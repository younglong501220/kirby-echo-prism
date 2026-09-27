import { AbilityType, EnemyType } from '../../types/game';
import { PLAYER_PHYSICS } from '../constants';

export class PlayerEntity {
  public x: number = 300;
  public y: number = 260;
  public vx: number = 0;
  public vy: number = 0;
  public r: number = 14;
  public baseR: number = 14;
  public facing: 1 | -1 = 1;
  public grounded: boolean = false;
  
  public hp: number = 10;
  public maxHp: number = 10;
  public battery: number = 3;
  public maxBattery: number = 3;

  public ability: AbilityType = 'normal';
  public mouthFull: EnemyType | null = null;
  public mouthFullAbility: AbilityType | null = null;

  public isFloating: boolean = false;
  public isSliding: boolean = false;
  public slideTimer: number = 0;

  public isInhaling: boolean = false;
  public attackCooldown: number = 0;
  public attackActionTimer: number = 0; // for flame breath, sword slash animation, etc.
  public swordCombo: number = 0;

  public invulnerableTimer: number = 0;
  public walkAnimFrame: number = 0;
  public squishX: number = 1;
  public squishY: number = 1;

  public phoneCallingTimer: number = 0;

  constructor(startX: number = 300, startY: number = 260) {
    this.x = startX;
    this.y = startY;
  }

  public takeDamage(amount: number, knockbackDir: 1 | -1 = 1): boolean {
    if (this.invulnerableTimer > 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableTimer = PLAYER_PHYSICS.INVULNERABILITY_FRAMES;
    this.vx = -knockbackDir * 3.5;
    this.vy = -3.5;
    this.isFloating = false;
    this.isInhaling = false;
    this.squishX = 0.7;
    this.squishY = 1.3;
    return true;
  }

  public heal(amount: number) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  public addBattery(amount: number = 1) {
    this.battery = Math.min(this.maxBattery, this.battery + amount);
  }

  public updateAnimation() {
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.attackActionTimer > 0) this.attackActionTimer--;
    if (this.phoneCallingTimer > 0) this.phoneCallingTimer--;

    // Radius depends on puff/floating or mouth full
    if (this.isFloating || this.mouthFull) {
      this.r = 18;
    } else {
      this.r = this.baseR;
    }

    // Walking animation
    if (Math.abs(this.vx) > 0.4 && this.grounded) {
      this.walkAnimFrame += 0.25;
    } else {
      this.walkAnimFrame = 0;
    }

    // Smooth squish recovery
    this.squishX += (1 - this.squishX) * 0.18;
    this.squishY += (1 - this.squishY) * 0.18;
  }
}
