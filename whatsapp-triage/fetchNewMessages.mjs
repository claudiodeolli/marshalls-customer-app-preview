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
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = join(__dirname, ".auth");
const STATE_DIR = join(__dirname, ".state");
const TMP_DIR = join(__dirname, "tmp");
const CHECKPOINT_PATH = join(STATE_DIR, "checkpoint.json");
const OUTPUT_PATH = join(TMP_DIR, "output.json");
const QR_IMAGE_PATH = join(__dirname, "qr.png");

const TRACKED_WA_JID = process.env.TRACKED_WA_JID;
if (!TRACKED_WA_JID) {
  console.error("TRACKED_WA_JID não definido — copie whatsapp-triage/.env.example para .env e preencha.");
  process.exit(1);
}

// Silêncio após a última mensagem relevante pra considerar "a rajada acabou".
const SETTLE_MS = 20_000;
// Teto absoluto, mesmo com mensagens ainda chegando — nunca fica esperando pra sempre.
const MAX_WAIT_MS = 90_000;
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
  if (!content) return { kind: "other", body: null, hasMedia: false };
  if (content.conversation) return { kind: "text", body: content.conversation, hasMedia: false };
  if (content.extendedTextMessage) {
    return { kind: "text", body: content.extendedTextMessage.text ?? null, hasMedia: false };
  }
  if (content.imageMessage) return { kind: "image", body: content.imageMessage.caption ?? null, hasMedia: true };
  if (content.videoMessage) return { kind: "video", body: content.videoMessage.caption ?? null, hasMedia: true };
  if (content.documentMessage) {
    return { kind: "document", body: content.documentMessage.caption ?? null, hasMedia: true };
  }
  if (content.audioMessage) return { kind: "audio", body: null, hasMedia: true };
  return { kind: "other", body: null, hasMedia: false };
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

  function scheduleSettle() {
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(finish, SETTLE_MS);
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

  function connect() {
    const sock = makeWASocket({ version, auth: state, logger: waLogger });

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
      if (upsert.type !== "notify") return;

      for (const msg of upsert.messages) {
        if (msg.key.fromMe) continue;
        if (msg.key.remoteJid !== TRACKED_WA_JID) continue;
        if (!msg.message) continue;

        const id = msg.key.id;
        if (!id || seenIds.has(id)) continue;

        const { kind, body, hasMedia } = extractKindAndBody(msg);
        const waTimestamp = new Date(Number(msg.messageTimestamp ?? Math.floor(Date.now() / 1000)) * 1000);

        let imagePath = null;
        if (hasMedia && kind === "image") {
          try {
            const buffer = await downloadMediaMessage(msg, "buffer", {}, { reuploadRequest: sock.updateMediaMessage });
            imagePath = join(TMP_DIR, `${id}.jpg`);
            await writeFile(imagePath, buffer);
          } catch (err) {
            console.error(`Falha ao baixar imagem ${id}:`, err.message);
          }
        }

        collected.push({ id, timestamp: waTimestamp.toISOString(), kind, body, imagePath });
        console.log(`+ [${waTimestamp.toTimeString().slice(0, 5)}] ${kind}${body ? `: ${body.slice(0, 60)}` : ""}`);
        scheduleSettle();
      }
    });
  }

  connect();
}

main().catch((err) => {
  console.error("Falha:", err);
  process.exit(1);
});
