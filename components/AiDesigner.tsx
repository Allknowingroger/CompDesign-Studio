import React, { useState } from 'react';
import { generateSvgFromPrompt } from '../services/geminiService';
import { Sparkles, Code, Download, Loader2, History, ChevronRight, Eye } from 'lucide-react';

interface DesignHistoryItem {
  id: string;
  prompt: string;
  svg: string;
  timestamp: number;
}

const AiDesigner: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSvg, setCurrentSvg] = useState<string | null>(null);
  const [history, setHistory] = useState<DesignHistoryItem[]>([]);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    const result = await generateSvgFromPrompt(prompt);
    
    // Add to history if successful
    if (!result.includes("Error")) {
      const newItem = {
        id: Date.now().toString(),
        prompt: prompt,
        svg: result,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 5)); // Keep last 5
      setCurrentSvg(result);
      setViewMode('preview');
    } else {
        setCurrentSvg(result); // Show error SVG
    }
    
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!currentSvg) return;
    const blob = new Blob([currentSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-design-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const loadHistoryItem = (item: DesignHistoryItem) => {
    setCurrentSvg(item.svg);
    setPrompt(item.prompt);
    setViewMode('preview');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden p-4 lg:p-6">
       {/* Input Section */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg flex flex-col h-fit max-h-full custom-scrollbar overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
             <Sparkles className="text-purple-600" size={20} />
             <h2 className="text-xl font-semibold text-slate-800">Generative Architect</h2>
          </div>

          <div className="space-y-4 flex-grow">
            <label className="block text-sm font-medium text-slate-600">
               Natural Language Prompt
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a geometric structure, e.g., 'A recursive isometric grid forming a 3D cube illusion with neon cyan lines'..."
              className="w-full h-32 bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm transition-shadow"
            />
            
            <button 
              onClick={handleGenerate}
              disabled={isLoading || !prompt}
              className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} />}
              {isLoading ? 'Architecting...' : 'Generate Structure'}
            </button>
          </div>

          {/* History Section */}
          {history.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                 <History size={12} /> Recent Generations
               </h3>
               <div className="space-y-2">
                 {history.map(item => (
                   <button 
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left p-2 rounded hover:bg-slate-50 group transition-colors border border-transparent hover:border-slate-200 flex items-center justify-between"
                   >
                     <span className="text-xs text-slate-600 truncate max-w-[200px] group-hover:text-purple-700">{item.prompt}</span>
                     <ChevronRight size={12} className="text-slate-400 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all" />
                   </button>
                 ))}
               </div>
            </div>
          )}
       </div>

       {/* Result View */}
       <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 relative shadow-inner flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
             {currentSvg && (
               <>
                 <div className="bg-white/90 backdrop-blur p-1 rounded-lg border border-slate-200 flex shadow-sm">
                    <button 
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'preview' ? 'bg-purple-100 text-purple-700 shadow-inner' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Eye size={14} className="inline mr-1"/> Preview
                    </button>
                    <button 
                      onClick={() => setViewMode('code')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'code' ? 'bg-purple-100 text-purple-700 shadow-inner' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Code size={14} className="inline mr-1"/> Code
                    </button>
                 </div>
                 <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200 shadow-sm"
                 >
                    <Download size={14} /> Save
                 </button>
               </>
             )}
          </div>

          {/* Content Area */}
          <div className="flex-grow flex items-center justify-center overflow-hidden relative">
             {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm transition-all">
                   <div className="relative">
                      <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
                      <Loader2 className="animate-spin text-purple-600 mb-4 relative z-10" size={48} />
                   </div>
                   <p className="text-slate-600 font-mono animate-pulse text-sm">Constructing geometry...</p>
                </div>
             )}

             {currentSvg ? (
               viewMode === 'preview' ? (
                  <div 
                    className="w-full h-full p-8 flex items-center justify-center animate-in fade-in zoom-in duration-500 [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[70vh] [&>svg]:drop-shadow-xl"
                    dangerouslySetInnerHTML={{ __html: currentSvg }}
                  />
               ) : (
                  <div className="w-full h-full p-6 overflow-auto custom-scrollbar bg-slate-50">
                    <pre className="text-[10px] md:text-xs font-mono text-slate-700 whitespace-pre-wrap break-all p-4 bg-white rounded-lg border border-slate-200 select-all shadow-sm">
                      {currentSvg}
                    </pre>
                  </div>
               )
             ) : (
               <div className="text-center text-slate-400 max-w-sm px-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-inner">
                     <Sparkles size={32} className="opacity-30" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-500 mb-2">AI Canvas Empty</h3>
                  <p className="text-sm font-mono text-slate-500 leading-relaxed">
                    Describe a structure to generate scalar vector graphics using Gemini 2.5.
                  </p>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default AiDesigner;