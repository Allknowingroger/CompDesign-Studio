import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { Image as ImageIcon, Wand2, Upload, Download, Loader2, X, Trash2, History, SplitSquareHorizontal } from 'lucide-react';

const PRESETS = [
  { label: "Cyberpunk", prompt: "Apply a futuristic cyberpunk neon color filter with high contrast and cyan/magenta highlights" },
  { label: "Sketch", prompt: "Convert this image into a detailed architectural pencil sketch on textured paper" },
  { label: "Vintage", prompt: "Apply a worn vintage 1970s photo effect with grain, scratches, and warm sepia tones" },
  { label: "Surreal", prompt: "Make the image dreamlike and surreal with melting objects and vibrant colors" },
  { label: "Vector", prompt: "Convert to a clean, flat vector art style with bold outlines and limited color palette" },
  { label: "Cleanup", prompt: "Enhance clarity, remove noise, and improve lighting" }
];

interface HistoryItem {
  original: string;
  edited: string;
  prompt: string;
}

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [comparePos, setComparePos] = useState(50); // For slider comparison
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large (Max 5MB).");
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError("Invalid file type.");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setGeneratedImage(null); 
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedImage) return;
    
    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const [meta, data] = selectedImage.split(',');
      const mimeType = meta.split(':')[1].split(';')[0];

      const result = await editImage(data, mimeType, prompt);
      setGeneratedImage(result);
      
      // Add to history
      setHistory(prev => [{ original: selectedImage, edited: result, prompt }, ...prev].slice(0, 5));
    } catch (error) {
      setError("Failed to process. Try a different prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = 'edited-design.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setComparePos(Math.max(0, Math.min(100, pos)));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden p-4 lg:p-6">
       {/* Input Section */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg flex flex-col h-fit max-h-full overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
             <Wand2 className="text-amber-600" size={20} />
             <h2 className="text-xl font-semibold text-slate-800">Nano Editor</h2>
          </div>

          <div className="space-y-6 flex-grow">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                {error}
              </div>
            )}

            {/* Drop Zone */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium">Source Image</label>
              {!selectedImage ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group
                    ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50'}
                  `}
                >
                  <Upload className={`mb-2 transition-colors ${isDragging ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-500'}`} size={24} />
                  <span className="text-xs text-slate-500 group-hover:text-slate-700">Drag & Drop or Click</span>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 group shadow-sm">
                   <img src={selectedImage} alt="Source" className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                   <button onClick={() => {setSelectedImage(null); setGeneratedImage(null);}} className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-red-100 hover:text-red-600 rounded text-slate-600 transition-colors shadow-sm">
                     <Trash2 size={14} />
                   </button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium">Editing Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the changes..."
                  className="w-full h-24 bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none placeholder-slate-400"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PRESETS.map((p) => (
                    <button key={p.label} onClick={() => setPrompt(p.prompt)} className="text-xs text-left px-3 py-2 bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded border border-slate-200 hover:border-amber-300 transition-all truncate shadow-sm">
                      {p.label}
                    </button>
                  ))}
                </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading || !prompt || !selectedImage}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Wand2 size={18} />}
              {isLoading ? 'Processing...' : 'Generate Edit'}
            </button>
            
            {/* History Strip */}
            {history.length > 0 && (
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-[10px] uppercase text-slate-500 font-bold mb-2 flex items-center gap-1"><History size={10} /> Recent Edits</p>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {history.map((item, i) => (
                    <button key={i} onClick={() => { setSelectedImage(item.original); setGeneratedImage(item.edited); setPrompt(item.prompt); }} className="w-12 h-12 shrink-0 rounded overflow-hidden border border-slate-200 hover:border-amber-500 transition-colors shadow-sm">
                      <img src={item.edited} className="w-full h-full object-cover" alt="hist" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
       </div>

       {/* Result View */}
       <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 relative shadow-inner flex flex-col items-center justify-center min-h-[400px] overflow-hidden group p-4">
          {/* BG Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#78350f 1px, transparent 1px)', backgroundSize: '20px 20px' }}/>

          {isLoading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-30 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 animate-pulse"></div>
                  <Loader2 className="relative z-10 animate-spin text-amber-600 mb-4" size={48} />
                </div>
                <p className="text-slate-600 font-mono animate-pulse text-sm">Applying visual transformations...</p>
             </div>
          )}

          {generatedImage && selectedImage ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Comparison Slider */}
              <div 
                 ref={sliderRef}
                 className="relative max-w-full max-h-[70vh] rounded-lg overflow-hidden shadow-2xl border border-slate-300 cursor-ew-resize select-none touch-none bg-white"
                 onMouseMove={handleSliderMove}
                 onTouchMove={handleSliderMove}
              >
                <img src={generatedImage} alt="Edited" className="max-w-full max-h-[70vh] block pointer-events-none" />
                
                {/* Original Overlay (Clipped) */}
                <div 
                  className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-[2px_0_10px_rgba(0,0,0,0.2)]"
                  style={{ width: `${comparePos}%` }}
                >
                  <img 
                    src={selectedImage} 
                    alt="Original" 
                    className="max-w-none h-full pointer-events-none object-cover" 
                    style={{ width: sliderRef.current ? sliderRef.current.clientWidth : '100%' }} 
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded">BEFORE</div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-amber-600/90 text-white text-[10px] font-bold rounded">AFTER</div>
                
                {/* Slider Handle */}
                <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 transform -translate-x-1/2 z-20 border border-slate-200" style={{ left: `${comparePos}%` }}>
                   <SplitSquareHorizontal size={16} />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                 <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-amber-200">
                    <Download size={16} /> Download Result
                 </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 max-w-md">
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-inner">
                 <ImageIcon size={32} className="opacity-40" />
               </div>
               <h3 className="text-lg font-semibold text-slate-700 mb-2">Studio Ready</h3>
               <p className="text-sm font-mono text-slate-500 leading-relaxed">
                 Upload an image to begin. Use the Nano Editor to perform complex edits using natural language prompts.
               </p>
            </div>
          )}
       </div>
    </div>
  );
};

export default ImageEditor;