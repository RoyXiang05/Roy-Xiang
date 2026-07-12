export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
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
  
  return fetch(input, newInit);
}
