export type ColorThemeId = 'fire' | 'electric' | 'acid' | 'frozen' | 'cosmic';

export interface ParticleSystemConfig {
  particleCount: number;
  explosionForce: number; // multiplier for initial velocity
  gravity: number; // acceleration downwards
  drag: number; // velocity multiplier per frame (air resistance)
  slowMo: number; // time scaling factor (e.g., 0.1 means 10x slower)
  turbulence: number; // randomized force per frame
  sparkDensity: number; // percentage of particles that are high-speed sparks
  smokeDensity: number; // percentage of particles that are smoke clouds
  glowSize: number; // size multiplier for fire/glow textures
  motionBlur: number; // trail length
  colorTheme: ColorThemeId;
  groundCollision: boolean;
  groundBounciness: number;
  cameraOrbitSpeed: number; // rotation speed of camera
  dynamicLighting: boolean; // toggle dynamic ground/backlight effect
  cinematicVignette: boolean;
}

export interface Particle {
  id: number;
  type: 'core' | 'spark' | 'smoke' | 'shockwave';
  
  // 3D coordinates
  x: number;
  y: number;
  z: number;
  
  // Tail coordinates for motion blur (3D)
  prevX: number;
  prevY: number;
  prevZ: number;

  // Velocities
  vx: number;
  vy: number;
  vz: number;

  // Visuals
  size: number;
  initialSize: number;
  color: string;
  glowColor: string;
  
  // Life characteristics
  life: number; // ranges 1 -> 0
  decay: number; // decrement per frame
  delay: number; // frame delay before activation for secondary explosions
  mass: number;
  turbulenceSeed: number; // randomized offset for trigonometry turbulence
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: Partial<ParticleSystemConfig>;
}
