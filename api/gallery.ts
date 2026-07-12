import { del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, getSql } from './_lib';

function isAdmin(request: VercelRequest) {
  return Boolean(request.headers.cookie?.includes('portfolio_admin='));
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
  const sql = getSql();
  await ensureSchema();
  if (request.method === 'GET') {
    const rows = await sql`SELECT project_id, media_url, link_url, poster_url FROM gallery_items ORDER BY project_id, sort_order`;
    const data: Record<string, any> = {};
    for (const row of rows as any[]) {
      const item = data[row.project_id] ||= { galleryImages: [], galleryLinks: {}, videoPosters: {} };
      item.galleryImages.push(row.media_url);
      if (row.link_url) item.galleryLinks[row.media_url] = row.link_url;
      if (row.poster_url) item.videoPosters[row.media_url] = row.poster_url;
    }
    return response.status(200).json(data);
  }
  if (!isAdmin(request)) return response.status(401).json({ error: 'Administrator login required' });
  if (request.method === 'POST') {
    const { projectId, galleryImages = [], galleryLinks = {}, videoPosters = {} } = request.body || {};
    if (!projectId) return response.status(400).json({ error: 'Missing projectId' });
    await sql`DELETE FROM gallery_items WHERE project_id = ${projectId}`;
    for (const [index, url] of [...new Set(galleryImages as string[])].entries()) {
      await sql`INSERT INTO gallery_items (project_id, media_url, link_url, poster_url, sort_order) VALUES (${projectId}, ${url}, ${galleryLinks[url] || ''}, ${videoPosters[url] || ''}, ${index})`;
    }
    return response.status(200).json({ success: true });
  }
  if (request.method === 'DELETE') {
    const { projectId, mediaUrl } = request.body || {};
    await sql`DELETE FROM gallery_items WHERE project_id = ${projectId} AND media_url = ${mediaUrl}`;
    if (typeof mediaUrl === 'string' && mediaUrl.includes('.public.blob.vercel-storage.com')) await del(mediaUrl);
    return response.status(200).json({ success: true });
  }
  return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Gallery API failed', error);
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Gallery database error' });
  }
}
