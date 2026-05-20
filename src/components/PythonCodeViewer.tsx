import { useState } from 'react';
import { ParticleSystemConfig } from '../types';
import { getPygameCpuScript, getModernGlScript } from '../utils/pythonScripts';
import { Copy, Check, Terminal, Cpu, ShieldAlert, CpuIcon } from 'lucide-react';

interface PythonCodeViewerProps {
  config: ParticleSystemConfig;
}

export const PythonCodeViewer = ({ config }: PythonCodeViewerProps) => {
  const [activeTab, setActiveTab] = useState<'cpu' | 'gpu'>('cpu');
  const [copied, setCopied] = useState<boolean>(false);

  const activeCode = activeTab === 'cpu' 
    ? getPygameCpuScript(config) 
    : getModernGlScript(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themeAccents = {
    fire: 'text-[#ff4e00] border-[#ff4e00]/30 selection:bg-[#ff4e00]/20',
    electric: 'text-[#00d2ff] border-[#00d2ff]/30 selection:bg-[#00d2ff]/20',
    acid: 'text-[#4ade80] border-[#4ade80]/30 selection:bg-[#4ade80]/20',
    frozen: 'text-[#00f2fe] border-[#00f2fe]/30 selection:bg-[#00f2fe]/20',
    cosmic: 'text-[#ec4899] border-[#ec4899]/30 selection:bg-[#ec4899]/20'
  };

  const activeAccent = themeAccents[config.colorTheme] || themeAccents.fire;

  return (
    <div className="flex flex-col gap-4 h-full bg-[#0d0d0d] p-5 rounded-xl border border-white/10">
      
      {/* Header with Title and Copy Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[#ff4e00]" />
            PRO SYSTEM OUTPUT (DYNAMIC SCRIPT EXPORTER)
          </h2>
          <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-sans">
            Python equations are updated instantly as you calibrate the physics properties panel.
          </p>
        </div>

        {/* Action Button */}
        <button
          id="btn-copy-python-code"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 py-1.5 px-4 rounded border text-[10px] tracking-wider uppercase font-mono font-medium cursor-pointer transition-all ${
            copied
              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30'
              : 'bg-[#151515] border-white/15 hover:border-white/20 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied Successfully</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 animate-pulse text-[#ff4e00]" />
              <span>Copy Script Code</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-white/10 pb-2">
        <button
          id="tab-select-pygame-cpu"
          onClick={() => setActiveTab('cpu')}
          className={`cursor-pointer px-4 py-1.5 rounded text-[10px] uppercase font-mono tracking-widest transition-all ${
            activeTab === 'cpu'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          Pygame 3D CPU (Recommended)
        </button>
        <button
          id="tab-select-moderngl-gpu"
          onClick={() => setActiveTab('gpu')}
          className={`cursor-pointer px-4 py-1.5 rounded text-[10px] uppercase font-mono tracking-widest transition-all ${
            activeTab === 'gpu'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          ModernGL Shader GPU (VFX Grade)
        </button>
      </div>

      {/* Script details */}
      <div className="text-[11px] font-mono leading-relaxed text-zinc-400 select-none">
        {activeTab === 'cpu' ? (
          <div className="flex items-start gap-2 bg-[#08080a] p-3 rounded border border-white/5">
            <Cpu className="h-4 w-4 text-[#ff4e00] mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-zinc-300">Pygame 3D CPU Engine:</span> Perspective matrix algorithms projection mapped to 2D draw paths. Instant setup, zero legacy graphics driver dependency. Highly fluid up to 4,000 entities.
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 bg-[#08080a] p-3 rounded border border-white/5">
            <CpuIcon className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-zinc-300">ModernGL 3D GPU Engine:</span> Accelerates cinematic calculations on host graphics hardware with vertex GLSL shaders. Expands capacity up to 30,000+ particles with custom spark and glow trails.
            </div>
          </div>
        )}
      </div>

      {/* Run Guide Section */}
      <div className="flex flex-col gap-2 font-mono">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Procedural Command Line Driver</span>
        <div className="bg-[#050505] text-[#ff4e00]/90 p-3 rounded text-[10px] border border-white/5 font-mono overflow-x-auto whitespace-pre">
          {activeTab === 'cpu' ? (
            <code>pip install pygame<br />python3 explosion_3d.py</code>
          ) : (
            <code>pip install pygame moderngl numpy<br />python3 explosion_3d.py</code>
          )}
        </div>
      </div>

      {/* Scrollable code block */}
      <div className="flex-1 min-h-[220px] md:min-h-[280px] overflow-hidden rounded border border-white/10 relative">
        <div className="absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest font-mono bg-black text-zinc-500 rounded border border-white/5">
          python / python3
        </div>

        <textarea
          readOnly
          value={activeCode}
          className={`w-full h-full bg-[#050505] text-zinc-300 p-4 font-mono text-[10px] leading-relaxed resize-none border-0 focus:ring-0 focus:outline-none overflow-y-auto ${activeAccent} select-text`}
        />
      </div>

      {/* Proactive caution safety banner */}
      <div className="flex items-start gap-2 text-[9.5px] font-sans text-zinc-500 mt-1 select-none leading-normal">
        <ShieldAlert className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
        <span>Hardware Window Listener: Ensure the active Python window remains focused during launch to listen to user inputs ([SPACE] pauses slow-mo frames, mouse dragging rotates camera orbit coordinates).</span>
      </div>

    </div>
  );
};
