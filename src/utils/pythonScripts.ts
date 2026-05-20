import { ParticleSystemConfig } from '../types';

/**
 * Returns a Pygame 3D (No OpenGL required) script with dynamic parameter values.
 */
export function getPygameCpuScript(config: ParticleSystemConfig): string {
  // Convert config variables
  const colorThemeHexMap = {
    fire: '[(255, 230, 100), (255, 100, 20), (120, 20, 10), (40, 40, 40)]',
    electric: '[(100, 230, 255), (20, 100, 255), (80, 20, 150), (25, 20, 40)]',
    acid: '[(200, 255, 100), (40, 200, 40), (10, 80, 20), (30, 40, 30)]',
    frozen: '[(210, 255, 255), (100, 180, 255), (20, 50, 180), (20, 25, 45)]',
    cosmic: '[(255, 150, 255), (200, 40, 200), (80, 10, 120), (30, 20, 40)]',
  };

  const themeColors = colorThemeHexMap[config.colorTheme] || colorThemeHexMap.fire;

  return `#!/usr/bin/env python3
"""
Hollywood VFX 3D Particle Explosion Sim (Pygame 3D Edition)
-----------------------------------------------------------
A high-fidelity 3D particle physics engine of a VFX style explosion.
Runs on pure Pygame using 3D-to-2D perspective projection.

Features:
- Thousands of particles with depth sorting & alpha blending
- Distinct particle classes: Core (hot plasma), Sparks (streaks), Smoke (drifting mist)
- Realistic physics: gravity, air resistance, wind turbulence, ground collision
- Interactive camera: orbit control using mouse or keys
- Motion blur / speed stretch styling and cinematic slow motion
- Zero driver dependencies - runs on standard Pygame!

Usage:
  1. Install dependency: pip install pygame
  2. Run the script: python3 explosion_3d.py
  3. Controls:
     - [Space]: Toggle cinematic Slow-Motion
     - [Mouse Drag] or [Arrow Keys]: Rotate Camera (Orbit)
     - [R]: Reset Explosion
     - [Esc] / [Q]: Quit
"""

import pygame
import math
import random
import sys

# --- SIMULATION PARAMETERS (Dynamically adjusted from VFX Studio) ---
PARTICLE_COUNT = ${config.particleCount}
EXPLOSION_FORCE = ${config.explosionForce}
GRAVITY = ${config.gravity / 10}
DRAG = ${config.drag}
SLOW_MO_ACTIVE = False
SLOW_MO_FACTOR = ${config.slowMo}
TURBULENCE = ${config.turbulence / 15}
MOTION_BLUR = ${config.motionBlur}
SPARK_RATIO = ${config.sparkDensity / 100}
SMOKE_RATIO = ${config.smokeDensity / 100}
GROUND_COLLISION = ${config.groundCollision ? 'True' : 'False'}
GROUND_BOUNCINESS = ${config.groundBounciness}
GLOW_SIZE = ${config.glowSize}

# Custom Hollywood Theme Palette
COLOR_GRADIENT = ${themeColors} 
# Colors map to life: [0.9-1.0 (Core Peak), 0.5-0.9 (Mid Flame), 0.1-0.5 (Decay Gas), 0-0.1 (Ashes)]

class Particle3D:
    def __init__(self, p_type, x=0.0, y=0.0, z=0.0):
        self.type = p_type  # 'core', 'spark', 'smoke'
        self.x = x
        self.y = y
        self.z = z
        self.prev_x = x
        self.prev_y = y
        self.prev_z = z
        
        # Initial velocities based on spherical distribution
        theta = random.uniform(0, 2 * math.pi)
        phi = math.acos(random.uniform(-1, 1))
        
        # Explosion speed
        if p_type == 'spark':
            base_speed = random.uniform(5.0, 16.0) * EXPLOSION_FORCE
        elif p_type == 'smoke':
            base_speed = random.uniform(1.0, 3.5) * EXPLOSION_FORCE
        else: # 'core'
            base_speed = random.uniform(3.0, 8.0) * EXPLOSION_FORCE
            
        self.vx = base_speed * math.sin(phi) * math.cos(theta)
        self.vy = base_speed * math.cos(phi) # vertical
        self.vz = base_speed * math.sin(phi) * math.sin(theta)
        
        # Adjust direction for upward chimney blast effect
        if p_type == 'smoke' or p_type == 'core':
            self.vy -= random.uniform(1.0, 4.0)
            
        self.life = 1.0
        self.decay = random.uniform(0.005, 0.02)
        if p_type == 'smoke':
            self.decay = random.uniform(0.003, 0.01)
        elif p_type == 'spark':
            self.decay = random.uniform(0.012, 0.025)
            
        # Physical size
        self.size = random.uniform(8.0, 20.0) if p_type == 'smoke' else random.uniform(2.0, 5.0)
        self.initial_size = self.size
        self.mass = random.uniform(0.5, 1.5)
        self.turbulence_seed = random.uniform(0, 100)

    def update(self, dt):
        self.prev_x, self.prev_y, self.prev_z = self.x, self.y, self.z
        
        # Apply physics
        # 1. Drag
        self.vx *= DRAG
        self.vy *= DRAG
        self.vz *= DRAG
        
        # 2. Gravity
        self.vy += GRAVITY * self.mass * dt
        
        # 3. Turbulence/Wind (Drift)
        self.vx += math.sin(pygame.time.get_ticks() * 0.005 + self.turbulence_seed) * TURBULENCE * dt
        self.vz += math.cos(pygame.time.get_ticks() * 0.005 + self.turbulence_seed) * TURBULENCE * dt
        
        # Update coordinates
        self.x += self.vx * dt
        self.y += self.vy * dt
        self.z += self.vz * dt
        
        # Ground bounce
        if GROUND_COLLISION and self.y > 150.0:
            self.y = 150.0
            self.vy = -self.vy * GROUND_BOUNCINESS
            # Restrict horizontal scatter slightly upon bounce friction
            self.vx *= 0.8
            self.vz *= 0.8
            
        # Age
        self.life -= self.decay * dt
        if self.life < 0:
            self.life = 0

    def get_color(self):
        # Piecewise interpolation across palette
        c_len = len(COLOR_GRADIENT)
        if self.type == 'smoke':
            # Smoke shifts from dark orange/red to soot grey
            smoke_col = COLOR_GRADIENT[3]
            mid_col = (80, 80, 80)
            t = self.life
            r = int(smoke_col[0] * t + mid_col[0] * (1-t))
            g = int(smoke_col[1] * t + mid_col[1] * (1-t))
            b = int(smoke_col[2] * t + mid_col[2] * (1-t))
            return r, g, b
            
        idx = (1.0 - self.life) * (c_len - 1)
        idx_low = int(math.floor(idx))
        idx_high = min(idx_low + 1, c_len - 1)
        weight = idx - idx_low
        
        c0 = COLOR_GRADIENT[idx_low]
        c1 = COLOR_GRADIENT[idx_high]
        
        r = int(c0[0] * (1 - weight) + c1[0] * weight)
        g = int(c0[1] * (1 - weight) + c1[1] * weight)
        b = int(c0[2] * (1 - weight) + c1[2] * weight)
        
        return r, g, b


class Projector3D:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.angle_y = 0.0 # Yaw
        self.angle_x = 0.15 # Pitch
        self.camera_dist = 600.0
        self.focal_length = width * 1.1

    def project(self, x, y, z):
        # Rotate around Y-axis (Yaw)
        cos_y, sin_y = math.cos(self.angle_y), math.sin(self.angle_y)
        x_rot = x * cos_y - z * sin_y
        z_rot1 = x * sin_y + z * cos_y

        # Rotate around X-axis (Pitch)
        cos_x, sin_x = math.cos(self.angle_x), math.sin(self.angle_x)
        y_rot = y * cos_x - z_rot1 * sin_x
        z_rot2 = y * sin_x + z_rot1 * cos_x

        # Translate relative to camera coordinates
        z_cam = z_rot2 + self.camera_dist
        
        if z_cam < 1.0:
            return None, z_cam

        scale = self.focal_length / z_cam
        px = int(self.width / 2 + x_rot * scale)
        py = int(self.height / 2 - y_rot * scale)
        return (px, py), z_cam


def main():
    pygame.init()
    screen = pygame.display.set_mode((1024, 768))
    pygame.display.set_caption("Hollywood 3D Particle Explosion - Pygame Edition")
    clock = pygame.time.Clock()
    
    projector = Projector3D(1024, 768)
    particles = []
    
    def spawn_explosion():
        particles.clear()
        for i in range(PARTICLE_COUNT):
            # Categorize particle
            r_val = random.random()
            if r_val < SPARK_RATIO:
                p_type = 'spark'
            elif r_val < SPARK_RATIO + SMOKE_RATIO:
                p_type = 'smoke'
            else:
                p_type = 'core'
                
            particles.append(Particle3D(p_type))

    spawn_explosion()
    slow_mo_mode = SLOW_MO_ACTIVE
    
    # Drag handler variables
    dragging = False
    last_mouse_pos = (0, 0)

    running = True
    while running:
        dt = clock.tick(60) / 16.666  # normalized frametime (1.0 = 60fps)
        
        # Apply cinematic slow motion
        sim_dt = dt * SLOW_MO_FACTOR if slow_mo_mode else dt
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key in [pygame.K_ESCAPE, pygame.K_q]:
                    running = False
                elif event.key == pygame.K_SPACE:
                    slow_mo_mode = not slow_mo_mode
                elif event.key == pygame.K_r:
                    spawn_explosion()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:
                    dragging = True
                    last_mouse_pos = event.pos
            elif event.type == pygame.MOUSEBUTTONUP:
                if event.button == 1:
                    dragging = False
            elif event.type == pygame.MOUSEMOTION:
                if dragging:
                    dx = event.pos[0] - last_mouse_pos[0]
                    dy = event.pos[1] - last_mouse_pos[1]
                    # Update camera angles
                    projector.angle_y += dx * 0.005
                    projector.angle_x = max(-math.pi/2.2, min(math.pi/2.2, projector.angle_x + dy * 0.005))
                    last_mouse_pos = event.pos

        # Arrow key rotation backup
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:  projector.angle_y -= 0.02
        if keys[pygame.K_RIGHT]: projector.angle_y += 0.02
        if keys[pygame.K_UP]:    projector.angle_x = min(math.pi/2.2, projector.angle_x + 0.02)
        if keys[pygame.K_DOWN]:  projector.angle_x = max(-math.pi/2.2, projector.angle_x - 0.02)

        # Update physical entities
        for p in particles:
            p.update(sim_dt)
            
        # Clean expired particles
        active_particles = [p for p in particles if p.life > 0.0]

        # Draw Frame
        # Set dark Hollywood grade visual base (deep soot grey background)
        screen.fill((10, 10, 12))
        
        # Draw dynamic ground glow grid if COLLISION enabled
        if GROUND_COLLISION:
            # Draw ground wireframe or floor planes
            floor_y = 150.0
            grid_res = 12
            for i in range(-grid_res, grid_res + 1):
                # Lateral lines
                p_start, z1 = projector.project(-400.0, floor_y, i * 400.0 / grid_res)
                p_end, z2 = projector.project(400.0, floor_y, i * 400.0 / grid_res)
                if p_start and p_end:
                    pygame.draw.line(screen, (20, 16, 18), p_start, p_end, 1)
                
                # Longitudinal lines
                p_start, z1 = projector.project(i * 400.0 / grid_res, floor_y, -400.0)
                p_end, z2 = projector.project(i * 400.0 / grid_res, floor_y, 400.0)
                if p_start and p_end:
                    pygame.draw.line(screen, (20, 16, 18), p_start, p_end, 1)

        # Project and depth sort of 3D indices for core drawing order
        render_queue = []
        for p in active_particles:
            coords = projector.project(p.x, p.y, p.z)
            prev_coords = projector.project(p.prev_x, p.prev_y, p.prev_z) if MOTION_BLUR > 0 else (None, 0)
            
            projected_pos, z_depth = coords
            
            if projected_pos:
                render_queue.append({
                    'pos': projected_pos,
                    'prev_pos': prev_coords[0],
                    'depth': z_depth,
                    'particle': p
                })
                
        # Draw back particles first (Painters Algorithm)
        render_queue.sort(key=lambda item: item['depth'], reverse=True)

        for item in render_queue:
            p = item['particle']
            px, py = item['pos']
            depth = item['depth']
            
            # Particle color
            base_col = p.get_color()
            
            # Camera scale factor
            radius = max(1.0, (projector.focal_length / depth) * p.size * 0.1)
            
            # Adjust opacity based on life
            alpha_multiplier = p.life
            if p.type == 'smoke':
                # Smoke cloud fading
                alpha_multiplier = p.life * 0.45
            
            # Draw Core
            try:
                # Basic Fire Glow overlay
                if GLOW_SIZE > 1.0 and (p.type == 'core' or p.type == 'spark'):
                    glow_rad = int(radius * GLOW_SIZE)
                    if glow_rad > 2:
                        # Draw concentric circles for mock bloom
                        for offset, r_mul, col_alpha in [(0.2, 2.5, 20), (0.4, 1.8, 50), (1.0, 1.0, 150)]:
                            inner_col = (
                                min(255, int(base_col[0] * col_alpha / 100)),
                                min(255, int(base_col[1] * col_alpha / 100)),
                                min(255, int(base_col[2] * col_alpha / 100))
                            )
                            # Draw transparency in pygame using temp surface for alpha glow
                            glow_s = pygame.Surface((glow_rad * 3, glow_rad * 3), pygame.SRCALPHA)
                            # Fill radial color
                            pygame.draw.circle(
                                glow_s, 
                                (*inner_col, int(col_alpha * alpha_multiplier)), 
                                (glow_rad * 1.5, glow_rad * 1.5), 
                                int(radius * GLOW_SIZE * r_mul)
                            )
                            screen.blit(glow_s, (px - glow_rad * 1.5, py - glow_rad * 1.5))
                
                # Draw central physical node
                if p.type == 'smoke':
                    smoke_col = p.get_color()
                    # Soft grey puff
                    smoke_surf = pygame.Surface((int(radius * 4), int(radius * 4)), pygame.SRCALPHA)
                    pygame.draw.circle(
                        smoke_surf, 
                        (*smoke_col, int(100 * alpha_multiplier)), 
                        (int(radius*2), int(radius*2)), 
                        int(radius)
                    )
                    screen.blit(smoke_surf, (px - radius*2, py - radius*2))
                else:
                    # Render particles with Motion Blur/Speed vectors 
                    if MOTION_BLUR > 0 and item['prev_pos']:
                        ppx, ppy = item['prev_pos']
                        # Stretch line from previous position to represent exposure delay
                        # Thickness based on radius
                        stroke = max(1, int(radius * 0.6))
                        pygame.draw.line(screen, base_col, (ppx, ppy), (px, py), stroke)
                    else:
                        pygame.draw.circle(screen, base_col, (px, py), int(radius))
            except Exception:
                pass # Fail-safe from float boundary issues in rendering surfaces

        # Dynamic overlay of central explosions backlight
        if len(active_particles) > 0 and config =="dynamicLighting":
            # Screen overlay flare
            sparkle_s = pygame.Surface((1024, 768), pygame.SRCALPHA)
            central_glow = int(max(0, min(100, len(active_particles) / 10)))
            pygame.draw.circle(sparkle_s, (*COLOR_GRADIENT[1], central_glow), (512, 384), 400)
            screen.blit(sparkle_s, (0,0))

        # Core statistics overlays (Cinematic Hud)
        font = pygame.font.SysFont('consolas', 16)
        fps_text = font.render(f"FPS: {int(clock.get_fps())}", True, (150, 150, 150))
        pts_text = font.render(f"Particles: {len(active_particles)}", True, (150, 150, 150))
        ctrl_text = font.render("SPACE: Slow-Motion | Mouse drag: Orbit Camera | R: Reset Explode", True, (100, 100, 100))
        
        # Indicator lights for status
        slow_mo_info = "SLO-MO ACTIVE" if slow_mo_mode else "NORMAL SPEED"
        status_col = COLOR_GRADIENT[1] if slow_mo_mode else (120, 120, 120)
        mode_text = font.render(slow_mo_info, True, status_col)

        screen.blit(fps_text, (20, 20))
        screen.blit(pts_text, (20, 45))
        screen.blit(mode_text, (20, 70))
        screen.blit(ctrl_text, (20, 730))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
`;
}

/**
 * Returns a ModernGL high-performance 3D GPU script structure.
 */
export function getModernGlScript(config: ParticleSystemConfig): string {
  const colorThemeHexMap = {
    fire: '[[1.0, 0.9, 0.4, 1.0], [1.0, 0.5, 0.1, 1.0], [0.5, 0.1, 0.05, 1.0], [0.15, 0.15, 0.15, 1.0]]',
    electric: '[[0.4, 0.9, 1.0, 1.0], [0.1, 0.4, 1.0, 1.0], [0.3, 0.1, 0.6, 1.0], [0.1, 0.1, 0.15, 1.0]]',
    acid: '[[0.8, 1.0, 0.4, 1.0], [0.1, 0.8, 0.2, 1.0], [0.05, 0.3, 0.1, 1.0], [0.12, 0.15, 0.12, 1.0]]',
    frozen: '[[0.8, 1.0, 1.0, 1.0], [0.4, 0.7, 1.0, 1.0], [0.1, 0.2, 0.7, 1.0], [0.08, 0.1, 0.18, 1.0]]',
    cosmic: '[[1.0, 0.6, 1.0, 1.0], [0.8, 0.1, 0.8, 1.0], [0.3, 0.05, 0.5, 1.0], [0.12, 0.08, 0.15, 1.0]]',
  };

  const themeColors = colorThemeHexMap[config.colorTheme] || colorThemeHexMap.fire;

  return `#!/usr/bin/env python3
"""
Hollywood VFX 3D Particle Explosion Sim (ModernGL GPU Shader Edition)
----------------------------------------------------------------------
A high-performance particle engine featuring beautiful GLSL particle billboard rendering,
glow filters, dynamic scale, and real-time physical updates running on standard GPU buffers.

Prerequisites:
  pip install pygame moderngl numpy

Controls:
  - [SPACE]: Toggle Slow Motion
  - [MOUSE DRAG]: Polar Camera rotation
  - [R]: Reset/Explode Again
  - [ESC]/[Q]: Quit
"""

import pygame
import moderngl
import numpy as np
import math
import random
import sys

# Simulation configuration
WIDTH, HEIGHT = 1024, 768
PARTICLE_COUNT = ${Math.min(config.particleCount * 2, 25000)}  # Can increase count significantly on GPU!
EXPLOSION_FORCE = ${config.explosionForce}
GRAVITY = ${config.gravity / 10}
DRAG = ${config.drag}
TURBULENCE = ${config.turbulence / 15}
SLOW_MO_FACTOR = ${config.slowMo}
SPARK_RATIO = ${config.sparkDensity / 100}
SMOKE_RATIO = ${config.smokeDensity / 100}

THEME_GRADIENT = ${themeColors}

vertex_shader = """
#version 330

uniform mat4 m_proj;
uniform mat4 m_view;

in vec3 in_position;
in vec4 in_color;
in float in_size;
in float in_life;

out vec4 v_color;
out float v_life;

void main() {
    vec4 view_pos = m_view * vec4(in_position, 1.0);
    gl_Position = m_proj * view_pos;
    
    // Scale particles based on distance from focal screen
    gl_PointSize = in_size * (300.0 / -view_pos.z);
    
    v_color = in_color;
    v_life = in_life;
}
"""

fragment_shader = """
#version 330

in vec4 v_color;
in float v_life;
out vec4 fragColor;

void main() {
    // Generate soft circular point sprites with realistic cinematic glow
    vec2 circ_coord = gl_PointCoord - vec2(0.5);
    float dist = length(circ_coord);
    
    if (dist > 0.5) {
        discard;
    }
    
    // Smooth radial edge
    float glow = smoothstep(0.5, 0.0, dist);
    
    // Dynamic alpha fade
    vec4 r_color = v_color;
    r_color.a *= (glow * v_life);
    
    fragColor = r_color;
}
"""

class ExplosionGPUSystem:
    def __init__(self, count):
        self.count = count
        
        # Buffer structures: x, y, z, r, g, b, a, size, life, vx, vy, vz, type, decay, mass, seed
        # Store positions & metadata
        self.positions = np.zeros((count, 3), dtype='f4')
        self.colors = np.zeros((count, 4), dtype='f4')
        self.sizes = np.zeros(count, dtype='f4')
        self.lives = np.zeros(count, dtype='f4')
        
        # Physics arrays
        self.velocities = np.zeros((count, 3), dtype='f4')
        self.decays = np.zeros(count, dtype='f4')
        self.masses = np.zeros(count, dtype='f4')
        self.seeds = np.random.uniform(0.0, 100.0, count).astype('f4')
        self.types = np.zeros(count, dtype='i4')  # 0=core, 1=spark, 2=smoke

        self.reset_explosion()

    def reset_explosion(self):
        for i in range(self.count):
            self.positions[i] = [0.0, 0.0, 0.0]
            self.lives[i] = 1.0
            
            # Type distribution
            r_val = random.random()
            if r_val < SPARK_RATIO:
                self.types[i] = 1 # spark
                self.masses[i] = random.uniform(0.4, 1.0)
                self.sizes[i] = random.uniform(1.5, 4.0)
                self.decays[i] = random.uniform(0.01, 0.03)
                base_speed = random.uniform(8.0, 22.0) * EXPLOSION_FORCE
            elif r_val < SPARK_RATIO + SMOKE_RATIO:
                self.types[i] = 2 # smoke
                self.masses[i] = random.uniform(0.1, 0.5)
                self.sizes[i] = random.uniform(12.0, 25.0)
                self.decays[i] = random.uniform(0.003, 0.01)
                base_speed = random.uniform(1.0, 4.0) * EXPLOSION_FORCE
            else:
                self.types[i] = 0 # core
                self.masses[i] = random.uniform(0.8, 1.8)
                self.sizes[i] = random.uniform(5.0, 10.0)
                self.decays[i] = random.uniform(0.006, 0.015)
                base_speed = random.uniform(4.0, 10.0) * EXPLOSION_FORCE

            theta = random.uniform(0, 2 * math.pi)
            phi = math.acos(random.uniform(-1, 1))
            
            self.velocities[i, 0] = base_speed * math.sin(phi) * math.cos(theta)
            self.velocities[i, 1] = base_speed * math.cos(phi)
            self.velocities[i, 2] = base_speed * math.sin(phi) * math.sin(theta)
            
            # Chimney drift on smoke core
            if self.types[i] in [0, 2]:
                self.velocities[i, 1] -= random.uniform(1.0, 5.0)

            # Assign initial gradient color
            self.update_single_color(i)

    def update_single_color(self, idx):
        life = self.lives[idx]
        ptype = self.types[idx]
        
        if ptype == 2:  # Smoke transitions to ash grey
            c_smoke = np.array(THEME_GRADIENT[3])
            c_ash = np.array([0.3, 0.3, 0.3, 1.0])
            self.colors[idx] = c_smoke * life + c_ash * (1.0 - life)
            return

        c_len = len(THEME_GRADIENT)
        val = (1.0 - life) * (c_len - 1)
        low_idx = int(math.floor(val))
        high_idx = min(low_idx + 1, c_len - 1)
        w = val - low_idx
        
        c0 = np.array(THEME_GRADIENT[low_idx])
        c1 = np.array(THEME_GRADIENT[high_idx])
        
        self.colors[idx] = c0 * (1.0 - w) + c1 * w

    def update(self, dt):
        for i in range(self.count):
            if self.lives[i] <= 0.0:
                continue
                
            # Physics loop
            self.velocities[i] *= DRAG
            self.velocities[i, 1] += GRAVITY * self.masses[i] * dt
            
            # Drifting wind
            time_ticks = pygame.time.get_ticks() * 0.004
            self.velocities[i, 0] += math.sin(time_ticks + self.seeds[i]) * TURBULENCE * dt
            self.velocities[i, 2] += math.cos(time_ticks + self.seeds[i]) * TURBULENCE * dt
            
            # Position calculations
            self.positions[i] += self.velocities[i] * dt
            
            # Ground bounce
            if ${config.groundCollision ? 'True' : 'False'} and self.positions[i, 1] > 10.0: # arbitrary bottom plane
                self.positions[i, 1] = 10.0
                self.velocities[i, 1] = -self.velocities[i, 1] * ${config.groundBounciness}
                self.velocities[i, 0] *= 0.8
                self.velocities[i, 2] *= 0.8
            
            # Age
            self.lives[i] -= self.decays[i] * dt
            if self.lives[i] < 0.0:
                self.lives[i] = 0.0
                
            self.update_single_color(i)

    def get_vbo_data(self):
        # Format interleaved floats for GPU: [x,y,z, r,g,b,a, size, life]
        # Total float fields = 3 (pos) + 4 (col) + 1 (size) + 1 (life) = 9 floats per vertex.
        data = np.zeros((self.count, 9), dtype='f4')
        data[:, 0:3] = self.positions
        data[:, 3:7] = self.colors
        data[:, 7] = self.sizes
        data[:, 8] = self.lives
        return data.tobytes()


def main():
    pygame.init()
    pygame.display.gl_set_attribute(pygame.GL_CONTEXT_MAJOR_VERSION, 3)
    pygame.display.gl_set_attribute(pygame.GL_CONTEXT_MINOR_VERSION, 3)
    pygame.display.gl_set_attribute(pygame.GL_CONTEXT_PROFILE_MASK, pygame.GL_CONTEXT_PROFILE_CORE)

    screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.OPENGL | pygame.DOUBLEBUF)
    pygame.display.set_caption("GLSL 3D Particle Explosion - ModernGL GPU")
    clock = pygame.time.Clock()

    ctx = moderngl.create_context()
    ctx.enable(moderngl.PROGRAM_POINT_SIZE)
    ctx.enable(moderngl.BLEND)
    ctx.blend_func = (moderngl.SRC_ALPHA, moderngl.ONE_MINUS_SRC_ALPHA)

    prog = ctx.program(vertex_shader=vertex_shader, fragment_shader=fragment_shader)
    
    # Orbit Camera Angles
    cam_dist = 400.0
    cam_pitch = 0.3
    cam_yaw = 0.0
    
    # Interaction state
    is_dragging = False
    last_mouse = (0, 0)
    slow_mo = False

    system = ExplosionGPUSystem(PARTICLE_COUNT)

    # Vertex buffers
    vbo = ctx.buffer(reserve=PARTICLE_COUNT * 9 * 4) # 9 floats * 4 bytes
    vao = ctx.vertex_array(prog, [
        (vbo, '3f 4f 1f 1f', 'in_position', 'in_color', 'in_size', 'in_life')
    ])

    # Simple perspective matrix
    def get_perspective_matrix(fov, aspect, near, far):
        f = 1.0 / math.tan(math.radians(fov) / 2.0)
        m = np.zeros((4,4), dtype='f4')
        m[0,0] = f / aspect
        m[1,1] = f
        m[2,2] = (far + near) / (near - far)
        m[2,3] = -1.0
        m[3,2] = (2.0 * far * near) / (near - far)
        return m

    # Simple view matrix looking at origin (0,0,0)
    def get_view_matrix(dist, pitch, yaw):
        # Calculate camera location
        cx = dist * math.cos(pitch) * math.sin(yaw)
        cy = dist * math.sin(pitch)
        cz = dist * math.cos(pitch) * math.cos(yaw)

        # Standard LookAt calculation simplified for target at (0,0,0)
        camera_pos = np.array([cx, cy, cz])
        look_target = np.array([0.0, 0.0, 0.0])
        up_dir = np.array([0.0, 1.0, 0.0])

        z_axis = camera_pos - look_target
        z_axis = z_axis / np.linalg.norm(z_axis)

        x_axis = np.cross(up_dir, z_axis)
        x_axis = x_axis / np.linalg.norm(x_axis)

        y_axis = np.cross(z_axis, x_axis)
        
        m_rot = np.identity(4, dtype='f4')
        m_rot[0, 0:3] = x_axis
        m_rot[1, 0:3] = y_axis
        m_rot[2, 0:3] = z_axis

        m_trans = np.identity(4, dtype='f4')
        m_trans[0:3, 3] = -camera_pos

        return m_rot @ m_trans

    proj_mat = get_perspective_matrix(60.0, WIDTH/HEIGHT, 1.0, 1500.0)
    prog['m_proj'].write(proj_mat.tobytes())

    running = True
    while running:
        dt = clock.tick(60) / 16.666
        sim_dt = dt * SLOW_MO_FACTOR if slow_mo else dt

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key in [pygame.K_ESCAPE, pygame.K_q]:
                    running = False
                elif event.key == pygame.K_SPACE:
                    slow_mo = not slow_mo
                elif event.key == pygame.K_r:
                    system.reset_explosion()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:
                    is_dragging = True
                    last_mouse = event.pos
            elif event.type == pygame.MOUSEBUTTONUP:
                if event.button == 1:
                    is_dragging = False
            elif event.type == pygame.MOUSEMOTION:
                if is_dragging:
                    dx, dy = event.pos[0] - last_mouse[0], event.pos[1] - last_mouse[1]
                    cam_yaw += dx * 0.005
                    cam_pitch = max(-math.pi/2.2, min(math.pi/2.2, cam_pitch + dy * 0.005))
                    last_mouse = event.pos

        # Keyboard camera update fallback
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:  cam_yaw -= 0.02
        if keys[pygame.K_RIGHT]: cam_yaw += 0.02
        if keys[pygame.K_UP]:    cam_pitch = min(math.pi/2.2, cam_pitch + 0.02)
        if keys[pygame.K_DOWN]:  cam_pitch = max(-math.pi/2.2, cam_pitch - 0.02)

        # Update physics
        system.update(sim_dt)

        # Draw frame
        ctx.clear(0.04, 0.04, 0.05, 1.0) # deep clean dark backbuffer

        view_mat = get_view_matrix(cam_dist, cam_pitch, cam_yaw)
        prog['m_view'].write(view_mat.tobytes())

        # Bind buffer with fresh values and Draw
        vbo.write(system.get_vbo_data())
        vao.render(moderngl.POINTS)

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
`;
}
