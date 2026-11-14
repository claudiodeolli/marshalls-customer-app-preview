export class ApiError extends Error {
  constructor(message, { code = 'UNKNOWN', details = null, status = 0 } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export async function fetchTranscript(input, { track = null, signal } = {}) {
  const url = new URL('/api/transcript', window.location.origin);
  url.searchParams.set('videoId', input);
  if (track) url.searchParams.set('track', track);
  let response;
  try {
    response = await fetch(url, { signal, headers: { accept: 'application/json' } });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError(
      'Não consegui falar com o servidor local. Verifique se o `node server.mjs` está rodando.',
      { code: 'SERVER_UNREACHABLE' },
    );
  }
  let data = null;
  try {
    data = await response.json();
  } catch {
    // A proxy or a crashed server can return HTML.
  }
  if (!response.ok) {
    throw new ApiError(
      data?.error?.message || 'Não foi possível carregar este vídeo.',
      {
        code: data?.error?.code || 'HTTP_ERROR',
        details: data?.error?.details || null,
        status: response.status,
      },
    );
  }
  if (!data || !Array.isArray(data.words)) {
    throw new ApiError('O servidor respondeu num formato inesperado.', {
      code: 'BAD_PAYLOAD',
    });
  }
  return data;
}
