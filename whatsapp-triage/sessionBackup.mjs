// Empacota a sessão do WhatsApp (whatsapp-triage/.auth, ~2500 arquivos) num
// único arquivo, para levar o /whatsapp-issues para outra máquina sem precisar
// reescanear o QR — reparear é o que obriga a estar com o celular em mãos.
//
//   node sessionBackup.mjs export <arquivo.json>
//   node sessionBackup.mjs import <arquivo.json>
//
// ATENÇÃO: o arquivo gerado contém as credenciais do dispositivo vinculado.
// Quem tiver ele lê e envia mensagens pela sua conta. Trate como senha:
// nunca commite, nunca mande por e-mail/chat, apague depois de restaurar.
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AUTH_DIR = join(dirname(fileURLToPath(import.meta.url)), '.auth');
const [command, target] = process.argv.slice(2);

if (!['export', 'import'].includes(command) || !target) {
  console.error('Uso: node sessionBackup.mjs <export|import> <arquivo.json>');
  process.exit(1);
}

if (command === 'export') {
  const names = await readdir(AUTH_DIR);
  const files = {};
  for (const name of names) {
    files[name] = await readFile(join(AUTH_DIR, name), 'utf-8');
  }
  await writeFile(target, JSON.stringify({ exportedAt: new Date().toISOString(), files }));
  console.log(`${names.length} arquivo(s) exportado(s) para ${target}`);
  console.log('Contém credenciais da sua conta do WhatsApp — não commite e apague após restaurar.');
  process.exit(0);
}

const { exportedAt, files } = JSON.parse(await readFile(target, 'utf-8'));
await rm(AUTH_DIR, { recursive: true, force: true });
await mkdir(AUTH_DIR, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  await writeFile(join(AUTH_DIR, name), content, 'utf-8');
}
console.log(`${Object.keys(files).length} arquivo(s) restaurado(s) (backup de ${exportedAt})`);
console.log('Rode `npm run fetch` para confirmar que conecta sem QR.');
