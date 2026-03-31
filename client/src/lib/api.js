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

async function uploadFile(method, path, file, fieldName = 'file') {
  const formData = new FormData();
  formData.append(fieldName, file);

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.error || 'Upload failed');
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
  upload: (path, file, { method = 'POST', fieldName = 'file' } = {}) =>
    uploadFile(method, path, file, fieldName),
};

export default api;
