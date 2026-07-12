import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

export function getSql() {
  const url = process.env.DATABASE_URL || process.env.DATABASE_POSTGRES_URL;
  if (!url) throw new Error('Database connection is not configured');
  return neon(url);
}

export async function ensureSchema() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS gallery_items (
    id BIGSERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    media_url TEXT NOT NULL,
    link_url TEXT NOT NULL DEFAULT '',
    poster_url TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL,
    UNIQUE(project_id, media_url)
  )`;
}

function signature(value: string) {
  return crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '').update(value).digest('base64url');
}

export function isAdmin(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const token = cookie.match(/(?:^|; )portfolio_admin=([^;]+)/)?.[1];
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [expiresAt, sig] = decodeURIComponent(token).split('.');
  return Boolean(expiresAt && sig && Number(expiresAt) > Date.now() && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(signature(expiresAt))));
}

export function adminCookie() {
  const expiresAt = String(Date.now() + 12 * 60 * 60 * 1000);
  return `portfolio_admin=${encodeURIComponent(`${expiresAt}.${signature(expiresAt)}`)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`;
}
