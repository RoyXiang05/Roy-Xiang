import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

const execPromise = promisify(exec);

const upload = multer({
  dest: '/tmp/',
  limits: {
    fileSize: 300 * 1024 * 1024, // 300MB limit to handle large video files
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up larger limit for base64 file uploads (videos/images)
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploads statically under /uploads with magic bytes sniffing to serve correct Content-Type (especially for GIF/PNG files renamed with .jpg extension)
  const staticOptions = {
    setHeaders: (res: express.Response, filePath: string) => {
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const fd = fs.openSync(filePath, 'r');
          const buffer = Buffer.alloc(4);
          fs.readSync(fd, buffer, 0, 4, 0);
          fs.closeSync(fd);

          // Check for GIF magic bytes: 'G', 'I', 'F', '8'
          if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
            res.setHeader('Content-Type', 'image/gif');
          } 
          // Check for PNG magic bytes
          else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            res.setHeader('Content-Type', 'image/png');
          } 
          // Check for JPEG magic bytes
          else if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
            res.setHeader('Content-Type', 'image/jpeg');
          }
        }
      } catch (e) {
        // Ignore
      }
    }
  };

  app.get('/uploads/:filename', (req, res, next) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();
      const isVideo = ext === '.mp4' || ext === '.webm' || ext === '.mov' || ext === '.ogg' || ext === '.m4v' || ext === '.avi';
      
      if (isVideo) {
        const defaultVideo = path.join(uploadsDir, '1783661864440_test.mp4');
        if (fs.existsSync(defaultVideo)) {
          try {
            fs.copyFileSync(defaultVideo, filePath);
            console.log(`[Fallback] Created fallback video for missing: ${filename}`);
          } catch (e) {
            console.error('[Fallback] Failed to copy fallback video:', e);
          }
        }
      } else {
        const recommendedDir = path.join(process.cwd(), 'portfolio_mapping', 'recommended_assets');
        if (fs.existsSync(recommendedDir)) {
          try {
            const files = fs.readdirSync(recommendedDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
            if (files.length > 0) {
              // Use a hash of the filename to pick a deterministic file from the recommended assets
              // to keep the visual identity consistent and non-random
              let hash = 0;
              for (let i = 0; i < filename.length; i++) {
                hash = (hash << 5) - hash + filename.charCodeAt(i);
                hash |= 0; // Convert to 32bit integer
              }
              const index = Math.abs(hash) % files.length;
              const sourcePath = path.join(recommendedDir, files[index]);
              fs.copyFileSync(sourcePath, filePath);
              console.log(`[Fallback] Created fallback image for missing: ${filename} from deterministic index ${index} (${files[index]})`);
            }
          } catch (e) {
            console.error('[Fallback] Failed to copy fallback image:', e);
          }
        }
      }
    }
    next();
  });

  app.use('/uploads', express.static(uploadsDir, staticOptions));
  app.use('/portfolio_mapping', express.static(path.join(process.cwd(), 'portfolio_mapping'), staticOptions));

  // --- API ROUTES ---

  // Helper function to process uploaded files (videos, gifs, images, PDFs)
  async function processUploadedFile(
    tempPath: string,
    fileName: string,
    shouldCleanupTemp: boolean,
    uploadsDir: string,
    res: express.Response
  ) {
    try {
      let isVideo = false;
      let isGif = false;
      const ext = path.extname(fileName).toLowerCase();
      isVideo = ext === '.mp4' || ext === '.webm' || ext === '.mov' || ext === '.ogg' || ext === '.m4v' || ext === '.avi';
      isGif = ext === '.gif';

      // Sanitize fileName to prevent directory traversal
      const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();

      if (isVideo) {
        // Always transcode to .mp4 for absolute browser compatibility
        const optimizedName = `opt_${timestamp}_${baseName}.mp4`;
        const optimizedPath = path.join(uploadsDir, optimizedName);
        const posterName = `poster_${timestamp}_${baseName}.jpg`;
        const posterPath = path.join(uploadsDir, posterName);

        console.log(`[API] Video optimization started for: ${fileName}`);

        try {
          const ffmpegCmd = `ffmpeg -y -i "${tempPath}" -vcodec libx264 -crf 26 -preset superfast -vf "scale='min(1920,iw)':-2" -acodec aac -b:a 128k -movflags +faststart "${optimizedPath}"`;
          await execPromise(ffmpegCmd);
          console.log(`[API] Video optimization complete. Compressed size: ${fs.statSync(optimizedPath).size} bytes.`);

          // Extract first frame as poster
          try {
            const ffmpegPosterCmd = `ffmpeg -y -i "${optimizedPath}" -ss 00:00:00 -vframes 1 -q:v 4 "${posterPath}"`;
            await execPromise(ffmpegPosterCmd);
            console.log(`[API] Poster extraction complete for ${posterName}`);
          } catch (posterErr) {
            console.error('[API] Failed to extract poster frame:', posterErr);
          }
          
          if (shouldCleanupTemp && tempPath && fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          
          const posterUrl = fs.existsSync(posterPath) ? `/uploads/${posterName}` : undefined;
          return res.json({ url: `/uploads/${optimizedName}`, poster: posterUrl });
        } catch (ffmpegErr: any) {
          console.error('[API] ffmpeg failed, falling back to original upload:', ffmpegErr);
          const finalFallbackName = `${timestamp}_${baseName}${ext || '.mp4'}`;
          const finalFallbackPath = path.join(uploadsDir, finalFallbackName);
          fs.copyFileSync(tempPath, finalFallbackPath);
          
          if (shouldCleanupTemp && tempPath && fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          return res.json({ url: `/uploads/${finalFallbackName}` });
        }
      } else if (isGif) {
        // Save original GIF
        const finalName = `${timestamp}_${baseName}.gif`;
        const filePath = path.join(uploadsDir, finalName);
        fs.copyFileSync(tempPath, filePath);
        console.log(`[API] Saved GIF file to ${filePath}`);

        // Extract first frame of GIF as poster
        const posterName = `poster_${timestamp}_${baseName}.jpg`;
        const posterPath = path.join(uploadsDir, posterName);

        try {
          const ffmpegPosterCmd = `ffmpeg -y -i "${filePath}" -vframes 1 -q:v 4 "${posterPath}"`;
          await execPromise(ffmpegPosterCmd);
          console.log(`[API] GIF poster extraction complete for ${posterName}`);
        } catch (posterErr) {
          console.error('[API] Failed to extract poster frame from GIF:', posterErr);
        }

        if (shouldCleanupTemp && tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }

        const posterUrl = fs.existsSync(posterPath) ? `/uploads/${posterName}` : undefined;
        return res.json({ url: `/uploads/${finalName}`, poster: posterUrl });
      } else {
        // Standard image or non-video static file upload (like PDF)
        const finalName = `${timestamp}_${baseName}${ext}`;
        const filePath = path.join(uploadsDir, finalName);
        fs.copyFileSync(tempPath, filePath);
        console.log(`[API] Saved static file to ${filePath}`);

        if (shouldCleanupTemp && tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }

        return res.json({ url: `/uploads/${finalName}` });
      }
    } catch (err: any) {
      console.error('[API] processUploadedFile error:', err);
      if (shouldCleanupTemp && tempPath && fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (_) {}
      }
      return res.status(500).json({ error: err.message || 'Failed to save file' });
    }
  }

  // --- ADMIN SESSION & AUTHENTICATION STATE ---
  const sessionStore = new Set<string>();
  const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

  function isRateLimited(ip: string): boolean {
    const attempt = loginAttempts.get(ip);
    if (!attempt) return false;
    const now = Date.now();
    // Lockout for 15 minutes if more than 5 failed attempts
    if (attempt.count >= 5 && now - attempt.lastAttempt < 15 * 60 * 1000) {
      return true;
    }
    // Reset after 15 minutes
    if (now - attempt.lastAttempt >= 15 * 60 * 1000) {
      loginAttempts.delete(ip);
      return false;
    }
    return false;
  }

  function recordAttempt(ip: string, success: boolean) {
    if (success) {
      loginAttempts.delete(ip);
      return;
    }
    const now = Date.now();
    const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
    attempt.count++;
    attempt.lastAttempt = now;
    loginAttempts.set(ip, attempt);
  }

  const checkAdminSession = (req: express.Request): boolean => {
    // 1. Check custom x-admin-token header
    const xToken = req.headers['x-admin-token'];
    if (xToken && typeof xToken === 'string' && sessionStore.has(xToken)) {
      return true;
    }

    // 2. Check Authorization Bearer token header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bToken = authHeader.substring(7).trim();
      if (sessionStore.has(bToken)) {
        return true;
      }
    }

    // 3. Check query param token
    const qToken = req.query.token;
    if (qToken && typeof qToken === 'string' && sessionStore.has(qToken)) {
      return true;
    }

    // 4. Fallback to traditional cookie check
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return false;
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === 'admin_session') {
        return sessionStore.has(value);
      }
    }
    return false;
  };

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (checkAdminSession(req)) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized: Admin session required' });
    }
  };

  // Admin endpoints
  app.post('/api/admin/login', (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many failed login attempts. Please try again after 15 minutes.' });
    }

    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      recordAttempt(ip, true);
      const token = Math.random().toString(36).substring(2) + '-' + Date.now().toString(36);
      sessionStore.add(token);

      const isProd = process.env.NODE_ENV === 'production';
      const cookieOptions = [
        `admin_session=${token}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        isProd ? 'Secure' : ''
      ].filter(Boolean).join('; ');

      res.setHeader('Set-Cookie', cookieOptions);
      return res.json({ success: true, token });
    } else {
      recordAttempt(ip, false);
      return res.status(401).json({ error: 'Incorrect password' });
    }
  });

  app.get('/api/admin/status', (req, res) => {
    const isAdmin = checkAdminSession(req);
    res.json({ isAdmin });
  });

  app.post('/api/admin/logout', (req, res) => {
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === 'admin_session') {
          sessionStore.delete(value);
        }
      }
    }
    res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    res.json({ success: true });
  });

  // Upload endpoint with automatic video optimization (secured)
  app.post('/api/upload', requireAdmin, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('[API] Multer upload error:', err);
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      next();
    });
  }, async (req: express.Request, res: express.Response) => {
    let tempPath: string | null = null;
    let shouldCleanupTemp = false;
    try {
      let fileName: string;

      if (req.file) {
        fileName = req.file.originalname;
        tempPath = req.file.path;
        shouldCleanupTemp = true; // multer created this temp file, we should delete it when done
      } else {
        const { fileName: bodyFileName, fileData } = req.body;
        if (!bodyFileName || !fileData) {
          return res.status(400).json({ error: 'Missing fileName or fileData' });
        }
        fileName = bodyFileName;

        // Write base64 body to a temp file
        let buffer: Buffer;
        if (fileData.startsWith('data:')) {
          const commaIndex = fileData.indexOf(',');
          if (commaIndex !== -1) {
            buffer = Buffer.from(fileData.substring(commaIndex + 1), 'base64');
          } else {
            buffer = Buffer.from(fileData, 'base64');
          }
        } else {
          buffer = Buffer.from(fileData, 'base64');
        }

        const ext = path.extname(fileName).toLowerCase();
        const timestamp = Date.now();
        const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9.-]/g, '_');
        tempPath = path.join('/tmp', `upload_json_${timestamp}_${baseName}${ext}`);
        fs.writeFileSync(tempPath, buffer);
        shouldCleanupTemp = true;
      }

      return await processUploadedFile(tempPath, fileName, shouldCleanupTemp, uploadsDir, res);
    } catch (err: any) {
      console.error('[API] Upload error:', err);
      if (shouldCleanupTemp && tempPath && fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (_) {}
      }
      return res.status(500).json({ error: err.message || 'Failed to save file' });
    }
  });

  // Chunked upload endpoint
  app.post('/api/upload-chunk', requireAdmin, (req, res, next) => {
    upload.single('chunk')(req, res, (err) => {
      if (err) {
        console.error('[API] Multer chunk upload error:', err);
        return res.status(400).json({ error: err.message || 'Chunk upload error' });
      }
      next();
    });
  }, async (req: express.Request, res: express.Response) => {
    try {
      const { chunkIndex, totalChunks, uploadId, fileName } = req.body;
      if (!uploadId || !fileName || chunkIndex === undefined || totalChunks === undefined) {
        return res.status(400).json({ error: 'Missing required chunk parameters' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No chunk file provided' });
      }

      const idx = parseInt(chunkIndex, 10);
      const total = parseInt(totalChunks, 10);

      // Create a unique folder for this upload session's chunks
      const chunkFolder = path.join('/tmp', `chunks_${uploadId}`);
      if (!fs.existsSync(chunkFolder)) {
        fs.mkdirSync(chunkFolder, { recursive: true });
      }

      // Move multer's temp file to the chunk folder with a sequential name
      const chunkPath = path.join(chunkFolder, `chunk_${idx}`);
      fs.copyFileSync(req.file.path, chunkPath);
      try { fs.unlinkSync(req.file.path); } catch (_) {}

      // Check if all chunks are uploaded
      let allUploaded = true;
      for (let i = 0; i < total; i++) {
        if (!fs.existsSync(path.join(chunkFolder, `chunk_${i}`))) {
          allUploaded = false;
          break;
        }
      }

      if (allUploaded) {
        // Merge chunks
        const ext = path.extname(fileName).toLowerCase();
        const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9.-]/g, '_');
        const mergedPath = path.join('/tmp', `merged_${uploadId}_${baseName}${ext}`);

        // Write sequentially
        fs.writeFileSync(mergedPath, '');
        for (let i = 0; i < total; i++) {
          const currentChunkPath = path.join(chunkFolder, `chunk_${i}`);
          const buf = fs.readFileSync(currentChunkPath);
          fs.appendFileSync(mergedPath, buf);
        }

        // Clean up chunk folder
        try {
          fs.rmSync(chunkFolder, { recursive: true, force: true });
        } catch (rmErr) {
          console.error('[API] Error cleaning up chunk folder:', rmErr);
        }

        console.log(`[API] Chunked upload complete for ${fileName}. Merging finished: ${mergedPath}`);
        
        // Process the merged file
        return await processUploadedFile(mergedPath, fileName, true, uploadsDir, res);
      } else {
        // Return status
        return res.json({ status: 'uploading', chunkReceived: idx });
      }
    } catch (err: any) {
      console.error('[API] Chunk upload error:', err);
      return res.status(500).json({ error: err.message || 'Failed to handle chunk' });
    }
  });

  // Save gallery config endpoint
  app.post('/api/save-gallery', requireAdmin, (req, res) => {
    try {
      const { projectId, galleryImages, galleryLinks, videoPosters, galleryColumns } = req.body;
      if (!projectId) {
        return res.status(400).json({ error: 'Missing projectId' });
      }

      const configPath = path.join(uploadsDir, 'gallery_config.json');
      let config: Record<string, { 
        galleryImages: string[], 
        galleryLinks: Record<string, string>,
        videoPosters?: Record<string, string>,
        galleryColumns?: number
      }> = {};

      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) {
          console.error('[API] Error parsing existing config:', e);
        }
      }

      config[projectId] = {
        galleryImages: galleryImages || [],
        galleryLinks: galleryLinks || {},
        videoPosters: videoPosters || {},
        galleryColumns: typeof galleryColumns === 'number' ? galleryColumns : 2
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      console.log(`[API] Saved gallery configuration for project: ${projectId} with columns: ${galleryColumns}`);

      return res.json({ success: true });
    } catch (err: any) {
      console.error('[API] Save gallery error:', err);
      return res.status(500).json({ error: err.message || 'Failed to save gallery config' });
    }
  });

  // Get gallery configs endpoint
  app.get('/api/gallery', (req, res) => {
    try {
      const configPath = path.join(uploadsDir, 'gallery_config.json');
      let config: Record<string, {
        galleryImages: string[],
        galleryLinks: Record<string, string>,
        videoPosters: Record<string, string>
      }> = {};

      if (fs.existsSync(configPath)) {
        try {
          const content = fs.readFileSync(configPath, 'utf8').trim();
          if (content) {
            config = JSON.parse(content);
          }
        } catch (e) {
          console.error('[API] Error parsing existing config:', e);
        }
      }

      // Auto-discover and restore valid physical media files in public/uploads/
      let hasChanges = false;
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        const discoveredVideos: string[] = [];
        const discoveredPosters: Record<string, string> = {};
        const discoveredImages: string[] = [];

        files.forEach(file => {
          const filePath = path.join(uploadsDir, file);
          try {
            const stats = fs.statSync(filePath);
            // Ignore small dummy test files (< 1000 bytes)
            if (stats.isFile() && stats.size > 1000) {
              const ext = path.extname(file).toLowerCase();
              if (ext === '.mp4') {
                const videoUrl = `/uploads/${file}#video`;
                discoveredVideos.push(videoUrl);
                
                // Find corresponding poster file
                const base = file.replace('opt_', '').replace('.mp4', '');
                const posterFile = files.find(f => f.startsWith('poster_') && f.includes(base) && f.endsWith('.jpg'));
                if (posterFile) {
                  discoveredPosters[videoUrl] = `/uploads/${posterFile}`;
                }
              } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif') {
                if (!file.startsWith('poster_')) {
                  discoveredImages.push(`/uploads/${file}#image`);
                }
              } else if (ext === '.pdf') {
                discoveredImages.push(`/uploads/${file}#pdf`);
              }
            }
          } catch (statErr) {
            console.error('[API] Error stating file:', file, statErr);
          }
        });

        // We automatically merge these discovered real files into the default project config
        const targetProjectId = 'ai-visual-production-workflow';
        if (!config[targetProjectId]) {
          config[targetProjectId] = {
            galleryImages: [],
            galleryLinks: {},
            videoPosters: {}
          };
          hasChanges = true;
        }

        const projectConfig = config[targetProjectId];
        if (!projectConfig.galleryImages) projectConfig.galleryImages = [];
        if (!projectConfig.galleryLinks) projectConfig.galleryLinks = {};
        if (!projectConfig.videoPosters) projectConfig.videoPosters = {};

        // Filter out any blob: URLs from the server-side config file just in case they slipped in
        const originalLength = projectConfig.galleryImages.length;
        projectConfig.galleryImages = projectConfig.galleryImages.filter(url => !url.startsWith('blob:'));
        if (projectConfig.galleryImages.length !== originalLength) {
          hasChanges = true;
        }

        const existingUrls = new Set(projectConfig.galleryImages);
        const allDiscovered = [...discoveredVideos, ...discoveredImages];

        allDiscovered.forEach(url => {
          if (!existingUrls.has(url)) {
            projectConfig.galleryImages.push(url);
            existingUrls.add(url);
            hasChanges = true;
          }
        });

        // Merge discovered posters
        Object.entries(discoveredPosters).forEach(([videoUrl, posterUrl]) => {
          if (projectConfig.videoPosters[videoUrl] !== posterUrl) {
            projectConfig.videoPosters[videoUrl] = posterUrl;
            hasChanges = true;
          }
        });
      }

      // If changes occurred or the file didn't exist, save the repaired/discovered config
      if (hasChanges || !fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        console.log('[API] Auto-discovered and repaired gallery config stored successfully.');
      }

      return res.json(config);
    } catch (err: any) {
      console.error('[API] Load gallery error:', err);
      return res.status(500).json({ error: err.message || 'Failed to load gallery config' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Catch-all for unmatched API routes to ensure they return JSON 404 instead of falling through
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  // Global error handler to ensure all API errors return JSON instead of HTML
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Global Error Handler]:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
    });
  });

  // --- VITE MIDDLEWARE / STATIC ASSETS ---

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Server] Starting Vite in middleware mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Serving built static assets in production mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
});
