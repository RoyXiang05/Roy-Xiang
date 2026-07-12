import React, { useState, useEffect, useRef } from 'react';
import { Work, WORKS, isBrokenUrl, cleanMediaUrl } from '../../data';
import { ArrowUp, ArrowDown, Trash2, Plus, Sliders, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon, Upload, Crop, Check, X, RotateCw, Maximize } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface GalleryItem {
  url: string;
  link?: string;
}

interface BatchUploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface WorkDetailScreenProps {
  project: Work;
  onNavigateBack: () => void;
  onSelectProject: (project: Work) => void;
  isAdmin?: boolean;
  onNavigate?: (view: string) => void;
}

export default function WorkDetailScreen({
  project,
  onNavigateBack,
  onSelectProject,
  isAdmin = false,
  onNavigate
 }: WorkDetailScreenProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [videoPosters, setVideoPosters] = useState<Record<string, string>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [galleryColumns, setGalleryColumns] = useState<2 | 3>(2);
  const [newUrl, setNewUrl] = useState('');
  const [newLink, setNewLink] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  const [batchFiles, setBatchFiles] = useState<BatchUploadFile[]>([]);

  // --- Slideshow & Media Loading States ---
  const [activeSlide, setActiveSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'slides' | 'schematic'>('slides');
  const [failedMediaUrls, setFailedMediaUrls] = useState<Record<string, boolean>>({});
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});

  const getSafeUrl = (url: string): string => {
    if (!url || isBrokenUrl(url)) {
      return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    }
    return cleanMediaUrl(url);
  };

  // Helper for localStorage fallback for missing uploaded images
  const getMediaBackup = (url: string): string | null => {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      return window.localStorage.getItem(`media_backup_${url}`);
    } catch (e) {
      return null;
    }
  };

  const setMediaBackup = (url: string, base64: string) => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      // Only store if it fits in localStorage (under 2MB to be safe)
      if (base64 && base64.length < 2 * 1024 * 1024) {
        window.localStorage.setItem(`media_backup_${url}`, base64);
      }
    } catch (e) {
      console.warn('[LocalStorage] Failed to save media backup (storage full or disabled):', e);
    }
  };

  // --- CROP STATES & LOGIC ---
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [croppingItemIndex, setCroppingItemIndex] = useState<number | null>(null); // -1 for draft, index >= 0 for existing gallery items
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '16:9' | '4:3'>('free');
  const [rotation, setRotation] = useState(0);
  const [imageAspect, setImageAspect] = useState(1);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const openCropper = (src: string, index: number | null) => {
    setCropImageSrc(src);
    setCroppingItemIndex(index);
    setRotation(0);
    setCropAspect('free');
    setCropX(10);
    setCropY(10);
    setCropW(80);
    setCropH(80);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageAspect(img.width / img.height);
    };
    img.src = src;
  };

  const updateCropValues = (newX: number, newY: number, newW: number, newH: number, aspect = cropAspect) => {
    let x = Math.max(0, Math.min(100, newX));
    let y = Math.max(0, Math.min(100, newY));
    let w = Math.max(5, Math.min(100 - x, newW));
    let h = Math.max(5, Math.min(100 - y, newH));

    if (aspect !== 'free') {
      let targetRatio = 1;
      if (aspect === '16:9') targetRatio = 16 / 9;
      if (aspect === '4:3') targetRatio = 4 / 3;

      const is90or270 = rotation % 180 !== 0;
      const currentImageAspect = is90or270 ? (1 / imageAspect) : imageAspect;

      h = w * (currentImageAspect / targetRatio);

      if (y + h > 100) {
        h = 100 - y;
        w = h * (targetRatio / currentImageAspect);
      }
    }

    setCropX(Math.round(x));
    setCropY(Math.round(y));
    setCropW(Math.max(5, Math.round(w)));
    setCropH(Math.max(5, Math.round(h)));
  };

  const handleApplyCrop = () => {
    if (!cropImageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const rotatedCanvas = document.createElement('canvas');
      const rotCtx = rotatedCanvas.getContext('2d');
      if (!rotCtx) return;

      const angleRad = (rotation * Math.PI) / 180;
      const is90or270 = rotation % 180 !== 0;

      const rotW = is90or270 ? img.height : img.width;
      const rotH = is90or270 ? img.width : img.height;

      rotatedCanvas.width = rotW;
      rotatedCanvas.height = rotH;

      rotCtx.translate(rotW / 2, rotH / 2);
      rotCtx.rotate(angleRad);
      rotCtx.drawImage(img, -img.width / 2, -img.height / 2);

      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) return;

      const pixelX = (cropX / 100) * rotW;
      const pixelY = (cropY / 100) * rotH;
      const pixelW = (cropW / 100) * rotW;
      const pixelH = (cropH / 100) * rotH;

      // Cap maximum cropped width/height to 1000px to avoid massive base64 payloads
      const MAX_CROP_DIM = 1000;
      let targetW = pixelW;
      let targetH = pixelH;
      if (pixelW > MAX_CROP_DIM || pixelH > MAX_CROP_DIM) {
        if (pixelW > pixelH) {
          targetW = MAX_CROP_DIM;
          targetH = Math.round((pixelH * MAX_CROP_DIM) / pixelW);
        } else {
          targetH = MAX_CROP_DIM;
          targetW = Math.round((pixelW * MAX_CROP_DIM) / pixelH);
        }
      }

      cropCanvas.width = targetW;
      cropCanvas.height = targetH;

      cropCtx.drawImage(
        rotatedCanvas,
        pixelX, pixelY, pixelW, pixelH,
        0, 0, targetW, targetH
      );

      const isPng = cropImageSrc.startsWith('data:image/png') || cropImageSrc.toLowerCase().includes('.png');
      const croppedDataUrl = isPng 
        ? cropCanvas.toDataURL('image/png') 
        : cropCanvas.toDataURL('image/jpeg', 0.80);
      const fileExt = isPng ? 'png' : 'jpg';

      if (croppingItemIndex === -1) {
        setIsUploading(true);
        apiFetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: `cropped_draft.${fileExt}`,
            fileData: croppedDataUrl
          })
        })
        .then(res => {
          if (!res.ok) throw new Error('Upload failed');
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) throw new Error('Invalid content type');
          return res.json();
        })
        .then(data => {
          if (data && data.url) {
            const markedUrl = data.url + '#image';
            setNewUrl(markedUrl);
            setMediaBackup(markedUrl, croppedDataUrl);
          } else {
            setNewUrl(croppedDataUrl);
          }
          setIsUploading(false);
        })
        .catch(() => {
          setNewUrl(croppedDataUrl);
          setIsUploading(false);
        });
      } else if (croppingItemIndex !== null) {
        setIsUploading(true);
        apiFetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: `cropped_gallery_${croppingItemIndex}.${fileExt}`,
            fileData: croppedDataUrl
          })
        })
        .then(res => {
          if (!res.ok) throw new Error('Upload failed');
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) throw new Error('Invalid content type');
          return res.json();
        })
        .then(data => {
          const finalUrl = (data && data.url) ? data.url : croppedDataUrl;
          setMediaBackup(finalUrl, croppedDataUrl);
          const updated = [...galleryItems];
          updated[croppingItemIndex] = { ...updated[croppingItemIndex], url: finalUrl };
          setGalleryItems(updated);
          syncToProject(updated);
          setIsUploading(false);
        })
        .catch(() => {
          const updated = [...galleryItems];
          updated[croppingItemIndex] = { ...updated[croppingItemIndex], url: croppedDataUrl };
          setGalleryItems(updated);
          syncToProject(updated);
          setIsUploading(false);
        });
      }

      setCropImageSrc(null);
      setCroppingItemIndex(null);
    };
    img.src = cropImageSrc;
  };

  // Live preview generator for the crop box
  useEffect(() => {
    if (!cropImageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const angleRad = (rotation * Math.PI) / 180;
      const is90or270 = rotation % 180 !== 0;

      const rotW = is90or270 ? img.height : img.width;
      const rotH = is90or270 ? img.width : img.height;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = rotW;
      tempCanvas.height = rotH;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCtx.translate(rotW / 2, rotH / 2);
      tempCtx.rotate(angleRad);
      tempCtx.drawImage(img, -img.width / 2, -img.height / 2);

      const pixelX = (cropX / 100) * rotW;
      const pixelY = (cropY / 100) * rotH;
      const pixelW = (cropW / 100) * rotW;
      const pixelH = (cropH / 100) * rotH;

      canvas.width = 160;
      canvas.height = 160 * (pixelH / pixelW);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        tempCanvas,
        pixelX, pixelY, pixelW, pixelH,
        0, 0, canvas.width, canvas.height
      );
    };
    img.src = cropImageSrc;
  }, [cropImageSrc, cropX, cropY, cropW, cropH, rotation]);

  const compressImageFile = (file: File): Promise<File | Blob> => {
    return new Promise((resolve) => {
      const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
      if (isPng || !file.type.startsWith('image/') || file.type === 'image/gif') {
        return resolve(file);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_DIM = 1000;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(file);
          }

          ctx.drawImage(img, 0, 0, width, height);

          const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
          const mimeType = isPng ? 'image/png' : 'image/jpeg';
          const quality = isPng ? undefined : 0.70;

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, mimeType, quality);
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const processFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(null);
    setUploadError(null);
    
    // Server proxy has a body size limit (usually around 20MB).
    // Validate file size upfront to avoid 413 Payload Too Large error.
    const MAX_ALLOWED_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_ALLOWED_SIZE) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`File is too large (${sizeInMB}MB). The server's network limit is 20MB. Please upload a smaller file or a compressed version.`);
      setIsUploading(false);
      return;
    }
    
    const isVideo = file.type.startsWith('video/') || 
                    /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || 
                  /\.pdf$/i.test(file.name);
    
    const uploadFileInChunks = (
      fileToUpload: File | Blob, 
      originalFileName: string
    ): Promise<any> => {
      return new Promise((resolve, reject) => {
        const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
        const totalChunks = Math.ceil(fileToUpload.size / CHUNK_SIZE);
        const uploadId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        let currentChunk = 0;
        
        const uploadNextChunk = () => {
          const start = currentChunk * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, fileToUpload.size);
          const chunkBlob = fileToUpload.slice(start, end);
          
          const progressPercent = Math.round((currentChunk / totalChunks) * 100);
          setUploadProgress(`Uploading: ${progressPercent}% (Chunk ${currentChunk + 1}/${totalChunks})`);
          
          const formData = new FormData();
          formData.append('chunk', chunkBlob, originalFileName);
          formData.append('chunkIndex', currentChunk.toString());
          formData.append('totalChunks', totalChunks.toString());
          formData.append('uploadId', uploadId);
          formData.append('fileName', originalFileName);
          
          apiFetch('/api/upload-chunk', {
            method: 'POST',
            body: formData
          })
          .then(async res => {
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok) {
              let errMsg = `Chunk upload failed (${currentChunk + 1}/${totalChunks})`;
              if (contentType.includes('application/json')) {
                try {
                  const errData = await res.json();
                  if (errData && errData.error) errMsg = errData.error;
                } catch (_) {}
              } else {
                const text = await res.text();
                if (text.includes('Cookie check') || text.includes('<!DOCTYPE html>')) {
                  errMsg = `The proxy server redirected the chunk request. Each chunk must be smaller (currently 4MB).`;
                }
              }
              throw new Error(errMsg);
            }
            if (!contentType.includes('application/json')) {
              throw new Error('Server returned invalid response type');
            }
            return res.json();
          })
          .then(data => {
            if (data.status === 'uploading') {
              currentChunk++;
              uploadNextChunk();
            } else {
              setUploadProgress('Finalizing upload...');
              resolve(data);
            }
          })
          .catch(err => {
            reject(err);
          });
        };
        
        uploadNextChunk();
      });
    };

    compressImageFile(file).then((processedFile) => {
      const isLargeFile = processedFile.size > 4 * 1024 * 1024; // Files > 4MB uploaded in chunks
      
      let uploadPromise: Promise<any>;
      if (isLargeFile) {
        uploadPromise = uploadFileInChunks(processedFile, file.name);
      } else {
        setUploadProgress('Uploading...');
        const formData = new FormData();
        formData.append('file', processedFile);
        
        uploadPromise = apiFetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        .then(async res => {
          const contentType = res.headers.get('content-type') || '';
          if (!res.ok) {
            let errMsg = 'Upload failed on server';
            if (contentType.includes('application/json')) {
              try {
                const errData = await res.json();
                if (errData && errData.error) {
                  errMsg = errData.error;
                }
              } catch (_) {}
            } else {
              errMsg = `Server error (${res.status}). The uploaded file might be too large or invalid.`;
            }
            throw new Error(errMsg);
          }
          
          if (!contentType.includes('application/json')) {
            const text = await res.text();
            console.error('[Upload] Non-JSON response received:', text);
            const sample = text.substring(0, 300).trim();
            if (sample.includes('<!DOCTYPE html>') || sample.includes('<html')) {
              const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/i);
              const title = titleMatch ? titleMatch[1].trim() : '';
              if (title) {
                throw new Error(`Server returned HTML instead of JSON: "${title}". This may occur if the file is too large or if the request was redirected.`);
              } else {
                throw new Error('Server returned an HTML page instead of JSON. The uploaded file might exceed the server or proxy size limit (typically 20MB).');
              }
            }
            throw new Error(`Server returned an invalid response (not JSON): "${sample.substring(0, 80)}...".`);
          }
          return res.json();
        });
      }

       uploadPromise
      .then(data => {
        if (data && data.url) {
          const suffix = isVideo ? '#video' : (isPdf ? '#pdf' : '#image');
          const markedUrl = data.url + suffix;
          setNewUrl(markedUrl);
          
          // Save Base64 backup of this uploaded file
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setMediaBackup(markedUrl, reader.result);
            }
          };
          reader.readAsDataURL(processedFile);

          if (data.poster) {
            setVideoPosters(prev => ({
              ...prev,
              [markedUrl]: data.poster
            }));
          }
        } else {
          throw new Error('No URL returned from server');
        }
        setIsUploading(false);
        setUploadProgress(null);
      })
      .catch(err => {
        console.error('[Upload] Backend upload failed:', err);
        setUploadError(`${err.message || 'Upload failed'}. File processed and stored locally as Base64.`);
        setUploadProgress(null);
        try {
          // Fallback to reading processedFile as Base64 Data URL for completely persistent local storage!
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              const suffix = isVideo ? '#video' : (isPdf ? '#pdf' : '#image');
              setNewUrl(reader.result + suffix);
            }
          };
          reader.readAsDataURL(processedFile);
        } catch (e) {
          console.error('[Upload] Base64 fallback failed:', e);
        }
        setIsUploading(false);
      });
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const addFilesToBatch = (files: FileList | File[]) => {
    const list = Array.from(files);
    const maxAllowedSize = 20 * 1024 * 1024; // 20MB limit
    
    const newBatchItems = list.map(file => {
      const isTooLarge = file.size > maxAllowedSize;
      return {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: isTooLarge ? 'failed' as const : 'pending' as const,
        error: isTooLarge ? 'Exceeds 20MB limit' : undefined
      };
    });

    setBatchFiles(prev => [...prev, ...newBatchItems]);
    setUploadMode('batch');
  };

  const clearBatchList = () => {
    if (isUploading) return;
    setBatchFiles([]);
  };

  const removeBatchFile = (id: string) => {
    if (isUploading) return;
    setBatchFiles(prev => prev.filter(bf => bf.id !== id));
  };

  const clearCompletedBatchFiles = () => {
    if (isUploading) return;
    setBatchFiles(prev => prev.filter(bf => bf.status !== 'completed'));
  };

  const startBatchUpload = async () => {
    if (isUploading) return;
    const filesToUpload = batchFiles.filter(bf => bf.status === 'pending' || bf.status === 'failed');
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    for (const bf of filesToUpload) {
      // Set status to compressing
      setBatchFiles(prev => prev.map(item => 
        item.id === bf.id ? { ...item, status: 'compressing', progress: 0, error: undefined } : item
      ));

      const file = bf.file;
      const isVideo = file.type.startsWith('video/') || 
                      /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);
      const isPdf = file.type === 'application/pdf' || 
                    /\.pdf$/i.test(file.name);

      let processedFile: File | Blob = file;
      try {
        processedFile = await compressImageFile(file);

        setBatchFiles(prev => prev.map(item => 
          item.id === bf.id ? { ...item, status: 'uploading' } : item
        ));

        let uploadResult: any;
        const isLargeFile = processedFile.size > 4 * 1024 * 1024;

        if (isLargeFile) {
          uploadResult = await new Promise((resolve, reject) => {
            const CHUNK_SIZE = 4 * 1024 * 1024;
            const totalChunks = Math.ceil(processedFile.size / CHUNK_SIZE);
            const uploadId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            let currentChunk = 0;

            const uploadNextChunk = () => {
              const start = currentChunk * CHUNK_SIZE;
              const end = Math.min(start + CHUNK_SIZE, processedFile.size);
              const chunkBlob = processedFile.slice(start, end);
              const progressPercent = Math.round((currentChunk / totalChunks) * 100);

              setBatchFiles(prev => prev.map(item => 
                item.id === bf.id ? { ...item, progress: progressPercent } : item
              ));

              const formData = new FormData();
              formData.append('chunk', chunkBlob, file.name);
              formData.append('chunkIndex', currentChunk.toString());
              formData.append('totalChunks', totalChunks.toString());
              formData.append('uploadId', uploadId);
              formData.append('fileName', file.name);

              apiFetch('/api/upload-chunk', {
                method: 'POST',
                body: formData
              })
              .then(async res => {
                const contentType = res.headers.get('content-type') || '';
                if (!res.ok) {
                  let errMsg = `Chunk ${currentChunk + 1}/${totalChunks} failed`;
                  if (contentType.includes('application/json')) {
                    const errData = await res.json();
                    if (errData && errData.error) errMsg = errData.error;
                  } else {
                    const text = await res.text();
                    if (text.includes('Cookie check') || text.includes('<!DOCTYPE html>')) {
                      errMsg = 'Network redirect / cookie challenge detected. File is processed locally.';
                    }
                  }
                  throw new Error(errMsg);
                }

                if (!contentType.includes('application/json')) {
                  const text = await res.text();
                  console.error('[Batch Chunk Upload] Non-JSON response received:', text);
                  const sample = text.substring(0, 300).trim();
                  if (sample.includes('<!DOCTYPE html>') || sample.includes('<html')) {
                    const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/i);
                    const title = titleMatch ? titleMatch[1].trim() : '';
                    if (title) {
                      throw new Error(`Server returned HTML (redirect/session expired): "${title}".`);
                    }
                  }
                  throw new Error(`Invalid non-JSON response from server.`);
                }
                return res.json();
              })
              .then(data => {
                if (data.status === 'uploading') {
                  currentChunk++;
                  uploadNextChunk();
                } else {
                  resolve(data);
                }
              })
              .catch(err => reject(err));
            };

            uploadNextChunk();
          });
        } else {
          const formData = new FormData();
          formData.append('file', processedFile);

          uploadResult = await apiFetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          .then(async res => {
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok) {
              let errMsg = 'Upload failed';
              if (contentType.includes('application/json')) {
                const errData = await res.json();
                if (errData && errData.error) errMsg = errData.error;
              } else {
                const text = await res.text();
                if (text.includes('Cookie check') || text.includes('<!DOCTYPE html>')) {
                  errMsg = 'Network redirect / cookie challenge detected. File is processed locally.';
                }
              }
              throw new Error(errMsg);
            }

            if (!contentType.includes('application/json')) {
              const text = await res.text();
              console.error('[Batch Upload] Non-JSON response received:', text);
              const sample = text.substring(0, 300).trim();
              if (sample.includes('<!DOCTYPE html>') || sample.includes('<html')) {
                const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/i);
                const title = titleMatch ? titleMatch[1].trim() : '';
                if (title) {
                  throw new Error(`Server returned HTML instead of JSON: "${title}". This may occur if the file is too large or if the request was redirected.`);
                } else {
                  throw new Error('Server returned an HTML page instead of JSON. The uploaded file might exceed the server or proxy size limit (typically 20MB).');
                }
              }
              throw new Error(`Server returned an invalid response (not JSON): "${sample.substring(0, 80)}...".`);
            }
            return res.json();
          });
        }

        if (uploadResult && uploadResult.url) {
          const suffix = isVideo ? '#video' : (isPdf ? '#pdf' : '#image');
          const markedUrl = uploadResult.url + suffix;

          // Save Base64 backup of this batch uploaded file
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setMediaBackup(markedUrl, reader.result);
            }
          };
          reader.readAsDataURL(processedFile);

          setBatchFiles(prev => prev.map(item => 
            item.id === bf.id ? { ...item, status: 'completed', progress: 100 } : item
          ));

          setVideoPosters(prevPosters => {
            const nextPosters = uploadResult.poster ? { ...prevPosters, [markedUrl]: uploadResult.poster } : prevPosters;
            
            setGalleryItems(prevItems => {
              const updated = [...prevItems, { url: markedUrl, link: '' }];
              syncToProject(updated, nextPosters);
              return updated;
            });
            
            return nextPosters;
          });
        } else {
          throw new Error('No URL returned from server');
        }

      } catch (err: any) {
        console.error(`[Batch Upload] Error uploading ${bf.name}:`, err);
        
        // Dynamic Fallback directly to client-side Base64 Data URL for persistence
        try {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              const suffix = isVideo ? '#video' : (isPdf ? '#pdf' : '#image');
              const localUrl = reader.result + suffix;
              
              setBatchFiles(prev => prev.map(item => 
                item.id === bf.id ? { 
                  ...item, 
                  status: 'completed', 
                  progress: 100, 
                  error: `Processed locally (Base64): ${err.message || 'Server check redirect'}` 
                } : item
              ));

              setGalleryItems(prevItems => {
                const cleanPrev = prevItems.filter(p => !p.url.startsWith('blob:'));
                const updated = [...cleanPrev, { url: localUrl, link: '' }];
                syncToProject(updated);
                return updated;
              });
            }
          };
          reader.readAsDataURL(processedFile);
        } catch (localErr) {
          console.error('[Batch Upload] Local fallback failed:', localErr);
          setBatchFiles(prev => prev.map(item => 
            item.id === bf.id ? { ...item, status: 'failed', error: err.message || 'Upload failed' } : item
          ));
        }
      }
    }

    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (uploadMode === 'batch' || e.target.files.length > 1) {
        addFilesToBatch(e.target.files);
      } else {
        processFile(e.target.files[0]);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      dragActive || setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (uploadMode === 'batch' || e.dataTransfer.files.length > 1) {
        addFilesToBatch(e.dataTransfer.files);
      } else {
        processFile(e.dataTransfer.files[0]);
      }
    }
  };

  useEffect(() => {
    // Reset interactive slide and image loading errors on project change
    setActiveSlide(0);
    setFailedMediaUrls({});
    setResolvedUrls({});

    // Explicitly clean up local storage keys of any of these known broken test URLs
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const key = `project_gallery_images_${project.id}`;
        const stored = window.localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((url: string) => !isBrokenUrl(url));
            if (cleaned.length !== parsed.length) {
              window.localStorage.setItem(key, JSON.stringify(cleaned));
              console.log(`[Cleanup] Sanitized broken image URLs from localStorage: ${key}`);
            }
          }
        }
      } catch (err) {
        console.warn('[Cleanup] Failed to sanitize localStorage:', err);
      }
    }

    // Filter out blob: and broken URLs to prevent displaying broken images
    const rawImages = (project.galleryImages || []).filter(url => !url.startsWith('blob:') && !isBrokenUrl(url));
    const links = (project as any).galleryLinks || {};
    const localPosters = (project as any).videoPosters || {};

    // Retrieve from localStorage as a fast primary backup
    let localImages: string[] = [];
    let localLinks: Record<string, string> = {};
    let localPostersMerged: Record<string, string> = { ...localPosters };
    let localColumns: 2 | 3 = 2;
    
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedImagesStr = window.localStorage.getItem(`project_gallery_images_${project.id}`);
        const storedLinksStr = window.localStorage.getItem(`project_gallery_links_${project.id}`);
        const storedPostersStr = window.localStorage.getItem(`project_gallery_posters_${project.id}`);
        const storedColumns = window.localStorage.getItem(`project_gallery_columns_${project.id}`);
        
        if (storedImagesStr) {
          localImages = JSON.parse(storedImagesStr).filter((url: string) => !url.startsWith('blob:') && !isBrokenUrl(url));
        }
        if (storedLinksStr) {
          localLinks = JSON.parse(storedLinksStr);
        }
        if (storedPostersStr) {
          localPostersMerged = { ...localPostersMerged, ...JSON.parse(storedPostersStr) };
        }
        if (storedColumns) {
          const parsedCols = parseInt(storedColumns, 10);
          if (parsedCols === 2 || parsedCols === 3) {
            localColumns = parsedCols as 2 | 3;
          }
        }
      } catch (err) {
        console.error("[Gallery] Failed to parse localStorage backup:", err);
      }
    }

    const initialImages = localImages.length > 0 ? localImages : rawImages;
    const initialLinks = localImages.length > 0 ? localLinks : links;

    setGalleryItems(initialImages.map(url => ({
      url,
      link: initialLinks[url] || ''
    })));
    setVideoPosters(localPostersMerged);
    setGalleryColumns(localColumns);

    const applyConfig = (config: any) => {
      if (config && config[project.id]) {
        const savedImages = (config[project.id].galleryImages || []).filter((url: string) => !url.startsWith('blob:') && !isBrokenUrl(url));
        const savedLinks = config[project.id].galleryLinks || {};
        const savedPosters = config[project.id].videoPosters || {};
        const savedColumns = config[project.id].galleryColumns;
        
        // Only update if we don't have local overrides or if they match
        const finalImages = localImages.length > 0 ? localImages : savedImages;
        const finalLinks = localImages.length > 0 ? localLinks : savedLinks;
        const finalPosters = { ...savedPosters, ...localPostersMerged };
        const finalColumns = (typeof savedColumns === 'number' && (savedColumns === 2 || savedColumns === 3)) 
          ? savedColumns as 2 | 3 
          : localColumns;

        project.galleryImages = finalImages;
        (project as any).galleryLinks = finalLinks;
        (project as any).videoPosters = finalPosters;
        (project as any).galleryColumns = finalColumns;
        
        setVideoPosters(finalPosters);
        setGalleryColumns(finalColumns);
        
        setGalleryItems(finalImages.map((url: string) => ({
          url,
          link: finalLinks[url] || ''
        })));
      }
    };

    // Load from full-stack API to override with persistent configuration
    apiFetch('/api/gallery')
      .then(res => {
        if (!res.ok) throw new Error('API server unreachable');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API did not return JSON');
        }
        return res.json();
      })
      .then(config => {
        applyConfig(config);
      })
      .catch(err => {
        console.warn('[Gallery] API failed, trying static config fallback:', err);
        apiFetch('/portfolio_assets/gallery_config.json')
          .then(res => {
            if (!res.ok) throw new Error('Static config unreachable');
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Static config did not return JSON');
            }
            return res.json();
          })
          .then(config => {
            applyConfig(config);
          })
          .catch(staticErr => {
            console.warn('[Gallery] Both API and static config fallback failed, using local fallback:', staticErr);
          });
      });
  }, [project]);

  const syncToProject = (items: GalleryItem[], updatedPosters: Record<string, string> = videoPosters) => {
    // Filter out transient blob URLs to prevent storing them persistently
    const cleanItems = items.filter(item => !item.url.startsWith('blob:'));
    const urls = cleanItems.map(item => item.url);
    project.galleryImages = urls;
    const links: Record<string, string> = {};
    cleanItems.forEach(item => {
      if (item.link) {
        links[item.url] = item.link;
      }
    });
    (project as any).galleryLinks = links;
    (project as any).videoPosters = updatedPosters;

    // Persist to localStorage as secondary fallback without massive data URIs to avoid quota exceeded error
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cleanUrlsForLocalStorage = urls.filter(url => !url.startsWith('data:'));
        const cleanLinksForLocalStorage: Record<string, string> = {};
        Object.entries(links).forEach(([url, val]) => {
          if (!url.startsWith('data:')) {
            cleanLinksForLocalStorage[url] = val;
          }
        });
        const cleanPostersForLocalStorage: Record<string, string> = {};
        Object.entries(updatedPosters).forEach(([url, val]) => {
          if (!url.startsWith('data:') && !val.startsWith('data:')) {
            cleanPostersForLocalStorage[url] = val;
          }
        });

        window.localStorage.setItem(`project_gallery_images_${project.id}`, JSON.stringify(cleanUrlsForLocalStorage));
        window.localStorage.setItem(`project_gallery_links_${project.id}`, JSON.stringify(cleanLinksForLocalStorage));
        window.localStorage.setItem(`project_gallery_posters_${project.id}`, JSON.stringify(cleanPostersForLocalStorage));
      } catch (err) {
        console.warn("[LocalStorage] Failed to save gallery content (quota or partition block):", err);
      }
    }

    // Persist to backend server
    apiFetch('/api/save-gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        galleryImages: urls,
        galleryLinks: links,
        videoPosters: updatedPosters,
        galleryColumns
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save to server');
      return res.json();
    })
    .then(data => {
      console.log('[Gallery] Successfully saved updated gallery config on server:', data);
    })
    .catch(err => {
      console.warn('[Gallery] Failed to save gallery config on server:', err);
    });
  };

  const handleSetColumns = (cols: 2 | 3) => {
    setGalleryColumns(cols);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(`project_gallery_columns_${project.id}`, cols.toString());
      } catch (err) {
        console.warn('[Gallery] Failed to save columns to localStorage:', err);
      }
    }
    
    // Sync to backend database/config file via API
    const urls = galleryItems.map(item => item.url);
    const links: Record<string, string> = {};
    galleryItems.forEach(item => {
      if (item.link) {
        links[item.url] = item.link;
      }
    });

    apiFetch('/api/save-gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        galleryImages: urls,
        galleryLinks: links,
        videoPosters: videoPosters,
        galleryColumns: cols
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save columns to server');
      return res.json();
    })
    .then(data => {
      console.log('[Gallery] Successfully saved columns to server config:', data);
    })
    .catch(err => {
      console.error('[Gallery] Failed to save columns to server:', err);
    });
  };

  const compressDataUrl = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const isPng = dataUrl.startsWith('data:image/png');
      if (isPng || !dataUrl.startsWith('data:image/') || dataUrl.includes('image/gif')) {
        return resolve(dataUrl);
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(dataUrl);
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.75));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleAddImage = (url: string, link: string = '') => {
    if (!url.trim()) return;
    
    if (url.startsWith('data:')) {
      const isVideo = url.startsWith('data:video/') || url.includes('#video');
      const isPdf = url.startsWith('data:application/pdf') || url.includes('#pdf');
      const isPng = url.startsWith('data:image/png');
      const ext = isVideo ? 'mp4' : isPdf ? 'pdf' : isPng ? 'png' : 'jpg';
      setIsUploading(true);
      
      const proceedUpload = (uploadUrl: string) => {
        apiFetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: `uploaded_fallback.${ext}`,
            fileData: uploadUrl
          })
        })
        .then(res => {
          if (!res.ok) throw new Error('Upload failed');
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) throw new Error('Invalid content type');
          return res.json();
        })
        .then(data => {
          const finalUrl = (data && data.url) ? data.url : uploadUrl;
          const updated = [...galleryItems, { url: finalUrl, link: link.trim() }];
          setGalleryItems(updated);
          
          let nextPosters = videoPosters;
          if (data && data.poster) {
            nextPosters = { ...videoPosters, [finalUrl]: data.poster };
            setVideoPosters(nextPosters);
          }
          syncToProject(updated, nextPosters);
          setIsUploading(false);
        })
        .catch(() => {
          const updated = [...galleryItems, { url: uploadUrl.trim(), link: link.trim() }];
          setGalleryItems(updated);
          syncToProject(updated);
          setIsUploading(false);
        });
      };

      if (!isVideo && !isPdf && url.startsWith('data:image/')) {
        compressDataUrl(url).then(compressedUrl => {
          proceedUpload(compressedUrl);
        });
      } else {
        proceedUpload(url);
      }
    } else {
      const updated = [...galleryItems, { url: url.trim(), link: link.trim() }];
      setGalleryItems(updated);
      syncToProject(updated);
    }

    setNewUrl('');
    setNewLink('');
  };

  const handleDeleteImage = (index: number) => {
    const updated = galleryItems.filter((_, idx) => idx !== index);
    setGalleryItems(updated);
    syncToProject(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...galleryItems];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setGalleryItems(updated);
    syncToProject(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === galleryItems.length - 1) return;
    const updated = [...galleryItems];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setGalleryItems(updated);
    syncToProject(updated);
  };

  const handleUpdateLink = (index: number, link: string) => {
    const updated = [...galleryItems];
    updated[index] = { ...updated[index], link: link.trim() };
    setGalleryItems(updated);
    syncToProject(updated);
  };

  const handleResetToOriginal = () => {
    const originalImages = (project as any).originalGalleryImages || [];
    const originalLinks = (project as any).originalGalleryLinks || {};
    
    // Clear localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(`project_gallery_images_${project.id}`);
      window.localStorage.removeItem(`project_gallery_links_${project.id}`);
    }
    
    // Reset in-memory project values
    project.galleryImages = [...originalImages];
    (project as any).galleryLinks = { ...originalLinks };
    
    // Update local React state
    setGalleryItems(originalImages.map((url: string) => ({
      url,
      link: originalLinks[url] || ''
    })));
    
    // Sync with backend database/config file via API
    apiFetch('/api/save-gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        galleryImages: originalImages,
        galleryLinks: originalLinks,
        videoPosters: {}
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('[Gallery] Server config successfully reset to default');
      }
    })
    .catch(err => console.error('[Gallery] Server reset error:', err));
  };

  // Scroll to top on load/change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [project]);

  // Find next project in sequence
  const currentIndex = WORKS.findIndex((w) => w.id === project.id);
  const nextProject = WORKS[currentIndex === WORKS.length - 1 ? 0 : currentIndex + 1];

  // Helper to pad numbers
  const pad = (num: number) => String(num).padStart(2, '0');

  // Helper to check if file is video
  const isVideoUrl = (url?: string) => {
    if (!url) return false;
    if (url.includes('#video')) return true;
    if (url.includes('#image')) return false;
    
    const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
    return (
      cleanUrl.endsWith('.mp4') || 
      cleanUrl.endsWith('.webm') || 
      cleanUrl.endsWith('.mov') || 
      cleanUrl.endsWith('.ogg') ||
      cleanUrl.endsWith('.m4v') ||
      url.toLowerCase().startsWith('data:video/')
    );
  };

  // Helper to check if file is PDF
  const isPdfUrl = (url?: string) => {
    if (!url) return false;
    if (url.includes('#pdf')) return true;
    if (url.includes('#image') || url.includes('#video')) return false;
    
    const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
    return (
      cleanUrl.endsWith('.pdf') ||
      url.toLowerCase().startsWith('data:application/pdf')
    );
  };

  // Client mapper to show company/brand name
  const getClient = (item: Work) => {
    if (item.id.includes('cityu')) return 'City University of HK';
    if (item.id.includes('hyundai')) return 'Hyundai China';
    if (item.id.includes('volvo')) return 'Volvo China';
    if (item.id.includes('vivo')) return 'vivo / OPPO';
    if (item.id.includes('farfetch') || item.id.includes('curioeye')) return 'Farfetch / CurioEye';
    if (item.id.includes('john-lobb')) return 'John Lobb';
    if (item.id.includes('baccarat')) return 'Baccarat';
    if (item.id.includes('adipec')) return 'Anton / AI Research Institution';
    if (item.id === 'hr-gen-ai-visual-linkedin') return 'Anton';
    return 'Anton / AI Research Institution';
  };

  // 1. Metadata Table Row Generator
  function metaRows(item: Work) {
    const client = getClient(item);
    const rows = [
      { label: "CLIENT", value: client },
      { label: "YEAR", value: item.period },
      { label: "CATEGORY", value: item.category },
      { label: "ROLE", value: item.role },
      { label: "REGION", value: item.market },
      { label: "TAGS", value: item.tags.join(" // ") }
    ];

    return (
      <div id="meta-table-section" className="meta-table border-t border-ink-900 py-4 mb-12 font-mono text-xs">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
          {rows.map((row, idx) => (
            <div key={idx} className="flex justify-between items-baseline py-3 border-b border-ink-150">
              <dt className="text-ink-400 uppercase tracking-wider text-[10px]">{row.label}</dt>
              <dd className="uppercase font-semibold text-ink-900 text-right max-w-[65%] truncate">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  // 2. Placeholder Plotted Graphic Generator
  function renderArchivePlaceholder(item: Work) {
    return (
      <div className="relative w-full h-[300px] md:h-[450px] bg-paper-100 border border-ink-200 overflow-hidden flex items-center justify-center group">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
          backgroundImage: `radial-gradient(#002FA7 1px, transparent 1px), radial-gradient(#002FA7 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }} />
        
        {/* Subtle blueprint lines */}
        <div className="absolute inset-8 border border-dashed border-ink-300 opacity-40 pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] border-t border-dashed border-ink-300 opacity-20 pointer-events-none" />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-l border-dashed border-ink-300 opacity-20 pointer-events-none" />

        {/* Outlined inner frame */}
        <div className="absolute inset-4 md:inset-8 border border-ink-900 flex flex-col items-center justify-center p-6 bg-paper-0/90 backdrop-blur-sm shadow-sm transition-all duration-300 group-hover:scale-[1.01]">
          <div className="absolute top-3 left-4 font-mono text-[9px] text-ink-400 tracking-widest">
            FILE.RX_SCHEMATIC_{pad(item.number)}
          </div>
          <div className="absolute top-3 right-4 font-mono text-[9px] text-klein font-bold uppercase tracking-widest animate-pulse">
            ● PLOTTED_STATE
          </div>

          {/* Large Klein Blue Project Number */}
          <div className="text-[100px] md:text-[160px] font-sans font-bold leading-none text-klein select-none tracking-tighter opacity-90">
            {pad(item.number)}
          </div>
          
          <div className="mt-2 font-mono text-[10px] md:text-xs text-ink-900 tracking-widest uppercase text-center max-w-md px-4">
            {item.title}
          </div>
          
          <div className="absolute bottom-3 left-4 font-mono text-[8px] text-ink-400">
            SCALE 1:1.75 / PLOT.2025
          </div>
          <div className="absolute bottom-3 right-4 font-mono text-[8px] text-ink-400">
            TYPE: {item.schematicType.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  // 3. Hero Media Container
  function renderMedia(item: Work) {
    const isVideo = isVideoUrl(item.heroImage);
    const heroUrl = item.heroImage;
    return (
      <div id="hero-media-container" className="rx-detail-hero-media mb-12">
        {heroUrl ? (
          <div className="relative w-full overflow-hidden border border-ink-200 bg-paper-100 group">
            {isVideo ? (
              <video 
                key={heroUrl}
                src={cleanMediaUrl(resolvedUrls[heroUrl] || heroUrl)} 
                poster={videoPosters[heroUrl] ? cleanMediaUrl(videoPosters[heroUrl]) : undefined}
                autoPlay 
                loop 
                muted 
                playsInline 
                onError={() => {
                  const backup = getMediaBackup(heroUrl);
                  if (backup && resolvedUrls[heroUrl] !== backup) {
                    setResolvedUrls(prev => ({ ...prev, [heroUrl]: backup }));
                  }
                }}
                className="w-full h-auto max-h-[600px] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="relative w-full overflow-hidden">
                {videoPosters[heroUrl] && (
                  <img 
                    src={getSafeUrl(resolvedUrls[videoPosters[heroUrl]] || videoPosters[heroUrl])} 
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-65 filter blur-[1px] transition-opacity duration-300 pointer-events-none"
                  />
                )}
                <img 
                  src={getSafeUrl(resolvedUrls[heroUrl] || heroUrl)} 
                  alt={item.title} 
                  onLoad={(e) => {
                    const target = e.currentTarget;
                    const prev = target.previousElementSibling as HTMLElement;
                    if (prev) prev.style.opacity = '0';
                  }}
                  onError={() => {
                    const backup = getMediaBackup(heroUrl);
                    if (backup && resolvedUrls[heroUrl] !== backup) {
                      setResolvedUrls(prev => ({ ...prev, [heroUrl]: backup }));
                    }
                  }}
                  ref={(el) => {
                    if (el && el.complete) {
                      const prev = el.previousElementSibling as HTMLElement;
                      if (prev) prev.style.opacity = '0';
                    }
                  }}
                  className="w-full h-auto max-h-[600px] object-cover relative z-10 transition-transform duration-500 group-hover:scale-[1.01]" 
                />
              </div>
            )}
            {/* Minimal overlays for premium editorial aesthetic */}
            <div className="absolute bottom-4 left-4 bg-paper-0/80 backdrop-blur-sm px-3 py-1 font-mono text-[9px] text-ink-900 border border-ink-200">
              HERO_PLATE.{pad(item.number)} / {isVideo ? 'VIDEO_RECORD' : 'IMAGE_RECORD'}
            </div>
          </div>
        ) : (
          renderArchivePlaceholder(item)
        )}
      </div>
    );
  }

  // 3b. Interactive PDF Slideshow for AI Visual Production Workflow
  function renderSlideshow() {
    const slideElements = [
      // Slide 1
      (
        <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between p-6 md:p-12 text-white overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-indigo-500/20 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-tr from-purple-950/40 via-transparent to-transparent blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center z-10">
            <div className="border border-white/20 px-2.5 py-0.5 font-mono text-[9px] tracking-widest uppercase font-bold text-white/75 bg-white/5 backdrop-blur-md rounded-xs">
              SHARING BY ROY
            </div>
            <div className="font-mono text-[9px] text-white/50 tracking-wider">
              CASE_DOSSIER_01.SLIDE_01
            </div>
          </div>
          <div className="my-auto space-y-4 md:space-y-6 z-10 max-w-3xl">
            <h2 className="font-sans font-extrabold text-2xl md:text-4xl lg:text-5xl tracking-tight leading-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              The Most Effective AI Graphic Design Workflow
            </h2>
            <div className="flex items-center space-x-2 md:space-x-3 text-indigo-300 font-mono text-xs md:text-sm font-semibold tracking-widest">
              <span>CHATGPT</span>
              <span className="text-white/30">+</span>
              <span className="text-blue-300">CODEX</span>
              <span className="text-white/30">+</span>
              <span className="text-pink-300">FIGMA</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4 z-10 text-[9px] font-mono">
            <div className="flex space-x-3 items-center">
              <span className="px-1.5 py-0.5 bg-white/10 rounded-xs text-white/80">CHATGPT</span>
              <span className="text-white/30">+</span>
              <span className="px-1.5 py-0.5 bg-white/10 rounded-xs text-blue-300">CODEX</span>
              <span className="text-white/30">+</span>
              <span className="px-1.5 py-0.5 bg-white/10 rounded-xs text-pink-300">FIGMA</span>
            </div>
            <div className="flex items-center space-x-1.5 text-white/40 tracking-wider">
              <span>EXPLORE DESIGN FLOW</span>
              <span className="animate-bounce">→</span>
            </div>
          </div>
        </div>
      ),
      // Slide 2
      (
        <div className="relative w-full h-full bg-paper-50 flex flex-col justify-between p-6 md:p-12 text-ink-900 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="border border-ink-900 px-2.5 py-0.5 font-mono text-[9px] tracking-widest uppercase font-bold text-ink-900 bg-paper-100 rounded-xs">
              WHY THIS WORKFLOW
            </div>
            <div className="font-mono text-[9px] text-ink-400 tracking-wider">
              CASE_DOSSIER_01.SLIDE_02
            </div>
          </div>
          <div className="my-auto space-y-3">
            <h3 className="font-sans font-extrabold text-xl md:text-3xl text-ink-950 uppercase tracking-tight leading-tight">
              The Real Bottleneck is <span className="text-klein">Translation</span>.
            </h3>
            <div className="bg-klein text-white p-4 md:p-6 rounded-sm space-y-3 shadow-lg border border-indigo-900 max-w-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs shrink-0">
                  RX
                </div>
                <div>
                  <div className="text-xs font-bold font-mono tracking-wide">Roy Xiang</div>
                  <div className="text-[9px] text-indigo-200">@ Driving Growth Marketing & Product Operations with AI</div>
                </div>
              </div>
              <p className="text-[11px] md:text-xs text-indigo-100 italic leading-relaxed">
                "The inefficiency of many design requirements is not due to 'not knowing how to do it' but rather the back-and-forth in these translation steps:"
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[10px] md:text-[11px] text-white/90 border-t border-white/10 pt-2.5 font-mono">
                <li className="flex items-center space-x-1.5">
                  <span className="text-indigo-300">●</span>
                  <span>Unclear text requirements</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-indigo-300">●</span>
                  <span>Visual direction is hard to align quickly</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-indigo-300">●</span>
                  <span>Static images are difficult to further edit</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-indigo-300">●</span>
                  <span>Going from "mockup" to "formal design file" often requires redoing</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-ink-200 pt-3 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] gap-2">
            <span className="font-mono text-[9px] text-ink-400 uppercase tracking-widest">Core Solution:</span>
            <span className="font-sans font-bold text-klein uppercase tracking-wider text-[11px]">
              Reducing the loss between content, visuals, and execution.
            </span>
          </div>
        </div>
      ),
      // Slide 3
      (
        <div className="relative w-full h-full bg-paper-50 flex flex-col justify-between p-6 md:p-12 text-ink-900 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-klein font-mono text-xs font-bold bg-klein/10 px-2 py-0.5 rounded-xs">STEP 01</span>
              <span className="font-mono text-[10px] font-bold tracking-widest text-ink-400">STRUCTURE THE BRIEF WITH GPT</span>
            </div>
            <span className="font-mono text-[9px] text-ink-400">CASE_DOSSIER_01.SLIDE_03</span>
          </div>
          <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-2">
              <h3 className="font-sans font-extrabold text-lg md:text-2xl text-ink-950 uppercase tracking-tight leading-none">
                Structure the Brief with GPT
              </h3>
              <p className="text-[11px] md:text-xs text-ink-600 leading-relaxed font-sans">
                Use GPT to turn raw text requests into a clear design brief, including the key message, audience, content structure and visual direction.
              </p>
            </div>
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-3.5 font-mono text-[9px] space-y-2.5 shadow-md w-full">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">● GPT_INTERFACE</span>
                <span className="text-emerald-400 uppercase tracking-wider text-[8px] animate-pulse">● MODEL_READY</span>
              </div>
              <div className="space-y-1.5 bg-slate-950 p-2 rounded border border-slate-800/50">
                <div className="text-emerald-500 font-bold text-[8px]">[USER PROMPT (CN)]</div>
                <div className="text-slate-300 leading-normal text-[8px] md:text-[9px]">
                  帮我根据附件PDF的结构排版，规划出来每个服务中每个模块的具体文本内容，并且用文本形式帮我列出（中英文）...
                </div>
              </div>
              <div className="space-y-1.5 bg-slate-950 p-2 rounded border border-slate-800/50">
                <div className="text-blue-400 font-bold text-[8px]">[TRANSLATED OUTLINE (EN)]</div>
                <div className="text-slate-300 leading-normal text-[8px] md:text-[9px] italic">
                  "Please help me plan the specific content for each module within each service based on the structure and layout of the attached PDF, and list it out in both Chinese and English in text form..."
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-ink-200 pt-2.5 text-[9px] font-mono text-ink-400 flex justify-between">
            <span>RAW_INPUT → STRUCTURED_OUTLINE</span>
            <span>ACCURACY RATE: 100%</span>
          </div>
        </div>
      ),
      // Slide 4
      (
        <div className="relative w-full h-full bg-paper-50 flex flex-col justify-between p-6 md:p-12 text-ink-900 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-klein font-mono text-xs font-bold bg-klein/10 px-2 py-0.5 rounded-xs">STEP 02</span>
              <span className="font-mono text-[10px] font-bold tracking-widest text-ink-400">GENERATE VISUALS WITH GPT</span>
            </div>
            <span className="font-mono text-[9px] text-ink-400">CASE_DOSSIER_01.SLIDE_04</span>
          </div>
          <div className="my-auto space-y-3">
            <div className="max-w-2xl space-y-1">
              <h3 className="font-sans font-extrabold text-lg md:text-2xl text-ink-950 uppercase tracking-tight leading-none">
                Generate Visuals with GPT
              </h3>
              <p className="text-[11px] md:text-xs text-ink-600 leading-relaxed font-sans">
                Use GPT Image2 to generate first-pass visual design based on the structured brief, quickly exploring layout, mood, style and composition.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {[
                { num: "00", name: "MULTI-MEDIA", color: "from-blue-600 to-indigo-800", desc: "Team Credentials" },
                { num: "01", name: "POSTER DESIGN", color: "from-amber-600 to-orange-800", desc: "Internal Training" },
                { num: "02", name: "VIDEO PRODUCTION", color: "from-teal-600 to-cyan-800", desc: "Storyboard Brief" },
                { num: "03", name: "WEBPAGE DESIGN", color: "from-slate-700 to-slate-900", desc: "Business Services" }
              ].map((item, idx) => (
                <div key={idx} className="border border-ink-150 p-2.5 bg-paper-100 flex flex-col justify-between h-24 md:h-28 relative overflow-hidden group hover:border-klein transition-colors duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="flex justify-between font-mono text-[8px] text-ink-400 z-10">
                    <span>{item.num} // PLATE</span>
                    <span className="text-klein">● ACTIVE</span>
                  </div>
                  <div className="z-10">
                    <div className="font-sans font-extrabold text-[10px] text-ink-900 tracking-tight">{item.name}</div>
                    <div className="font-mono text-[7px] text-ink-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-ink-200 pt-2.5 text-[9px] font-mono text-ink-400 flex justify-between">
            <span>FIRST-PASS VISUAL EXPLORATION</span>
            <span>GRID RATIO: 16:9</span>
          </div>
        </div>
      ),
      // Slide 5
      (
        <div className="relative w-full h-full bg-paper-50 flex flex-col justify-between p-6 md:p-12 text-ink-900 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-klein font-mono text-xs font-bold bg-klein/10 px-2 py-0.5 rounded-xs">STEP 03</span>
              <span className="font-mono text-[10px] font-bold tracking-widest text-ink-400">CONVERT IMAGES WITH CODEX</span>
            </div>
            <span className="font-mono text-[9px] text-ink-400">CASE_DOSSIER_01.SLIDE_05</span>
          </div>
          <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-2">
              <h3 className="font-sans font-extrabold text-lg md:text-2xl text-ink-950 uppercase tracking-tight leading-none">
                Convert PNG/JPG into Figma
              </h3>
              <p className="text-[11px] md:text-xs text-ink-600 leading-relaxed font-sans">
                Use Codex to convert static PNG or JPG design images into editable Figma files, making the AI-generated output easier to adjust and reuse.
              </p>
            </div>
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-3.5 font-mono text-[9px] text-slate-100 space-y-2.5 shadow-md w-full">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">● CODEX_WORKSPACE</span>
                <span className="text-blue-400 tracking-wider text-[8px] font-bold">Figma Link Connected ●</span>
              </div>
              <div className="space-y-1.5 bg-slate-950 p-2 rounded border border-slate-800/50">
                <div className="text-blue-400 font-bold text-[8px]">AI_AGENT_PROMPT:</div>
                <p className="text-slate-200 leading-normal text-[8px] md:text-[9px] italic">
                  "Figma in this page Sonara Ecommerce Website, convert the attached image into an editable Section version."
                </p>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded text-[8px]">
                <span className="text-slate-400 font-bold">APP CONNECTOR</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xs text-[7px] font-extrabold">CONNECTED</span>
              </div>
            </div>
          </div>
          <div className="border-t border-ink-200 pt-2.5 text-[9px] font-mono text-ink-400 flex justify-between">
            <span>CONVERSION RATE: HIGH FIDELITY</span>
            <span>STATUS: EXPORTED_TO_FIGMA</span>
          </div>
        </div>
      ),
      // Slide 6
      (
        <div className="relative w-full h-full bg-paper-50 flex flex-col justify-between p-6 md:p-12 text-ink-900 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-klein font-mono text-xs font-bold bg-klein/10 px-2 py-0.5 rounded-xs">STEP 04</span>
              <span className="font-mono text-[10px] font-bold tracking-widest text-ink-400">REFINE THE DESIGN IN FIGMA</span>
            </div>
            <span className="font-mono text-[9px] text-ink-400">CASE_DOSSIER_01.SLIDE_06</span>
          </div>
          <div className="my-auto space-y-3">
            <div className="max-w-2xl space-y-1">
              <h3 className="font-sans font-extrabold text-lg md:text-2xl text-ink-950 uppercase tracking-tight leading-none">
                Refine the Design in Figma
              </h3>
              <p className="text-[11px] md:text-xs text-ink-600 leading-relaxed font-sans">
                Use the editable Figma file to refine typography, layout, spacing, images, components and brand details for final design delivery.
              </p>
            </div>
            <div className="border border-ink-200 bg-paper-100 p-3 relative rounded-sm h-28 md:h-32 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 bottom-0 left-12 w-[1px] border-l border-dashed border-klein/20 z-0" />
              <div className="absolute left-0 right-0 top-12 h-[1px] border-t border-dashed border-klein/20 z-0" />
              <div className="flex justify-between items-center z-10 text-[8px] font-mono">
                <span className="bg-klein text-white px-1 py-0.5 font-bold rounded-xs">FIGMA_CANVAS</span>
                <span className="text-ink-400">RULERS: ACTIVE</span>
              </div>
              <div className="grid grid-cols-3 gap-3 z-10">
                {[
                  { label: "STRUCTURE REDESIGN", value: "Clearer Content Flow" },
                  { label: "VISUAL SYSTEM UPGRADE", value: "Unified Visual Style" },
                  { label: "GRAPHIC REMAKE", value: "Polished Brand Assets" }
                ].map((card, index) => (
                  <div key={index} className="bg-paper-0 p-2 border border-ink-150 rounded-xs shadow-xs hover:border-klein transition-colors duration-300">
                    <div className="font-mono text-[7px] text-klein font-bold mb-0.5">// {card.label}</div>
                    <div className="font-sans font-semibold text-[8px] md:text-[9px] text-ink-900 leading-tight">{card.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-ink-200 pt-2.5 text-[9px] font-mono text-ink-400 flex justify-between">
            <span>PRODUCTION WORKFLOW OPTIMIZED</span>
            <span>HANDOFF STATE: DELIVERED</span>
          </div>
        </div>
      ),
      // Slide 7
      (
        <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between p-6 md:p-12 text-white overflow-hidden">
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-indigo-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />
          <div className="flex justify-between items-center z-10">
            <div className="border border-white/20 px-2.5 py-0.5 font-mono text-[9px] tracking-widest uppercase font-bold text-white/75 bg-white/5 backdrop-blur-md rounded-xs">
              SUMMARY STATEMENT
            </div>
            <div className="font-mono text-[9px] text-white/50 tracking-wider">
              CASE_DOSSIER_01.SLIDE_07
            </div>
          </div>
          <div className="my-auto space-y-4 z-10 max-w-3xl text-center">
            <h2 className="font-sans font-extrabold text-xl md:text-3xl lg:text-4xl tracking-tight leading-tight uppercase">
              From AI Output to <span className="text-indigo-400">Real Design Workflow</span>
            </h2>
            <p className="text-xs md:text-base text-slate-300 leading-relaxed font-sans font-medium italic max-w-2xl mx-auto">
              "The value is not only faster image generation. The real value is connecting AI output with editable, reusable and collaborative design production."
            </p>
          </div>
          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs z-10 text-[9px] font-mono">
            <span className="text-white/40">Roy Xiang / Portfolio 2026</span>
            <span className="text-indigo-400 font-extrabold">
              ● WORKFLOW_COMPLETE
            </span>
          </div>
        </div>
      )
    ];

    const nextSlide = () => {
      setActiveSlide((prev) => (prev === slideElements.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
      setActiveSlide((prev) => (prev === 0 ? slideElements.length - 1 : prev - 1));
    };

    return (
      <div className="flex flex-col space-y-4">
        {/* Navigation Selector Tabs */}
        <div className="flex border-b border-ink-200 justify-between items-center bg-paper-100 p-1 rounded-sm">
          <div className="flex space-x-1 font-mono text-[10px] tracking-wider uppercase">
            <button 
              onClick={() => setViewMode('slides')} 
              className={`px-3 py-1.5 font-bold cursor-pointer transition-all duration-300 rounded-xs ${viewMode === 'slides' ? 'bg-paper-0 text-klein shadow-sm border border-ink-150' : 'text-ink-500 hover:text-ink-950'}`}
            >
              📊 WORKFLOW SLIDESHOW (PDF)
            </button>
            <button 
              onClick={() => setViewMode('schematic')} 
              className={`px-3 py-1.5 font-bold cursor-pointer transition-all duration-300 rounded-xs ${viewMode === 'schematic' ? 'bg-paper-0 text-klein shadow-sm border border-ink-150' : 'text-ink-500 hover:text-ink-950'}`}
            >
              📁 BLUEPRINT SCHEMATIC
            </button>
          </div>
          <div className="hidden md:block font-mono text-[9px] text-ink-400 px-3">
            FORMAT: INTERACTIVE_DECK
          </div>
        </div>

        {viewMode === 'slides' ? (
          <div className="relative w-full border border-ink-900 rounded-sm overflow-hidden bg-paper-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col justify-between h-[360px] md:h-[460px]">
            {/* Active Slide Body */}
            <div className="flex-grow relative overflow-hidden">
              {slideElements[activeSlide]}
            </div>

            {/* Bottom Playback Controls */}
            <div className="bg-paper-0 border-t border-ink-200 px-4 py-3 flex items-center justify-between font-mono text-[11px] shrink-0 select-none">
              <button 
                onClick={prevSlide}
                className="px-2.5 py-1.5 border border-ink-200 hover:border-klein hover:text-klein transition-colors duration-300 font-bold rounded-xs cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-klein"
              >
                ← PREV
              </button>

              <div className="flex items-center space-x-2">
                {slideElements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === index ? 'bg-klein w-3' : 'bg-ink-200 hover:bg-ink-400'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
                <span className="text-ink-400 font-bold text-[9px] ml-1.5">
                  [{pad(activeSlide + 1)} / {pad(slideElements.length)}]
                </span>
              </div>

              <button 
                onClick={nextSlide}
                className="px-2.5 py-1.5 border border-ink-200 hover:border-klein hover:text-klein transition-colors duration-300 font-bold rounded-xs cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-klein"
              >
                NEXT →
              </button>
            </div>
          </div>
        ) : (
          renderArchivePlaceholder(project)
        )}
      </div>
    );
  }

  // 4. Detail Layout Section Block Generator
  function detailSection(label: string, content: string | string[]) {
    const isArray = Array.isArray(content);
    return (
      <div className="detail-block py-8 border-b border-ink-150">
        <h2 className="font-mono font-bold text-ink-900 uppercase tracking-widest text-[11px] mb-4 text-klein">
          // {label.toUpperCase()}
        </h2>
        {isArray ? (
          <ul className="space-y-3 pl-0">
            {(content as string[]).map((itemVal, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-ink-700">
                <span className="font-mono text-[11px] text-klein flex-shrink-0 mt-0.5">
                  [{pad(idx + 1)}]
                </span>
                <span className="font-sans text-[15px] leading-relaxed">{itemVal}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-700 text-[15px] leading-relaxed font-sans">{content as string}</p>
        )}
      </div>
    );
  }

  // 5. Key Metrics Aside Generator
  function renderMetricGrid(item: Work) {
    const clientName = getClient(item).toUpperCase();
    return (
      <aside id="metrics-aside-section" className="detail-results space-y-6">
        <div className="pt-4 mb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400 font-bold block mb-1">
            PERFORMANCE DOSSIER
          </span>
          <span className="font-mono text-xs text-ink-900 font-bold uppercase">
            METRICS & ANALYTICS
          </span>
        </div>
        <div className="metric-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {item.metrics.map((metric, idx) => (
            <div key={idx} className="result-tile border border-ink-150 bg-paper-0 p-5 flex flex-col justify-between h-32 hover:border-klein/40 transition-colors duration-300 shadow-[2px_2px_0px_rgba(0,0,0,0.03)]">
              <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400 font-bold">
                METRIC.{pad(idx + 1)} / {metric.label.toUpperCase()} // {clientName}
              </span>
              <span className="font-sans font-extrabold text-3xl md:text-4xl tracking-tight text-klein leading-none">
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  // 6. Visual Gallery Plotted Plates
  function renderGallery(item: Work) {
    if (item.id === 'cityu-seo-campaign') {
      return null;
    }
    const totalPlates = galleryItems.length;
    const plateIndices = Array.from({ length: totalPlates }, (_, i) => i + 1);

    return (
      <section id="gallery-section" className="gallery mt-16 pt-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] text-ink-400 uppercase tracking-widest font-bold">
              VISUAL PROTOTYPES
            </span>
            <h3 className="font-sans font-bold text-ink-900 text-lg uppercase tracking-tight mt-1">
              Schematic Plates Gallery
            </h3>
          </div>
          
          {isAdmin ? (
            <button 
              onClick={() => setIsEditOpen(!isEditOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-ink-900 font-mono text-[10px] uppercase tracking-wider text-ink-900 hover:bg-ink-900 hover:text-paper-50 transition-all duration-300 rounded-sm cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              {isEditOpen ? 'Close Editor' : 'Edit Gallery'}
            </button>
          ) : (
            <button 
              onClick={() => onNavigate && onNavigate('Admin')}
              className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-ink-300 font-mono text-[10px] uppercase tracking-wider text-ink-400 hover:text-ink-900 hover:border-ink-900 transition-all duration-300 rounded-sm cursor-pointer bg-paper-100"
              title="Click to authenticate as Admin and manage images/videos"
            >
              <Sliders className="w-3.5 h-3.5 text-ink-400 animate-pulse" />
              Manage Images (Admin Portal)
            </button>
          )}
        </div>

        {isAdmin && isEditOpen && (
          <div className="mb-8 p-5 bg-paper-100 border border-ink-150 rounded-xs font-mono text-xs">
            <div className="flex items-center justify-between border-b border-ink-150 pb-3 mb-4">
              <span className="font-bold text-ink-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-klein" />
                GALLERY EDITOR // PROTOCOL: ADMIN
              </span>
              <div className="flex items-center gap-3">
                <span className="text-ink-400 text-[10px]">TOTAL ITEMS: {galleryItems.length}</span>
                
                <div className="flex items-center gap-1 border border-ink-150 rounded-xs p-0.5 bg-paper-200">
                  <button
                    type="button"
                    onClick={() => handleSetColumns(2)}
                    className={`px-1.5 py-0.5 font-bold uppercase text-[8px] rounded-xs transition-all cursor-pointer ${
                      galleryColumns === 2 
                        ? 'bg-klein text-paper-50 shadow-xs' 
                        : 'text-ink-500 hover:text-ink-800'
                    }`}
                  >
                    2 Col
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetColumns(3)}
                    className={`px-1.5 py-0.5 font-bold uppercase text-[8px] rounded-xs transition-all cursor-pointer ${
                      galleryColumns === 3 
                        ? 'bg-klein text-paper-50 shadow-xs' 
                        : 'text-ink-500 hover:text-ink-800'
                    }`}
                  >
                    3 Col
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetToOriginal}
                  className="px-2 py-0.5 border border-rose-300 hover:border-rose-500 text-rose-600 hover:text-rose-700 font-bold uppercase text-[9px] rounded-xs cursor-pointer transition-colors"
                  title="Reset gallery to default portfolio images"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>

            {/* List of current images with controls */}
            <div className="space-y-4 mb-6">
              {galleryItems.length === 0 ? (
                <div className="text-center py-6 text-ink-400 italic bg-paper-0 border border-dashed border-ink-200">
                  No media items in the gallery. Use the control below to add.
                </div>
              ) : (
                galleryItems.map((imgItem, index) => {
                  const imgUrl = imgItem.url;
                  const isVideo = isVideoUrl(imgUrl);
                  return (
                    <div key={index} className="bg-paper-0 p-3.5 border border-ink-150 rounded-xs flex flex-col gap-2.5">
                      <div className="flex items-center gap-3">
                        {/* Mini Thumbnail */}
                        <div className="w-12 h-12 shrink-0 bg-paper-100 border border-ink-200 overflow-hidden flex items-center justify-center relative rounded-xs">
                          {isVideo ? (
                            <video 
                              key={imgUrl} 
                              src={getSafeUrl(resolvedUrls[imgUrl] || imgUrl)} 
                              poster={videoPosters[imgUrl] ? cleanMediaUrl(videoPosters[imgUrl]) : undefined} 
                              className="w-full h-full object-cover" 
                              muted 
                              playsInline 
                              onError={() => {
                                const backup = getMediaBackup(imgUrl);
                                if (backup && resolvedUrls[imgUrl] !== backup) {
                                  setResolvedUrls(prev => ({ ...prev, [imgUrl]: backup }));
                                }
                              }}
                            />
                          ) : isPdfUrl(imgUrl) ? (
                            <div className="w-full h-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-[10px]">PDF</div>
                          ) : (
                            <img 
                              src={getSafeUrl(resolvedUrls[imgUrl] || videoPosters[imgUrl] || imgUrl)} 
                              className="w-full h-full object-cover" 
                              alt="" 
                              onError={() => {
                                const backup = getMediaBackup(imgUrl);
                                if (backup && resolvedUrls[imgUrl] !== backup) {
                                  setResolvedUrls(prev => ({ ...prev, [imgUrl]: backup }));
                                }
                              }}
                            />
                          )}
                          <div className="absolute bottom-0 right-0 bg-ink-900/80 text-paper-50 px-1 text-[7px] leading-tight font-sans rounded-tl-xs">
                            {isVideo ? 'MP4' : isPdfUrl(imgUrl) ? 'PDF' : 'IMG'}
                          </div>
                        </div>

                        {/* URL text */}
                        <div className="flex-grow min-w-0">
                          <div className="text-[9px] text-ink-400 font-bold uppercase mb-0.5">Item #{index + 1}</div>
                          <div className="truncate text-ink-900 text-[11px] font-mono select-all" title={imgUrl}>
                            {imgUrl}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isVideo && !isPdfUrl(imgUrl) && (
                            <button
                              onClick={() => openCropper(imgUrl, index)}
                              className="p-1.5 border border-ink-150 text-klein hover:border-klein hover:bg-klein/5 rounded-xs cursor-pointer transition-colors"
                              title="Crop & Edit Image"
                            >
                              <Crop className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1.5 border border-ink-150 text-ink-600 hover:border-klein hover:text-klein disabled:opacity-35 disabled:hover:border-ink-150 disabled:hover:text-ink-600 rounded-xs cursor-pointer transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === galleryItems.length - 1}
                            className="p-1.5 border border-ink-150 text-ink-600 hover:border-klein hover:text-klein disabled:opacity-35 disabled:hover:border-ink-150 disabled:hover:text-ink-600 rounded-xs cursor-pointer transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(index)}
                            className="p-1.5 border border-ink-150 text-rose-600 hover:border-rose-500 hover:bg-rose-50 rounded-xs cursor-pointer transition-all"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Hyperlink editor */}
                      <div className="flex items-center gap-2 pl-[60px]">
                        <span className="text-[9px] text-ink-500 font-bold shrink-0 flex items-center gap-1 uppercase">
                          <LinkIcon className="w-3 h-3 text-klein" /> Link Target:
                        </span>
                        <input
                          type="text"
                          value={imgItem.link || ''}
                          onChange={(e) => handleUpdateLink(index, e.target.value)}
                          placeholder="Paste click-through hyperlink URL (e.g. https://github.com/project, or direct demo/site URL)"
                          className="flex-grow bg-paper-100 border border-ink-150 px-2 py-1.5 rounded-xs text-[10px] font-mono text-ink-900 focus:outline-none focus:border-klein"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add new image form */}
            <div className="bg-paper-0 p-4 border border-ink-150 rounded-xs">
              <span className="font-bold text-ink-900 block mb-3 uppercase text-[10px] tracking-wider">Add New Gallery Media (Images, GIFs, Videos, PDFs)</span>
              
              {/* Tab Headers */}
              <div className="flex border-b border-ink-150 mb-4">
                <button
                  type="button"
                  onClick={() => !isUploading && setUploadMode('single')}
                  disabled={isUploading}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 -mb-[1px] cursor-pointer ${
                    uploadMode === 'single'
                      ? 'border-klein text-klein font-black'
                      : 'border-transparent text-ink-400 hover:text-ink-700 disabled:opacity-50'
                  }`}
                >
                  Single Upload (单件上传)
                </button>
                <button
                  type="button"
                  onClick={() => !isUploading && setUploadMode('batch')}
                  disabled={isUploading}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
                    uploadMode === 'batch'
                      ? 'border-klein text-klein font-black'
                      : 'border-transparent text-ink-400 hover:text-ink-700 disabled:opacity-50'
                  }`}
                >
                  Batch Upload (批量上传)
                  {batchFiles.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-klein/10 text-klein rounded-full text-[9px] font-mono font-bold">
                      {batchFiles.length}
                    </span>
                  )}
                </button>
              </div>

              {uploadMode === 'single' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Local File Upload Zone */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-ink-400 font-bold uppercase">Local Computer Upload (Drag & Drop or Click)</label>
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => !isUploading && document.getElementById('local-file-picker')?.click()}
                        className={`border-2 border-dashed rounded-xs p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[110px] ${
                          dragActive 
                            ? 'border-klein bg-klein/5 text-klein' 
                            : isUploading
                              ? 'border-amber-400 bg-amber-50/10 text-amber-600'
                              : (newUrl.startsWith('/uploads/') || newUrl.startsWith('/portfolio_assets/'))
                                ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600'
                                : 'border-ink-200 hover:border-klein/50 hover:bg-paper-100 text-ink-500'
                        }`}
                      >
                        <input 
                          id="local-file-picker"
                          type="file" 
                          accept="image/*,video/*,application/pdf" 
                          className="hidden" 
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                        <Upload className={`w-5 h-5 mb-1.5 ${isUploading ? 'animate-bounce text-amber-500' : ''}`} />
                        <span className="font-mono text-[10px] font-bold uppercase">
                          {isUploading 
                            ? (uploadProgress || 'Uploading File...') 
                            : (newUrl.startsWith('/uploads/') || newUrl.startsWith('/portfolio_assets/')) 
                              ? '✓ File Saved Online' 
                              : 'Choose Local File or Drop'}
                        </span>
                        <span className="text-[8px] text-ink-400 mt-0.5 max-w-[180px] truncate">
                          {isUploading 
                            ? (uploadProgress ? 'Processing chunks securely' : 'Processing media chunk') 
                            : (newUrl.startsWith('/uploads/') || newUrl.startsWith('/portfolio_assets/')) 
                              ? 'Ready to add to gallery' 
                              : 'Supports JPG, PNG, GIF, MP4'}
                        </span>
                      </div>
                      {uploadError && (
                        <div className="text-[8px] text-rose-500 font-mono mt-1 text-center">{uploadError}</div>
                      )}
                    </div>

                    {/* URL Direct Input Zone */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-ink-400 font-bold uppercase">Or Direct Media URL</label>
                      <div className="border border-ink-200 bg-paper-100 rounded-xs p-3.5 h-[110px] flex flex-col justify-between">
                        <span className="text-[8px] text-ink-400 font-mono leading-relaxed">
                          Alternatively, paste any public direct link or CDN address for images, GIFs, or MP4 video files.
                        </span>
                        <input
                          type="text"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder="https://example.com/asset.jpg, .gif, or .mp4"
                          className="w-full bg-paper-0 border border-ink-150 px-2.5 py-1.5 rounded-xs text-ink-900 focus:outline-none focus:border-klein text-[11px] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-ink-400 font-bold uppercase">Hyperlink / Click-through Target URL (Optional)</label>
                    <input
                      type="text"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="Paste external target link URL (e.g., https://linkedin.com, https://github.com/project)"
                      className="w-full bg-paper-100 border border-ink-200 px-3 py-2 rounded-xs text-ink-900 focus:outline-none focus:border-klein text-xs font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddImage(newUrl, newLink);
                        }
                      }}
                    />
                  </div>

                  {newUrl && (
                    <div className="bg-paper-100 border border-ink-150 p-3 rounded-xs flex items-center justify-between gap-4 mt-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 bg-paper-200 border border-ink-200 overflow-hidden flex items-center justify-center relative rounded-xs shrink-0">
                          {isVideoUrl(newUrl) ? (
                            <video 
                              key={newUrl} 
                              src={getSafeUrl(resolvedUrls[newUrl] || newUrl)} 
                              poster={videoPosters[newUrl] ? cleanMediaUrl(videoPosters[newUrl]) : undefined} 
                              className="w-full h-full object-cover" 
                              muted 
                              playsInline 
                              onError={() => {
                                const backup = getMediaBackup(newUrl);
                                if (backup && resolvedUrls[newUrl] !== backup) {
                                  setResolvedUrls(prev => ({ ...prev, [newUrl]: backup }));
                                }
                              }}
                            />
                          ) : isPdfUrl(newUrl) ? (
                            <div className="w-full h-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-[10px]">PDF</div>
                          ) : (
                            <img 
                              src={getSafeUrl(resolvedUrls[newUrl] || videoPosters[newUrl] || newUrl)} 
                              className="w-full h-full object-cover" 
                              alt="Draft Preview" 
                              onError={() => {
                                const backup = getMediaBackup(newUrl);
                                if (backup && resolvedUrls[newUrl] !== backup) {
                                  setResolvedUrls(prev => ({ ...prev, [newUrl]: backup }));
                                }
                              }}
                            />
                          )}
                          <div className="absolute bottom-0 right-0 bg-ink-900/80 text-paper-50 px-1 text-[7px] leading-tight font-sans rounded-tl-xs">
                            {isVideoUrl(newUrl) ? 'MP4' : isPdfUrl(newUrl) ? 'PDF' : 'IMG'}
                          </div>
                        </div>
                        <div className="min-w-0 flex-grow">
                          <span className="font-mono text-[9px] text-ink-400 font-bold uppercase block mb-0.5">DRAFT MEDIA PREVIEW</span>
                          <div className="truncate text-[10px] text-ink-800 font-mono select-all" title={newUrl}>
                            {newUrl.startsWith('data:') 
                              ? 'Loaded Local Base64 Resource' 
                              : newUrl.startsWith('blob:') 
                                ? 'Loaded Local Blob Stream' 
                                : (newUrl.startsWith('/uploads/') || newUrl.startsWith('/portfolio_assets/'))
                                  ? '✓ Saved & Hosted on Server'
                                  : newUrl}
                          </div>
                        </div>
                      </div>

                      {!isVideoUrl(newUrl) && !isPdfUrl(newUrl) && (
                        <button
                          type="button"
                          onClick={() => openCropper(newUrl, -1)}
                          className="px-3 py-1.5 border border-klein text-klein hover:bg-klein hover:text-white transition-all font-sans text-[10px] font-bold uppercase rounded-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Crop className="w-3.5 h-3.5" /> Crop / Edit Image
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleAddImage(newUrl, newLink)}
                      className="bg-klein text-white hover:bg-klein/90 px-4 py-2 font-bold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors uppercase tracking-wider text-[10px]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Local Batch Files Upload Zone */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-ink-400 font-bold uppercase">Local Computer Batch Upload (Select multiple or Drop files)</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => !isUploading && document.getElementById('batch-file-picker')?.click()}
                      className={`border-2 border-dashed rounded-xs p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[120px] ${
                        dragActive 
                          ? 'border-klein bg-klein/5 text-klein' 
                          : isUploading
                            ? 'border-amber-400 bg-amber-50/10 text-amber-600 animate-pulse'
                            : 'border-ink-200 hover:border-klein/50 hover:bg-paper-100 text-ink-500'
                      }`}
                    >
                      <input 
                        id="batch-file-picker"
                        type="file" 
                        accept="image/*,video/*,application/pdf" 
                        className="hidden" 
                        onChange={handleFileChange}
                        disabled={isUploading}
                        multiple
                      />
                      <Upload className={`w-6 h-6 mb-1.5 ${isUploading ? 'animate-bounce text-amber-500' : ''}`} />
                      <span className="font-mono text-[10px] font-bold uppercase">
                        {isUploading ? 'Batch Uploading in progress...' : 'Choose Multiple Files or Drop Them Here'}
                      </span>
                      <span className="text-[8px] text-ink-400 mt-1 max-w-[280px]">
                        Supports JPG, PNG, GIF, MP4, PDF files up to 20MB. Selected files are compressed automatically.
                      </span>
                    </div>
                  </div>

                  {batchFiles.length > 0 && (
                    <div className="border border-ink-150 bg-paper-50 rounded-xs p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-ink-150 pb-2">
                        <span className="font-mono text-[9px] text-ink-500 font-bold uppercase">
                          BATCH FILE QUEUE ({batchFiles.length} FILES)
                        </span>
                        <div className="flex gap-2">
                          {batchFiles.some(bf => bf.status === 'completed') && (
                            <button
                              type="button"
                              onClick={clearCompletedBatchFiles}
                              disabled={isUploading}
                              className="text-[9px] font-mono uppercase font-bold text-ink-400 hover:text-ink-700 disabled:opacity-40 cursor-pointer"
                            >
                              Clear Completed
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={clearBatchList}
                            disabled={isUploading}
                            className="text-[9px] font-mono uppercase font-bold text-rose-500 hover:text-rose-700 disabled:opacity-40 cursor-pointer"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {batchFiles.map((bf) => {
                          const isCompleted = bf.status === 'completed';
                          const isFailed = bf.status === 'failed';
                          const isProcessing = bf.status === 'compressing' || bf.status === 'uploading';
                          
                          return (
                            <div key={bf.id} className="bg-paper-0 border border-ink-150 rounded-xs p-2.5 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="shrink-0">
                                    {isCompleted ? (
                                      <div className="w-4 h-4 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3" />
                                      </div>
                                    ) : isFailed ? (
                                      <div className="w-4 h-4 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center">
                                        <X className="w-3 h-3" />
                                      </div>
                                    ) : isProcessing ? (
                                      <div className="w-4 h-4 border border-t-amber-500 border-ink-200 rounded-full animate-spin" />
                                    ) : (
                                      <div className="w-4 h-4 bg-ink-100 text-ink-500 rounded-full flex items-center justify-center text-[8px] font-mono">
                                        ...
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-ink-900 font-mono font-bold truncate block" title={bf.name}>
                                      {bf.name}
                                    </span>
                                    <span className="text-[8px] text-ink-400 font-mono block">
                                      {formatFileSize(bf.size)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-xs font-bold ${
                                    isCompleted ? 'bg-emerald-50 text-emerald-600' :
                                    isFailed ? 'bg-rose-50 text-rose-600' :
                                    bf.status === 'compressing' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                                    'bg-ink-100 text-ink-500'
                                  }`}>
                                    {bf.status === 'compressing' ? 'COMPRESSING' :
                                     bf.status === 'uploading' ? `UPLOADING: ${bf.progress}%` :
                                     bf.status === 'completed' ? 'COMPLETED' :
                                     bf.status === 'failed' ? 'FAILED' : 'PENDING'}
                                  </span>

                                  {!isUploading && (
                                    <button
                                      type="button"
                                      onClick={() => removeBatchFile(bf.id)}
                                      className="text-ink-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Custom subtle progress bar */}
                              {(isProcessing || bf.progress > 0) && (
                                <div className="w-full bg-ink-100 h-1 rounded-full overflow-hidden mt-0.5">
                                  <div 
                                    className={`h-full transition-all duration-300 ${
                                      bf.status === 'compressing' ? 'bg-amber-400 animate-pulse' :
                                      isCompleted ? 'bg-emerald-500' : 'bg-klein'
                                    }`}
                                    style={{ width: bf.status === 'compressing' ? '10%' : `${bf.progress}%` }}
                                  />
                                </div>
                              )}

                              {isFailed && bf.error && (
                                <div className="text-[8px] text-rose-500 font-mono leading-relaxed mt-0.5">
                                  ERROR: {bf.error}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-2 border-t border-ink-150">
                        <button
                          type="button"
                          onClick={startBatchUpload}
                          disabled={isUploading || !batchFiles.some(bf => bf.status === 'pending' || bf.status === 'failed')}
                          className="bg-klein text-white hover:bg-klein/90 disabled:bg-ink-200 disabled:text-ink-400 px-4 py-2 font-bold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors uppercase tracking-wider text-[10px]"
                        >
                          {isUploading ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin" /> Uploading Batch...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" /> Start Uploading Queue
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Presets */}
              <div className="mt-4 pt-3.5 border-t border-ink-150">
                <span className="text-[9px] text-ink-400 font-bold block mb-2 uppercase tracking-wider">Quick Presets (Dynamic Media & Video Loops)</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleAddImage('https://www.w3schools.com/html/mov_bbb.mp4', 'https://www.w3schools.com/html/mov_bbb.mp4')}
                    className="px-2.5 py-1 bg-paper-100 hover:bg-klein hover:text-white border border-ink-200 text-ink-700 font-sans text-[10px] rounded-xs cursor-pointer transition-colors"
                  >
                    + Big Buck Bunny (MP4 Video)
                  </button>
                  <button
                    onClick={() => handleAddImage('https://www.w3schools.com/html/movie.mp4', 'https://www.w3schools.com/html/movie.mp4')}
                    className="px-2.5 py-1 bg-paper-100 hover:bg-klein hover:text-white border border-ink-200 text-ink-700 font-sans text-[10px] rounded-xs cursor-pointer transition-colors"
                  >
                    + Bear Wildlife (MP4 Video)
                  </button>
                  <button
                    onClick={() => handleAddImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcHBmYXZrcXlhNnBmdDJubWoxazhkcGtwZ2ptYndzOXoxMGhxeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LMc8x8NshcrvWCEH6A/giphy.gif', 'https://giphy.com/')}
                    className="px-2.5 py-1 bg-paper-100 hover:bg-klein hover:text-white border border-ink-200 text-ink-700 font-sans text-[10px] rounded-xs cursor-pointer transition-colors"
                  >
                    + HUD UI (GIF Animation)
                  </button>
                  <button
                    onClick={() => handleAddImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcHBmYXZrcXlhNnBmdDJubWoxazhkcGtwZ2ptYndzOXoxMGhxeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjei1fG/giphy.gif', 'https://giphy.com/')}
                    className="px-2.5 py-1 bg-paper-100 hover:bg-klein hover:text-white border border-ink-200 text-ink-700 font-sans text-[10px] rounded-xs cursor-pointer transition-colors"
                  >
                    + Node Network (GIF Animation)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(() => {
          const isThreeCol = galleryColumns === 3;
          const columnsData = isThreeCol 
            ? [
                plateIndices.filter((_, i) => i % 3 === 0),
                plateIndices.filter((_, i) => i % 3 === 1),
                plateIndices.filter((_, i) => i % 3 === 2),
              ]
            : [
                plateIndices.filter((_, i) => i % 2 === 0),
                plateIndices.filter((_, i) => i % 2 !== 0),
              ];

            const renderPlate = (idx: number) => {
             const rawItem = galleryItems && galleryItems[idx - 1];
             const hasRealImage = !!(rawItem && rawItem.url) && !failedMediaUrls[rawItem.url];
             const mediaUrl = hasRealImage ? rawItem.url : '';
             const linkUrl = hasRealImage ? rawItem.link : '';
             const isVideo = isVideoUrl(mediaUrl);
             const isPdf = isPdfUrl(mediaUrl);

             const mediaContent = (
               <div className="relative w-full overflow-hidden bg-transparent">
                 {isVideo ? (
                   <video 
                     key={mediaUrl}
                     src={cleanMediaUrl(resolvedUrls[mediaUrl] || mediaUrl)} 
                     poster={videoPosters[mediaUrl] ? cleanMediaUrl(videoPosters[mediaUrl]) : undefined}
                     autoPlay 
                     loop 
                     muted 
                     playsInline 
                     onError={() => {
                       const backup = getMediaBackup(mediaUrl);
                       if (backup && resolvedUrls[mediaUrl] !== backup) {
                         console.log(`[Backup] Rescued video from localStorage backup: ${mediaUrl}`);
                         setResolvedUrls(prev => ({ ...prev, [mediaUrl]: backup }));
                       } else {
                         console.error(`Failed to load video URL: ${mediaUrl}`);
                         setFailedMediaUrls(prev => ({ ...prev, [mediaUrl]: true }));
                       }
                     }}
                     className="w-full h-auto block"
                   />
                 ) : isPdf ? (
                   <div className="w-full h-[360px] md:h-[480px] bg-paper-100 border border-ink-200 relative">
                     <iframe 
                       src={cleanMediaUrl(resolvedUrls[mediaUrl] || mediaUrl)} 
                       className="w-full h-full border-0" 
                       title={`PDF Preview ${idx}`}
                     />
                     <div className="absolute top-2 right-2 bg-paper-0/90 border border-ink-200 px-2 py-1 text-[9px] font-mono text-ink-600 rounded-sm pointer-events-none z-10 flex items-center gap-1 shadow-sm">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                       PDF DOCUMENT PREVIEW
                     </div>
                   </div>
                 ) : (
                   <>
                     {videoPosters[mediaUrl] && (
                       <img 
                         src={getSafeUrl(resolvedUrls[videoPosters[mediaUrl]] || videoPosters[mediaUrl])} 
                         alt=""
                         onError={() => {
                           console.warn(`Failed to load video poster: ${videoPosters[mediaUrl]}`);
                         }}
                         className="absolute inset-0 w-full h-full object-cover opacity-65 filter blur-[1px] transition-opacity duration-300 pointer-events-none"
                       />
                     )}
                     <img 
                       src={getSafeUrl(resolvedUrls[mediaUrl] || mediaUrl)} 
                       alt={`Plate ${idx}`} 
                       onError={() => {
                         const backup = getMediaBackup(mediaUrl);
                         if (backup && resolvedUrls[mediaUrl] !== backup) {
                           console.log(`[Backup] Rescued image from localStorage backup: ${mediaUrl}`);
                           setResolvedUrls(prev => ({ ...prev, [mediaUrl]: backup }));
                         } else {
                           console.warn(`Failed to load image URL: ${mediaUrl}`);
                           setFailedMediaUrls(prev => ({ ...prev, [mediaUrl]: true }));
                         }
                       }}
                       className="w-full h-auto block relative z-10 bg-transparent"
                     />
                   </>
                 )}
               </div>
             );

            return (
              <div 
                key={idx} 
                className={`gallery-item group relative overflow-hidden flex flex-col justify-between ${
                  hasRealImage 
                    ? 'bg-transparent border-0 p-0 h-auto' 
                    : 'bg-paper-100 border border-ink-150 h-[220px] md:h-[280px] p-4 hover:border-klein/30'
                } transition-all duration-300`}
              >
                {hasRealImage ? (
                  linkUrl ? (
                    <a 
                      href={linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block w-full cursor-pointer relative"
                    >
                      {mediaContent}
                    </a>
                  ) : (
                    mediaContent
                  )
                ) : (
                  <>
                    {/* Soft grid background */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                      backgroundImage: `radial-gradient(#002FA7 1.5px, transparent 1px)`,
                      backgroundSize: '16px 16px'
                    }} />
                  </>
                )}

                {/* Outlined inner frame */}
                {!hasRealImage && (
                  <div className="absolute inset-2 border border-ink-200/50 pointer-events-none z-10" />
                )}

                {/* Plate top stats */}
                {!hasRealImage && (
                  <div className="flex justify-between items-center font-mono text-[8px] text-ink-400 z-10 bg-paper-0/80 backdrop-blur-xs px-2 py-0.5 rounded-xs">
                    <span>PLATE_REF.{pad(item.number)}.{pad(idx)}</span>
                    <span>SCALE: SECURE_DOSSIER_MODE</span>
                  </div>
                )}

                {/* Center schematic visual (only shown if no real image exists) */}
                {!hasRealImage && (
                  <div className="flex-grow flex items-center justify-center z-10">
                    <div className="text-center">
                      <span className="font-sans font-bold text-4xl md:text-5xl text-ink-200 group-hover:text-klein/20 transition-colors duration-500">
                        {pad(item.number)}.{idx}
                      </span>
                    </div>
                  </div>
                )}

                {/* Caption */}
                {!hasRealImage && (
                  <div className="font-mono text-[9px] text-ink-500 z-10 flex justify-between border-t border-ink-150/40 pt-2 mt-auto bg-paper-0/80 backdrop-blur-xs px-2 py-1 rounded-xs">
                    <span className="uppercase truncate max-w-[50%]">{item.title}</span>
                    <span className="text-ink-400 font-bold shrink-0">
                      {pad(item.number)}.{idx} / Placeholder Plate
                    </span>
                  </div>
                )}
              </div>
            );
          };

          return (
            <div className={`gallery-grid gallery-grid-placeholders grid ${isThreeCol ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'} gap-6 items-start`}>
              {columnsData.map((colIndices, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-6">
                  {colIndices.map(renderPlate)}
                </div>
              ))}
            </div>
          );
        })()}
      </section>
    );
  }

  // 7. Next Project Dossier Editorial Transition
  function renderNextDossier(nextItem: Work) {
    return (
      <div id="next-dossier-section" className="next-dossier mt-24 py-12 border-t border-b border-ink-900 group">
        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400 font-bold block mb-3">
          CONTINUE READING DOSSIER
        </span>
        <button
          onClick={() => onSelectProject(nextItem)}
          className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-klein py-2 cursor-pointer"
        >
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <h2 className="font-sans font-bold text-3xl md:text-5xl lg:text-6xl text-ink-900 tracking-tighter group-hover:text-klein transition-colors duration-300">
              {pad(nextItem.number)} — {nextItem.title}
            </h2>
            <span className="font-mono text-xs uppercase tracking-widest text-ink-400 group-hover:text-klein transition-colors duration-300 shrink-0">
              Next Case study →
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <article className="work-detail max-w-[1440px] mx-auto px-6 md:px-12 py-12" id="work-detail-container">
      {/* Back Link */}
      <div className="mb-8" id="back-link-wrapper">
        <button 
          id="back-to-works-btn"
          onClick={onNavigateBack} 
          className="back-link font-mono text-[11px] uppercase tracking-[0.2em] text-ink-900 hover:text-klein transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-klein"
        >
          ← Back to Works
        </button>
      </div>

      {/* Detail Header */}
      <header id="detail-header-section" className="detail-header grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 mb-10">
        <div className="md:col-span-3">
          <div className="detail-number font-sans font-bold text-klein select-none tracking-tighter">
            {pad(project.number)}
          </div>
        </div>
        <div className="md:col-span-9 flex flex-col justify-end">
          <span className="eyebrow font-mono text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-bold mb-2 block">
            {project.category} / {getClient(project)}
          </span>
          <h1 className="font-sans font-extrabold text-ink-900 tracking-tighter mb-4 leading-none">
            {project.title}
          </h1>
          <p className="font-sans text-ink-600 text-[16px] md:text-[18px] max-w-3xl leading-relaxed font-normal">
            {project.summary}
          </p>
        </div>
      </header>

      {/* Detail Content Layout */}
      <div id="detail-layout-section" className="detail-layout grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Main dossier narrative */}
        <div className="lg:col-span-8 space-y-2">
          {detailSection("Project Challenge", project.challenge)}
          {detailSection("Project Insight", project.insight)}
          {detailSection("Project Solution", project.solution)}
          {detailSection("Core Deliverables", project.deliverables)}
          {detailSection("Key Results", project.results)}
        </div>

        {/* Right Column: Sticky metrics and performance outcomes */}
        <div className="lg:col-span-4 lg:sticky lg:top-[100px]">
          {renderMetricGrid(project)}
        </div>
      </div>

      {/* Plotted visual schematic plates gallery */}
      {renderGallery(project)}

      {/* Editorial progression to the next project */}
      {renderNextDossier(nextProject)}

      {/* --- CROP EDITOR OVERLAY MODAL --- */}
      {cropImageSrc && (
        <div className="fixed inset-0 bg-ink-950/70 backdrop-blur-xs z-[999] flex items-center justify-center p-4">
          <div className="bg-paper-0 border-2 border-ink-900 shadow-2xl max-w-4xl w-full rounded-sm overflow-hidden flex flex-col max-h-[90vh] text-ink-900 font-sans">
            
            {/* Terminal Header */}
            <div className="bg-ink-900 text-paper-50 px-4 py-3 flex items-center justify-between border-b border-ink-900 select-none">
              <div className="flex items-center gap-2">
                <Crop className="w-4.5 h-4.5 text-klein animate-pulse" />
                <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider">
                  IMAGE EDITING PROTOCOL // PROCESS: PRECISION_CROP
                </span>
              </div>
              <button 
                onClick={() => { setCropImageSrc(null); setCroppingItemIndex(null); }}
                className="text-paper-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Work area */}
            <div className="p-5 md:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Visual Editor workspace */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-ink-400 block">
                  1. Visual Workspace Frame
                </span>
                
                <div className="relative border border-ink-200 bg-paper-50 rounded-xs overflow-hidden flex items-center justify-center h-[280px] md:h-[350px] select-none">
                  {/* Image with rotation */}
                  <img 
                    src={cropImageSrc} 
                    style={{ 
                      transform: `rotate(${rotation}deg)`, 
                      maxWidth: '100%', 
                      maxHeight: '100%',
                    }}
                    className="object-contain transition-transform duration-300"
                    alt="Source to crop"
                  />

                  {/* Precise high-contrast overlay bounding box */}
                  <div 
                    className="absolute border-2 border-dashed border-klein shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none"
                    style={{
                      left: `${cropX}%`,
                      top: `${cropY}%`,
                      width: `${cropW}%`,
                      height: `${cropH}%`,
                      transition: 'left 0.1s, top 0.1s, width 0.1s, height 0.1s'
                    }}
                  >
                    {/* Rule of thirds lines */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                      <div className="border-r border-b border-klein"></div>
                      <div className="border-r border-b border-klein"></div>
                      <div className="border-b border-klein"></div>
                      <div className="border-r border-b border-klein"></div>
                      <div className="border-r border-b border-klein"></div>
                      <div className="border-b border-klein"></div>
                      <div className="border-r border-klein"></div>
                      <div className="border-r border-klein"></div>
                      <div></div>
                    </div>

                    <div className="absolute -top-5 left-0 bg-klein text-white text-[8px] font-mono px-1.5 py-0.5 uppercase tracking-wider leading-none rounded-t-xs">
                      CROP AREA
                    </div>
                  </div>
                </div>

                {/* Readout stats */}
                <div className="bg-paper-100 border border-ink-150 rounded-xs p-3 font-mono text-[9px] flex justify-between text-ink-600">
                  <span>X_OFFSET: <strong className="text-ink-900">{cropX}%</strong></span>
                  <span>Y_OFFSET: <strong className="text-ink-900">{cropY}%</strong></span>
                  <span>WIDTH: <strong className="text-ink-900">{cropW}%</strong></span>
                  <span>HEIGHT: <strong className="text-ink-900">{cropH}%</strong></span>
                  <span>ROTATION: <strong className="text-ink-900">{rotation}°</strong></span>
                </div>
              </div>

              {/* Right Column: Controls, presets, and live preview */}
              <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-ink-400 block mb-2">
                      2. Live Processed Preview
                    </span>
                    <div className="bg-paper-100 border border-ink-200 rounded-xs p-3 flex justify-center items-center h-[180px] relative overflow-hidden">
                      <canvas 
                        ref={previewCanvasRef} 
                        className="max-w-full max-h-full object-contain shadow-md rounded-xs border border-ink-150 bg-paper-0"
                      />
                      <div className="absolute bottom-1.5 right-1.5 bg-ink-900 text-paper-50 px-1 text-[7px] font-mono leading-tight tracking-widest rounded-xs">
                        REALTIME CANVAS PREVIEW
                      </div>
                    </div>
                  </div>

                  {/* Presets & Rotation */}
                  <div className="space-y-3">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-ink-400 block mb-1.5">
                        Aspect Ratio Lock
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['free', '1:1', '16:9', '4:3'] as const).map((aspect) => (
                          <button
                            key={aspect}
                            type="button"
                            onClick={() => {
                              setCropAspect(aspect);
                              updateCropValues(cropX, cropY, cropW, cropH, aspect);
                            }}
                            className={`py-1 px-2 border font-mono text-[10px] font-bold uppercase rounded-xs transition-colors cursor-pointer ${
                              cropAspect === aspect
                                ? 'bg-klein border-klein text-white'
                                : 'bg-paper-0 border-ink-200 text-ink-700 hover:border-klein'
                            }`}
                          >
                            {aspect}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rotate Button */}
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-ink-400 block mb-1.5">
                        Orient Controls
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextRot = (rotation + 90) % 360;
                          setRotation(nextRot);
                          setTimeout(() => {
                            updateCropValues(cropX, cropY, cropW, cropH);
                          }, 50);
                        }}
                        className="w-full py-1.5 px-3 bg-paper-0 border border-ink-200 hover:border-klein text-ink-700 hover:text-klein transition-all font-mono text-[10px] font-bold uppercase rounded-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Rotate 90° Clockwise
                      </button>
                    </div>
                  </div>

                  {/* Fine tuning sliders */}
                  <div className="space-y-2 pt-2 border-t border-ink-150">
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-ink-400 block mb-2">
                      3. Precision Sliders
                    </span>
                    
                    {/* Slider X */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-ink-600 font-bold uppercase">Horizontal Position</span>
                        <span className="text-ink-900 font-bold">{cropX}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={100 - cropW} 
                        value={cropX} 
                        onChange={(e) => updateCropValues(parseInt(e.target.value), cropY, cropW, cropH)}
                        className="w-full accent-klein bg-paper-100 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Slider Y */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-ink-600 font-bold uppercase">Vertical Position</span>
                        <span className="text-ink-900 font-bold">{cropY}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={100 - cropH} 
                        value={cropY} 
                        onChange={(e) => updateCropValues(cropX, parseInt(e.target.value), cropW, cropH)}
                        className="w-full accent-klein bg-paper-100 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Slider Width */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-ink-600 font-bold uppercase">Crop Width</span>
                        <span className="text-ink-900 font-bold">{cropW}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max={100 - cropX} 
                        value={cropW} 
                        onChange={(e) => updateCropValues(cropX, cropY, parseInt(e.target.value), cropH)}
                        className="w-full accent-klein bg-paper-100 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Slider Height */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-ink-600 font-bold uppercase">Crop Height</span>
                        <span className="text-ink-900 font-bold">{cropH}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max={100 - cropY} 
                        value={cropH} 
                        disabled={cropAspect !== 'free'}
                        onChange={(e) => updateCropValues(cropX, cropY, cropW, parseInt(e.target.value))}
                        className="w-full accent-klein bg-paper-100 h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer actions */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-ink-150">
                  <button
                    type="button"
                    onClick={() => {
                      setCropX(10);
                      setCropY(10);
                      setCropW(80);
                      setCropH(80);
                      setRotation(0);
                      setCropAspect('free');
                    }}
                    className="px-3 py-2 border border-ink-200 hover:border-ink-400 text-ink-600 hover:text-ink-900 font-mono text-[10px] font-bold uppercase rounded-xs cursor-pointer transition-colors"
                  >
                    Reset
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setCropImageSrc(null); setCroppingItemIndex(null); }}
                      className="px-4 py-2 border border-ink-200 hover:border-rose-500 hover:text-rose-600 font-mono text-[10px] font-bold uppercase rounded-xs cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyCrop}
                      className="px-5 py-2 bg-klein hover:bg-klein/90 text-white font-mono text-[10px] font-bold uppercase rounded-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" /> Apply
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </article>
  );
}
