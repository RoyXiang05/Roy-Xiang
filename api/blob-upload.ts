import crypto from 'node:crypto';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  if (!isAdmin(request)) return response.status(401).json({ error: 'Administrator login required' });
  try {
    const result = await handleUpload({
      body: request.body as HandleUploadBody,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/*', 'video/*', 'application/pdf'],
        maximumSizeInBytes: 100 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Unable to start upload' });
  }
}
