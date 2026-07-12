import { del } from '@vercel/blob';
import { ensureSchema, getSql, isAdmin } from './_lib';

export default async function handler(request: Request) {
  await ensureSchema();
  const sql = getSql();
  if (request.method === 'GET') {
    const rows = await sql`SELECT project_id, media_url, link_url, poster_url FROM gallery_items ORDER BY project_id, sort_order`;
    const data: Record<string, any> = {};
    for (const row of rows as any[]) {
      const item = data[row.project_id] ||= { galleryImages: [], galleryLinks: {}, videoPosters: {} };
      item.galleryImages.push(row.media_url);
      if (row.link_url) item.galleryLinks[row.media_url] = row.link_url;
      if (row.poster_url) item.videoPosters[row.media_url] = row.poster_url;
    }
    return Response.json(data);
  }
  if (!isAdmin(request)) return Response.json({ error: 'Administrator login required' }, { status: 401 });
  if (request.method === 'POST') {
    const { projectId, galleryImages = [], galleryLinks = {}, videoPosters = {} } = await request.json();
    if (!projectId) return Response.json({ error: 'Missing projectId' }, { status: 400 });
    await sql`DELETE FROM gallery_items WHERE project_id = ${projectId}`;
    for (const [index, rawUrl] of [...new Set(galleryImages as string[])].entries()) {
      const url = String(rawUrl);
      await sql`INSERT INTO gallery_items (project_id, media_url, link_url, poster_url, sort_order) VALUES (${projectId}, ${url}, ${galleryLinks[url] || ''}, ${videoPosters[url] || ''}, ${index})`;
    }
    return Response.json({ success: true });
  }
  if (request.method === 'DELETE') {
    const { projectId, mediaUrl } = await request.json();
    await sql`DELETE FROM gallery_items WHERE project_id = ${projectId} AND media_url = ${mediaUrl}`;
    if (typeof mediaUrl === 'string' && mediaUrl.includes('.public.blob.vercel-storage.com')) await del(mediaUrl);
    return Response.json({ success: true });
  }
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
