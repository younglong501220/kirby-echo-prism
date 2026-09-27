import { EnemyType, AbilityType } from '../../types/game';

export class EnemyEntity {
  public id: number;
  public type: EnemyType;
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public r: number = 14;
  public facing: 1 | -1 = 1;
  public grounded: boolean = false;
  public hp: number = 2;
  public maxHp: number = 2;
  public patrolLeft: number;
  public patrolRight: number;
  public actionTimer: number = 0;
  public animFrame: number = 0;
  public isInvulnerable: number = 0;
  public bossPhase: number = 1;

  constructor(id: number, type: EnemyType, startX: number, startY: number, facing: 1 | -1 = 1) {
    this.id = id;
    this.type = type;
    this.x = startX;
    this.y = startY;
    this.facing = facing;
    this.patrolLeft = startX - 80;
    this.patrolRight = startX + 80;

    switch (type) {
      case 'waddle':
        this.hp = 2;
        this.maxHp = 2;
        this.r = 13;
        break;
      case 'blade_knight':
        this.hp = 4;
        this.maxHp = 4;
        this.r = 15;
        break;
      case 'flamer':
        this.hp = 3;
        this.maxHp = 3;
        this.r = 14;
        break;
      case 'sparky':
        this.hp = 3;
        this.maxHp = 3;
        this.r = 13;
        break;
      case 'wood_bonker':
        this.hp = 6;
        this.maxHp = 6;
        this.r = 18;
        break;
      case 'cutter_bird':
        this.hp = 3;
        this.maxHp = 3;
        this.r = 14;
        break;
      case 'boss_golem':
        this.hp = 36;
        this.maxHp = 36;
        this.r = 28;
        break;
      case 'boss_shadow':
        this.hp = 70;
        this.maxHp = 70;
        this.r = 30;
        break;
    }
  }

  public getDropAbility(): AbilityType | null {
    switch (this.type) {
      case 'blade_knight': return 'sword';
      case 'flamer': return 'fire';
      case 'sparky': return 'spark';
      case 'wood_bonker': return 'hammer';
      case 'cutter_bird': return 'cutter';
      default: return null;
    }
  }

  public updateAI(playerX: number, playerY: number): { attackSpawn?: { type: string; x: number; y: number; vx: number; vy: number } } {
    if (this.isInvulnerable > 0) this.isInvulnerable--;
    this.actionTimer++;
    this.animFrame += 0.2;

    let attackSpawn: { type: string; x: number; y: number; vx: number; vy: number } | undefined;

    // Boss Golem AI
    if (this.type === 'boss_golem') {
      this.facing = playerX > this.x ? 1 : -1;
      if (this.actionTimer % 180 === 0 && this.grounded) {
        // High jump ground pound
        this.vy = -8.5;
        this.vx = this.facing * 2.8;
      } else if (this.actionTimer % 120 === 60) {
        // Throw boulder shockwave
        attackSpawn = {
          type: 'enemy_bullet',
          x: this.x + this.facing * 24,
          y: this.y,
          vx: this.facing * 4.5,
          vy: 0
        };
      } else if (this.grounded) {
        this.vx *= 0.8;
      }
      return { attackSpawn };
    }

    // Final Boss: Shadow Prism Phantom
    if (this.type === 'boss_shadow') {
      this.facing = playerX > this.x ? 1 : -1;
      // Floats in sine wave
      this.y += Math.sin(this.actionTimer * 0.05) * 1.2;
      this.x += Math.cos(this.actionTimer * 0.03) * 1.5;

      if (this.actionTimer % 160 === 0) {
        // Dark star shot
        attackSpawn = {
          type: 'enemy_bullet',
          x: this.x + this.facing * 25,
          y: this.y,
          vx: this.facing * 4.2,
          vy: (playerY - this.y) * 0.02
        };
      } else if (this.actionTimer % 240 === 120) {
        // Triple dark pulse
        attackSpawn = {
          type: 'enemy_bullet',
          x: this.x,
          y: this.y,
          vx: this.facing * 5,
          vy: -1
        };
      }
      return { attackSpawn };
    }

    // Flying cutter bird
    if (this.type === 'cutter_bird') {
      this.facing = playerX > this.x ? 1 : -1;
      this.y += Math.sin(this.actionTimer * 0.08) * 1.5;
      this.x += this.facing * 0.9;
      if (this.actionTimer % 140 === 0 && Math.abs(playerX - this.x) < 220) {
        attackSpawn = {
          type: 'cutter_blade',
          x: this.x + this.facing * 16,
          y: this.y,
          vx: this.facing * 3.5,
          vy: 0
        };
      }
      return { attackSpawn };
    }

    // Standard ground walkers
    if (this.type === 'waddle') {
      this.vx = this.facing * 1.0;
      if (this.x < this.patrolLeft) { this.facing = 1; }
      if (this.x > this.patrolRight) { this.facing = -1; }
    } else if (this.type === 'blade_knight') {
      const dist = Math.abs(playerX - this.x);
      if (dist < 120) {
        this.facing = playerX > this.x ? 1 : -1;
        this.vx = this.facing * 1.8;
      } else {
        this.vx = this.facing * 1.0;
        if (this.x < this.patrolLeft) this.facing = 1;
        if (this.x > this.patrolRight) this.facing = -1;
      }
    } else if (this.type === 'flamer') {
      if (this.actionTimer % 110 < 40) {
        // Sudden flaming dash!
        this.vx = this.facing * 3.8;
      } else {
        this.vx = this.facing * 1.2;
      }
      if (this.x < this.patrolLeft) this.facing = 1;
      if (this.x > this.patrolRight) this.facing = -1;
    } else if (this.type === 'sparky') {
      if (this.grounded && this.actionTimer % 60 === 0) {
        this.vy = -4.5;
        this.vx = this.facing * 1.5;
      }
      if (this.x < this.patrolLeft) this.facing = 1;
      if (this.x > this.patrolRight) this.facing = -1;
    } else if (this.type === 'wood_bonker') {
      this.facing = playerX > this.x ? 1 : -1;
      if (this.actionTimer % 120 === 0 && this.grounded) {
        this.vy = -5.0;
        this.vx = this.facing * 2.2;
      } else {
        this.vx *= 0.8;
      }
    }

    return { attackSpawn };
  }
}
