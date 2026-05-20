import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Particle, ParticleSystemConfig, ColorThemeId } from '../types';
import { Flame, Play, Pause, RefreshCw, Zap } from 'lucide-react';

interface ParticleCanvasProps {
  config: ParticleSystemConfig;
  onExplosionTriggered: () => void;
  particleActiveCount: number;
  setParticleActiveCount: (count: number) => void;
}

export interface ParticleCanvasRef {
  triggerExplosion: () => void;
}

// Custom theme color generators
const getThemeColors = (theme: ColorThemeId, life: number) => {
  // Returns [color, glowColor] based on life stage
  switch (theme) {
    case 'electric':
      if (life > 0.8) return ['#ffffff', 'rgba(120, 230, 255, 0.9)'];
      if (life > 0.4) return ['#3b82f6', 'rgba(59, 130, 246, 0.6)'];
      if (life > 0.15) return ['#8b5cf6', 'rgba(139, 92, 246, 0.4)'];
      return ['#1e1b4b', 'rgba(30, 27, 75, 0.2)'];

    case 'acid':
      if (life > 0.85) return ['#ffffff', 'rgba(217, 249, 157, 0.9)'];
      if (life > 0.45) return ['#4ade80', 'rgba(74, 222, 128, 0.6)'];
      if (life > 0.15) return ['#15803d', 'rgba(21, 128, 61, 0.4)'];
      return ['#14532d', 'rgba(20, 83, 45, 0.2)'];

    case 'frozen':
      if (life > 0.8) return ['#ffffff', 'rgba(207, 250, 254, 0.9)'];
      if (life > 0.4) return ['#06b6d4', 'rgba(6, 182, 212, 0.6)'];
      if (life > 0.15) return ['#2563eb', 'rgba(37, 99, 235, 0.4)'];
      return ['#172554', 'rgba(23, 37, 84, 0.2)'];

    case 'cosmic':
      if (life > 0.8) return ['#ffffff', 'rgba(255, 212, 255, 0.9)'];
      if (life > 0.4) return ['#ec4899', 'rgba(236, 72, 153, 0.6)'];
      if (life > 0.15) return ['#a21caf', 'rgba(162, 28, 175, 0.4)'];
      return ['#1e1b4b', 'rgba(30, 27, 75, 0.2)'];

    case 'fire':
    default:
      if (life > 0.85) return ['#ffffff', 'rgba(254, 240, 138, 0.9)'];
      if (life > 0.5) return ['#f97316', 'rgba(249, 115, 22, 0.7)'];
      if (life > 0.2) return ['#dc2626', 'rgba(220, 38, 38, 0.4)'];
      return ['#2d1510', 'rgba(45, 21, 16, 0.2)'];
  }
};

export const ParticleCanvas = forwardRef<ParticleCanvasRef, ParticleCanvasProps>(
  ({ config, onExplosionTriggered, setParticleActiveCount }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep simulation properties in mutable refs to achieve solid 60FPS bypassing React states
    const particlesRef = useRef<Particle[]>([]);
    const nextIdRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const cameraRotationRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0.2 });
    const isDraggingRef = useRef<boolean>(false);
    const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const dragAnglesRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
    const isPausedRef = useRef<boolean>(false);
    const triggerResetNeededRef = useRef<boolean>(false);
    const cameraShakeRef = useRef<number>(0);

    // States for visual controls hud
    const [pausedState, setPausedState] = useState(false);
    const [stats, setStats] = useState({ fps: 60 });

    const handleContainerResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth * window.devicePixelRatio;
      canvas.height = container.clientHeight * window.devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };

    // Camera rotation dragging
    const onMouseDown = (e: React.MouseEvent) => {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      dragAnglesRef.current = { ...cameraRotationRef.current };
    };

    const onMouseMove = (e: React.MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      // Update yaw & pitch
      cameraRotationRef.current.yaw = dragAnglesRef.current.yaw + dx * 0.006;
      cameraRotationRef.current.pitch = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, dragAnglesRef.current.pitch + dy * 0.006)
      );
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Trigger double click or button to initiate a fresh blast
    const triggerExplosion = () => {
      onExplosionTriggered();
      cameraShakeRef.current = 1.0; // trigger camera radial vibration
      
      const count = config.particleCount;
      const theme = config.colorTheme;
      particlesRef.current = []; // Wipe previous active ones
      nextIdRef.current = 0;

      const newParticles: Particle[] = [];

      // Determine ratio distribution
      const sparkCount = Math.floor(count * (config.sparkDensity / 100));
      const smokeCount = Math.floor(count * (config.smokeDensity / 100));
      const coreCount = count - sparkCount - smokeCount;

      // 1. Spawning explosion core elements (highly turbulent bright gas spheres)
      for (let i = 0; i < coreCount; i++) {
        const id = nextIdRef.current++;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = (0.5 + Math.random() * 0.5) * config.explosionForce * 4.5;

        const vx = speed * Math.sin(phi) * Math.cos(theta);
        const vy = speed * Math.cos(phi) - Math.random() * 1.5; // push core fire slightly upward
        const vz = speed * Math.sin(phi) * Math.sin(theta);

        const decay = 0.008 + Math.random() * 0.012;
        const size = 6 + Math.random() * 8;
        const [color, glowColor] = getThemeColors(theme, 1.0);

        newParticles.push({
          id,
          type: 'core',
          x: 0, y: 0, z: 0,
          prevX: 0, prevY: 0, prevZ: 0,
          vx, vy, vz,
          size,
          initialSize: size,
          decay,
          life: 1.0,
          delay: 0,
          mass: 0.6 + Math.random() * 0.8,
          turbulenceSeed: Math.random() * 100,
          color,
          glowColor
        });
      }

      // 2. Secondary Sparks (long streaking stars popping out with custom delays)
      for (let i = 0; i < sparkCount; i++) {
        const id = nextIdRef.current++;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = (0.8 + Math.random() * 0.7) * config.explosionForce * 12.0;

        const vx = speed * Math.sin(phi) * Math.cos(theta);
        const vy = speed * Math.cos(phi) - Math.random() * 1.5;
        const vz = speed * Math.sin(phi) * Math.sin(theta);

        const decay = 0.012 + Math.random() * 0.018;
        const size = 1.2 + Math.random() * 1.8;
        const [color, glowColor] = getThemeColors(theme, 1.0);

        newParticles.push({
          id,
          type: 'spark',
          x: 0, y: 0, z: 0,
          prevX: 0, prevY: 0, prevZ: 0,
          vx, vy, vz,
          size,
          initialSize: size,
          decay,
          life: 1.0,
          delay: Math.floor(Math.random() * 5), // dynamic release
          mass: 0.4 + Math.random() * 0.6,
          turbulenceSeed: Math.random() * 100,
          color,
          glowColor
        });
      }

      // 3. Smoke Clouds (expanding, slow-moving gas pockets conversion)
      for (let i = 0; i < smokeCount; i++) {
        const id = nextIdRef.current++;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = (0.2 + Math.random() * 0.4) * config.explosionForce * 2.5;

        const vx = speed * Math.sin(phi) * Math.cos(theta);
        const vy = speed * Math.cos(phi) - 1.5 - Math.random() * 2.5; // strong chimney upward motion
        const vz = speed * Math.sin(phi) * Math.sin(theta);

        const decay = 0.002 + Math.random() * 0.006;
        const size = 15 + Math.random() * 20;

        // Custom ash smoke base color
        const smokeBaseColors = {
          fire: 'rgba(50, 45, 45, 0.45)',
          electric: 'rgba(38, 30, 45, 0.45)',
          acid: 'rgba(28, 38, 28, 0.45)',
          frozen: 'rgba(30, 42, 48, 0.45)',
          cosmic: 'rgba(40, 25, 42, 0.45)',
        };

        newParticles.push({
          id,
          type: 'smoke',
          x: 0, y: 0, z: 0,
          prevX: 0, prevY: 0, prevZ: 0,
          vx, vy, vz,
          size,
          initialSize: size,
          decay,
          life: 1.0,
          delay: Math.floor(Math.random() * 8), // staggered launch
          mass: 0.2 + Math.random() * 0.2,
          turbulenceSeed: Math.random() * 100,
          color: smokeBaseColors[theme],
          glowColor: 'transparent'
        });
      }

      // 4. Kinetic Shockwave Ring (horizontal scatter disk)
      const shockwaveCount = Math.floor(count * 0.08);
      for (let i = 0; i < shockwaveCount; i++) {
        const id = nextIdRef.current++;
        const theta = Math.random() * Math.PI * 2;
        const speed = (1.5 + Math.random() * 0.5) * config.explosionForce * 6.0;

        const vx = speed * Math.sin(theta);
        const vy = (Math.random() - 0.5) * 1.5; // low height delta
        const vz = speed * Math.cos(theta);

        const decay = 0.015 + Math.random() * 0.015;
        const size = 2.0;
        const [color, glowColor] = getThemeColors(theme, 1.0);

        newParticles.push({
          id,
          type: 'shockwave',
          x: 0, y: 0, z: 0,
          prevX: 0, prevY: 0, prevZ: 0,
          vx, vy, vz,
          size,
          initialSize: size,
          decay,
          life: 1.0,
          delay: 0,
          mass: 0.1,
          turbulenceSeed: Math.random() * 100,
          color,
          glowColor
        });
      }

      particlesRef.current = newParticles;
      setParticleActiveCount(newParticles.length);
    };

    useImperativeHandle(ref, () => ({
      triggerExplosion,
    }));

    // Trigger initial onmount explosion
    useEffect(() => {
      triggerExplosion();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.colorTheme]); // re-draw whenever color changes

    useEffect(() => {
      handleContainerResize();
      window.addEventListener('resize', handleContainerResize);

      // Animation Loop setup
      let animationId: number;
      let frameCount = 0;
      let fpsTimer = 0;

      const physicsLoop = (timestamp: number) => {
        if (!canvasRef.current) {
          animationId = requestAnimationFrame(physicsLoop);
          return;
        }

        if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
        const rawDt = (timestamp - lastTimeRef.current) / 1000;
        lastTimeRef.current = timestamp;

        // Cap dt to prevent massive jumps when tab suspended
        const adjustedDt = Math.min(0.1, rawDt);

        // Calculate visual frames per second accurately
        frameCount++;
        fpsTimer += rawDt;
        if (fpsTimer >= 1.0) {
          setStats({ fps: frameCount });
          frameCount = 0;
          fpsTimer = 0;
        }

        // Apply cinematic slow-motion scaler
        const dt = adjustedDt * config.slowMo;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Reset buffer with subtle alpha clearance for cinematic motion trail residue
        ctx.fillStyle = 'rgba(8, 8, 10, 0.22)'; // extremely deep graphite
        ctx.fillRect(0, 0, width, height);

        // Decrease shake vibration damping over time
        cameraShakeRef.current = Math.max(0, cameraShakeRef.current - adjustedDt * 2.0);

        if (!isPausedRef.current) {
          // Physics step
          const activeParticles = particlesRef.current;
          for (let i = 0; i < activeParticles.length; i++) {
            const p = activeParticles[i];

            // Handle spawn delay offset
            if (p.delay > 0) {
              p.delay -= dt * 60; // scale delay with simulated slowMo speed
              continue;
            }

            p.prevX = p.x;
            p.prevY = p.y;
            p.prevZ = p.z;

            // 1. Air drag/friction slows velocities
            p.vx *= Math.pow(config.drag, dt * 60);
            p.vy *= Math.pow(config.drag, dt * 60);
            p.vz *= Math.pow(config.drag, dt * 60);

            // 2. Heavy acceleration gravity pulls downwards
            p.vy += config.gravity * 0.45 * p.mass * dt * 30;

            // 3. Turbulent hot wind vortex chaos
            if (config.turbulence > 0) {
              const windShift = timestamp * 0.002 + p.turbulenceSeed;
              p.vx += Math.sin(windShift) * config.turbulence * 0.25 * dt * 30;
              p.vz += Math.cos(windShift * 0.8) * config.turbulence * 0.25 * dt * 30;
            }

            // Update 3D Coordinates
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
            p.z += p.vz * dt * 60;

            // 4. Ground collision plane checks
            if (config.groundCollision && p.y > 100) {
              p.y = 100;
              p.vy = -p.vy * config.groundBounciness;
              p.vx *= 0.7; // ground friction
              p.vz *= 0.7;
            }

            // Decay life expectancy
            p.life -= p.decay * dt * 60;
            if (p.life < 0) p.life = 0;

            // Update live aesthetics based on age
            if (p.type !== 'smoke') {
              const [color, glowColor] = getThemeColors(config.colorTheme, p.life);
              p.color = color;
              p.glowColor = glowColor;
            }
          }

          // Cull evaporated atoms
          particlesRef.current = activeParticles.filter((p) => p.life > 0.0);
          setParticleActiveCount(particlesRef.current.length);
        }

        // --- RENDER 3D PROJECTED VIEWPORT ---

        // Draw Ambient Epicentre Backdrop Flare
        if (config.dynamicLighting && particlesRef.current.length > 0) {
          const coreGlowSize = Math.max(100, particlesRef.current.length * 0.25);
          const activeCoreThemeColors = {
            fire: 'rgba(239, 68, 68, 0.025)',
            electric: 'rgba(59, 130, 246, 0.025)',
            acid: 'rgba(34, 197, 94, 0.025)',
            frozen: 'rgba(6, 182, 212, 0.025)',
            cosmic: 'rgba(162, 28, 175, 0.025)',
          };
          const radialGrad = ctx.createRadialGradient(
            width / 2, height / 2, 5,
            width / 2, height / 2, coreGlowSize * 0.8
          );
          radialGrad.addColorStop(0, activeCoreThemeColors[config.colorTheme]);
          radialGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = radialGrad;
          ctx.fillRect(0, 0, width, height);
        }

        // 3D camera variables
        // Rotate orbit angles (yaw) if enabled config
        if (config.cameraOrbitSpeed > 0 && !isDraggingRef.current && !isPausedRef.current) {
          cameraRotationRef.current.yaw += config.cameraOrbitSpeed * 0.005 * config.slowMo;
        }

        const yaw = cameraRotationRef.current.yaw;
        const pitch = cameraRotationRef.current.pitch;
        const cameraDistance = 350; // virtual camera orbit radius
        const focalLength = width * 1.0; // perspective scaling scalar

        // Projection helper translates relative 3D coordinate => screen values
        const project3DCoords = (x: number, y: number, z: number) => {
          // Camera rotation around vertical Y axis (Horizontal panning)
          const cosY = Math.cos(yaw);
          const sinY = Math.sin(yaw);
          const xRot1 = x * cosY - z * sinY;
          const zRot1 = x * sinY + z * cosY;

          // Camera rotation around horizontal lateral axis (Vertical panning)
          const cosP = Math.cos(pitch);
          const sinP = Math.sin(pitch);
          const yRot2 = y * cosP - zRot1 * sinP;
          const zRot2 = y * sinP + zRot1 * cosP;

          // Push relative to physical camera offset
          const zDepth = zRot2 + cameraDistance;

          if (zDepth <= 5.0) return null; // Behind camera clipping

          const scale = focalLength / zDepth;
          
          // Camera shakes
          const shakeOffset = cameraShakeRef.current * 12.0;
          const shakeX = (Math.random() - 0.5) * shakeOffset;
          const shakeY = (Math.random() - 0.5) * shakeOffset;

          const screenX = width / 2 + xRot1 * scale + shakeX;
          const screenY = height / 2 - yRot2 * scale + shakeY;

          return { x: screenX, y: screenY, size: scale, depth: zDepth };
        };

        // Render Floor Wireframe mesh if active
        if (config.groundCollision) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
          ctx.lineWidth = 1;

          // Drawing parallel boundary grids
          const gridSize = 160;
          const stepSize = 40;
          const yFloor = 100;

          // Grid lines along Z axis
          for (let xl = -gridSize; xl <= gridSize; xl += stepSize) {
            ctx.beginPath();
            let started = false;
            for (let zl = -gridSize; zl <= gridSize; zl += 10) {
              const proj = project3DCoords(xl, yFloor, zl);
              if (proj) {
                if (!started) {
                  ctx.moveTo(proj.x, proj.y);
                  started = true;
                } else {
                  ctx.lineTo(proj.x, proj.y);
                }
              }
            }
            ctx.stroke();
          }

          // Grid lines along X axis
          for (let zl = -gridSize; zl <= gridSize; zl += stepSize) {
            ctx.beginPath();
            let started = false;
            for (let xl = -gridSize; xl <= gridSize; xl += 10) {
              const proj = project3DCoords(xl, yFloor, zl);
              if (proj) {
                if (!started) {
                  ctx.moveTo(proj.x, proj.y);
                  started = true;
                } else {
                  ctx.lineTo(proj.x, proj.y);
                }
              }
            }
            ctx.stroke();
          }
        }

        // Compile render queues including projection calculations
        interface ProjectedItem {
          p: Particle;
          screenX: number;
          screenY: number;
          prevScreenX?: number;
          prevScreenY?: number;
          scale: number;
          depth: number;
        }

        const renderQueue: ProjectedItem[] = [];

        const activeBatch = particlesRef.current;
        for (let i = 0; i < activeBatch.length; i++) {
          const p = activeBatch[i];
          if (p.delay > 0) continue; // Skip hidden delay nodes

          const currentProj = project3DCoords(p.x, p.y, p.z);
          if (!currentProj) continue;

          let prevProj = undefined;
          if (config.motionBlur > 0) {
            // Draw speed streak vectors based on historical ticks
            prevProj = project3DCoords(
              p.x - (p.vx * dt * 4 * config.motionBlur),
              p.y - (p.vy * dt * 4 * config.motionBlur),
              p.z - (p.vz * dt * 4 * config.motionBlur)
            );
          }

          renderQueue.push({
            p,
            screenX: currentProj.x,
            screenY: currentProj.y,
            prevScreenX: prevProj?.x,
            prevScreenY: prevProj?.y,
            scale: currentProj.size,
            depth: currentProj.depth
          });
        }

        // Sort items using Depth (Painter's Algorithm) to render rear elements underneath forward layers
        renderQueue.sort((a, b) => b.depth - a.depth);

        // Drawing loops for sorted indices
        for (let i = 0; i < renderQueue.length; i++) {
          const item = renderQueue[i];
          const p = item.p;
          const px = item.screenX;
          const py = item.screenY;
          const scaleRadius = Math.max(0.6, p.size * (item.scale * 0.0035));

          // Base Glow composition rendering
          if (p.type !== 'smoke' && config.glowSize > 0.5) {
            ctx.globalCompositeOperation = 'screen';
            const flareRadius = scaleRadius * config.glowSize * 2.5;

            const radGrad = ctx.createRadialGradient(px, py, 1.0, px, py, flareRadius);
            radGrad.addColorStop(0, p.glowColor);
            radGrad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(px, py, flareRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over'; // restore
          }

          // Main Particle Node Drawing
          ctx.beginPath();
          if (p.type === 'smoke') {
            // Smoke cloud soft puff shapes
            ctx.fillStyle = p.color;
            ctx.arc(px, py, scaleRadius * 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Cinematic Motion Blurring stretch streaks
            if (config.motionBlur > 0 && item.prevScreenX !== undefined && item.prevScreenY !== undefined) {
              ctx.strokeStyle = p.color;
              ctx.lineWidth = Math.max(1, scaleRadius * 0.85);
              ctx.lineCap = 'round';
              ctx.moveTo(item.prevScreenX, item.prevScreenY);
              ctx.lineTo(px, py);
              ctx.stroke();
            } else {
              // Draw solid spark point
              ctx.fillStyle = p.color;
              ctx.arc(px, py, scaleRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Draw HUD details (Cine vignetting, parameters overlay)
        if (config.cinematicVignette) {
          const vignette = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.35,
            width / 2, height / 2, width * 0.72
          );
          vignette.addColorStop(0, 'rgba(0,0,0,0)');
          vignette.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, width, height);
        }

        animationId = requestAnimationFrame(physicsLoop);
      };

      // Boot Simulation loop
      animationId = requestAnimationFrame(physicsLoop);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleContainerResize);
      };
    }, [config, setParticleActiveCount]);

    const handlePlayPause = () => {
      isPausedRef.current = !isPausedRef.current;
      setPausedState(isPausedRef.current);
    };

    const outlineBorderColors = {
      fire: 'border-[#f97316]/20 ring-1 ring-[#f97316]/10 backdrop-blur-md',
      electric: 'border-[#3b82f6]/20 ring-1 ring-[#3b82f6]/10 backdrop-blur-md',
      acid: 'border-[#4ade80]/20 ring-1 ring-[#4ade80]/10 backdrop-blur-md',
      frozen: 'border-[#06b6d4]/20 ring-1 ring-[#06b6d4]/10 backdrop-blur-md',
      cosmic: 'border-[#ec4899]/20 ring-1 ring-[#ec4899]/10 backdrop-blur-md',
    };

    return (
      <div className="relative w-full h-[380px] md:h-full flex flex-col group/canvas">
        {/* Canvas Render Frame */}
        <div
          ref={containerRef}
          className="relative w-full h-full overflow-hidden rounded-2xl bg-[#08080a] select-none cursor-grab active:cursor-grabbing border border-[#18181b]"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <canvas ref={canvasRef} className="block w-full h-full" id="particle-canvas-3d" />

          {/* Interactive Floating Canvas HUD */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 pointer-events-none select-none font-mono">
            <div className="flex items-center gap-2 bg-[#000000]/60 border border-white/5 py-1 px-2.5 rounded-md backdrop-blur-sm text-xs text-white/90">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>RENDER ENGINE: PERSPECTIVE CAMERA</span>
            </div>
            
            <div className="text-[10px] text-zinc-500 bg-[#000000]/40 p-1 px-2 rounded mt-1 max-w-[200px]">
              Drag left/right to orbit. Drag up/down to tilt orientation angle.
            </div>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-10 font-mono text-xs">
            <div className="bg-[#000000]/60 border border-white/5 py-1 px-2 rounded-md text-zinc-400">
              FPS: <span className="text-[#a1a1aa] font-medium">{stats.fps}</span>
            </div>
          </div>

          {/* Central Trigger Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 opacity-0 group-hover/canvas:opacity-80 transition-opacity duration-300">
              Click Canvas to Rotate Orbit Sphere
            </span>
          </div>

          {/* Controls HUD */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 px-3 py-1.5 rounded-full bg-black/75 border border-zinc-800/40 backdrop-blur-md">
            <button
              id="btn-play-pause-simulation"
              onClick={handlePlayPause}
              className={`p-2 rounded-full cursor-pointer hover:bg-zinc-800/80 transition-all text-white`}
              title={pausedState ? 'Resume simulation' : 'Pause simulation'}
            >
              {pausedState ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>

            <button
              id="btn-trigger-detonation"
              onClick={triggerExplosion}
              className={`p-2 rounded-full cursor-pointer hover:bg-zinc-800/80 transition-all text-[#e11d48]`}
              title="Trigger Hollywood Detonation"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <div className="h-4 w-[1px] bg-zinc-800/80 mx-1"></div>

            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 pr-2 select-none">
              Playback Focus
            </span>
          </div>
        </div>

        {/* Ambient outline representing theme color glows */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300 border-2 ${outlineBorderColors[config.colorTheme]}`} />
      </div>
    );
  }
);

ParticleCanvas.displayName = 'ParticleCanvas';
