// Sob-demanda, não um serviço: conecta ao WhatsApp, junta as mensagens novas
// do contato rastreado, salva em tmp/output.json e desliga. Chamado pelo
// comando /whatsapp-issues (.claude/commands/whatsapp-issues.md) — não roda
// sozinho em background, não precisa de VPS.
import "dotenv/config";
import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcodeTerminal from "qrcode-terminal";
import QRCode from "qrcode";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = join(__dirname, ".auth");
const STATE_DIR = join(__dirname, ".state");
const TMP_DIR = join(__dirname, "tmp");
const CHECKPOINT_PATH = join(STATE_DIR, "checkpoint.json");
// Log append-only de tudo que chega do contato, gravado ANTES de qualquer
// filtro. A fila de mensagens offline do WhatsApp é entregue uma única vez:
// se um erro acontecer depois de recebê-la, o conteúdo se perde e só volta
// reescaneando o QR. Este arquivo é a rede de segurança.
const RAW_LOG_PATH = join(STATE_DIR, "recebidas.jsonl");
const OUTPUT_PATH = join(TMP_DIR, "output.json");
const QR_IMAGE_PATH = join(__dirname, "qr.png");

const TRACKED_WA_JID = process.env.TRACKED_WA_JID;
if (!TRACKED_WA_JID) {
  console.error("TRACKED_WA_JID não definido — copie whatsapp-triage/.env.example para .env e preencha.");
  process.exit(1);
}

// Silêncio após a última mensagem relevante pra considerar "a rajada acabou".
const SETTLE_MS = 25_000;
// Tempo mínimo de escuta depois de conectar, mesmo sem nada chegando. O
// WhatsApp leva um tempo variável para começar a despejar a fila de quem
// esteve offline, e sem essa carência o script encerrava por "silêncio"
// antes da primeira mensagem aparecer — reportando zero com a caixa cheia.
const GRACE_MS = Number(process.env.FETCH_GRACE_MS ?? 60_000);
// Teto absoluto, mesmo com mensagens ainda chegando — nunca fica esperando pra sempre.
// Mais alto que o normal porque um sync de histórico (após reescanear o QR)
// pode vir em vários lotes com pausas entre eles.
// Um pareamento novo dispara sync de histórico, que pode passar de dois
// minutos. FETCH_MAX_WAIT_MS permite esticar a janela nessas horas sem
// mexer no código.
const MAX_WAIT_MS = Number(process.env.FETCH_MAX_WAIT_MS ?? 120_000);
// Baileys costuma fechar a conexão uma vez logo após o QR ser escaneado
// ("restart required") antes da sessão ficar de fato utilizável — sem
// reconectar automaticamente aqui, o script morreria bem no meio do pareamento.
const MAX_RECONNECT_ATTEMPTS = 5;

const waLogger = pino({ level: process.env.BAILEYS_LOG_LEVEL ?? "silent" });

async function loadCheckpoint() {
  try {
    const raw = await readFile(CHECKPOINT_PATH, "utf-8");
    return new Set(JSON.parse(raw).seenIds ?? []);
  } catch {
    return new Set();
  }
}

async function saveCheckpoint(seenIds) {
  await mkdir(STATE_DIR, { recursive: true });
  // Só o suficiente pra dedupe recente — não precisa crescer pra sempre.
  const trimmed = Array.from(seenIds).slice(-1000);
  await writeFile(CHECKPOINT_PATH, JSON.stringify({ seenIds: trimmed }, null, 2));
}

function extractKindAndBody(msg) {
  const content = msg.message;
  if (!content) return { kind: "other", body: null, hasMedia: false, fileName: null };
  if (content.conversation) {
    return { kind: "text", body: content.conversation, hasMedia: false, fileName: null };
  }
  if (content.extendedTextMessage) {
    return { kind: "text", body: content.extendedTextMessage.text ?? null, hasMedia: false, fileName: null };
  }
  if (content.imageMessage) {
    return { kind: "image", body: content.imageMessage.caption ?? null, hasMedia: true, fileName: null };
  }
  if (content.videoMessage) {
    return { kind: "video", body: content.videoMessage.caption ?? null, hasMedia: true, fileName: null };
  }
  if (content.documentMessage) {
    return {
      kind: "document",
      body: content.documentMessage.caption ?? null,
      hasMedia: true,
      fileName: content.documentMessage.fileName ?? null,
    };
  }
  if (content.audioMessage) return { kind: "audio", body: null, hasMedia: true, fileName: null };
  return { kind: "other", body: null, hasMedia: false, fileName: null };
}

function extensionFor(kind, fileName) {
  if (fileName && fileName.includes(".")) return fileName.slice(fileName.lastIndexOf("."));
  return kind === "image" ? ".jpg" : ".bin";
}

async function main() {
  await mkdir(AUTH_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });

  const seenIds = await loadCheckpoint();
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const collected = [];
  let settleTimer = null;
  let hardTimer = null;
  let finished = false;
  let reconnectAttempts = 0;

  // Enquanto a carência não vence, o silêncio não encerra a coleta.
  let escutarAoMenosAte = 0;

  function scheduleSettle() {
    if (settleTimer) clearTimeout(settleTimer);
    const restante = escutarAoMenosAte - Date.now();
    settleTimer = setTimeout(finish, Math.max(SETTLE_MS, restante));
  }

  async function finish(sock) {
    if (finished) return;
    finished = true;
    if (settleTimer) clearTimeout(settleTimer);
    if (hardTimer) clearTimeout(hardTimer);

    for (const msg of collected) seenIds.add(msg.id);
    await saveCheckpoint(seenIds);
    await writeFile(OUTPUT_PATH, JSON.stringify(collected, null, 2));

    console.log(`\n${collected.length} mensagem(ns) nova(s) salva(s) em whatsapp-triage/tmp/output.json`);
    try {
      sock?.end(undefined);
    } catch {
      // conexão já pode ter caído — sem problema, estamos saindo mesmo
    }
    process.exit(0);
  }

  /** Grava o cru antes de filtrar — ver comentário em RAW_LOG_PATH. */
  async function registrarCru(msg) {
    try {
      await mkdir(STATE_DIR, { recursive: true });
      await appendFile(RAW_LOG_PATH, JSON.stringify({
        recebidoEm: new Date().toISOString(),
        id: msg.key?.id,
        fromMe: !!msg.key?.fromMe,
        messageTimestamp: Number(msg.messageTimestamp ?? 0),
        message: msg.message ?? null,
      }) + '\n', 'utf-8');
    } catch (err) {
      console.error("Falha ao gravar log cru:", err.message);
    }
  }

  async function processMessage(sock, msg) {
    if (msg.key.remoteJid !== TRACKED_WA_JID) return;
    await registrarCru(msg);

    if (msg.key.fromMe) return;
    if (!msg.message) return;

    const id = msg.key.id;
    if (!id || seenIds.has(id)) return;
    if (collected.some((m) => m.id === id)) return; // já veio num sync anterior nesta mesma execução

    const { kind, body, hasMedia, fileName } = extractKindAndBody(msg);
    const waTimestamp = new Date(Number(msg.messageTimestamp ?? Math.floor(Date.now() / 1000)) * 1000);

    let filePath = null;
    if (hasMedia && (kind === "image" || kind === "document")) {
      try {
        const buffer = await downloadMediaMessage(msg, "buffer", {}, { reuploadRequest: sock.updateMediaMessage });
        filePath = join(TMP_DIR, `${id}${extensionFor(kind, fileName)}`);
        await writeFile(filePath, buffer);
      } catch (err) {
        console.error(`Falha ao baixar anexo ${id}:`, err.message);
      }
    }

    collected.push({ id, timestamp: waTimestamp.toISOString(), kind, body, fileName, filePath });
    console.log(`+ [${waTimestamp.toTimeString().slice(0, 5)}] ${kind}${body ? `: ${body.slice(0, 60)}` : ""}${fileName ? ` (${fileName})` : ""}`);
    scheduleSettle();
  }

  function connect() {
    const sock = makeWASocket({
      version,
      auth: state,
      logger: waLogger,
      // Sem isso, uma sessão já pareada só recebe atualizações incrementais —
      // o pareamento inicial é a única chance de puxar o histórico recente
      // (é por isso que /whatsapp-issues pede pra reescanear o QR quando
      // precisa pegar mensagens de antes da última vez que isso rodou).
      syncFullHistory: true,
      shouldSyncHistoryMessage: () => true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("\nEscaneie o QR code abaixo no WhatsApp (Aparelhos conectados):\n");
        qrcodeTerminal.generate(qr, { small: true });
        QRCode.toFile(QR_IMAGE_PATH, qr, { width: 400 }).catch(() => {});
      }

      if (connection === "open") {
        console.log("Conectado ao WhatsApp. Aguardando mensagens pendentes...");
        reconnectAttempts = 0;
        escutarAoMenosAte = Date.now() + GRACE_MS;
        scheduleSettle();
        if (!hardTimer) hardTimer = setTimeout(() => finish(sock), MAX_WAIT_MS);
      }

      if (connection === "close") {
        if (finished) return;
        const statusCode = lastDisconnect?.error instanceof Boom ? lastDisconnect.error.output?.statusCode : undefined;

        if (statusCode === DisconnectReason.loggedOut) {
          console.error(
            "Sessão do WhatsApp deslogada. Apague whatsapp-triage/.auth e rode o comando de novo pra escanear um QR novo.",
          );
          process.exit(1);
        }

        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error("Conexão caiu demais vezes seguidas. Rode o comando de novo (é seguro repetir).");
          process.exit(1);
        }

        reconnectAttempts += 1;
        const delayMs = Math.min(1000 * 2 ** reconnectAttempts, 15_000);
        setTimeout(connect, delayMs);
      }
    });

    sock.ev.on("messages.upsert", async (upsert) => {
      // "notify" é mensagem que chega com o dispositivo já conectado;
      // "append" é como o WhatsApp entrega o que ficou na fila enquanto ele
      // esteve offline. Como este script conecta sob demanda, quase tudo que
      // interessa chega como "append" — filtrar só por "notify" fazia o
      // comando não ver nenhuma mensagem do cliente.
      if (upsert.type !== "notify" && upsert.type !== "append") return;
      for (const msg of upsert.messages) await processMessage(sock, msg);
    });

    // Só chega uma vez por pareamento (device novo) — WhatsApp entrega um
    // lote do histórico recente da conversa nessa hora. É a única forma de
    // pegar mensagens que já estavam no chat antes deste script rodar pela
    // primeira vez.
    sock.ev.on("messaging-history.set", async ({ messages }) => {
      for (const msg of messages ?? []) await processMessage(sock, msg);
    });
  }

  connect();
}

main().catch((err) => {
  console.error("Falha:", err);
  process.exit(1);
});
