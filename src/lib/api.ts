export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const mappedInput = typeof input === 'string'
    ? input.replace('/api/save-gallery', '/api/gallery')
      .replace('/api/admin/status', '/api/auth')
      .replace('/api/admin/login', '/api/auth')
      .replace('/api/admin/logout', '/api/auth')
    : input;
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const newInit: RequestInit = { ...init };
  newInit.credentials = 'include';
  
  if (token) {
    const headers = new Headers(newInit.headers);
    if (!headers.has('x-admin-token')) {
      headers.set('x-admin-token', token);
    }
    newInit.headers = headers;
  }
  
  if (typeof input === 'string' && input.includes('/api/admin/logout')) newInit.method = 'DELETE';
  return fetch(mappedInput, newInit);
}
