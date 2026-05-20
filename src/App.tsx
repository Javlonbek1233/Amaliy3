import { useState, useRef } from 'react';
import { ParticleCanvas, ParticleCanvasRef } from './components/ParticleCanvas';
import { ControlPanel } from './components/ControlPanel';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { ParticleSystemConfig } from './types';
import { Flame, Film, Tv, Cpu, Award } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<ParticleCanvasRef>(null);

  // Core physical/visual simulator configurations
  const [config, setConfig] = useState<ParticleSystemConfig>({
    particleCount: 2200,
    explosionForce: 4.5,
    gravity: 2.5,
    drag: 0.95,
    slowMo: 0.30,
    turbulence: 3.5,
    sparkDensity: 15,
    smokeDensity: 55,
    glowSize: 1.8,
    motionBlur: 1.5,
    colorTheme: 'fire',
    groundCollision: true,
    groundBounciness: 0.3,
    cameraOrbitSpeed: 1.0,
    dynamicLighting: true,
    cinematicVignette: true,
  });

  const [activeCount, setActiveCount] = useState<number>(0);

  // Trigger click to initiate trigger explosion from parents
  const handleTriggerExplosion = () => {
    if (canvasRef.current) {
      canvasRef.current.triggerExplosion();
    }
  };

  // Dynamic color theme style accents based on selection
  const themeAccents = {
    fire: {
      text: 'text-[#ff4e00]',
      border: 'border-[#ff4e00]/40',
      tag: 'bg-[#ff4e00]/10 text-[#ff4e00] border-[#ff4e00]/20',
      btn: 'hover:bg-[#ff4e00] hover:text-black border-[#ff4e00]/40 text-[#ff4e00]',
      primaryBtn: 'from-[#ff8c00] to-[#ff4e00] text-black shadow-[0_0_15px_rgba(255,78,0,0.3)]'
    },
    electric: {
      text: 'text-[#00d2ff]',
      border: 'border-[#00d2ff]/40',
      tag: 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/20',
      btn: 'hover:bg-[#00d2ff] hover:text-black border-[#00d2ff]/40 text-[#00d2ff]',
      primaryBtn: 'from-[#00f2fe] to-[#4facfe] text-black shadow-[0_0_15px_rgba(0,210,255,0.3)]'
    },
    acid: {
      text: 'text-[#4ade80]',
      border: 'border-[#4ade80]/40',
      tag: 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20',
      btn: 'hover:bg-[#4ade80] hover:text-black border-[#4ade80]/40 text-[#4ade80]',
      primaryBtn: 'from-[#a8ff78] to-[#78ffd6] text-black shadow-[0_0_15px_rgba(74,222,128,0.3)]'
    },
    frozen: {
      text: 'text-[#00f2fe]',
      border: 'border-[#00f2fe]/40',
      tag: 'bg-[#00f2fe]/10 text-[#00f2fe] border-[#00f2fe]/20',
      btn: 'hover:bg-[#00f2fe] hover:text-black border-[#00f2fe]/40 text-[#00f2fe]',
      primaryBtn: 'from-[#abdcff] to-[#0396ff] text-black shadow-[0_0_15px_rgba(0,242,254,0.3)]'
    },
    cosmic: {
      text: 'text-[#ec4899]',
      border: 'border-[#ec4899]/40',
      tag: 'bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/20',
      btn: 'hover:bg-[#ec4899] hover:text-black border-[#ec4899]/40 text-[#ec4899]',
      primaryBtn: 'from-[#f857a6] to-[#ec4899] text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
    }
  };

  const activeAccent = themeAccents[config.colorTheme] || themeAccents.fire;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans flex flex-col selection:bg-[#ff4e00]/20 antialiased overflow-x-hidden">
      
      {/* Upper Ribbon Navigation Panel aligned with Design HTML */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0d0d0d] shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-[#ff4e00] rounded flex items-center justify-center animate-pulse">
            <div className="w-3 h-3 bg-black rounded-full shadow-[0_0_8px_#ff4e00]"></div>
          </div>
          <h1 id="app-main-title" className="text-xs md:text-sm font-bold tracking-widest uppercase text-white">
            VFX PARTICLE STUDIO <span className={`text-[10px] opacity-70 ml-2 transition-all font-mono ${activeAccent.text}`}>{config.colorTheme.toUpperCase()} ENGINE</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] text-white/40 uppercase tracking-tighter">Render Quality Pipeline</span>
            <span className={`text-[10px] font-mono tracking-wider ${activeAccent.text}`}>16X CINEMATIC SHADER</span>
          </div>
          <div className="hidden sm:block h-6 w-[1px] bg-white/10"></div>
          <button 
            id="btn-trigger-top-detonation"
            onClick={handleTriggerExplosion}
            className={`px-4 py-1.5 border ${activeAccent.btn} text-[10px] uppercase tracking-widest transition-all font-mono font-medium`}
          >
            Trigger Detonation
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-[1500px] w-full mx-auto px-4 py-6 md:px-6 lg:px-8 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: 3D Stage + Exporter Tab */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Visual Viewport Wrapper */}
            <div className="relative h-[480px] md:h-[550px] w-full shrink-0">
              <ParticleCanvas
                ref={canvasRef}
                config={config}
                onExplosionTriggered={handleTriggerExplosion}
                particleActiveCount={activeCount}
                setParticleActiveCount={setActiveCount}
              />
            </div>

            {/* Script Exporter Block */}
            <div className="min-h-[350px]">
              <PythonCodeViewer config={config} />
            </div>

          </div>

          {/* Right Panel: Side Controls and Environmental System Parameters */}
          <div className="lg:col-span-4 bg-[#0d0d0d] border border-white/10 rounded-xl p-5 lg:p-6 flex flex-col gap-5 lg:sticky lg:top-20 max-h-none lg:max-h-[calc(100vh-100px)] overflow-y-auto">
            
            {/* Direct detonation core driver */}
            <button
              id="btn-detonate-blast-big"
              onClick={handleTriggerExplosion}
              className={`w-full cursor-pointer py-3.5 px-4 rounded-lg font-bold text-xs bg-gradient-to-r ${activeAccent.primaryBtn} transition-all active:scale-[0.98] border border-transparent uppercase tracking-wider flex items-center justify-center gap-2 group font-mono`}
            >
              <Flame className="h-4.5 w-4.5 group-hover:animate-bounce" />
              DETONATE VFX EXPLOSION
            </button>

            <div className="h-[1px] bg-white/10"></div>

            {/* UI Parameters slider controller container */}
            <ControlPanel
              config={config}
              onChange={setConfig}
              onTriggerExplosion={handleTriggerExplosion}
              activeCount={activeCount}
            />

            <div className="mt-auto border-t border-white/10 pt-4 flex items-center gap-2.5 text-[10px] text-zinc-500 font-sans leading-relaxed">
              <Award className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>Hollywood VFX Studio: Calibrate physics vectors, adjust time constraints, and copy procedural executable Python files instantly.</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
