import React, { useState, useRef, useEffect } from 'react';
import { FractalParams } from '../types';
import { Play, Pause, Wind, RefreshCcw } from 'lucide-react';

const AlgorithmicDesigner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  const [params, setParams] = useState<FractalParams>({
    angle: 25,
    depth: 10,
    lengthMultiplier: 0.7,
    branchCount: 2
  });

  const [growth, setGrowth] = useState(0); // 0 to 1 animation progress
  const [isAnimating, setIsAnimating] = useState(true);
  const [enableWind, setEnableWind] = useState(false);
  const [time, setTime] = useState(0);

  // Main Draw Function
  const drawTree = (
    ctx: CanvasRenderingContext2D, 
    startX: number, 
    startY: number, 
    len: number, 
    angle: number, 
    depth: number,
    currentDepth: number
  ) => {
    
    ctx.beginPath();
    ctx.save();
    ctx.translate(startX, startY);
    
    // Wind Effect calculation
    let windAngle = 0;
    if (enableWind) {
      // Wind affects smaller branches more (higher currentDepth)
      const windForce = Math.sin(time * 0.002 + currentDepth) * (currentDepth * 0.5);
      windAngle = windForce;
    }

    ctx.rotate((angle + windAngle) * Math.PI / 180);
    ctx.moveTo(0, 0);
    
    // Growth animation logic
    // If current depth is being drawn, we scale length by remaining growth factor
    // This is a simplified growth model: entire tree grows at once but logic ensures connectivity
    const drawnLen = len * Math.min(1, growth * (params.depth / 2)); 
    
    ctx.lineTo(0, -drawnLen);
    
    // Color gradient from Emerald to darker Teal/Blue for light mode contrast
    // hue 160 (green) -> 200 (blue)
    // lightness 40 -> 20 (darker at tips)
    const hue = 160 + (currentDepth / params.depth) * 40;
    ctx.strokeStyle = `hsl(${hue}, 70%, ${40 - (currentDepth/params.depth)*10}%)`;
    ctx.lineWidth = Math.max(0.5, (params.depth - currentDepth + 1) * 0.8);
    ctx.stroke();

    if (depth < 1) {
      ctx.restore();
      return;
    }

    const nextLen = len * params.lengthMultiplier;
    
    // Recursively draw branches
    // Right
    drawTree(ctx, 0, -drawnLen, nextLen, params.angle, depth - 1, currentDepth + 1);
    // Left
    drawTree(ctx, 0, -drawnLen, nextLen, -params.angle, depth - 1, currentDepth + 1);

    if (params.branchCount > 2) {
       drawTree(ctx, 0, -drawnLen, nextLen, 0, depth - 1, currentDepth + 1);
    }

    ctx.restore();
  };

  const renderFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI handling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Origin at bottom center
    const startLen = rect.height * 0.25;
    drawTree(ctx, rect.width / 2, rect.height, startLen, 0, params.depth, 0);
  };

  // Animation Loop
  useEffect(() => {
    const animate = () => {
      if (isAnimating && growth < 1) {
        setGrowth(prev => Math.min(prev + 0.01, 1));
      }
      
      if (enableWind) {
        setTime(Date.now());
      }

      renderFrame();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [growth, isAnimating, enableWind, params]);

  const resetAnimation = () => {
    setGrowth(0);
    setIsAnimating(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden p-4 lg:p-6">
       {/* Controls */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg h-fit">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
             <Wind className={enableWind ? "text-emerald-600 animate-pulse" : "text-slate-400"} size={20} />
             <h2 className="text-xl font-semibold text-emerald-800">L-System</h2>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setEnableWind(!enableWind)} className={`p-2 rounded-full transition-colors ${enableWind ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 text-slate-400'}`} title="Toggle Wind">
               <Wind size={18} />
             </button>
             <button onClick={resetAnimation} className="p-2 hover:bg-slate-100 rounded-full text-emerald-600 transition-colors" title="Regrow">
               <RefreshCcw size={18} />
             </button>
          </div>
        </div>

        <div className="space-y-6">
           <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Branch Angle</label>
              <span className="text-emerald-600 font-mono text-xs">{params.angle}°</span>
            </div>
            <input 
              type="range" min="0" max="90" 
              value={params.angle} 
              onChange={(e) => setParams({...params, angle: Number(e.target.value)})}
              className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
             <div className="flex justify-between mb-1">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Recursion Depth</label>
              <span className="text-emerald-600 font-mono text-xs">{params.depth}</span>
            </div>
            <input 
              type="range" min="1" max="12" step="1"
              value={params.depth} 
              onChange={(e) => {
                setParams({...params, depth: Number(e.target.value)});
                setGrowth(0); // Reset growth on complexity change
              }}
              className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

           <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Length Decay</label>
              <span className="text-emerald-600 font-mono text-xs">{params.lengthMultiplier}</span>
            </div>
            <input 
              type="range" min="0.4" max="0.8" step="0.01"
              value={params.lengthMultiplier} 
              onChange={(e) => setParams({...params, lengthMultiplier: Number(e.target.value)})}
              className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-50 rounded border border-slate-200 text-sm text-slate-600 font-mono">
            <p className="mb-2 flex justify-between">
                <span className="text-emerald-600 font-bold">Nodes:</span> 
                <span>{(Math.pow(params.branchCount === 2 ? 2 : 3, params.depth + 1)).toLocaleString()}</span>
            </p>
            <p className="mb-2 flex justify-between">
                <span className="text-emerald-600 font-bold">Algorithm:</span> 
                <span>Recursive Fractal</span>
            </p>
            <div className="w-full bg-slate-200 h-1 mt-4 rounded overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{width: `${growth * 100}%`}}></div>
            </div>
            <p className="text-[10px] text-right mt-1 text-slate-500">Simulation Progress</p>
        </div>
      </div>

       {/* Canvas View */}
       <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 relative shadow-inner overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full block" style={{width: '100%', height: '100%'}}></canvas>
          
          <div className="absolute top-6 right-6 flex flex-col items-end gap-1 pointer-events-none">
              <span className="px-2 py-1 bg-white/80 border border-slate-200 rounded text-[10px] text-emerald-700 font-mono uppercase tracking-widest backdrop-blur-sm shadow-sm">
                Procedural Generation
              </span>
          </div>
       </div>
    </div>
  );
};

export default AlgorithmicDesigner;