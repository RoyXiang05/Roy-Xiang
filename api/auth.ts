import crypto from 'node:crypto';
import { adminCookie, isAdmin } from './_lib';

export default async function handler(request: Request) {
  if (request.method === 'GET') return Response.json({ isAdmin: isAdmin(request) });
  if (request.method === 'POST') {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD || '';
    if (!expected || !crypto.timingSafeEqual(crypto.createHash('sha256').update(String(password)).digest(), crypto.createHash('sha256').update(expected).digest())) return Response.json({ error: 'Incorrect password' }, { status: 401 });
    return new Response(JSON.stringify({ success: true }), { headers: { 'content-type': 'application/json', 'set-cookie': adminCookie() } });
  }
  if (request.method === 'DELETE') {
    return new Response(JSON.stringify({ success: true }), { headers: { 'content-type': 'application/json', 'set-cookie': 'portfolio_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' } });
  }
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
