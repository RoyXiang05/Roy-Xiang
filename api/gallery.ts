import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

function isAdmin(request: VercelRequest) {
  const token = request.headers.cookie?.match(/(?:^|; )portfolio_admin=([^;]+)/)?.[1];
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return false;

  const [expiresAt, signature] = decodeURIComponent(token).split('.');
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret).update(expiresAt).digest('base64url');
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
  // Dynamic imports keep a module-load error inside this handler, so the client
  // receives a useful JSON error instead of Vercel's opaque invocation failure.
  const { neon, neonConfig } = await import('@neondatabase/serverless');
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_POSTGRES_URL;
  if (!databaseUrl) throw new Error('Database connection is not configured');

  neonConfig.fetchFunction = (url, options) => fetch(url, {
    ...options,
    signal: AbortSignal.timeout(8_000),
  });
  const sql = neon(databaseUrl);
  await sql`CREATE TABLE IF NOT EXISTS gallery_items (
    id BIGSERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    media_url TEXT NOT NULL,
    link_url TEXT NOT NULL DEFAULT '',
    poster_url TEXT NOT NULL DEFAULT '',
    gallery_columns INTEGER NOT NULL DEFAULT 2,
    sort_order INTEGER NOT NULL,
    UNIQUE(project_id, media_url)
  )`;
  // Existing installations were created before the column setting existed.
  await sql`ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS gallery_columns INTEGER NOT NULL DEFAULT 2`;
  if (request.method === 'GET') {
    const rows = await sql`SELECT project_id, media_url, link_url, poster_url, gallery_columns FROM gallery_items ORDER BY project_id, sort_order`;
    const data: Record<string, any> = {};
    for (const row of rows as any[]) {
      const item = data[row.project_id] ||= { galleryImages: [], galleryLinks: {}, videoPosters: {}, galleryColumns: row.gallery_columns };
      item.galleryImages.push(row.media_url);
      if (row.link_url) item.galleryLinks[row.media_url] = row.link_url;
      if (row.poster_url) item.videoPosters[row.media_url] = row.poster_url;
    }
    return response.status(200).json(data);
  }
  if (!isAdmin(request)) return response.status(401).json({ error: 'Administrator login required' });
  if (request.method === 'POST') {
    const { projectId, galleryImages = [], galleryLinks = {}, videoPosters = {}, galleryColumns = 2 } = request.body || {};
    if (!projectId) return response.status(400).json({ error: 'Missing projectId' });
    await sql`DELETE FROM gallery_items WHERE project_id = ${projectId}`;
    for (const [index, url] of [...new Set(galleryImages as string[])].entries()) {
      const columns = galleryColumns === 3 ? 3 : 2;
      await sql`INSERT INTO gallery_items (project_id, media_url, link_url, poster_url, gallery_columns, sort_order) VALUES (${projectId}, ${url}, ${galleryLinks[url] || ''}, ${videoPosters[url] || ''}, ${columns}, ${index})`;
    }
    return response.status(200).json({ success: true });
  }
  if (request.method === 'DELETE') {
    const { projectId, mediaUrl } = request.body || {};
    await sql`DELETE FROM gallery_items WHERE project_id = ${projectId} AND media_url = ${mediaUrl}`;
    if (typeof mediaUrl === 'string' && mediaUrl.includes('.public.blob.vercel-storage.com')) {
      const { del } = await import('@vercel/blob');
      await del(mediaUrl);
    }
    return response.status(200).json({ success: true });
  }
  return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Gallery API failed', error);
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Gallery database error' });
  }
}
