import { put } from '@vercel/blob';
import { isAdmin } from './_lib';

export default async function handler(request: Request) {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  if (!isAdmin(request)) return Response.json({ error: 'Administrator login required' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'Missing file' }, { status: 400 });
  const blob = await put(`portfolio/${Date.now()}-${file.name}`, file, { access: 'public', addRandomSuffix: true });
  return Response.json({ url: blob.url });
}
