// Client for the local model service (traffic-violation-ai: scripts/model_service.py).
// It runs on the machine with the GPU, so its URL and token are per-admin settings kept in localStorage,
// not part of the deployed backend.

const URL_KEY = 'modelServiceUrl';
const TOKEN_KEY = 'modelServiceToken';
const DEFAULT_URL = import.meta.env.VITE_MODEL_SERVICE_URL || 'http://127.0.0.1:8765';

export function getServiceSettings() {
  return {
    url: (localStorage.getItem(URL_KEY) || DEFAULT_URL).replace(/\/+$/, ''),
    token: localStorage.getItem(TOKEN_KEY) || '',
  };
}

export function saveServiceSettings({ url, token }) {
  localStorage.setItem(URL_KEY, url.trim().replace(/\/+$/, ''));
  localStorage.setItem(TOKEN_KEY, token.trim());
}

async function call(path, { method = 'GET', body, form } = {}) {
  const { url, token } = getServiceSettings();
  const headers = { 'X-Service-Token': token };
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(`${url}${path}`, {
      method,
      headers,
      body: form || (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new Error(`Cannot reach the model service at ${url}. Is it running on this machine?`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Model service error ${res.status}`);
  return data;
}

// URLs the browser loads directly (<img>, <video>) cannot send headers, so the token goes in the query.
export function mediaUrl(path, cacheKey) {
  const { url, token } = getServiceSettings();
  const q = new URLSearchParams({ token });
  if (cacheKey) q.set('k', cacheKey);
  return `${url}${path}?${q}`;
}

export const modelServiceAPI = {
  health: () => call('/health'),
  startLive: (opts) => call('/live/start', { method: 'POST', body: opts }),
  stopLive: () => call('/live/stop', { method: 'POST' }),
  liveStatus: () => call('/live/status'),
  uploadVideo: (file, opts) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(opts).forEach(([k, v]) => v != null && v !== '' && form.append(k, v));
    return call('/video-jobs', { method: 'POST', form });
  },
  jobStatus: (id) => call(`/video-jobs/${id}`),
  cancelJob: (id) => call(`/video-jobs/${id}/cancel`, { method: 'POST' }),
};
