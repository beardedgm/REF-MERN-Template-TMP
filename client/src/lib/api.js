const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(method, path, body) {
  const options = {
    method,
    credentials: 'include',
    headers: {},
  };

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    error.details = data.details;
    throw error;
  }

  return res.json();
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export default api;
