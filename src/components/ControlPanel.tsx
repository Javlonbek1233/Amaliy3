import { ColorThemeId, ParticleSystemConfig, Preset } from '../types';
import { 
  Sliders, 
  Flame, 
  Wind, 
  Sparkles, 
  Layers, 
  Compass, 
  Zap, 
  VolumeX, 
  Tv, 
  BaggageClaim, 
  Info,
  CircleDot
} from 'lucide-react';

interface ControlPanelProps {
  config: ParticleSystemConfig;
  onChange: (updatedConfig: ParticleSystemConfig) => void;
  onTriggerExplosion: () => void;
  activeCount: number;
}

export const PRESETS: Preset[] = [
  {
    id: 'fireball',
    name: 'Hollywood Fireball',
    description: 'Aggressive combustible core blast with thick billowing dark combustion fuel smoke and glowing soot.',
    config: {
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
    }
  },
  {
    id: 'supernova',
    name: 'Plasma Supernova',
    description: 'Thermonuclear glowing cosmic flash that expands spherically in zero-gravity with minimal air drag degradation.',
    config: {
      particleCount: 3000,
      explosionForce: 6.8,
      gravity: 0.0,
      drag: 0.98,
      slowMo: 0.15,
      turbulence: 1.0,
      sparkDensity: 40,
      smokeDensity: 5,
      glowSize: 2.2,
      motionBlur: 2.5,
      colorTheme: 'cosmic',
      groundCollision: false,
    }
  },
  {
    id: 'shrapnel',
    name: 'Electric Shrapnel',
    description: 'High-voltage electric discharge popping instant fast-fading metallic shards with strong velocity stretching.',
    config: {
      particleCount: 1500,
      explosionForce: 9.5,
      gravity: 5.5,
      drag: 0.93,
      slowMo: 0.25,
      turbulence: 4.0,
      sparkDensity: 80,
      smokeDensity: 0,
      glowSize: 1.2,
      motionBlur: 4.5,
      colorTheme: 'electric',
      groundCollision: true,
      groundBounciness: 0.7,
    }
  },
  {
    id: 'acid',
    name: 'Corrosive Eruption',
    description: 'Chemical radioactive waste explosion expelling dense green hazardous fumes and floating glowing acid spores.',
    config: {
      particleCount: 1800,
      explosionForce: 3.2,
      gravity: 1.2,
      drag: 0.96,
      slowMo: 0.40,
      turbulence: 6.0,
      sparkDensity: 10,
      smokeDensity: 65,
      glowSize: 1.5,
      motionBlur: 1.0,
      colorTheme: 'acid',
      groundCollision: true,
      groundBounciness: 0.2,
    }
  },
  {
    id: 'frozen',
    name: 'Subzero Shockwave',
    description: 'Frost grenade detonation releasing ice fragments that bounce wildly off the frost ground floor.',
    config: {
      particleCount: 2400,
      explosionForce: 5.5,
      gravity: 3.0,
      drag: 0.96,
      slowMo: 0.20,
      turbulence: 2.0,
      sparkDensity: 50,
      smokeDensity: 15,
      glowSize: 1.6,
      motionBlur: 3.0,
      colorTheme: 'frozen',
      groundCollision: true,
      groundBounciness: 0.85,
    }
  }
];

const THEMES: { id: ColorThemeId; name: string; color: string; bg: string }[] = [
  { id: 'fire', name: 'Classic Fire', color: 'bg-gradient-to-r from-yellow-400 to-red-600', bg: 'border-amber-500/30' },
  { id: 'electric', name: 'Hi-Volt Cyan', color: 'bg-gradient-to-r from-cyan-400 to-indigo-600', bg: 'border-blue-500/30' },
  { id: 'acid', name: 'Acid Green', color: 'bg-gradient-to-r from-lime-300 to-emerald-600', bg: 'border-emerald-500/30' },
  { id: 'frozen', name: 'Ice Crystal', color: 'bg-gradient-to-r from-cyan-200 to-cyan-600', bg: 'border-cyan-500/30' },
  { id: 'cosmic', name: 'Celestial Void', color: 'bg-gradient-to-r from-fuchsia-400 to-purple-800', bg: 'border-purple-500/30' },
];

export const ControlPanel = ({ config, onChange, onTriggerExplosion, activeCount }: ControlPanelProps) => {

  const updateField = <K extends keyof ParticleSystemConfig>(field: K, value: ParticleSystemConfig[K]) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  const currentPresetId = PRESETS.find(p => {
    return p.config.colorTheme === config.colorTheme && p.config.particleCount === config.particleCount;
  })?.id || 'custom';

  const applyPreset = (preset: Preset) => {
    onChange({
      ...config,
      ...preset.config
    });
  };

  // Dynamically mapped color themes to match selected theme vibe with custom color accent tags and indicators
  const themeAccents = {
    fire: {
      text: 'text-[#ff4e00]',
      border: 'border-[#ff4e00]/40',
      activeBorder: 'border-[#ff4e00]/50 dark:border-[#ff4e00]/40',
      bgGlow: 'shadow-[0_0_10px_rgba(255,78,0,0.15)]',
      accent: 'accent-[#ff4e00]',
      peerCheckedBg: 'peer-checked:bg-[#ff4e00]',
      dot: 'bg-[#ff4e00]'
    },
    electric: {
      text: 'text-[#00d2ff]',
      border: 'border-[#00d2ff]/40',
      activeBorder: 'border-[#00d2ff]/50 dark:border-[#00d2ff]/40',
      bgGlow: 'shadow-[0_0_10px_rgba(0,210,255,0.15)]',
      accent: 'accent-[#00d2ff]',
      peerCheckedBg: 'peer-checked:bg-[#00d2ff]',
      dot: 'bg-[#00d2ff]'
    },
    acid: {
      text: 'text-[#4ade80]',
      border: 'border-[#4ade80]/40',
      activeBorder: 'border-[#4ade80]/50 dark:border-[#4ade80]/40',
      bgGlow: 'shadow-[0_0_10px_rgba(74,222,128,0.15)]',
      accent: 'accent-[#4ade80]',
      peerCheckedBg: 'peer-checked:bg-[#4ade80]',
      dot: 'bg-[#4ade80]'
    },
    frozen: {
      text: 'text-[#00f2fe]',
      border: 'border-[#00f2fe]/40',
      activeBorder: 'border-[#00f2fe]/50 dark:border-[#00f2fe]/40',
      bgGlow: 'shadow-[0_0_10px_rgba(0,242,254,0.15)]',
      accent: 'accent-[#00f2fe]',
      peerCheckedBg: 'peer-checked:bg-[#00f2fe]',
      dot: 'bg-[#00f2fe]'
    },
    cosmic: {
      text: 'text-[#ec4899]',
      border: 'border-[#ec4899]/40',
      activeBorder: 'border-[#ec4899]/50 dark:border-[#ec4899]/40',
      bgGlow: 'shadow-[0_0_10px_rgba(236,72,153,0.15)]',
      accent: 'accent-[#ec4899]',
      peerCheckedBg: 'peer-checked:bg-[#ec4899]',
      dot: 'bg-[#ec4899]'
    }
  };

  const activeAccent = themeAccents[config.colorTheme] || themeAccents.fire;

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      
      {/* Dynamic VFX presets */}
      <div>
        <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-2.5 flex items-center gap-2 select-none">
          <Tv className="h-3.5 w-3.5 text-zinc-400" />
          Cinematic VFX Presets
        </h3>
        
        <div className="flex flex-col gap-2">
          {PRESETS.map((preset) => {
            const isActive = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                id={`preset-card-${preset.id}`}
                onClick={() => applyPreset(preset)}
                className={`w-full text-left p-3 rounded-lg cursor-pointer border transition-all text-xs flex flex-col gap-1 ${
                  isActive
                    ? `bg-[#151515] border-white/20 shadow-md ${activeAccent.bgGlow}`
                    : 'bg-[#090909]/40 hover:bg-[#121212]/60 border-white/5 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`font-semibold tracking-wide ${isActive ? 'text-white font-mono' : 'text-zinc-300 font-sans'}`}>
                    {preset.name}
                  </span>
                  {isActive && (
                    <span className={`h-2 w-2 rounded-full ${activeAccent.dot} animate-pulse`}></span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[1px] bg-white/10"></div>

      {/* VFX Color theme selection */}
      <div>
        <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-2.5 flex items-center gap-2 select-none">
          <Flame className="h-3.5 w-3.5" />
          Color Shader Theme
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-1.5">
          {THEMES.map((theme) => {
            const isSelected = config.colorTheme === theme.id;
            return (
              <button
                key={theme.id}
                id={`btn-theme-${theme.id}`}
                onClick={() => updateField('colorTheme', theme.id)}
                className={`relative py-2.5 px-1.5 rounded border cursor-pointer text-[10px] text-center font-mono uppercase tracking-wider transition-all overflow-hidden ${
                  isSelected
                    ? 'bg-[#121212] border-white/20 text-white font-bold'
                    : 'bg-[#090909]/40 hover:bg-[#121212]/30 border-white/5 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {/* Small indicator bar colored as theme gradient */}
                <div className={`h-1 w-full ${theme.color} absolute top-0 left-0`} />
                <span className="relative z-10">{theme.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[1px] bg-white/10"></div>

      {/* Physics sliders */}
      <div>
        <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-3.5 flex items-center gap-2 select-none">
          <Sliders className="h-3.5 w-3.5" />
          Physical Properties Designer
        </h3>

        <div className="flex flex-col gap-4">
          
          {/* Slider: particleCount */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-zinc-400">PARTICLE COUNT</span>
              <span className={`font-mono font-medium ${activeAccent.text}`}>{config.particleCount}</span>
            </div>
            <input
              id="slider-particle-count"
              type="range"
              min="500"
              max="4000"
              step="100"
              value={config.particleCount}
              onChange={(e) => updateField('particleCount', parseInt(e.target.value))}
              className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
            />
            <span className="text-[9px] text-zinc-500 leading-normal">Determines particle density. High counts are beautiful but require more processing.</span>
          </div>

          {/* Slider: explosionForce */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-zinc-400">EXPLOSION SPEED (FORCE)</span>
              <span className={`font-mono font-medium ${activeAccent.text}`}>{config.explosionForce}x</span>
            </div>
            <input
              id="slider-explosion-force"
              type="range"
              min="1.0"
              max="12.0"
              step="0.5"
              value={config.explosionForce}
              onChange={(e) => updateField('explosionForce', parseFloat(e.target.value))}
              className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
            />
            <span className="text-[9px] text-zinc-500 leading-normal">Initial kinetic speed of particles propagating outward from the explosion focal point.</span>
          </div>

          {/* Slider: slowMo */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-zinc-400">TIME SCALE (SLOW MOTION)</span>
              <span className={`font-mono font-medium ${activeAccent.text}`}>{Math.round(100 / config.slowMo)}% Slowed</span>
            </div>
            <input
              id="slider-slowmo"
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={config.slowMo}
              onChange={(e) => updateField('slowMo', parseFloat(e.target.value))}
              className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
            />
            <span className="text-[9px] text-zinc-500 leading-normal">Simulates cinematic high-speed cameras. 0.1 represents 10x slower than normal speed.</span>
          </div>

          {/* Slider: gravity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-zinc-400">GRAVITATIONAL PULL</span>
              <span className={`font-mono font-medium ${activeAccent.text}`}>{config.gravity} m/s²</span>
            </div>
            <input
              id="slider-gravity"
              type="range"
              min="0.0"
              max="10.0"
              step="0.5"
              value={config.gravity}
              onChange={(e) => updateField('gravity', parseFloat(e.target.value))}
              className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
            />
            <span className="text-[9px] text-zinc-500 leading-normal">Vertical acceleration pulling particles downward. Set to 0 for zero-gravity void fields.</span>
          </div>

          {/* Slider: drag */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-zinc-400">AIR DRAG (FRICT)</span>
              <span className={`font-mono font-medium ${activeAccent.text}`}>{config.drag}</span>
            </div>
            <input
              id="slider-drag"
              type="range"
              min="0.900"
              max="0.995"
              step="0.005"
              value={config.drag}
              onChange={(e) => updateField('drag', parseFloat(e.target.value))}
              className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
            />
            <span className="text-[9px] text-zinc-500 leading-normal">Deceleration scalar representing air resistance. Lower values slow particles down quickly.</span>
          </div>

          {/* Slider: wind/turbulence */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-zinc-400">WIND DRIFT (TURBULENCE)</span>
              <span className={`font-mono font-medium ${activeAccent.text}`}>{config.turbulence}</span>
            </div>
            <input
              id="slider-turbulence"
              type="range"
              min="0.0"
              max="10.0"
              step="0.5"
              value={config.turbulence}
              onChange={(e) => updateField('turbulence', parseFloat(e.target.value))}
              className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
            />
            <span className="text-[9px] text-zinc-500 leading-normal">Adds micro-oscillations to represent heat waves, rising thermal winds, and outdoor drafts.</span>
          </div>

          {/* Slider: motionBlur */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-zinc-400">MOTION BLUR LENGTH</span>
              <span className={`font-mono font-medium ${activeAccent.text}`}>{config.motionBlur}x</span>
            </div>
            <input
              id="slider-motion-blur"
              type="range"
              min="0.0"
              max="5.0"
              step="0.5"
              value={config.motionBlur}
              onChange={(e) => updateField('motionBlur', parseFloat(e.target.value))}
              className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
            />
            <span className="text-[9px] text-zinc-500 leading-normal">Draws trailing links on sparks based on high speeds, mirroring high-exposure shutter speeds.</span>
          </div>

          {/* Slider: sparkDensity */}
          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-1.5 items-start w-1/2">
              <div className="flex justify-between items-center text-[10px] font-mono w-full">
                <span className="text-zinc-400">SPARK %</span>
                <span className={`font-mono ${activeAccent.text}`}>{config.sparkDensity}%</span>
              </div>
              <input
                id="slider-spark-density"
                type="range"
                min="0"
                max="100"
                step="5"
                value={config.sparkDensity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const currentSmoke = config.smokeDensity;
                  const targetSmoke = Math.min(currentSmoke, 100 - val);
                  onChange({
                    ...config,
                    sparkDensity: val,
                    smokeDensity: targetSmoke
                  });
                }}
                className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
              />
            </div>

            <div className="flex flex-col gap-1.5 items-start w-1/2">
              <div className="flex justify-between items-center text-[10px] font-mono w-full">
                <span className="text-zinc-400">SMOKE %</span>
                <span className={`font-mono ${activeAccent.text}`}>{config.smokeDensity}%</span>
              </div>
              <input
                id="slider-smoke-density"
                type="range"
                min="0"
                max="100"
                step="5"
                value={config.smokeDensity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const currentSpark = config.sparkDensity;
                  const targetSpark = Math.min(currentSpark, 100 - val);
                  onChange({
                    ...config,
                    smokeDensity: val,
                    sparkDensity: targetSpark
                  });
                }}
                className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
              />
            </div>
          </div>
          <span className="text-[9px] text-zinc-500 -mt-2.5 leading-normal">Core blast is converted to sparks (quick hot lines) and smoke (slow expanding dark soot). Rest is Core flame.</span>

          {/* Slider: glowSize */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-zinc-400">FIRE BLOOM (GLOW SIZE)</span>
              <span className={`font-mono font-medium ${activeAccent.text}`}>{config.glowSize}x</span>
            </div>
            <input
              id="slider-glow-size"
              type="range"
              min="0.0"
              max="3.0"
              step="0.1"
              value={config.glowSize}
              onChange={(e) => updateField('glowSize', parseFloat(e.target.value))}
              className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
            />
          </div>

        </div>
      </div>

      <div className="h-[1px] bg-white/10"></div>

      {/* Ground settings */}
      <div>
        <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-2.5 flex items-center gap-2 select-none">
          <Compass className="h-3.5 w-3.5 text-zinc-400" />
          Environment Colliders
        </h3>

        <div className="bg-[#090909]/60 border border-white/5 p-3.5 rounded-lg flex flex-col gap-3">
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-zinc-300">GROUND SURFACE PLANE</span>
              <span className="text-[9px] text-zinc-500 leading-normal">Enable particles bounding off ground grid floor</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                id="checkbox-ground-collision"
                type="checkbox"
                checked={config.groundCollision}
                onChange={(e) => updateField('groundCollision', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-8 h-4 bg-white/15 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${activeAccent.peerCheckedBg} peer-checked:after:bg-white`}></div>
            </label>
          </div>

          {config.groundCollision && (
            <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-400">BOUNCINESS (COR COEFFICIENT)</span>
                <span className={`font-mono ${activeAccent.text}`}>{Math.round(config.groundBounciness * 100)}%</span>
              </div>
              <input
                id="slider-ground-bounciness"
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={config.groundBounciness}
                onChange={(e) => updateField('groundBounciness', parseFloat(e.target.value))}
                className={`w-full h-1 bg-white/10 ${activeAccent.accent} cursor-pointer rounded-lg`}
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-zinc-300">ORBIT AUTO-CAMERA (60s)</span>
              <span className="text-[9px] text-zinc-500 leading-normal">Gradually rotates view target during inactive frame</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                id="checkbox-camera-orbit"
                type="checkbox"
                checked={config.cameraOrbitSpeed > 0}
                onChange={(e) => updateField('cameraOrbitSpeed', e.target.checked ? 1.0 : 0.0)}
                className="sr-only peer"
              />
              <div className={`w-8 h-4 bg-white/15 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${activeAccent.peerCheckedBg} peer-checked:after:bg-white`}></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-zinc-300">DYNAMIC GROUND LIGHTING</span>
              <span className="text-[9px] text-zinc-500 leading-normal">Injects custom backdrop flash reflection on trigger</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                id="checkbox-dynamic-lighting"
                type="checkbox"
                checked={config.dynamicLighting}
                onChange={(e) => updateField('dynamicLighting', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-8 h-4 bg-white/15 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${activeAccent.peerCheckedBg} peer-checked:after:bg-white`}></div>
            </label>
          </div>

        </div>
      </div>

      <div className="h-[1px] bg-white/10"></div>

      {/* VFX sandbox stats node */}
      <div className="bg-[#090909]/60 border border-white/5 p-3.5 rounded-lg flex items-center justify-between font-mono text-[10px] select-none text-zinc-400">
        <div className="flex flex-col gap-1">
          <span>ACTIVE ENTITIES:</span>
          <span className={`text-xs font-semibold font-mono ${activeAccent.text}`}>{activeCount} particles</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span>COMPLEXITY INDEX:</span>
          <span className={`text-xs font-semibold font-mono ${activeAccent.text}`}>
            {activeCount > 3000 ? 'HEAVY' : activeCount > 1500 ? 'CINEMATIC' : 'LIGHT'}
          </span>
        </div>
      </div>

    </div>
  );
};
