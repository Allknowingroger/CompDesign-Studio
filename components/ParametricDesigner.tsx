import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SuperformulaParams } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, Download, Shuffle, LayoutTemplate } from 'lucide-react';

const PRESETS = [
  { name: 'Starfish', params: { m: 5, n1: 0.5, n2: 1.7, n3: 1.7, a: 1, b: 1, resolution: 360 } },
  { name: 'Shield', params: { m: 4, n1: 10, n2: 10, n3: 10, a: 1, b: 1, resolution: 360 } },
  { name: 'Atomic', params: { m: 6, n1: 0.3, n2: 0.3, n3: 0.3, a: 1, b: 1, resolution: 720 } },
  { name: 'Flower', params: { m: 8, n1: 5, n2: 2, n3: 7, a: 1, b: 1, resolution: 360 } },
];

const ParametricDesigner: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [params, setParams] = useState<SuperformulaParams>(PRESETS[0].params);

  // Superformula function
  const calculatePoints = (p: SuperformulaParams) => {
    const points: { x: number; y: number }[] = [];
    const scale = 150;
    
    for (let i = 0; i <= p.resolution; i++) {
      const phi = (i * 2 * Math.PI) / p.resolution;
      
      let r = 0;
      const t1 = Math.pow(Math.abs(Math.cos((p.m * phi) / 4) / p.a), p.n2);
      const t2 = Math.pow(Math.abs(Math.sin((p.m * phi) / 4) / p.b), p.n3);
      
      if (Math.abs(t1 + t2) > 0) {
        r = Math.pow(t1 + t2, -1 / p.n1);
      }

      // Clamp infinity
      if (r > 20) r = 20;

      points.push({
        x: 250 + r * Math.cos(phi) * scale,
        y: 250 + r * Math.sin(phi) * scale
      });
    }
    return points;
  };

  const points = useMemo(() => calculatePoints(params), [params]);
  
  const pointsString = useMemo(() => {
    return points.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  }, [points]);

  const handleRandomize = () => {
    setParams({
      m: Math.floor(Math.random() * 16) + 2,
      n1: parseFloat((Math.random() * 10 + 0.1).toFixed(1)),
      n2: parseFloat((Math.random() * 5 + 0.1).toFixed(1)),
      n3: parseFloat((Math.random() * 5 + 0.1).toFixed(1)),
      a: 1,
      b: 1,
      resolution: 360
    });
  };

  const handleDownload = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parametric-shape-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // "Performance Data" logic
  const performanceData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      step: i,
      stress: Math.abs(Math.sin(i * 0.5 + params.m) * 80) + 20,
      material: Math.abs(Math.cos(i * 0.5) * params.n1 * 10) + 40
    }));
  }, [params]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden p-4 lg:p-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg flex flex-col h-fit max-h-full overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="text-cyan-600" size={20} />
            <h2 className="text-xl font-semibold text-slate-800">Parameters</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRandomize} className="p-2 hover:bg-slate-100 rounded-full text-cyan-600 transition-colors" title="Randomize">
              <Shuffle size={18} />
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => setParams(preset.params)}
              className="px-2 py-1 text-xs rounded bg-slate-100 border border-slate-200 text-slate-600 hover:border-cyan-500 hover:text-cyan-600 transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
        
        <div className="space-y-6">
          <ControlRow label="Symmetry (m)" value={params.m} min={0} max={20} step={1} onChange={v => setParams(p => ({...p, m: v}))} />
          <ControlRow label="Tension (n1)" value={params.n1} min={0.1} max={20} step={0.1} onChange={v => setParams(p => ({...p, n1: v}))} />
          <ControlRow label="Shape X (n2)" value={params.n2} min={0.1} max={20} step={0.1} onChange={v => setParams(p => ({...p, n2: v}))} />
          <ControlRow label="Shape Y (n3)" value={params.n3} min={0.1} max={20} step={0.1} onChange={v => setParams(p => ({...p, n3: v}))} />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
             <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
               <Info size={14} /> Real-time Analysis
             </h3>
             <div className="h-32 w-full bg-slate-50 rounded-lg p-2 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                      itemStyle={{ padding: 0 }}
                    />
                    <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="material" stroke="#0891b2" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">
                <span className="text-red-500">● Structural Stress</span>
                <span className="text-cyan-600">● Material Volume</span>
             </div>
        </div>
      </div>

      {/* Viewport */}
      <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 relative flex items-center justify-center overflow-hidden shadow-inner bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-slate-100">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        <svg ref={svgRef} viewBox="0 0 500 500" className="w-full h-full max-h-[80vh] drop-shadow-xl">
            <defs>
              <linearGradient id="paramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <polygon 
                points={pointsString} 
                fill="url(#paramGradient)"
                stroke="#0891b2" 
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            {/* Decorative Vertices */}
            {points.filter((_, i) => i % Math.max(1, Math.floor(params.resolution/40)) === 0).map((p, i) => (
                 <circle key={i} cx={p.x} cy={p.y} r="2" fill="#0e7490" />
            ))}
        </svg>

        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
           <div className="text-xs font-mono text-slate-500 text-right bg-white/80 p-2 rounded border border-slate-200 backdrop-blur-sm shadow-sm">
             Vertices: {points.length} <br/>
             Complexity: {(params.m * params.n1).toFixed(2)}
           </div>
           <button 
             onClick={handleDownload}
             className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-500/60 text-cyan-700 text-xs font-bold rounded-full transition-all shadow-sm"
           >
              <Download size={14} /> SVG
           </button>
        </div>
      </div>
    </div>
  );
};

const ControlRow: React.FC<{label: string, value: number, min: number, max: number, step: number, onChange: (val: number) => void}> = ({label, value, min, max, step, onChange}) => (
  <div>
    <div className="flex justify-between mb-1">
      <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">{label}</label>
      <span className="text-cyan-600 font-mono text-xs">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-cyan-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer hover:bg-slate-300 transition-colors"
    />
  </div>
);

export default ParametricDesigner;