import React, { useState } from 'react';
import { DesignMode } from './types';
import ParametricDesigner from './components/ParametricDesigner';
import AlgorithmicDesigner from './components/AlgorithmicDesigner';
import AiDesigner from './components/AiDesigner';
import ImageEditor from './components/ImageEditor';
import { Sliders, GitBranch, Bot, Box, ArrowRight, Image as ImageIcon, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<DesignMode>(DesignMode.INTRO);

  const renderContent = () => {
    switch (mode) {
      case DesignMode.PARAMETRIC:
        return <ParametricDesigner />;
      case DesignMode.ALGORITHMIC:
        return <AlgorithmicDesigner />;
      case DesignMode.AI_GENERATIVE:
        return <AiDesigner />;
      case DesignMode.IMAGE_EDIT:
        return <ImageEditor />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 max-w-6xl mx-auto text-center space-y-12 animate-fade-in overflow-y-auto custom-scrollbar relative z-10">
            {/* Decorative Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60">
               <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl animate-pulse"></div>
               <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="space-y-6 mt-8 md:mt-0 z-10">
              <div className="inline-flex p-5 bg-white/80 rounded-3xl border border-slate-200 shadow-2xl mb-4 backdrop-blur-sm ring-1 ring-black/5">
                 <Box size={64} className="text-cyan-600" strokeWidth={1} />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600 tracking-tight">
                CompDesign Studio
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
                The interface for <span className="text-cyan-600 font-medium">computational logic</span> and <span className="text-purple-600 font-medium">generative AI</span>. 
                Design beyond manual limitations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full pb-12 z-10">
              <IntroCard 
                icon={<Sliders size={32} />}
                title="Parametric"
                desc="Mathematical relationships and variable constraints."
                color="text-cyan-600"
                borderColor="hover:border-cyan-200"
                bgHover="hover:bg-cyan-50"
                onClick={() => setMode(DesignMode.PARAMETRIC)}
              />
              <IntroCard 
                icon={<GitBranch size={32} />}
                title="Algorithmic"
                desc="Recursive rules and L-systems for organic growth."
                color="text-emerald-600"
                borderColor="hover:border-emerald-200"
                bgHover="hover:bg-emerald-50"
                onClick={() => setMode(DesignMode.ALGORITHMIC)}
              />
              <IntroCard 
                icon={<Bot size={32} />}
                title="GenAI Architect"
                desc="Text-to-Structure generation powered by Gemini."
                color="text-purple-600"
                borderColor="hover:border-purple-200"
                bgHover="hover:bg-purple-50"
                onClick={() => setMode(DesignMode.AI_GENERATIVE)}
              />
              <IntroCard 
                icon={<ImageIcon size={32} />}
                title="Nano Editor"
                desc="AI-powered image transformation and editing."
                color="text-amber-600"
                borderColor="hover:border-amber-200"
                bgHover="hover:bg-amber-50"
                onClick={() => setMode(DesignMode.IMAGE_EDIT)}
              />
            </div>
            
            <footer className="text-slate-400 text-sm font-mono pb-6">
               v2.5.0 • Powered by Gemini 2.5 Flash
            </footer>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-200">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-6 justify-between shrink-0 z-50 relative">
        <div 
          onClick={() => setMode(DesignMode.INTRO)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
             <Box size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800 group-hover:text-black transition-colors">CompDesign</span>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
           <NavButton active={mode === DesignMode.PARAMETRIC} onClick={() => setMode(DesignMode.PARAMETRIC)} icon={<Sliders size={14} />} label="Parametric" />
           <NavButton active={mode === DesignMode.ALGORITHMIC} onClick={() => setMode(DesignMode.ALGORITHMIC)} icon={<GitBranch size={14} />} label="Algorithmic" />
           <NavButton active={mode === DesignMode.AI_GENERATIVE} onClick={() => setMode(DesignMode.AI_GENERATIVE)} icon={<Bot size={14} />} label="GenAI" />
           <NavButton active={mode === DesignMode.IMAGE_EDIT} onClick={() => setMode(DesignMode.IMAGE_EDIT)} icon={<ImageIcon size={14} />} label="Editor" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100">
        {renderContent()}
      </main>
    </div>
  );
};

const IntroCard: React.FC<{icon: React.ReactNode, title: string, desc: string, color: string, borderColor: string, bgHover: string, onClick: () => void}> = ({icon, title, desc, color, borderColor, bgHover, onClick}) => (
  <button 
    onClick={onClick}
    className={`group relative overflow-hidden p-6 bg-white border border-slate-200 ${borderColor} rounded-2xl transition-all duration-300 ${bgHover} hover:shadow-xl hover:-translate-y-1 text-left h-64 flex flex-col backdrop-blur-sm shadow-sm`}
  >
    <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-500 ${color}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 100 })}
    </div>
    <div className={`${color} mb-4 p-3 bg-slate-50 rounded-xl w-fit border border-slate-200 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 flex-grow leading-relaxed opacity-90">{desc}</p>
    <div className={`mt-4 ${color} text-xs font-bold uppercase tracking-wider flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0`}>
      Launch Tool <ArrowRight size={14} />
    </div>
  </button>
);

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
      ${active ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}
    `}
  >
    {icon}
    {label}
  </button>
);

export default App;