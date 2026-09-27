import { RoomData, Projectile, Particle, DroppedStar, IngameItem, AbilityType } from '../types/game';
import { INITIAL_ROOMS } from './worldData';
import { PlayerEntity } from './entities/player';
import { CompanionEntity } from './entities/companion';
import { EnemyEntity } from './entities/enemies';
import { GameRenderer } from './renderer';
import { soundManager } from '../audio/soundManager';
import { resolveEntityMapCollision, checkAABB, checkCircleRect } from './physics';
import { PLAYER_PHYSICS } from './constants';

export class GameEngine {
  public rooms: Map<string, RoomData> = new Map();
  public currentRoomId: string = 'room_sanctuary_hub';
  public visitedRoomIds: Set<string> = new Set(['room_sanctuary_hub']);
  public collectedShards: boolean[] = [false, false, false, false, false, false, false, false];

  public player: PlayerEntity;
  public companions: CompanionEntity[] = [];
  public enemies: EnemyEntity[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public droppedStars: DroppedStar[] = [];
  public items: IngameItem[] = [];

  public renderer: GameRenderer;
  private projectileIdCounter: number = 0;
  private itemIdCounter: number = 0;
  private enemyIdCounter: number = 0;

  // Key tracking
  public keys: Record<string, boolean> = {};
  public lastJumpPress: boolean = false;
  public lastAttackPress: boolean = false;
  public lastPhonePress: boolean = false;
  public lastDropPress: boolean = false;

  // Callbacks for UI updates
  public onStateChange?: () => void;
  public onShardCollected?: (shardIndex: number) => void;
  public onVictory?: () => void;

  constructor() {
    INITIAL_ROOMS.forEach(r => {
      // Deep clone room data so state changes are tracked
      this.rooms.set(r.id, JSON.parse(JSON.stringify(r)));
    });

    this.player = new PlayerEntity(300, 260);
    this.renderer = new GameRenderer();
    this.loadRoom('room_sanctuary_hub', 300, 260);
  }

  public get currentRoom(): RoomData {
    return this.rooms.get(this.currentRoomId)!;
  }

  public loadRoom(roomId: string, targetX: number, targetY: number) {
    this.currentRoomId = roomId;
    this.visitedRoomIds.add(roomId);
    this.player.x = targetX;
    this.player.y = targetY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isFloating = false;
    this.player.isInhaling = false;

    // Reset temporary projectiles and particles
    this.projectiles = [];
    this.droppedStars = [];
    this.items = [];

    // Respawn enemies in room
    const room = this.currentRoom;
    this.enemies = room.enemies.map(e => {
      this.enemyIdCounter++;
      return new EnemyEntity(this.enemyIdCounter, e.type, e.x, e.y, e.initialFacing || 1);
    });

    // Reposition active companions near player
    this.companions.forEach((c, idx) => {
      c.x = targetX - (idx + 1) * 25 * this.player.facing;
      c.y = targetY;
      c.vx = 0;
      c.vy = 0;
      c.warpInTimer = 15;
    });

    // Play appropriate BGM
    if (room.theme === 'sanctuary') {
      soundManager.startBGM('sanctuary');
    } else if (room.theme === 'core') {
      soundManager.startBGM('boss');
    } else {
      soundManager.startBGM('adventure');
    }

    if (this.onStateChange) this.onStateChange();
  }

  public callCompanions() {
    if (this.player.battery <= 0) return;
    this.player.battery--;
    this.player.phoneCallingTimer = 40;
    soundManager.playPhoneRing();

    // If companions are already out, rally them to player
    if (this.companions.length > 0) {
      this.companions.forEach((c, idx) => {
        c.x = this.player.x - (idx + 1) * 28 * this.player.facing;
        c.y = this.player.y - 30;
        c.vx = 0;
        c.vy = -3;
        c.warpInTimer = 20;
      });
      return;
    }

    // Summon 3 clone spirits (Flare, Leaf, Wave)
    const flare = new CompanionEntity(
      'comp_flare',
      '烈焰光靈',
      'yellow',
      'fire',
      this.player.x - 30,
      this.player.y - 20
    );
    const leaf = new CompanionEntity(
      'comp_leaf',
      '飛刃光靈',
      'green',
      'cutter',
      this.player.x + 30,
      this.player.y - 20
    );
    const wave = new CompanionEntity(
      'comp_wave',
      '巨槌光靈',
      'blue',
      'hammer',
      this.player.x - 55,
      this.player.y - 20
    );

    this.companions = [flare, leaf, wave];
    soundManager.playWarp();
    this.spawnSparkleParticles(this.player.x, this.player.y, 20, '#f1c40f');
    if (this.onStateChange) this.onStateChange();
  }

  public dropCurrentAbility() {
    if (this.player.ability === 'normal') return;
    const oldAbility = this.player.ability;
    this.player.ability = 'normal';

    // Spawn bouncing ability star
    this.droppedStars.push({
      x: this.player.x,
      y: this.player.y - 12,
      vx: this.player.facing * 3.5,
      vy: -4,
      ability: oldAbility,
      timer: 360 // 6 seconds
    });
    soundManager.playAirSpit();
    if (this.onStateChange) this.onStateChange();
  }

  public update() {
    this.handlePlayerInput();
    this.updatePlayerPhysics();
    this.updateCompanions();
    this.updateEnemies();
    this.updateProjectiles();
    this.updatePuzzles();
    this.updateChests();
    this.updateDroppedEntities();
    this.updateParticles();
  }

  private handlePlayerInput() {
    const p = this.player;

    // Call Phone: C key
    if (this.keys['c'] && !this.lastPhonePress) {
      this.callCompanions();
    }
    this.lastPhonePress = !!this.keys['c'];

    // Discard Ability: K or X key
    if ((this.keys['k'] || this.keys['x']) && !this.lastDropPress) {
      this.dropCurrentAbility();
    }
    this.lastDropPress = !!(this.keys['k'] || this.keys['x']);

    // Left / Right Movement
    const left = this.keys['arrowleft'] || this.keys['a'];
    const right = this.keys['arrowright'] || this.keys['d'];
    const down = this.keys['arrowdown'] || this.keys['s'];
    const up = this.keys['arrowup'] || this.keys['w'];
    const attack = this.keys['j'] || this.keys['z'];
    const jump = this.keys[' '] || this.keys['k'] === undefined ? (this.keys['w'] || this.keys['arrowup'] || this.keys[' ']) : false;

    // Slide kick (Down + Attack or Down + Jump when grounded)
    if (down && attack && p.grounded && !p.isSliding && p.slideTimer <= 0) {
      p.isSliding = true;
      p.slideTimer = PLAYER_PHYSICS.SLIDE_DURATION;
      p.vx = p.facing * PLAYER_PHYSICS.SLIDE_SPEED;
      soundManager.playFloatPuff();
      this.spawnSparkleParticles(p.x, p.y + 10, 6, '#ffffff');
    }

    if (p.isSliding) {
      p.slideTimer--;
      if (p.slideTimer <= 0) p.isSliding = false;
      return; // in slide lock
    }

    // Swallow full mouth: Press Down/S
    if (down && p.mouthFull) {
      const absorbed = p.mouthFullAbility || 'normal';
      p.ability = absorbed;
      p.mouthFull = null;
      p.mouthFullAbility = null;
      soundManager.playSwallow();
      this.spawnSparkleParticles(p.x, p.y, 16, '#f1c40f');
      if (this.onStateChange) this.onStateChange();
    }

    // Walking / Running
    if (left) {
      p.vx = -PLAYER_PHYSICS.WALK_SPEED;
      p.facing = -1;
    } else if (right) {
      p.vx = PLAYER_PHYSICS.WALK_SPEED;
      p.facing = 1;
    } else {
      p.vx *= 0.65;
    }

    // Jump & Float mechanics
    const jumpPressed = this.keys['w'] || this.keys['arrowup'] || this.keys[' '];
    if (jumpPressed && !this.lastJumpPress) {
      if (p.grounded) {
        p.vy = PLAYER_PHYSICS.JUMP_IMPULSE;
        p.grounded = false;
        p.squishX = 0.8;
        p.squishY = 1.25;
        soundManager.playJump();
      } else {
        // Aerial puff floating!
        p.isFloating = true;
        p.vy = PLAYER_PHYSICS.FLOAT_IMPULSE;
        p.squishX = 1.2;
        p.squishY = 0.8;
        soundManager.playFloatPuff();
      }
    }
    this.lastJumpPress = jumpPressed;

    // Inhale / Attack
    if (attack) {
      this.executePlayerAttack();
    } else {
      p.isInhaling = false;
    }
  }

  private executePlayerAttack() {
    const p = this.player;

    // If currently floating, attacking exhales the air bullet and cancels flight!
    if (p.isFloating) {
      p.isFloating = false;
      this.spawnProjectile('air', p.x + p.facing * 18, p.y, p.facing * 6.5, 0, 7, true, 1);
      soundManager.playAirSpit();
      return;
    }

    // Normal Ability
    if (p.ability === 'normal') {
      if (p.mouthFull) {
        // Spit out piercing Star Bullet!
        if (p.attackCooldown <= 0) {
          this.spawnProjectile('star', p.x + p.facing * 20, p.y, p.facing * 8.5, 0, 10, true, 4, true);
          p.mouthFull = null;
          p.mouthFullAbility = null;
          p.attackCooldown = 18;
          soundManager.playStarShoot();
          this.renderer.triggerShake(3);
        }
      } else {
        // Continuous Inhale Vortex!
        p.isInhaling = true;
        soundManager.playInhaleLoop();
        this.processInhaleVortex();
      }
      return;
    }

    if (p.attackCooldown > 0) return;

    // Sword Ability
    if (p.ability === 'sword') {
      p.attackCooldown = 16;
      p.attackActionTimer = 12;
      p.swordCombo = (p.swordCombo + 1) % 3;
      this.spawnProjectile('sword_beam', p.x + p.facing * 22, p.y, p.facing * 5.5, 0, 14, true, 3);
      soundManager.playSwordSlash();
      this.renderer.triggerShake(2);
    }
    // Fire Ability
    else if (p.ability === 'fire') {
      p.attackCooldown = 12;
      p.attackActionTimer = 10;
      this.spawnProjectile('fire_ball', p.x + p.facing * 22, p.y + (Math.random() - 0.5) * 6, p.facing * 6.8, (Math.random() - 0.5) * 1.5, 11, true, 3);
      soundManager.playFire();
    }
    // Hammer Ability
    else if (p.ability === 'hammer') {
      p.attackCooldown = 28;
      p.attackActionTimer = 20;
      this.spawnProjectile('hammer_wave', p.x + p.facing * 26, p.y + 6, p.facing * 3.5, 0, 18, true, 6);
      soundManager.playHammerSmash();
      this.renderer.triggerShake(8);
    }
    // Spark Ability
    else if (p.ability === 'spark') {
      p.attackCooldown = 15;
      p.attackActionTimer = 12;
      this.spawnProjectile('spark_ring', p.x, p.y, p.facing * 6.0, 0, 14, true, 3);
      soundManager.playSpark();
    }
    // Cutter Ability
    else if (p.ability === 'cutter') {
      p.attackCooldown = 22;
      this.spawnProjectile('cutter_blade', p.x + p.facing * 20, p.y, p.facing * 7.0, 0, 11, true, 3);
      soundManager.playCutter();
    }
  }

  private processInhaleVortex() {
    const p = this.player;
    const reach = 85;
    const mouthX = p.x + p.facing * 14;
    const mouthY = p.y;

    // Check dropped ability stars
    for (let i = this.droppedStars.length - 1; i >= 0; i--) {
      const star = this.droppedStars[i];
      const dx = star.x - mouthX;
      const dy = star.y - mouthY;
      const inFront = p.facing === 1 ? dx > 0 : dx < 0;

      if (inFront && Math.hypot(dx, dy) < reach) {
        star.x -= dx * 0.22;
        star.y -= dy * 0.22;
        if (Math.hypot(dx, dy) < 18) {
          p.mouthFull = 'waddle'; // dummy type
          p.mouthFullAbility = star.ability;
          this.droppedStars.splice(i, 1);
          soundManager.playSwallow();
          return;
        }
      }
    }

    // Check enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.type === 'boss_golem' || e.type === 'boss_shadow') continue; // bosses cannot be inhaled directly

      const dx = e.x - mouthX;
      const dy = e.y - mouthY;
      const inFront = p.facing === 1 ? dx > 0 : dx < 0;

      if (inFront && Math.hypot(dx, dy) < reach) {
        e.x -= dx * 0.24;
        e.y -= dy * 0.24;
        if (Math.hypot(dx, dy) < 18) {
          p.mouthFull = e.type;
          p.mouthFullAbility = e.getDropAbility();
          this.enemies.splice(i, 1);
          soundManager.playSwallow();
          this.spawnSparkleParticles(mouthX, mouthY, 12, '#ffffff');
          return;
        }
      }
    }
  }

  private updatePlayerPhysics() {
    const p = this.player;
    const room = this.currentRoom;

    // Gravity
    p.vy += p.isFloating ? PLAYER_PHYSICS.FLOAT_GRAVITY : PLAYER_PHYSICS.GRAVITY;
    if (p.isFloating && p.vy > PLAYER_PHYSICS.MAX_FLOAT_FALL_SPEED) {
      p.vy = PLAYER_PHYSICS.MAX_FLOAT_FALL_SPEED;
    } else if (p.vy > PLAYER_PHYSICS.MAX_FALL_SPEED) {
      p.vy = PLAYER_PHYSICS.MAX_FALL_SPEED;
    }

    p.x += p.vx;
    p.y += p.vy;

    const col = resolveEntityMapCollision(p, room.blocks, room.puzzles);
    if (col.landedGround) {
      p.isFloating = false;
    }

    // Check Door transition
    const upPressed = this.keys['w'] || this.keys['arrowup'];
    for (const door of room.doors) {
      const dist = Math.hypot(p.x - (door.x + door.w / 2), p.y - (door.y + door.h / 2));
      if (dist < 26 && (upPressed || dist < 14)) {
        soundManager.playWarp();
        this.loadRoom(door.targetRoomId, door.targetX, door.targetY);
        return;
      }
    }

    // Lava / Spike hazard damage
    if (room.spikes) {
      for (const sp of room.spikes) {
        if (checkCircleRect(p.x, p.y, p.r, sp)) {
          p.takeDamage(2, p.facing);
          soundManager.playHit();
          this.renderer.triggerShake(5);
        }
      }
    }

    p.updateAnimation();
  }

  private updateCompanions() {
    const p = this.player;
    const room = this.currentRoom;

    // Track co-op plates
    const coopPlates = room.puzzles
      .filter(pz => pz.type === 'coop_plate')
      .map(pz => ({ x: pz.x + pz.w / 2, y: pz.y, occupied: false }));

    const boulder = room.puzzles.find(pz => pz.type === 'heavy_boulder' && pz.state === 'active');
    const boulderData = boulder ? { x: boulder.currentX || boulder.x, y: boulder.y, active: true } : null;

    for (let i = this.companions.length - 1; i >= 0; i--) {
      const comp = this.companions[i];
      const ai = comp.updateAI(
        p.x,
        p.y,
        this.enemies.map(e => ({ x: e.x, y: e.y, hp: e.hp, type: e.type })),
        coopPlates,
        boulderData
      );

      // Gravity
      comp.vy += 0.38;
      if (comp.vy > 7) comp.vy = 7;
      comp.x += comp.vx;
      comp.y += comp.vy;
      resolveEntityMapCollision(comp, room.blocks, room.puzzles);

      // Attack execution
      if (ai.wantsAttack) {
        if (ai.attackType === 'fire') {
          this.spawnProjectile('fire_ball', comp.x + comp.facing * 18, comp.y, comp.facing * 6, 0, 10, true, 2);
          soundManager.playFire();
        } else if (ai.attackType === 'cutter') {
          this.spawnProjectile('cutter_blade', comp.x + comp.facing * 18, comp.y, comp.facing * 6.5, 0, 10, true, 2);
          soundManager.playCutter();
        } else if (ai.attackType === 'hammer') {
          this.spawnProjectile('hammer_wave', comp.x + comp.facing * 20, comp.y, comp.facing * 4, 0, 14, true, 3);
          soundManager.playHammerSmash();
        }
      }

      // Health sharing with player if in contact
      if (Math.hypot(p.x - comp.x, p.y - comp.y) < 26 && p.hp < p.maxHp && comp.hp > 2) {
        // Face to face health kiss/share!
        p.heal(1);
        comp.hp = Math.max(1, comp.hp - 1);
        soundManager.playHealthShare();
        this.spawnSparkleParticles((p.x + comp.x) / 2, (p.y + comp.y) / 2, 8, '#ff7aa2');
      }
    }
  }

  private updateEnemies() {
    const p = this.player;
    const room = this.currentRoom;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const ai = e.updateAI(p.x, p.y);

      if (ai.attackSpawn) {
        this.spawnProjectile(
          ai.attackSpawn.type as Projectile['type'],
          ai.attackSpawn.x,
          ai.attackSpawn.y,
          ai.attackSpawn.vx,
          ai.attackSpawn.vy,
          9,
          false,
          1
        );
      }

      // Gravity for non-bosses
      if (e.type !== 'boss_shadow' && e.type !== 'cutter_bird') {
        e.vy += 0.38;
        if (e.vy > 7) e.vy = 7;
        e.x += e.vx;
        e.y += e.vy;
        resolveEntityMapCollision(e, room.blocks, room.puzzles);
      }

      // Check collision with player
      if (checkCircleRect(p.x, p.y, p.r, { x: e.x - e.r, y: e.y - e.r, w: e.r * 2, h: e.r * 2 })) {
        if (p.isSliding) {
          // Slide kick damages enemy!
          e.hp -= 2;
          soundManager.playHit();
          this.spawnSparkleParticles(e.x, e.y, 10, '#f1c40f');
          if (e.hp <= 0) {
            this.handleEnemyDefeat(e, i);
          }
        } else {
          // Player takes damage
          p.takeDamage(1, p.x > e.x ? -1 : 1);
          soundManager.playHit();
          this.renderer.triggerShake(4);
        }
      }
    }
  }

  private handleEnemyDefeat(e: EnemyEntity, index: number) {
    this.enemies.splice(index, 1);
    soundManager.playHit();
    this.spawnSparkleParticles(e.x, e.y, 25, '#f1c40f');
    this.renderer.triggerShake(6);

    // Drop food or ability
    if (e.type === 'boss_shadow') {
      soundManager.playShardGet();
      this.renderer.triggerShake(12);
      if (this.onVictory) this.onVictory();
    } else if (e.type === 'boss_golem') {
      // Drop Maxim Tomato
      this.spawnItem('tomato', e.x, e.y);
    } else if (Math.random() < 0.4) {
      this.spawnItem('apple', e.x, e.y);
    }
  }

  private updateProjectiles() {
    const room = this.currentRoom;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life--;

      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Hit enemies
      if (proj.fromPlayer) {
        for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
          const e = this.enemies[ei];
          if (Math.hypot(proj.x - e.x, proj.y - e.y) < proj.r + e.r) {
            e.hp -= proj.damage;
            soundManager.playHit();
            this.spawnSparkleParticles(e.x, e.y, 8, '#ffffff');

            if (!proj.piercing) {
              this.projectiles.splice(i, 1);
              break;
            }

            if (e.hp <= 0) {
              this.handleEnemyDefeat(e, ei);
            }
          }
        }
      } else {
        // Enemy projectile hits player
        if (Math.hypot(proj.x - this.player.x, proj.y - this.player.y) < proj.r + this.player.r) {
          this.player.takeDamage(proj.damage, this.player.x > proj.x ? -1 : 1);
          soundManager.playHit();
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Check puzzle interactions with projectile
      this.checkProjectilePuzzleInteractions(proj, i);
    }
  }

  private checkProjectilePuzzleInteractions(proj: Projectile, projIdx: number) {
    const room = this.currentRoom;

    for (const pz of room.puzzles) {
      if (pz.state === 'cleared') continue;

      const pzRect = { x: pz.x, y: pz.y, w: pz.w, h: pz.h };
      if (!checkCircleRect(proj.x, proj.y, proj.r, pzRect)) continue;

      // 1. Vine sliced by Sword or Cutter
      if (pz.type === 'vine' && (proj.type === 'sword_beam' || proj.type === 'cutter_blade')) {
        pz.state = 'cleared';
        soundManager.playSwordSlash();
        this.spawnSparkleParticles(pz.x + pz.w / 2, pz.y + pz.h / 2, 18, '#2ecc71');
        this.unlockLinkedGate(pz.targetGateId);
        soundManager.playSolveFanfare();
      }
      // 2. Ice block melted by Fire
      else if (pz.type === 'ice_block' && proj.type === 'fire_ball') {
        pz.state = 'cleared';
        soundManager.playFire();
        this.spawnSparkleParticles(pz.x + pz.w / 2, pz.y + pz.h / 2, 20, '#aed6f1');
        this.unlockLinkedGate(pz.targetGateId);
        soundManager.playSolveFanfare();
      }
      // 3. Ground stake pounded by Hammer
      else if (pz.type === 'ground_stake' && proj.type === 'hammer_wave') {
        pz.currentY = (pz.currentY || 0) + 12;
        soundManager.playHammerSmash();
        this.renderer.triggerShake(5);
        if (pz.currentY >= pz.h - 6) {
          pz.state = 'cleared';
          this.unlockLinkedGate(pz.targetGateId);
          soundManager.playSolveFanfare();
        }
      }
      // 4. Generator charged by Spark
      else if (pz.type === 'generator' && proj.type === 'spark_ring') {
        pz.state = 'charging';
        soundManager.playSpark();
        this.spawnSparkleParticles(pz.x + pz.w / 2, pz.y + 16, 20, '#f1c40f');
        this.unlockLinkedGate(pz.targetGateId);
        soundManager.playSolveFanfare();
      }
      // 5. Fuse bomb ignited by Fire
      else if (pz.type === 'fuse_bomb' && proj.type === 'fire_ball') {
        pz.state = 'cleared';
        soundManager.playFire();
        this.spawnSparkleParticles(pz.x + pz.w / 2, pz.y + pz.h / 2, 35, '#e74c3c');
        this.renderer.triggerShake(10);
        this.unlockLinkedGate(pz.targetGateId);
        soundManager.playSolveFanfare();
      }
    }
  }

  private unlockLinkedGate(gateId?: string) {
    if (!gateId) return;
    const gate = this.currentRoom.puzzles.find(p => p.id === gateId);
    if (gate) {
      gate.state = 'cleared';
    }
  }

  private updatePuzzles() {
    const p = this.player;
    const room = this.currentRoom;

    // Check Heavy Boulder: pushed by player + companions
    const boulder = room.puzzles.find(pz => pz.type === 'heavy_boulder' && pz.state === 'active');
    if (boulder) {
      const curX = boulder.currentX || boulder.x;
      // Count how many spirits are touching the boulder from the left
      let pushersCount = 0;
      if (p.x + p.r >= curX - 10 && p.x < curX && p.vx > 0) pushersCount++;
      for (const comp of this.companions) {
        if (comp.x + comp.r >= curX - 10 && comp.x < curX && comp.vx > 0) pushersCount++;
      }

      if (pushersCount >= 3) {
        boulder.currentX = curX + 2.5;
        this.renderer.triggerShake(2);
        if (boulder.currentX > boulder.x + 110) {
          boulder.state = 'cleared';
          soundManager.playHammerSmash();
          soundManager.playSolveFanfare();
          this.unlockLinkedGate(boulder.targetGateId);
        }
      }
    }

    // Check Co-op plates: all 4 must be pressed!
    const plates = room.puzzles.filter(pz => pz.type === 'coop_plate');
    if (plates.length > 0) {
      let activePlates = 0;
      for (const plate of plates) {
        const plateRect = { x: plate.x, y: plate.y, w: plate.w, h: plate.h };
        let isPressed = checkCircleRect(p.x, p.y + p.r - 2, 4, plateRect);
        if (!isPressed) {
          for (const comp of this.companions) {
            if (checkCircleRect(comp.x, comp.y + comp.r - 2, 4, plateRect)) {
              isPressed = true;
              break;
            }
          }
        }
        plate.state = isPressed ? 'depressed' : 'active';
        if (isPressed) activePlates++;
      }

      if (activePlates >= plates.length) {
        const gate = room.puzzles.find(pz => pz.id === plates[0].targetGateId);
        if (gate && gate.state === 'active') {
          gate.state = 'cleared';
          soundManager.playSolveFanfare();
        }
      }
    }
  }

  private updateChests() {
    const p = this.player;
    const room = this.currentRoom;

    for (const chest of room.chests) {
      if (chest.opened) continue;
      const dist = Math.hypot(p.x - (chest.x + chest.w / 2), p.y - (chest.y + chest.h / 2));
      if (dist < 26) {
        chest.opened = true;
        soundManager.playItemGet();
        this.spawnSparkleParticles(chest.x + chest.w / 2, chest.y, 25, '#f1c40f');

        if (chest.type === 'battery') {
          p.addBattery(1);
        } else if (chest.type === 'tomato') {
          p.heal(p.maxHp);
        } else if (chest.type === 'shard' && chest.shardIndex !== undefined) {
          this.collectedShards[chest.shardIndex] = true;
          soundManager.playShardGet();
          this.renderer.triggerShake(6);
          if (this.onShardCollected) this.onShardCollected(chest.shardIndex);
        }
        if (this.onStateChange) this.onStateChange();
      }
    }
  }

  private updateDroppedEntities() {
    const p = this.player;

    // Ability Stars bouncing on ground
    for (let i = this.droppedStars.length - 1; i >= 0; i--) {
      const s = this.droppedStars[i];
      s.vy += 0.35;
      s.x += s.vx;
      s.y += s.vy;
      s.timer--;

      // Bounce on floor
      if (s.y > 300) {
        s.y = 300;
        s.vy = -s.vy * 0.7;
        s.vx *= 0.85;
      }

      if (s.timer <= 0) {
        this.droppedStars.splice(i, 1);
        continue;
      }

      // Re-collect by touching
      if (Math.hypot(p.x - s.x, p.y - s.y) < p.r + 11 && p.ability === 'normal') {
        p.ability = s.ability;
        soundManager.playSwallow();
        this.spawnSparkleParticles(s.x, s.y, 14, '#f1c40f');
        this.droppedStars.splice(i, 1);
        if (this.onStateChange) this.onStateChange();
      }
    }

    // Ingame Items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.vy += 0.35;
      item.x += item.vx;
      item.y += item.vy;

      if (item.y > 300) {
        item.y = 300;
        item.vy = 0;
        item.vx *= 0.8;
      }

      // Pick up item
      if (Math.hypot(p.x - item.x, p.y - item.y) < p.r + 12) {
        if (item.type === 'tomato') {
          p.heal(p.maxHp);
          soundManager.playItemGet();
        } else if (item.type === 'apple') {
          p.heal(2);
          soundManager.playItemGet();
        } else if (item.type === 'battery') {
          p.addBattery(1);
          soundManager.playItemGet();
        }
        this.spawnSparkleParticles(item.x, item.y, 16, '#f1c40f');
        this.items.splice(i, 1);
        if (this.onStateChange) this.onStateChange();
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      pt.alpha = pt.life / pt.maxLife;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public spawnProjectile(
    type: Projectile['type'],
    x: number,
    y: number,
    vx: number,
    vy: number,
    r: number,
    fromPlayer: boolean,
    damage: number,
    piercing: boolean = false
  ) {
    this.projectileIdCounter++;
    this.projectiles.push({
      id: this.projectileIdCounter,
      x,
      y,
      vx,
      vy,
      r,
      type,
      fromPlayer,
      life: 55,
      maxLife: 55,
      damage,
      piercing
    });
  }

  public spawnItem(type: IngameItem['type'], x: number, y: number) {
    this.itemIdCounter++;
    this.items.push({
      id: this.itemIdCounter,
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -3.5,
      type,
      life: 600
    });
  }

  public spawnSparkleParticles(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 25 + Math.floor(Math.random() * 20),
        maxLife: 45
      });
    }
  }
}
