import { RoomData, Projectile, Particle, DroppedStar, IngameItem, AbilityType } from '../types/game';
import { PlayerEntity } from './entities/player';
import { CompanionEntity } from './entities/companion';
import { EnemyEntity } from './entities/enemies';

export class GameRenderer {
  public screenShake: number = 0;

  public triggerShake(intensity: number = 6) {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  public render(
    ctx: CanvasRenderingContext2D,
    room: RoomData,
    player: PlayerEntity,
    companions: CompanionEntity[],
    enemies: EnemyEntity[],
    projectiles: Projectile[],
    particles: Particle[],
    droppedStars: DroppedStar[],
    items: IngameItem[],
    collectedShards: boolean[]
  ) {
    ctx.save();

    // Screen shake
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
      this.screenShake *= 0.85;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // 1. Background
    this.renderBackground(ctx, room);

    // 2. Room Blocks & Environment
    this.renderBlocks(ctx, room);

    // 3. Spikes & Hazards
    this.renderHazards(ctx, room);

    // 4. Mirror Doors
    this.renderDoors(ctx, room, collectedShards);

    // 5. Puzzle Objects
    this.renderPuzzles(ctx, room);

    // 6. Chests
    this.renderChests(ctx, room);

    // 7. Dropped Items & Ability Stars
    this.renderDroppedEntities(ctx, droppedStars, items);

    // 8. Inhale Wind Vortex
    if (player.isInhaling && !player.mouthFull && player.ability === 'normal') {
      this.renderInhaleVortex(ctx, player);
    }

    // 9. Companions
    for (const comp of companions) {
      this.renderCompanion(ctx, comp);
    }

    // 10. Enemies & Bosses
    for (const enemy of enemies) {
      this.renderEnemy(ctx, enemy);
    }

    // 11. Player Hero
    this.renderPlayer(ctx, player);

    // 12. Projectiles
    this.renderProjectiles(ctx, projectiles);

    // 13. Particles
    this.renderParticles(ctx, particles);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, room: RoomData) {
    const grad = ctx.createLinearGradient(0, 0, 0, room.height);
    grad.addColorStop(0, room.bgGradient[0]);
    grad.addColorStop(1, room.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, room.width, room.height);

    // Subtle background parallax stars or crystal pillars
    ctx.save();
    if (room.theme === 'sanctuary' || room.theme === 'core') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 20; i++) {
        const x = (i * 37) % room.width;
        const y = (i * 23 + (Date.now() * 0.015)) % (room.height - 80);
        ctx.beginPath();
        ctx.arc(x, y, (i % 3) + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (room.theme === 'grove') {
      ctx.fillStyle = 'rgba(39, 174, 96, 0.08)';
      // Giant background trees
      ctx.fillRect(80, 80, 60, room.height - 80);
      ctx.fillRect(280, 60, 80, room.height - 60);
      ctx.fillRect(480, 90, 70, room.height - 90);
    } else if (room.theme === 'forge') {
      // Magma heat glow
      ctx.fillStyle = 'rgba(231, 76, 60, 0.12)';
      ctx.fillRect(0, room.height - 100, room.width, 100);
    }
    ctx.restore();
  }

  private renderBlocks(ctx: CanvasRenderingContext2D, room: RoomData) {
    let topColor = '#4a6572';
    let bodyColor = '#344955';

    switch (room.theme) {
      case 'sanctuary':
        topColor = '#9b59b6';
        bodyColor = '#4a235a';
        break;
      case 'grove':
        topColor = '#2ecc71';
        bodyColor = '#1e8449';
        break;
      case 'forge':
        topColor = '#e67e22';
        bodyColor = '#78281f';
        break;
      case 'frost':
        topColor = '#aed6f1';
        bodyColor = '#2471a3';
        break;
      case 'ruins':
        topColor = '#f39c12';
        bodyColor = '#7e5109';
        break;
      case 'cavern':
        topColor = '#7f8c8d';
        bodyColor = '#34495e';
        break;
      case 'storm':
        topColor = '#1abc9c';
        bodyColor = '#117864';
        break;
      case 'core':
        topColor = '#e056fd';
        bodyColor = '#4834d4';
        break;
    }

    for (const b of room.blocks) {
      // Body
      ctx.fillStyle = bodyColor;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Top grass / crystal highlight
      ctx.fillStyle = topColor;
      ctx.fillRect(b.x, b.y, b.w, 4);

      // Brick pattern lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      for (let bx = b.x; bx < b.x + b.w; bx += 24) {
        ctx.beginPath();
        ctx.moveTo(bx, b.y + 4);
        ctx.lineTo(bx, b.y + b.h);
        ctx.stroke();
      }
    }
  }

  private renderHazards(ctx: CanvasRenderingContext2D, room: RoomData) {
    if (room.spikes) {
      for (const sp of room.spikes) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(sp.x, sp.y, sp.w, sp.h);
        // Lava bubbles
        ctx.fillStyle = '#f39c12';
        for (let i = sp.x + 8; i < sp.x + sp.w; i += 16) {
          const bubbleY = sp.y + Math.sin((Date.now() * 0.005) + i) * 3;
          ctx.beginPath();
          ctx.arc(i, bubbleY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private renderDoors(ctx: CanvasRenderingContext2D, room: RoomData, collectedShards: boolean[]) {
    for (const d of room.doors) {
      ctx.save();
      if (d.isMirrorPortal) {
        // Master Mirror Frame
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(d.x - 3, d.y - 3, d.w + 6, d.h + 6);

        // Ornate arch
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(d.x, d.y, d.w, d.h);

        // Swirling mirror portal interior
        const portalGrad = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
        portalGrad.addColorStop(0, '#3498db');
        portalGrad.addColorStop(0.5, '#e056fd');
        portalGrad.addColorStop(1, '#1abc9c');
        ctx.fillStyle = portalGrad;
        ctx.fillRect(d.x + 3, d.y + 3, d.w - 6, d.h - 6);

        // Ornate star crest atop mirror
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(d.x + d.w / 2, d.y - 4, 5, 0, Math.PI * 2);
        ctx.fill();

        // Label above door
        if (d.label) {
          ctx.font = '10px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#f1c40f';
          ctx.textAlign = 'center';
          ctx.fillText(d.label, d.x + d.w / 2, d.y - 12);
        }
      } else {
        // Standard wooden / stone door
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(d.x + 3, d.y + 3, d.w - 6, d.h - 6);

        if (d.label) {
          ctx.font = '10px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#ecf0f1';
          ctx.textAlign = 'center';
          ctx.fillText(d.label, d.x + d.w / 2, d.y - 6);
        }
      }
      ctx.restore();
    }
  }

  private renderPuzzles(ctx: CanvasRenderingContext2D, room: RoomData) {
    for (const p of room.puzzles) {
      if (p.state === 'cleared') continue;

      ctx.save();
      if (p.type === 'vine') {
        // Green tangled vine rope
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#2ecc71';
        for (let y = p.y + 6; y < p.y + p.h; y += 14) {
          ctx.beginPath();
          ctx.arc(p.x + (y % 4 === 0 ? 3 : 16), y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === 'ice_block') {
        // Translucent ice block with crystalline highlight
        ctx.fillStyle = 'rgba(174, 214, 241, 0.85)';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        // Ice cracks
        ctx.beginPath();
        ctx.moveTo(p.x + 6, p.y + 6);
        ctx.lineTo(p.x + p.w * 0.6, p.y + p.h * 0.4);
        ctx.lineTo(p.x + p.w - 6, p.y + p.h - 6);
        ctx.stroke();
      } else if (p.type === 'ground_stake') {
        // Iron stake with hazard stripes
        const offY = p.currentY || 0;
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(p.x, p.y + offY, p.w, p.h - offY);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(p.x, p.y + offY, p.w, 6);
      } else if (p.type === 'generator') {
        // Ancient generator
        ctx.fillStyle = '#34495e';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = p.state === 'charging' ? '#f1c40f' : '#7f8c8d';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + 16, 12, 0, Math.PI * 2);
        ctx.fill();
        if (p.state === 'charging') {
          // Electric arcs
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else if (p.type === 'heavy_boulder') {
        const curX = p.currentX || p.x;
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.arc(curX + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Weight symbol
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('4人協力', curX + p.w / 2, p.y + p.h / 2 + 4);
      } else if (p.type === 'coop_plate') {
        // Co-op floor pressure plate
        ctx.fillStyle = p.state === 'depressed' ? '#2ecc71' : '#f39c12';
        ctx.fillRect(p.x, p.y + (p.state === 'depressed' ? 4 : 0), p.w, p.state === 'depressed' ? 4 : 8);
      } else if (p.type === 'locked_gate') {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
      } else if (p.type === 'fuse_bomb') {
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        // Fuse wire
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, p.y);
        ctx.lineTo(p.x + p.w / 2 + 6, p.y - 10);
        ctx.stroke();
        // Fuse spark
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2 + 6, p.y - 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderChests(ctx: CanvasRenderingContext2D, room: RoomData) {
    for (const c of room.chests) {
      ctx.save();
      // Chest body
      ctx.fillStyle = c.opened ? '#7f8c8d' : '#f39c12';
      ctx.fillRect(c.x, c.y + (c.opened ? 6 : 0), c.w, c.h - (c.opened ? 6 : 0));
      // Golden bands
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(c.x + 4, c.y + (c.opened ? 6 : 0), 4, c.h - (c.opened ? 6 : 0));
      ctx.fillRect(c.x + c.w - 8, c.y + (c.opened ? 6 : 0), 4, c.h - (c.opened ? 6 : 0));

      if (!c.opened) {
        // Lock keyhole
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderDroppedEntities(ctx: CanvasRenderingContext2D, stars: DroppedStar[], items: IngameItem[]) {
    // Ability Stars bouncing on the ground
    for (const s of stars) {
      ctx.save();
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ability symbol inside star
      ctx.fillStyle = '#2c3e50';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.ability.substring(0, 1).toUpperCase(), s.x, s.y + 4);
      ctx.restore();
    }

    // Ingame Items (Tomato, Battery, Apple, Shard)
    for (const it of items) {
      ctx.save();
      if (it.type === 'tomato') {
        // Maxim Tomato
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(it.x, it.y, 10, 0, Math.PI * 2);
        ctx.fill();
        // Green stem
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(it.x - 2, it.y - 12, 4, 4);
        // Letter 'M'
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "Press Start 2P", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('M', it.x, it.y + 4);
      } else if (it.type === 'battery') {
        // Battery pickup
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(it.x - 6, it.y - 8, 12, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(it.x - 3, it.y - 11, 6, 3);
        ctx.fillStyle = '#f1c40f';
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', it.x, it.y + 4);
      } else if (it.type === 'shard') {
        // Glowing Mirror Shard
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(it.x, it.y - 12);
        ctx.lineTo(it.x + 8, it.y);
        ctx.lineTo(it.x, it.y + 12);
        ctx.lineTo(it.x - 8, it.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Apple
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(it.x, it.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderInhaleVortex(ctx: CanvasRenderingContext2D, player: PlayerEntity) {
    ctx.save();
    const facing = player.facing;
    const mouthX = player.x + facing * 12;
    const mouthY = player.y;

    const vortexLength = 70;
    const vortexSpread = 32;

    const grad = ctx.createRadialGradient(
      mouthX, mouthY, 5,
      mouthX + facing * vortexLength * 0.7, mouthY, vortexLength
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(mouthX, mouthY);
    ctx.lineTo(mouthX + facing * vortexLength, mouthY - vortexSpread);
    ctx.lineTo(mouthX + facing * vortexLength, mouthY + vortexSpread);
    ctx.closePath();
    ctx.fill();

    // Swirling lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const offset = ((Date.now() * 0.05 + i * 20) % vortexLength);
      ctx.beginPath();
      ctx.arc(
        mouthX + facing * offset,
        mouthY + Math.sin(offset * 0.2) * 6,
        4 + offset * 0.15,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D, p: PlayerEntity) {
    ctx.save();
    if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 1) {
      ctx.restore();
      return; // invulnerability flicker
    }

    ctx.translate(p.x, p.y);
    ctx.scale(p.squishX, p.squishY);

    const isFull = p.mouthFull !== null;
    const r = p.r;

    // Body
    ctx.fillStyle = isFull ? '#ff9db6' : '#ff7aa2';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Blush cheeks
    ctx.fillStyle = '#ff4d79';
    ctx.beginPath();
    ctx.arc(p.facing === 1 ? -4 : 4, 3, 3, 0, Math.PI * 2);
    ctx.arc(p.facing === 1 ? 8 : -8, 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e272e';
    const eyeX = p.facing === 1 ? 4 : -7;
    ctx.beginPath();
    ctx.ellipse(eyeX, -3, 2, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX, -5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth / Cheeks
    if (isFull) {
      // Puffed stuffed cheeks
      ctx.fillStyle = '#c44569';
      ctx.beginPath();
      ctx.arc(p.facing === 1 ? 6 : -6, 2, 3, 0, Math.PI);
      ctx.stroke();
    } else if (p.isInhaling) {
      // Big open inhaling mouth
      ctx.fillStyle = '#591629';
      ctx.beginPath();
      ctx.ellipse(p.facing === 1 ? 7 : -7, 1, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cute smile
      ctx.fillStyle = '#c44569';
      ctx.beginPath();
      ctx.arc(p.facing === 1 ? 4 : -4, 2, 2.5, 0, Math.PI);
      ctx.fill();
    }

    // Cute red feet
    ctx.fillStyle = '#e84118';
    const footAnim = Math.sin(p.walkAnimFrame) * 3;
    ctx.beginPath();
    ctx.ellipse(-6, r - 1 + footAnim, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(6, r - 1 - footAnim, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flapping arms when floating
    if (p.isFloating) {
      ctx.fillStyle = '#ff7aa2';
      ctx.beginPath();
      ctx.ellipse(-r, -2, 4, 3, 0.4, 0, Math.PI * 2);
      ctx.ellipse(r, -2, 4, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ability Hat
    this.renderAbilityHat(ctx, p.ability, p.facing, r);

    // Cell Phone animation if calling
    if (p.phoneCallingTimer > 0) {
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(p.facing === 1 ? 12 : -18, -18, 8, 14);
      ctx.fillStyle = '#3498db';
      ctx.fillRect(p.facing === 1 ? 13 : -17, -16, 6, 6);
      // Ring waves
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.facing === 1 ? 16 : -14, -20, 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderCompanion(ctx: CanvasRenderingContext2D, comp: CompanionEntity) {
    ctx.save();
    ctx.translate(comp.x, comp.y);

    // Warp-in sparkle ring
    if (comp.warpInTimer > 0) {
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, comp.r + comp.warpInTimer, 0, Math.PI * 2);
      ctx.stroke();
    }

    let bodyColor = '#f1c40f'; // Yellow
    if (comp.color === 'green') bodyColor = '#2ecc71';
    if (comp.color === 'blue') bodyColor = '#3498db';

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, comp.r, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e272e';
    const eyeX = comp.facing === 1 ? 4 : -7;
    ctx.beginPath();
    ctx.ellipse(eyeX, -3, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.fillStyle = '#b71540';
    ctx.beginPath();
    ctx.arc(comp.facing === 1 ? 4 : -4, 2, 2, 0, Math.PI);
    ctx.fill();

    // Feet
    ctx.fillStyle = '#d35400';
    const footAnim = Math.sin(comp.walkAnimFrame) * 3;
    ctx.beginPath();
    ctx.ellipse(-6, comp.r - 1 + footAnim, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(6, comp.r - 1 - footAnim, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hat
    this.renderAbilityHat(ctx, comp.ability, comp.facing, comp.r);

    // Name tag above head
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(comp.name, 0, -comp.r - 8);

    ctx.restore();
  }

  private renderAbilityHat(ctx: CanvasRenderingContext2D, ability: AbilityType, facing: 1 | -1, r: number) {
    if (ability === 'sword') {
      // Green hero cap
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.5);
      ctx.lineTo(r * 0.7, -r * 0.5);
      ctx.lineTo(-facing * r * 1.3, -r * 1.5);
      ctx.closePath();
      ctx.fill();
      // Golden buckle
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(facing * 3, -r * 0.6, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (ability === 'fire') {
      // Flaming crown
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, -r * 0.5);
      ctx.lineTo(-r * 0.4, -r * 1.5);
      ctx.lineTo(0, -r * 0.9);
      ctx.lineTo(r * 0.4, -r * 1.6);
      ctx.lineTo(r * 0.8, -r * 0.5);
      ctx.closePath();
      ctx.fill();
      // Inner yellow flame
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.5);
      ctx.lineTo(0, -r * 1.2);
      ctx.lineTo(r * 0.4, -r * 0.5);
      ctx.closePath();
      ctx.fill();
    } else if (ability === 'hammer') {
      // Blue headband
      ctx.fillStyle = '#3498db';
      ctx.fillRect(-r, -r * 0.7, r * 2, 5);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-facing * (r - 2), -r * 0.5, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (ability === 'spark') {
      // Spark crown
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(0, -r * 0.8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (ability === 'cutter') {
      // Golden winged helmet
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(0, -r * 0.6, 7, Math.PI, Math.PI * 2);
      ctx.fill();
      // Blade on top
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(-2, -r * 1.3, 4, 10);
    }
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, e: EnemyEntity) {
    ctx.save();
    ctx.translate(e.x, e.y);

    if (e.type === 'boss_golem') {
      // Colossal stone golem
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(-e.r, -e.r, e.r * 2, e.r * 2);
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 4;
      ctx.strokeRect(-e.r, -e.r, e.r * 2, e.r * 2);

      // Glowing rune eyes
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(e.facing === 1 ? 6 : -14, -8, 8, 8);
      // Health bar above boss
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(-30, -e.r - 16, 60 * (e.hp / e.maxHp), 6);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(-30, -e.r - 16, 60, 6);
    } else if (e.type === 'boss_shadow') {
      // Final Boss: Dark Shadow Phantom
      const pulse = Math.sin(e.animFrame) * 4;
      ctx.fillStyle = '#2c043b';
      ctx.beginPath();
      ctx.arc(0, 0, e.r + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e056fd';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Menacing violet eyes
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.ellipse(e.facing === 1 ? 8 : -14, -5, 5, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Boss Health Bar
      ctx.fillStyle = '#e056fd';
      ctx.fillRect(-40, -e.r - 18, 80 * (e.hp / e.maxHp), 7);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(-40, -e.r - 18, 80, 7);
    } else if (e.type === 'waddle') {
      // Classic cute orange companion enemy
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.arc(0, 0, e.r, 0, Math.PI * 2);
      ctx.fill();
      // Tan face
      ctx.fillStyle = '#fad390';
      ctx.beginPath();
      ctx.arc(e.facing === 1 ? 3 : -3, 0, e.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.ellipse(e.facing === 1 ? 4 : -6, -2, 1.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Feet
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.ellipse(-5, e.r - 1, 4, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(5, e.r - 1, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'blade_knight') {
      // Armored knight with sword
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(0, 0, e.r, 0, Math.PI * 2);
      ctx.fill();
      // Silver helmet visor
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(e.facing === 1 ? 0 : -8, -6, 10, 6);
      // Sword
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(e.facing === 1 ? 12 : -18, -4, 8, 3);
    } else if (e.type === 'flamer') {
      // Fire spirit
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(0, 0, e.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(0, 0, e.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'sparky') {
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(0, 0, e.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    } else if (e.type === 'wood_bonker') {
      ctx.fillStyle = '#8b5a2b';
      ctx.beginPath();
      ctx.arc(0, 0, e.r, 0, Math.PI * 2);
      ctx.fill();
      // Wooden club
      ctx.fillStyle = '#d35400';
      ctx.fillRect(e.facing === 1 ? 10 : -20, -12, 8, 22);
    } else if (e.type === 'cutter_bird') {
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(0, 0, e.r, 0, Math.PI * 2);
      ctx.fill();
      // Beak
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.moveTo(e.facing === 1 ? 8 : -8, -2);
      ctx.lineTo(e.facing === 1 ? 16 : -16, 2);
      ctx.lineTo(e.facing === 1 ? 8 : -8, 6);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D, projs: Projectile[]) {
    for (const p of projs) {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'star') {
        // Piercing yellow star
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        const rot = (Date.now() * 0.02) % (Math.PI * 2);
        for (let i = 0; i < 5; i++) {
          const a = rot + (i * Math.PI * 2) / 5;
          const aIn = a + Math.PI / 5;
          if (i === 0) ctx.moveTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
          else ctx.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
          ctx.lineTo(Math.cos(aIn) * (p.r * 0.5), Math.sin(aIn) * (p.r * 0.5));
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'fire_ball') {
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sword_beam') {
        // Crescent energy wave
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 1.3, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(-p.r * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'cutter_blade') {
        // Spinning boomerang crescent
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(0, 0, p.r, -Math.PI / 3, Math.PI / 3);
        ctx.lineTo(-p.r * 0.3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f39c12';
        ctx.stroke();
      } else if (p.type === 'spark_ring') {
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'air') {
        // Air bullet puff
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Enemy bullet
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const pt of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
