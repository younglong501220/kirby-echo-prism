import { AbilityType, SpiritColor, EnemyType } from '../../types/game';

export class CompanionEntity {
  public id: string;
  public name: string;
  public color: SpiritColor;
  public ability: AbilityType;
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public r: number = 14;
  public facing: 1 | -1 = 1;
  public grounded: boolean = false;
  public hp: number = 8;
  public maxHp: number = 8;
  public attackCooldown: number = 0;
  public attackAnimTimer: number = 0;
  public walkAnimFrame: number = 0;
  public warpInTimer: number = 25; // sparkle warp animation
  public isPushing: boolean = false;

  constructor(id: string, name: string, color: SpiritColor, ability: AbilityType, startX: number, startY: number) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.ability = ability;
    this.x = startX;
    this.y = startY;
  }

  public updateAI(
    playerX: number,
    playerY: number,
    enemies: { x: number; y: number; hp: number; type: EnemyType }[],
    coopPlates: { x: number; y: number; occupied: boolean }[],
    boulder: { x: number; y: number; active: boolean } | null
  ): { wantsAttack: boolean; attackType: AbilityType } {
    if (this.warpInTimer > 0) {
      this.warpInTimer--;
      return { wantsAttack: false, attackType: this.ability };
    }
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.attackAnimTimer > 0) this.attackAnimTimer--;

    let wantsAttack = false;
    this.isPushing = false;

    // 1. Cooperative Puzzle Prioritization: If near a heavy boulder, help push!
    if (boulder && boulder.active && Math.abs(this.x - (boulder.x - 20)) < 160) {
      const targetX = boulder.x - 24;
      if (Math.abs(this.x - targetX) > 10) {
        this.vx = targetX > this.x ? 2.5 : -2.5;
        this.facing = this.vx > 0 ? 1 : -1;
      } else {
        this.vx = 1.5; // pushing forward
        this.facing = 1;
        this.isPushing = true;
      }
      if (this.grounded && Math.random() < 0.05) this.vy = -4;
    }
    // 2. Co-op Plate Prioritization: If there's an unoccupied pressure plate in this room
    else {
      const freePlate = coopPlates.find(p => !p.occupied);
      if (freePlate && Math.hypot(this.x - freePlate.x, this.y - freePlate.y) < 260) {
        freePlate.occupied = true;
        const targetX = freePlate.x;
        if (Math.abs(this.x - targetX) > 8) {
          this.vx = targetX > this.x ? 2.2 : -2.2;
          this.facing = this.vx > 0 ? 1 : -1;
        } else {
          this.vx *= 0.5;
        }
      }
      // 3. Combat: Look for nearest enemy within 180px
      else {
        let nearestEnemy: { x: number; y: number; hp: number } | null = null;
        let minDist = 180;

        for (const e of enemies) {
          const d = Math.hypot(this.x - e.x, this.y - e.y);
          if (d < minDist) {
            minDist = d;
            nearestEnemy = e;
          }
        }

        if (nearestEnemy) {
          this.facing = nearestEnemy.x > this.x ? 1 : -1;
          const distToEnemy = Math.abs(nearestEnemy.x - this.x);

          if (distToEnemy > 45) {
            this.vx = (nearestEnemy.x > this.x ? 2.6 : -2.6);
          } else {
            this.vx *= 0.5;
          }

          if (distToEnemy < 100 && this.attackCooldown <= 0) {
            wantsAttack = true;
            this.attackCooldown = 50 + Math.floor(Math.random() * 25);
            this.attackAnimTimer = 16;
          }

          // Jump if enemy is higher
          if (nearestEnemy.y < this.y - 30 && this.grounded && Math.random() < 0.08) {
            this.vy = -6.5;
          }
        }
        // 4. Follow Player
        else {
          const distToPlayer = Math.hypot(this.x - playerX, this.y - playerY);
          if (distToPlayer > 60) {
            this.vx = (playerX > this.x ? 2.4 : -2.4);
            this.facing = this.vx > 0 ? 1 : -1;
          } else {
            this.vx *= 0.6;
          }

          if (playerY < this.y - 40 && this.grounded && Math.random() < 0.05) {
            this.vy = -6.5;
          }
        }
      }
    }

    if (Math.abs(this.vx) > 0.4 && this.grounded) {
      this.walkAnimFrame += 0.25;
    } else {
      this.walkAnimFrame = 0;
    }

    return { wantsAttack, attackType: this.ability };
  }
}
