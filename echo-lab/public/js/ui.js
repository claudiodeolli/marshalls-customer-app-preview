// Rendering helpers. Every value coming from YouTube or the learner is
// escaped before it becomes HTML.

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function formatPrecise(milliseconds) {
  const value = Math.max(0, Number(milliseconds) || 0);
  const totalSeconds = value / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const centis = Math.floor((value % 1000) / 10);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
}

export function formatDuration(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  return `${value.toFixed(1).replace('.', ',')} s`;
}

export function formatPercent(value) {
  const number = Number(value) || 0;
  if (Math.abs(number - Math.round(number)) < 0.05) return `${Math.round(number)}%`;
  return `${number.toFixed(1).replace('.', ',')}%`;
}

export function formatWords(count) {
  return `${count} palavra${count === 1 ? '' : 's'}`;
}

export function scoreTone(value) {
  if (value >= 85) return 'ok';
  if (value >= 60) return 'mid';
  return 'low';
}

export function scoreBarTone(value) {
  if (value >= 80) return '';
  if (value >= 55) return 'medium';
  return 'low';
}

export function icon(name) {
  const map = {
    play: '<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/>',
    pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>',
    check: '<path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    repeat: '<path d="M4 12a8 8 0 0 1 13.6-5.7L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.6 5.7L4 16M4 20v-4h4" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    arrow: '<path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    mic: '<path d="M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3Z" stroke="currentColor" stroke-width="1.8"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3M9 20h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>',
    eye: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.7"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.7"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${map[name] || ''}</svg>`;
}

function chip(text, tone = '') {
  return `<span class="chip ${tone}">${escapeHtml(text)}</span>`;
}

export function renderRecent(items) {
  if (!items.length) return '';
  return items
    .map(
      (item) => `
      <li>
        <button class="recent-item" type="button" data-action="open-recent" data-video-id="${escapeHtml(item.videoId)}">
          <span class="recent-title">${escapeHtml(item.title || item.videoId)}</span>
          <span class="recent-score">${item.accuracy != null ? escapeHtml(formatPercent(item.accuracy)) : '—'}</span>
        </button>
      </li>`,
    )
    .join('');
}

export function renderResumeCard(session) {
  if (!session) return '';
  const history = Array.isArray(session.history) ? session.history : [];
  const average = history.length
    ? history.reduce((sum, item) => sum + (Number(item.accuracy) || 0), 0) / history.length
    : null;
  return `
    <div class="resume-card panel-card" style="padding:18px 20px;display:grid;gap:10px">
      <div class="chips">
        <span class="chip good">Sessão salva</span>
        ${history.length ? chip(`${history.length} trecho${history.length === 1 ? '' : 's'}`) : ''}
        ${average != null ? chip(`média ${formatPercent(average)}`) : ''}
      </div>
      <div>
        <h3 style="margin:0;font-size:1rem;line-height:1.35">${escapeHtml(session.title || 'Vídeo')}</h3>
        <p class="muted" style="margin:4px 0 0;font-size:0.78rem">Continue de onde parou (${formatPrecise(session.positionMs || 0)}).</p>
      </div>
      <div class="ready-actions">
        <button class="btn btn-primary" type="button" data-action="resume-session">Continuar</button>
        <button class="btn btn-secondary" type="button" data-action="discard-session">Descartar</button>
      </div>
    </div>`;
}

export function renderReadySkeleton() {
  return `
    <div class="skeleton" aria-label="Carregando vídeo">
      <span></span><span></span><span></span><span></span>
    </div>
    <p class="hint" style="margin-top:16px">Buscando legendas e montando os tempos por palavra…</p>`;
}

export function renderReadyCard({ transcript, settings, startInfo }) {
  const timing =
    transcript.timing === 'asr-aligned'
      ? `Tempos por palavra · ${Math.round((transcript.alignment?.coverage || 0) * 100)}% alinhado`
      : transcript.timing === 'asr'
        ? 'Tempos por palavra da faixa automática'
        : 'Tempos estimados dentro de cada frase';
  const trackOptions = (transcript.tracks || [])
    .map(
      (track) =>
        `<option value="${escapeHtml(track.key)}" ${track.key === transcript.selectedTrack?.key ? 'selected' : ''}>${escapeHtml(
          `${track.name || track.languageCode} — ${track.kind === 'asr' ? 'automática' : 'oficial'}`,
        )}</option>`,
    )
    .join('');
  const warnings = (transcript.warnings || [])
    .map((warning) => `<div class="warning">${escapeHtml(warning)}</div>`)
    .join('');
  const modeCopy =
    settings.mode === 'shadowing'
      ? 'Loop do trecho, texto de apoio e gravação de voz opcional.'
      : 'O vídeo pausa no intervalo. Você escreve e recebe o diff palavra a palavra.';
  const startCopy =
    startInfo?.adjusted && startInfo.reason === 'first-word'
      ? 'ajustado para a primeira fala'
      : startInfo?.adjusted
        ? 'ajustado para não cortar palavra'
        : 'conforme informado';

  return `
    <div class="ready-top">
      <div class="ready-thumb">${icon('play')}</div>
      <div style="min-width:0">
        <p class="eyebrow" style="margin-bottom:5px">Vídeo carregado</p>
        <h2>${escapeHtml(transcript.title || transcript.videoId)}</h2>
        <p class="ready-meta">
          ${escapeHtml(transcript.author || 'YouTube')} ·
          ${formatClock((transcript.durationMs || 0) / 1000)} ·
          ${formatWords(transcript.wordCount || transcript.words.length)}
        </p>
      </div>
    </div>
    <div class="chips">
      ${chip(transcript.source === 'manual' ? 'Legenda oficial' : 'Transcrição automática', transcript.source === 'manual' ? 'good' : '')}
      ${chip(timing, transcript.timing === 'interpolated' ? 'warn' : 'good')}
      ${chip(`${settings.intervalSec}s por trecho`)}
      ${chip(settings.mode === 'shadowing' ? 'Shadowing' : 'Ditado')}
    </div>
    <div class="ready-grid">
      <label class="field">
        <span>Faixa de legenda</span>
        <select id="ready-track">${trackOptions}</select>
      </label>
      <div class="ready-start">
        <span>Começa em</span>
        <strong>${formatPrecise(startInfo?.startMs || 0)}</strong>
        <small class="hint" style="margin-top:3px">${escapeHtml(startCopy)}</small>
      </div>
    </div>
    ${warnings ? `<div class="warnings">${warnings}</div>` : ''}
    <p class="panel-copy" style="margin:0;font-size:0.8rem">${escapeHtml(modeCopy)}</p>
    <div class="ready-actions">
      <button class="btn btn-primary" type="button" data-action="start-session">
        Começar sessão ${icon('arrow')}
      </button>
      <button class="btn btn-secondary" type="button" data-action="back-setup">Trocar vídeo</button>
    </div>`;
}

function renderUserDiff(result) {
  if (!result.alignedUser?.length) {
    return '<span class="dim">(sem resposta)</span>';
  }
  return result.alignedUser
    .map((item) => {
      if (item.status === 'correct') {
        return `<span class="w correct">${escapeHtml(item.word)}</span>`;
      }
      if (item.status === 'wrong') {
        return `<span class="w wrong" title="esperado: ${escapeHtml(item.expected || '')}">${escapeHtml(item.word)}</span>`;
      }
      return `<span class="w extra" title="não estava no trecho">${escapeHtml(item.word)}</span>`;
    })
    .join(' ');
}

function renderRefDiff(result) {
  if (!result.alignedRef?.length) {
    return '<span class="dim">(sem fala no trecho)</span>';
  }
  return result.alignedRef
    .map((item) => {
      if (item.status === 'correct') {
        return `<span class="w correct">${escapeHtml(item.word)}</span>`;
      }
      if (item.status === 'wrong') {
        return `<span class="w note" title="você escreveu: ${escapeHtml(item.typed || '')}">${escapeHtml(item.word)}<span class="expected">→ ${escapeHtml(item.typed || '')}</span></span>`;
      }
      return `<span class="w missing" title="faltou">${escapeHtml(item.word)}</span>`;
    })
    .join(' ');
}

export function renderDiffBlocks(result, { showCopy = true } = {}) {
  return `
    <div class="diff-block">
      <div class="diff-label">
        <span>Sua resposta</span>
        ${showCopy ? `<button class="text-btn" type="button" data-action="copy-reference">${icon('copy')} copiar referência</button>` : ''}
      </div>
      <div class="diff-text">${renderUserDiff(result)}</div>
    </div>
    <div class="diff-block">
      <div class="diff-label">
        <span>Transcrição exata do corte</span>
        <span>${formatWords(result.total)}</span>
      </div>
      <div class="diff-text">${renderRefDiff(result)}</div>
    </div>`;
}

function countdownHtml() {
  return `
    <div class="listen-bars" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    </div>`;
}

export function renderShadowWords(reference) {
  if (!reference?.words?.length) {
    return '<span class="dim">Sem fala neste trecho.</span>';
  }
  return reference.words
    .map(
      (word) =>
        `<span class="kw" data-start="${word.startMs}" data-end="${word.endMs}">${escapeHtml(word.display)}</span>`,
    )
    .join(' ');
}

function renderShadowing(ctx) {
  const {
    reference,
    segmentIndex,
    shadow,
    startMs,
    cutMs,
  } = ctx;
  const supported = shadow?.supported !== false;
  const recording = Boolean(shadow?.recording);
  const audioUrl = shadow?.audioUrl || '';
  const loopActive = Boolean(shadow?.loopActive);
  const remaining = shadow?.loopRemaining ?? 0;
  const total = shadow?.repeats ?? 3;

  return `
    <div class="panel-head">
      <div>
        <p class="eyebrow">Shadowing · trecho ${segmentIndex + 1}</p>
        <h2>Ouça e repita junto</h2>
        <p>${formatPrecise(startMs)} → ${formatPrecise(cutMs)} · ${formatDuration((cutMs - startMs) / 1000)}</p>
      </div>
      <span class="segment-badge">${formatClock(startMs / 1000)}–${formatClock(cutMs / 1000)}</span>
    </div>
    <div class="panel-body">
      <div class="shadow-toolbar">
        <label class="mini-select">Repetições
          <select id="shadow-reps">
            ${[1, 2, 3, 5].map((value) => `<option value="${value}" ${Number(shadow?.repeats) === value ? 'selected' : ''}>${value}</option>`).join('')}
          </select>
        </label>
        <label class="mini-select">Velocidade
          <select id="shadow-rate">
            ${[1, 0.85, 0.75, 0.6].map((value) => `<option value="${value}" ${Number(shadow?.rate) === value ? 'selected' : ''}>${String(value).replace('.', ',')}x</option>`).join('')}
          </select>
        </label>
        <button class="ghost-btn" type="button" data-action="shadow-blur">${icon('eye')} ${shadow?.blurred ? 'Mostrar texto' : 'Esconder texto'}</button>
      </div>
      <div class="shadow-text ${shadow?.blurred ? 'blurred' : ''}" id="shadow-text">${renderShadowWords(reference)}</div>
      <div class="panel-actions">
        <button class="btn btn-primary" type="button" data-action="shadow-play">
          ${icon('play')} ${loopActive ? 'Repetindo…' : 'Ouvir e repetir'}
        </button>
        ${loopActive ? `<button class="btn btn-secondary" type="button" data-action="shadow-stop">${icon('stop')} Parar</button>` : ''}
        <button class="btn btn-secondary" type="button" data-action="next">Próximo trecho ${icon('arrow')}</button>
      </div>
      <p class="panel-hint" id="shadow-status">
        ${loopActive ? `<strong>${remaining} de ${total}</strong> repetições restantes.` : '<strong>Dica:</strong> use fones para o microfone não captar o vídeo.'}
      </p>
      <div class="record-panel ${recording ? 'recording' : ''}">
        <div class="record-head">
          <span>${recording ? '<span class="record-dot"></span>Gravando sua voz…' : 'Sua voz (opcional)'}</span>
          <span class="dim">${supported ? 'fica só neste navegador' : 'não disponível neste navegador'}</span>
        </div>
        ${
          supported
            ? recording
              ? `<button class="btn btn-secondary" type="button" data-action="record-stop">${icon('stop')} Parar gravação</button>`
              : `<button class="btn btn-secondary" type="button" data-action="record-start">${icon('mic')} Gravar minha voz</button>`
            : ''
        }
        ${audioUrl ? `<audio controls src="${escapeHtml(audioUrl)}"></audio><p class="record-note">Compare sua pronúncia com o trecho original. O áudio não sai do navegador.</p>` : ''}
      </div>
    </div>`;
}

export function renderPanel(ctx) {
  const {
    phase,
    mode,
    segmentIndex,
    startMs,
    cutMs,
    reference,
    answer,
    result,
    intervalSec,
    attempts,
    ended,
    error,
  } = ctx;

  if (phase === 'error') {
    return `
      <div class="panel-body center">
        <p class="eyebrow">Não foi possível</p>
        <h2 style="margin:0 0 8px;font-size:1.4rem;letter-spacing:-0.03em">${escapeHtml(error?.title || 'Algo saiu do trilho')}</h2>
        <p class="panel-copy">${escapeHtml(error?.message || 'Tente novamente ou escolha outro vídeo.')}</p>
        <div class="panel-actions">
          <button class="btn btn-primary" type="button" data-action="back-setup">Escolher vídeo</button>
          ${error?.retry ? '<button class="btn btn-secondary" type="button" data-action="retry-load">Tentar de novo</button>' : ''}
          ${error?.url ? `<a class="btn btn-secondary" href="${escapeHtml(error.url)}" target="_blank" rel="noreferrer noopener">Abrir no YouTube</a>` : ''}
        </div>
      </div>`;
  }

  if (phase === 'done') {
    return `
      <div class="panel-body center">
        <p class="eyebrow">Fim do vídeo</p>
        <h2 style="margin:0 0 8px;font-size:1.5rem;letter-spacing:-0.03em">Boa sessão.</h2>
        <p class="panel-copy">Você concluiu ${attempts} trecho${attempts === 1 ? '' : 's'}. O histórico fica salvo neste navegador.</p>
        <div class="panel-actions">
          <button class="btn btn-primary" type="button" data-action="exit">Novo vídeo</button>
          <button class="btn btn-secondary" type="button" data-action="export">Exportar sessão</button>
        </div>
      </div>`;
  }

  if (phase === 'idle') {
    return `
      <div class="panel-head">
        <div>
          <p class="eyebrow">${mode === 'shadowing' ? 'Shadowing' : 'Ditado'} · pronto</p>
          <h2>Trecho ${segmentIndex + 1} começa em ${formatPrecise(startMs)}</h2>
          <p>${mode === 'shadowing' ? 'O texto aparece para apoiar a repetição.' : 'O texto fica escondido até a correção.'}</p>
        </div>
      </div>
      <div class="panel-body center">
        ${countdownHtml()}
        <p class="panel-copy">
          A cada <strong>${intervalSec}s</strong> o vídeo pausa.
          ${mode === 'shadowing' ? 'Ouça, repita junto e use o loop para pegar o ritmo.' : 'Escute com atenção, escreva o que entendeu e pressione <strong>Enter</strong>.'}
        </p>
        <div class="panel-actions">
          <button class="btn btn-primary" type="button" data-action="start">${icon('play')} Iniciar sessão</button>
        </div>
        <p class="panel-hint">O player fica sob controle do app: sem barra de seek e sem legendas durante o ditado.</p>
      </div>`;
  }

  if (phase === 'playing') {
    return `
      <div class="panel-head">
        <div>
          <p class="eyebrow">Ouvindo · trecho ${segmentIndex + 1}</p>
          <h2>Pausa em <span id="countdown">${formatDuration(intervalSec)}</span></h2>
          <p>${formatPrecise(startMs)} → ${formatPrecise(cutMs)}</p>
        </div>
        <span class="segment-badge">trecho em curso</span>
      </div>
      <div class="panel-body">
        ${countdownHtml()}
        <p class="panel-copy" style="margin-top:6px">
          ${mode === 'shadowing' ? 'Acompanhe o áudio. Ao pausar, use o loop e grave sua voz se quiser comparar.' : 'Não escreva ainda: ouça o trecho inteiro. A pausa é automática.'}
        </p>
        <div class="panel-hint">
          <strong>Precisão:</strong> o corte é ajustado para uma pausa entre palavras e o tempo real é registrado ao pausar.
        </div>
        <div class="panel-actions">
          <button class="btn btn-secondary" type="button" data-action="pause-now">${icon('pause')} Pausar agora</button>
        </div>
      </div>`;
  }

  if (phase === 'paused') {
    const reason = ctx.pausedReason || 'manual';
    const copy = {
      restore: {
        eyebrow: 'Sessão salva',
        title: 'Continue de onde parou',
        text: 'O player está posicionado no início do próximo trecho. Retome quando quiser.',
      },
      hidden: {
        eyebrow: 'Sessão pausada',
        title: 'Você saiu da aba',
        text: 'Pausei antes do corte para você não perder o trecho. Retome para ouvir do início.',
      },
      autoplay: {
        eyebrow: 'Pronto',
        title: 'Um toque para começar',
        text: 'O navegador pediu uma interação para liberar o áudio. Clique em retomar.',
      },
      manual: {
        eyebrow: 'Sessão pausada',
        title: 'Retome quando quiser',
        text: 'O trecho atual recomeça do início, com a mesma referência de corte.',
      },
    }[reason] || {
      eyebrow: 'Sessão pausada',
      title: 'Retome quando quiser',
      text: 'O trecho atual recomeça do início.',
    };
    return `
      <div class="panel-head">
        <div>
          <p class="eyebrow">${copy.eyebrow}</p>
          <h2>${copy.title}</h2>
          <p>${formatPrecise(startMs)} → ${formatPrecise(cutMs)}</p>
        </div>
      </div>
      <div class="panel-body center">
        <p class="panel-copy">${copy.text}</p>
        <div class="panel-actions">
          <button class="btn btn-primary" type="button" data-action="resume-segment">${icon('play')} Retomar trecho</button>
          <button class="btn btn-secondary" type="button" data-action="skip">Pular trecho</button>
        </div>
      </div>`;
  }

  if (phase === 'answering') {
    return `
      <div class="panel-head">
        <div>
          <p class="eyebrow">Trecho ${segmentIndex + 1} · pausado</p>
          <h2>Escreva o que você ouviu</h2>
          <p>${formatPrecise(startMs)} → ${formatPrecise(cutMs)} · ${formatDuration((cutMs - startMs) / 1000)}</p>
        </div>
        <span class="segment-badge">${attempts > 0 ? `tentativa ${attempts + 1}` : 'ditado'}</span>
      </div>
      <div class="panel-body">
        <div class="answer-wrap">
          <div class="answer-label">
            <span>Sua transcrição</span>
            <small>Use o inglês que você ouviu</small>
          </div>
          <textarea id="answer-input" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="Escreva aqui o que você entendeu…">${escapeHtml(answer || '')}</textarea>
          <div class="answer-foot">
            <span><kbd>Enter</kbd> corrige · <kbd>Shift</kbd>+<kbd>Enter</kbd> nova linha</span>
            <span class="answer-count" id="answer-count">0 palavras</span>
          </div>
        </div>
        <div class="panel-actions">
          <button class="btn btn-primary" type="button" data-action="check">${icon('check')} Corrigir</button>
          <button class="btn btn-secondary" type="button" data-action="replay">${icon('repeat')} Ouvir de novo</button>
        </div>
        <div class="panel-hint">
          <strong>Ouvir de novo não muda a referência.</strong> O trecho reproduz do mesmo início até o mesmo corte registrado.
        </div>
      </div>`;
  }

  if (phase === 'reviewing' && result) {
    const tone = scoreBarTone(result.accuracy);
    const perfect = result.perfect;
    return `
      <div class="panel-head">
        <div>
          <p class="eyebrow">Correção · trecho ${segmentIndex + 1}</p>
          <h2>${perfect ? 'Trecho perfeito.' : 'Veja o que a legenda diz.'}</h2>
          <p>${formatPrecise(startMs)} → ${formatPrecise(cutMs)} · ${formatDuration((cutMs - startMs) / 1000)}</p>
        </div>
        <span class="segment-badge">${attempts > 1 ? `${attempts} tentativas` : 'resultado'}</span>
      </div>
      <div class="panel-body">
        <div class="score-hero">
          <div class="score-value">${Math.round(result.accuracy)}<small>%</small></div>
          <div class="score-copy">
            <strong>${result.correct} de ${result.total} ${result.total === 1 ? 'palavra' : 'palavras'}</strong>
            ${perfect ? 'Tudo certo, inclusive os extras.' : 'A porcentagem desconta palavras trocadas, faltantes e extras.'}
          </div>
        </div>
        <div class="score-bar ${tone}"><span style="width:${Math.max(2, Math.min(100, result.accuracy))}%"></span></div>
        <div class="stats-row">
          <span class="stat-pill ok">${result.correct} certas</span>
          ${result.substitutions ? `<span class="stat-pill bad">${result.substitutions} trocada${result.substitutions === 1 ? '' : 's'}</span>` : ''}
          ${result.missing ? `<span class="stat-pill warn">${result.missing} faltando</span>` : ''}
          ${result.extras ? `<span class="stat-pill bad">${result.extras} extra${result.extras === 1 ? '' : 's'}</span>` : ''}
        </div>
        ${perfect ? '<p class="perfect-note">Você reproduziu o trecho exatamente. Siga para o próximo ou tente outro intervalo.</p>' : ''}
        ${renderDiffBlocks(result)}
        <p class="timecode-line">corte real: ${formatPrecise(startMs)} → ${formatPrecise(cutMs)} · ${formatDuration((cutMs - startMs) / 1000)}</p>
        <div class="panel-actions">
          <button class="btn btn-primary" type="button" data-action="${ended ? 'finish' : 'next'}">
            ${ended ? 'Concluir' : 'Próximo trecho'} ${icon('arrow')}
          </button>
          <button class="btn btn-secondary" type="button" data-action="retry">Tentar de novo</button>
          <button class="btn btn-secondary" type="button" data-action="replay">${icon('repeat')} Ouvir</button>
        </div>
      </div>`;
  }

  if (phase === 'shadowing' || phase === 'shadow-playing') {
    return renderShadowing(ctx);
  }

  if (phase === 'replaying') {
    return `
      <div class="panel-head">
        <div><p class="eyebrow">Repetindo</p><h2>Ouvindo o trecho…</h2></div>
      </div>
      <div class="panel-body center">
        ${countdownHtml()}
        <p class="panel-copy">O player pausa no mesmo corte. Sua resposta continua guardada.</p>
      </div>`;
  }

  return '<div class="panel-body center"><p class="panel-copy">Carregando…</p></div>';
}

export function renderHistory(history) {
  if (!history.length) {
    return '<div class="empty-state">Os trechos corrigidos aparecem aqui, com o diff e a nota.</div>';
  }
  return history
    .map((item, index) => {
      const result = item.result;
      const accuracy = result ? result.accuracy : 0;
      const tone = scoreTone(accuracy);
      return `
        <details class="history-item">
          <summary>
            <span class="history-index">#${item.index + 1}</span>
            <span class="history-times">${formatPrecise(item.startMs)}–${formatPrecise(item.endMs)}</span>
            <span class="history-excerpt">${escapeHtml(item.refText || item.answer || '—')}</span>
            <span class="history-score ${tone === 'ok' ? '' : tone}">${result ? formatPercent(accuracy) : '—'}</span>
          </summary>
          <div class="history-detail">
            ${result ? renderDiffBlocks(result, { showCopy: false }) : `<p class="panel-copy">${escapeHtml(item.answer || '')}</p>`}
            <p class="timecode-line">${item.attempts ? `${item.attempts} tentativa${item.attempts === 1 ? '' : 's'} · ` : ''}corte ${formatPrecise(item.startMs)} → ${formatPrecise(item.endMs)}</p>
          </div>
        </details>`;
    })
    .join('');
}

