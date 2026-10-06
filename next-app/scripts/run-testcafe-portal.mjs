// Roda a suíte TestCafe num browser visível: o "remote browser" do TestCafe é
// aberto dentro de um portal da Maestri, então o teste anda na tela em vez de
// rodar headless. Uso: npm run test:e2e:portal -- tests/testcafe/arquivo.js
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const portalName = process.env.PORTAL_NAME ?? 'Bancada E2E';
const appPort = Number(process.env.APP_PORT ?? 3100);
const [viewportWidth, viewportHeight] = (process.env.VIEWPORT ?? '390x844').split('x').map(Number);
const maestriCli = process.env.MAESTRI_CLI ?? 'maestri';

const appUrl = `http://localhost:${appPort}`;
const readinessUrl = `${appUrl}/agendamentos`;
// next dev a frio nesta máquina leva minutos — o mesmo limite do playwright.config.js.
const devServerTimeoutMs = 10 * 60 * 1000;
const connectUrlPattern = /(https?:\/\/\S*\/browser\/connect\S*)/;

const isWindows = process.platform === 'win32';

// npm e npx são .cmd no Windows e só rodam via shell, que por sua vez não cita
// os argumentos sozinho — o nome do portal ("Bancada E2E") viraria dois args.
function quoteForShell(value) {
  return isWindows && /\s/.test(value) ? `"${value}"` : value;
}

function runMaestri(args) {
  const needsShell = isWindows && !maestriCli.toLowerCase().endsWith('.exe');
  return spawnSync(maestriCli, needsShell ? args.map(quoteForShell) : args, {
    encoding: 'utf8',
    shell: needsShell,
  });
}

async function isAppRunning() {
  try {
    const response = await fetch(readinessUrl, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForApp(deadline) {
  while (Date.now() < deadline) {
    if (await isAppRunning()) return;
    await delay(3000);
  }
  throw new Error(`App não respondeu em ${readinessUrl} dentro do tempo limite.`);
}

async function startAppIfNeeded() {
  if (await isAppRunning()) {
    console.log(`[portal] reaproveitando o dev server já em ${appUrl}`);
    return null;
  }

  console.log(`[portal] subindo o dev server mock em ${appUrl} (pode levar alguns minutos a frio)`);
  const devServer = spawn('npm', ['run', 'dev', '--', '-p', String(appPort)].map(quoteForShell), {
    env: { ...process.env, NEXT_PUBLIC_MOCK_MODE: '1' },
    stdio: 'ignore',
    shell: isWindows,
  });

  await waitForApp(Date.now() + devServerTimeoutMs);
  return devServer;
}

function showConnectUrlInPortal(connectUrl) {
  const navigated = runMaestri(['portal', 'navigate', portalName, connectUrl]);
  if (navigated.status !== 0) {
    console.log(`[portal] "${portalName}" não respondeu (${navigated.stderr?.trim()}); criando um portal novo`);
    runMaestri(['portal', 'create', connectUrl, portalName, '--size', `${viewportWidth}x${viewportHeight}`]);
    return;
  }
  runMaestri(['portal', 'resize', portalName, String(viewportWidth), String(viewportHeight)]);
}

// Interromper o runner mata só o processo direto: npx e testcafe seguem vivos
// segurando o dev server e centenas de MB. Derruba a árvore inteira.
function killProcessTree(child) {
  if (!child?.pid) return;
  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  child.kill();
}

function cleanUpOnExit(children) {
  const killAll = () => children.forEach(killProcessTree);
  process.on('exit', killAll);
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
      killAll();
      process.exit(1);
    });
  }
}

function startTestcafe(testFiles) {
  return spawn('npx', ['testcafe', 'remote', ...testFiles, '--hostname', 'localhost'].map(quoteForShell), {
    // As fixtures montam a URL a partir daqui: o `baseUrl` do .testcaferc.js não
    // é aplicado a `fixture.page()` relativo e vira um host inexistente.
    env: { ...process.env, APP_URL: appUrl },
    shell: isWindows,
  });
}

function pipeAndCaptureConnectUrl(testcafe) {
  let connectUrlHandled = false;

  const forward = (chunk, stream) => {
    const text = chunk.toString();
    stream.write(text);
    if (connectUrlHandled) return;

    const [connectUrl] = text.match(connectUrlPattern) ?? [];
    if (!connectUrl) return;

    connectUrlHandled = true;
    console.log(`[portal] abrindo o browser de teste em "${portalName}" (${viewportWidth}x${viewportHeight})`);
    showConnectUrlInPortal(connectUrl);
  };

  testcafe.stdout.on('data', chunk => forward(chunk, process.stdout));
  testcafe.stderr.on('data', chunk => forward(chunk, process.stderr));
}

async function main() {
  const testFiles = process.argv.slice(2);
  const targets = testFiles.length > 0 ? testFiles : ['tests/testcafe'];
  const devServer = await startAppIfNeeded();

  const testcafe = startTestcafe(targets);
  cleanUpOnExit([testcafe, devServer]);
  pipeAndCaptureConnectUrl(testcafe);

  const exitCode = await new Promise(resolve => testcafe.on('close', resolve));
  killProcessTree(devServer);
  process.exit(exitCode ?? 1);
}

main().catch(error => {
  console.error(`[portal] ${error.message}`);
  process.exit(1);
});
