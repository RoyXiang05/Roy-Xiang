import multer from 'multer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export const config = { api: { bodyParser: false } };

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
    if (!request.headers.cookie?.includes('portfolio_admin=')) return response.status(401).json({ error: 'Administrator login required' });
    await new Promise<void>((resolve, reject) => upload.single('file')(request as any, response as any, error => error ? reject(error) : resolve()));
    const file = (request as any).file as Express.Multer.File | undefined;
    if (!file) return response.status(400).json({ error: 'Missing file' });
    const { put } = await import('@vercel/blob');
    const blob = await put(`portfolio/${Date.now()}-${file.originalname}`, file.buffer, { access: 'public', addRandomSuffix: true, contentType: file.mimetype });
    return response.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Upload API failed', error);
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Upload failed' });
  }
}
