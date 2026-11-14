// Microphone recorder for shadowing. Audio never leaves the browser.

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  return candidates.find((type) => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  }) || '';
}

export function isRecordingSupported() {
  return Boolean(
    typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined',
  );
}

export function createVoiceRecorder() {
  let stream = null;
  let recorder = null;
  let chunks = [];
  let startedAt = 0;
  let active = false;

  function releaseStream() {
    if (!stream) return;
    for (const track of stream.getTracks()) {
      try {
        track.stop();
      } catch {
        // Already stopped.
      }
    }
    stream = null;
  }

  function cleanup() {
    active = false;
    recorder = null;
    chunks = [];
    releaseStream();
  }

  async function start() {
    if (!isRecordingSupported()) {
      throw new Error('Seu navegador não permite gravar áudio nesta página.');
    }
    if (active) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (error) {
      const name = error?.name || '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        throw new Error('Permissão do microfone negada. Libere o acesso no navegador.');
      }
      if (name === 'NotFoundError') {
        throw new Error('Nenhum microfone foi encontrado.');
      }
      throw new Error('Não foi possível abrir o microfone.');
    }
    const mimeType = pickMimeType();
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      releaseStream();
      throw new Error('Não foi possível iniciar a gravação neste navegador.');
    }
    chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };
    recorder.start(200);
    startedAt = performance.now();
    active = true;
  }

  function stop() {
    return new Promise((resolve, reject) => {
      if (!recorder || !active) {
        resolve(null);
        return;
      }
      const durationMs = Math.max(0, Math.round(performance.now() - startedAt));
      const current = recorder;
      current.onstop = () => {
        const type = current.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type });
        const url = URL.createObjectURL(blob);
        cleanup();
        resolve({ blob, url, durationMs, type });
      };
      current.onerror = () => {
        cleanup();
        reject(new Error('A gravação falhou.'));
      };
      try {
        current.stop();
      } catch {
        cleanup();
        reject(new Error('A gravação falhou.'));
      }
    });
  }

  function cancel() {
    try {
      if (recorder && active) recorder.stop();
    } catch {
      // Ignore.
    }
    cleanup();
  }

  return {
    get active() {
      return active;
    },
    start,
    stop,
    cancel,
  };
}
