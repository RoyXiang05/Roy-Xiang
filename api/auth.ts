import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function readSession(request: VercelRequest) {
  const token = request.headers.cookie?.match(/(?:^|; )portfolio_admin=([^;]+)/)?.[1];
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [expiresAt, signature] = decodeURIComponent(token).split('.');
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;
  const expected = crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(expiresAt).digest('base64url');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export default function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'GET') return response.status(200).json({ isAdmin: readSession(request) });
  if (request.method === 'DELETE') {
    response.setHeader('Set-Cookie', 'portfolio_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
    return response.status(200).json({ success: true });
  }
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const expectedPassword = process.env.ADMIN_PASSWORD || '';
  if (!expectedPassword || !crypto.timingSafeEqual(
    crypto.createHash('sha256').update(password).digest(),
    crypto.createHash('sha256').update(expectedPassword).digest()
  )) return response.status(401).json({ error: 'Incorrect password' });

  const expiresAt = String(Date.now() + 12 * 60 * 60 * 1000);
  const signature = crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET!).update(expiresAt).digest('base64url');
  response.setHeader('Set-Cookie', `portfolio_admin=${encodeURIComponent(`${expiresAt}.${signature}`)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
  return response.status(200).json({ success: true, isAdmin: true });
}
