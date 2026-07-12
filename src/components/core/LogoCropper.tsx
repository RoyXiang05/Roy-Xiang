import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { Upload, X, Check, RotateCcw, Scissors, Sliders, RefreshCw, AlertCircle, Info, Layers } from 'lucide-react';

interface LogoCropperProps {
  onClose: () => void;
  onUpdate: () => void;
}

const BRANDS = [
  { id: 'sinopec', name: 'SINOPEC 中国石化' },
  { id: 'douyin', name: '抖音' },
  { id: 'red', name: '小红书' },
  { id: 'tencent', name: 'Tencent 腾讯' },
  { id: 'tencent_ad', name: 'Tencent 腾讯广告' },
  { id: 'lenovo', name: 'lenovo 联想' },
  { id: 'dior', name: 'DIOR 迪奥' },
  { id: 'john_lobb', name: 'JOHN LOBB' },
  { id: 'vanke', name: 'vanke 万科' },
  { id: 'vivo', name: 'vivo' },
  { id: 'kuaishou', name: '快手' },
  { id: 'ocean_engine', name: '巨量引擎' },
  { id: 'estee_lauder', name: 'ESTĒE LAUDER 雅诗兰黛' }
];

export default function LogoCropper({ onClose, onUpdate }: LogoCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('sinopec');
  const [croppedImages, setCroppedImages] = useState<Record<string, string>>({});
  
  // Cropping State
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, width: 150, height: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // Zoom and Pan sliders for extra precision
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load existing cropped logos
  useEffect(() => {
    const loaded: Record<string, string> = {};
    BRANDS.forEach((brand) => {
      const saved = localStorage.getItem(`custom_logo_${brand.id}`);
      if (saved) {
        loaded[brand.id] = saved;
      }
    });
    setCroppedImages(loaded);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setZoom(1);
        setPanX(0);
        setPanY(0);
        // Reset cropbox to a reasonable size
        setCropBox({ x: 100, y: 100, width: 160, height: 64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setZoom(1);
        setPanX(0);
        setPanY(0);
        setCropBox({ x: 100, y: 100, width: 160, height: 64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Dragging/Resizing handlers for crop box
  const handleMouseDown = (e: ReactMouseEvent, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    if (!imageRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;

    setDragStart({ x: startX, y: startY });
    setCropStart({ ...cropBox });

    if (action === 'drag') {
      setIsDragging(true);
    } else if (action === 'resize' && handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!imageRef.current) return;

      const imgRect = imageRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      if (isDragging) {
        // Bound calculation
        let newX = cropStart.x + deltaX;
        let newY = cropStart.y + deltaY;

        newX = Math.max(0, Math.min(newX, imgRect.width - cropBox.width));
        newY = Math.max(0, Math.min(newY, imgRect.height - cropBox.height));

        setCropBox((prev) => ({
          ...prev,
          x: newX,
          y: newY
        }));
      } else if (isResizing && resizeHandle) {
        let newWidth = cropStart.width;
        let newHeight = cropStart.height;
        let newX = cropStart.x;
        let newY = cropStart.y;

        const minSize = 24;

        if (resizeHandle.includes('e')) {
          newWidth = Math.max(minSize, Math.min(cropStart.width + deltaX, imgRect.width - cropStart.x));
        }
        if (resizeHandle.includes('s')) {
          newHeight = Math.max(minSize, Math.min(cropStart.height + deltaY, imgRect.height - cropStart.y));
        }
        if (resizeHandle.includes('w')) {
          const possibleWidth = cropStart.width - deltaX;
          if (possibleWidth >= minSize && cropStart.x + deltaX >= 0) {
            newWidth = possibleWidth;
            newX = cropStart.x + deltaX;
          }
        }
        if (resizeHandle.includes('n')) {
          const possibleHeight = cropStart.height - deltaY;
          if (possibleHeight >= minSize && cropStart.y + deltaY >= 0) {
            newHeight = possibleHeight;
            newY = cropStart.y + deltaY;
          }
        }

        setCropBox({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, cropStart, resizeHandle, cropBox.width, cropBox.height]);

  // Actual extraction using HTML Canvas
  const cropAndSave = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The image displayed has a certain client size vs natural size
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;

    // Target size for high fidelity logo
    // Let's standardise the cropped logo height to 64px, and variable width to maintain quality
    const targetHeight = 64;
    const targetWidth = Math.round((cropBox.width * scaleX) * (targetHeight / (cropBox.height * scaleY)));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      img,
      cropBox.x * scaleX,
      cropBox.y * scaleY,
      cropBox.width * scaleX,
      cropBox.height * scaleY,
      0,
      0,
      targetWidth,
      targetHeight
    );

    const base64 = canvas.toDataURL('image/png');
    
    // Save to LocalStorage
    localStorage.setItem(`custom_logo_${selectedBrand}`, base64);
    
    // Update local state
    setCroppedImages((prev) => ({
      ...prev,
      [selectedBrand]: base64
    }));

    onUpdate(); // Trigger marquee reload
  };

  const deleteCroppedLogo = (brandId: string) => {
    localStorage.removeItem(`custom_logo_${brandId}`);
    setCroppedImages((prev) => {
      const copy = { ...prev };
      delete copy[brandId];
      return copy;
    });
    onUpdate(); // Trigger marquee reload
  };

  const clearAllLogos = () => {
    BRANDS.forEach((brand) => {
      localStorage.removeItem(`custom_logo_${brand.id}`);
    });
    setCroppedImages({});
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-5xl bg-paper-50 border border-ink-900/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-150 flex items-center justify-between bg-paper-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-klein-tint text-klein rounded-lg">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-ink-900 text-lg leading-tight">品牌 Logo 智能剪裁与替换环境</h2>
              <p className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mt-0.5">Brand Logo Cropping & Deployment Workspace</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-ink-100 rounded-lg text-ink-500 hover:text-ink-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Image Area & Controls */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Upload Zone & Interactive Cropper Container */}
            <div 
              className="flex-grow border-2 border-dashed border-ink-300 rounded-xl bg-paper-0 flex flex-col items-center justify-center relative min-h-[350px] overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              ref={containerRef}
            >
              {!imageSrc ? (
                <div className="p-8 text-center space-y-4 max-w-sm flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-sans font-medium text-ink-800 text-sm">拖拽包含 Logo 的 PNG 文件到这里</p>
                    <p className="font-sans text-xs text-ink-500 mt-1">或者点击下方按钮选择本地文件</p>
                  </div>
                  <label className="px-4 py-2 bg-klein hover:bg-klein-hover text-paper-0 text-xs font-medium rounded-lg cursor-pointer transition-colors inline-block shadow-sm">
                    选择 Logo 图像
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  <p className="font-mono text-[9px] text-ink-400 mt-2 bg-ink-100 px-2 py-1 rounded">
                    Tip: Supports any PNG/JPG file
                  </p>
                </div>
              ) : (
                <div className="relative select-none w-full h-full flex items-center justify-center p-4">
                  
                  {/* Image container with cropping overlays */}
                  <div className="relative max-w-full max-h-[450px]">
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Logo source"
                      className="max-w-full max-h-[400px] object-contain block pointer-events-none"
                      style={{
                        transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                        transition: 'transform 0.1s ease-out'
                      }}
                    />

                    {/* Draggable and Resizable Cropping Box overlay */}
                    <div
                      className="absolute border-2 border-klein shadow-[0_0_0_9999px_rgba(10,10,10,0.5)] z-10"
                      style={{
                        left: `${cropBox.x}px`,
                        top: `${cropBox.y}px`,
                        width: `${cropBox.width}px`,
                        height: `${cropBox.height}px`,
                        cursor: 'move'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'drag')}
                    >
                      {/* Anchor handles inside the crop rectangle */}
                      {['nw', 'ne', 'se', 'sw'].map((handle) => (
                        <div
                          key={handle}
                          className={`absolute w-3.5 h-3.5 bg-paper-0 border-2 border-klein rounded-full shadow-md z-20`}
                          style={{
                            top: handle.includes('n') ? '-7px' : 'auto',
                            bottom: handle.includes('s') ? '-7px' : 'auto',
                            left: handle.includes('w') ? '-7px' : 'auto',
                            right: handle.includes('e') ? '-7px' : 'auto',
                            cursor: `${handle}-resize`
                          }}
                          onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
                        />
                      ))}

                      {/* Displaying Current Crop Dimensions */}
                      <div className="absolute -bottom-6 left-0 bg-klein text-paper-0 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                        {Math.round(cropBox.width)} x {Math.round(cropBox.height)} px
                      </div>
                    </div>
                  </div>

                  {/* Reset image button */}
                  <button
                    onClick={() => setImageSrc(null)}
                    className="absolute top-4 right-4 p-1.5 bg-paper-0/90 hover:bg-paper-0 border border-ink-200 text-ink-600 hover:text-ink-900 rounded-lg shadow-sm transition-colors"
                    title="Change Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Fine-Tuning Controls Slider */}
            {imageSrc && (
              <div className="bg-paper-0 p-4 border border-ink-150 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-ink-700">
                  <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-klein" /> 极精细微调控件 (Pixel Sliders)</span>
                  <button 
                    onClick={() => {
                      setCropBox({ x: 100, y: 100, width: 160, height: 64 });
                      setZoom(1);
                      setPanX(0);
                      setPanY(0);
                    }}
                    className="flex items-center gap-1 text-[10px] font-mono text-ink-500 hover:text-klein"
                  >
                    <RotateCcw className="w-3 h-3" /> 重置画布
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-mono text-[10px] text-ink-500 mb-1">X 轴坐标: {Math.round(cropBox.x)}px</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="600" 
                      value={cropBox.x} 
                      onChange={(e) => setCropBox(p => ({ ...p, x: parseInt(e.target.value) }))}
                      className="w-full accent-klein h-1 bg-ink-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-ink-500 mb-1">Y 轴坐标: {Math.round(cropBox.y)}px</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="600" 
                      value={cropBox.y} 
                      onChange={(e) => setCropBox(p => ({ ...p, y: parseInt(e.target.value) }))}
                      className="w-full accent-klein h-1 bg-ink-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-ink-500 mb-1">剪裁宽度: {Math.round(cropBox.width)}px</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="400" 
                      value={cropBox.width} 
                      onChange={(e) => setCropBox(p => ({ ...p, width: parseInt(e.target.value) }))}
                      className="w-full accent-klein h-1 bg-ink-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-ink-500 mb-1">剪裁高度: {Math.round(cropBox.height)}px</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="400" 
                      value={cropBox.height} 
                      onChange={(e) => setCropBox(p => ({ ...p, height: parseInt(e.target.value) }))}
                      className="w-full accent-klein h-1 bg-ink-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Scaling options */}
                <div className="pt-2 border-t border-ink-100 flex items-center gap-4 text-xs">
                  <div className="flex-grow">
                    <label className="block font-mono text-[10px] text-ink-500 mb-1">原图放大比例 (Zoom): {zoom.toFixed(2)}x</label>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3" 
                      step="0.05"
                      value={zoom} 
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-klein h-1 bg-ink-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Setup Panel & Target Mapping */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Setup Targets / Selector */}
            <div className="bg-paper-0 p-5 border border-ink-150 rounded-xl space-y-4 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="font-sans font-bold text-ink-900 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-klein" /> 步骤 1. 选择目标部署品牌
                </h3>
                <p className="text-xs text-ink-500 mt-1">请选择你要将当前剪裁区域替换的对应品牌位置：</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-h-[220px] overflow-y-auto pr-2 border border-ink-100 rounded-lg p-2 bg-paper-50">
                  {BRANDS.map((brand) => {
                    const hasCustom = !!croppedImages[brand.id];
                    const isSelected = selectedBrand === brand.id;
                    return (
                      <button
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs border transition-all duration-150 ${
                          isSelected 
                            ? 'bg-klein text-paper-0 border-klein font-semibold shadow-sm' 
                            : 'bg-paper-0 border-ink-150 hover:border-ink-300 text-ink-800'
                        }`}
                      >
                        <span className="truncate">{brand.name}</span>
                        {hasCustom && (
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-paper-0' : 'bg-green-500'}`} title="已配置自定义 Logo" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2. Preview and Confirm */}
              <div className="border-t border-ink-150 pt-4 space-y-3">
                <h3 className="font-sans font-bold text-ink-900 text-sm flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-klein" /> 步骤 2. 预览并确认部署
                </h3>
                
                <div className="flex items-center space-x-4 bg-paper-50 p-3 rounded-lg border border-ink-150">
                  {/* Realtime Canvas rendering placeholder */}
                  <div className="bg-paper-0 w-24 h-12 rounded border border-ink-200 flex items-center justify-center overflow-hidden">
                    {imageSrc ? (
                      <div className="relative text-center text-[10px] text-ink-400 font-mono">
                        Ready to Crop
                      </div>
                    ) : (
                      <div className="text-center text-[9px] text-ink-400 font-mono px-1 select-none">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs font-semibold text-ink-800">
                      目标品牌: <span className="text-klein">{BRANDS.find(b => b.id === selectedBrand)?.name}</span>
                    </p>
                    <p className="text-[10px] text-ink-500 mt-0.5">
                      {croppedImages[selectedBrand] ? '✓ 当前已有自定义图像 (点击保存将覆盖)' : '⚡ 尚未配置自定义图像 (将使用 SVG 复刻版)'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={cropAndSave}
                    disabled={!imageSrc}
                    className={`flex-grow py-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                      imageSrc 
                        ? 'bg-klein hover:bg-klein-hover active:bg-klein-active text-paper-0 cursor-pointer' 
                        : 'bg-ink-150 text-ink-400 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    确定裁剪并部署
                  </button>
                </div>
              </div>

            </div>

            {/* Currently Active Customs Overview list */}
            <div className="bg-paper-0 p-5 border border-ink-150 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-ink-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-ink-500" /> 已配置的自定义 PNG 资产 (Assets)
                </h3>
                {Object.keys(croppedImages).length > 0 && (
                  <button
                    onClick={clearAllLogos}
                    className="text-[10px] text-red-500 hover:text-red-700 font-mono"
                  >
                    全部还原 (Reset All)
                  </button>
                )}
              </div>

              {Object.keys(croppedImages).length === 0 ? (
                <div className="text-center py-4 bg-paper-50 rounded-lg border border-dashed border-ink-200">
                  <p className="text-xs text-ink-400 font-mono">No Custom Logo Configured</p>
                  <p className="text-[10px] text-ink-400 mt-1">All brands currently display using default vector representations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {BRANDS.map((brand) => {
                    const img = croppedImages[brand.id];
                    if (!img) return null;
                    return (
                      <div key={brand.id} className="relative group border border-ink-150 rounded-lg p-1.5 bg-paper-50 flex flex-col items-center justify-between text-center min-h-[60px]">
                        <img src={img} alt={brand.name} className="h-6 object-contain max-w-[80%]" />
                        <span className="font-sans text-[8px] text-ink-600 truncate max-w-full mt-1">{brand.name}</span>
                        
                        <button
                          onClick={() => deleteCroppedLogo(brand.id)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity shadow-sm"
                          title="还原默认 SVG"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer info line */}
        <div className="bg-paper-0 px-6 py-3 border-t border-ink-150 flex items-center justify-between text-[10px] text-ink-500 font-mono">
          <span>SINOPEC & ALL BRAND LOGO CROPPER v1.0.0</span>
          <span>SYSTEM DISCIPLINE: LITERAL CROPPED RAW ASSETS</span>
        </div>

      </div>

      {/* Hidden Canvas for Cropping Process */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
