const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export function getDashboard({ signal } = {}) {
  return request('/api/dashboard', { signal });
}

export function sendControl(moduleId, control, value) {
  return request(`/api/modules/${moduleId}/control`, {
    method: 'POST',
    body: JSON.stringify({ control, value }),
  });
}
