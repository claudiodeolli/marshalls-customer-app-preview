// Thin wrapper around the YouTube IFrame player. The app owns playback so the
// pause happens on our schedule and we can read the exact time at the cut.

export const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

let apiPromise = null;

export function loadYouTubeApi() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Sem janela.'));
  }
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('A API do YouTube não respondeu. Verifique a conexão.'));
    }, 20_000);
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') {
        try {
          previous();
        } catch {
          // Ignore a third-party callback failure.
        }
      }
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      reject(new Error('Não foi possível carregar o player do YouTube.'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

const ERROR_MESSAGES = {
  2: 'O identificador do vídeo é inválido.',
  5: 'O navegador não conseguiu reproduzir este vídeo.',
  100: 'O vídeo não existe, é privado ou foi removido.',
  101: 'O dono deste vídeo não permite incorporação.',
  150: 'O dono deste vídeo não permite incorporação.',
};

export class EchoPlayer {
  constructor() {
    this.player = null;
    this.videoId = null;
    this.ready = false;
    this.onStateChange = null;
    this.onError = null;
    this.onReady = null;
    this.container = null;
    this.mountId = `echo-player-${Math.random().toString(36).slice(2)}`;
  }

  async mount(container, videoId, { onStateChange, onError, onReady } = {}) {
    const YT = await loadYouTubeApi();
    this.destroy();
    this.container = container;
    this.videoId = videoId;
    this.onStateChange = onStateChange || null;
    this.onError = onError || null;
    this.onReady = onReady || null;
    this.ready = false;
    container.innerHTML = `<div id="${this.mountId}" class="player-mount-inner"></div>`;
    const element = container.firstElementChild;

    await new Promise((resolve, reject) => {
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('O player demorou demais para carregar.'));
      }, 20_000);

      this.player = new YT.Player(element, {
        videoId,
        host: 'https://www.youtube.com',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
          origin: window.location.origin,
          start: 0,
        },
        events: {
          onReady: (event) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            this.ready = true;
            this.player = event.target;
            this.disableCaptions();
            for (const delay of [80, 350, 1200]) {
              window.setTimeout(() => this.disableCaptions(), delay);
            }
            if (this.onReady) this.onReady();
            resolve();
          },
          onStateChange: (event) => {
            if (!this.player) return;
            if (event.data === 1) this.disableCaptions();
            if (this.onStateChange) {
              this.onStateChange(event.data, this.time(), this);
            }
          },
          onApiChange: () => {
            // YouTube may restore the viewer's saved caption preference after
            // the player initialises. A dictation app must hide that overlay.
            this.disableCaptions();
          },
          onError: (event) => {
            const message =
              ERROR_MESSAGES[event.data] ||
              'O player encontrou um erro ao carregar este vídeo.';
            if (this.onError) this.onError(message, event.data);
          },
        },
      });
    });
  }

  destroy() {
    this.ready = false;
    if (this.player) {
      try {
        this.player.destroy();
      } catch {
        // The iframe may already be gone.
      }
    }
    this.player = null;
    if (this.container) this.container.innerHTML = '';
  }

  /**
   * Hide YouTube's own caption overlay. The player restores the viewer's
   * saved preference on start, so this is called on ready, on every PLAYING
   * transition and whenever the captions API module changes.
   */
  disableCaptions() {
    if (!this.player || !this.ready) return;
    try {
      this.player.setOption('captions', 'track', {});
    } catch {
      // The captions module may not be loaded yet.
    }
    try {
      this.player.setOption('cc', 'track', {});
    } catch {
      // Legacy module.
    }
    try {
      this.player.unloadModule('captions');
    } catch {
      // Already unloaded.
    }
    try {
      this.player.unloadModule('cc');
    } catch {
      // Already unloaded.
    }
  }

  time() {
    if (!this.player || !this.ready) return 0;
    try {
      return Number(this.player.getCurrentTime()) || 0;
    } catch {
      return 0;
    }
  }

  duration() {
    if (!this.player || !this.ready) return 0;
    try {
      return Number(this.player.getDuration()) || 0;
    } catch {
      return 0;
    }
  }

  state() {
    if (!this.player || !this.ready) return PlayerState.UNSTARTED;
    try {
      return this.player.getPlayerState();
    } catch {
      return PlayerState.UNSTARTED;
    }
  }

  seek(seconds) {
    if (!this.player || !this.ready) return;
    try {
      this.player.seekTo(Math.max(0, seconds), true);
    } catch {
      // Ignore.
    }
  }

  /**
   * Start playback a little before `seconds` so a late seek can never clip the
   * first word of a segment. The caller keeps the reference start separate.
   */
  seekAndPlay(seconds, leadInSeconds = 0.12) {
    if (!this.player || !this.ready) return;
    const target = Math.max(0, seconds - leadInSeconds);
    try {
      this.player.seekTo(target, true);
      this.player.playVideo();
    } catch {
      // The next tick will show the player as paused.
    }
  }

  play() {
    if (!this.player || !this.ready) return;
    try {
      this.player.playVideo();
    } catch {
      // Ignore.
    }
  }

  pause() {
    if (!this.player || !this.ready) return;
    try {
      this.player.pauseVideo();
    } catch {
      // Ignore.
    }
  }

  setRate(rate) {
    if (!this.player || !this.ready) return;
    try {
      this.player.setPlaybackRate(rate);
    } catch {
      // Some videos do not expose a rate menu; 1x still works.
    }
  }

  mute() {
    try {
      this.player?.mute?.();
    } catch {
      // Ignore.
    }
  }

  unmute() {
    try {
      this.player?.unMute?.();
    } catch {
      // Ignore.
    }
  }

  isMuted() {
    try {
      return Boolean(this.player?.isMuted?.());
    } catch {
      return false;
    }
  }
}
