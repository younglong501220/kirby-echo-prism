import { Rect, PuzzleObject } from '../types/game';

export interface EntityPhysical {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facing: 1 | -1;
}

export function checkAABB(r1: Rect, r2: Rect): boolean {
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}

export function checkCircleRect(cx: number, cy: number, cr: number, rect: Rect): boolean {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const distX = cx - closestX;
  const distY = cy - closestY;
  return distX * distX + distY * distY < cr * cr;
}

export function resolveEntityMapCollision(
  entity: EntityPhysical,
  blocks: Rect[],
  puzzles: PuzzleObject[]
): { bumpedCeiling: boolean; landedGround: boolean } {
  entity.grounded = false;
  let bumpedCeiling = false;
  let landedGround = false;

  const solidRects: Rect[] = [...blocks];

  // Active puzzle barriers are also solid
  puzzles.forEach((p) => {
    if (p.state === 'active') {
      if (p.type === 'vine' || p.type === 'ice_block' || p.type === 'locked_gate' || p.type === 'fuse_bomb') {
        solidRects.push({ x: p.x, y: p.y, w: p.w, h: p.h });
      } else if (p.type === 'ground_stake') {
        const stakeHeight = p.currentY ? p.h - p.currentY : p.h;
        if (stakeHeight > 4) {
          solidRects.push({ x: p.x, y: p.y + (p.currentY || 0), w: p.w, h: stakeHeight });
        }
      } else if (p.type === 'heavy_boulder') {
        solidRects.push({ x: p.currentX || p.x, y: p.y, w: p.w, h: p.h });
      }
    }
  });

  // Vertical pass
  for (const block of solidRects) {
    if (
      entity.x + entity.r * 0.7 > block.x &&
      entity.x - entity.r * 0.7 < block.x + block.w
    ) {
      // Landing on top
      if (
        entity.vy >= 0 &&
        entity.y + entity.r >= block.y &&
        entity.y - entity.r < block.y + 16
      ) {
        entity.y = block.y - entity.r;
        entity.vy = 0;
        entity.grounded = true;
        landedGround = true;
      }
      // Hitting ceiling
      else if (
        entity.vy < 0 &&
        entity.y - entity.r <= block.y + block.h &&
        entity.y + entity.r > block.y + block.h - 16
      ) {
        entity.y = block.y + block.h + entity.r;
        entity.vy = 0;
        bumpedCeiling = true;
      }
    }
  }

  // Horizontal pass
  for (const block of solidRects) {
    if (
      entity.y + entity.r * 0.7 > block.y &&
      entity.y - entity.r * 0.7 < block.y + block.h
    ) {
      // Hitting left of block
      if (
        entity.vx > 0 &&
        entity.x + entity.r >= block.x &&
        entity.x - entity.r < block.x
      ) {
        entity.x = block.x - entity.r;
        entity.vx = 0;
      }
      // Hitting right of block
      else if (
        entity.vx < 0 &&
        entity.x - entity.r <= block.x + block.w &&
        entity.x + entity.r > block.x + block.w
      ) {
        entity.x = block.x + block.w + entity.r;
        entity.vx = 0;
      }
    }
  }

  return { bumpedCeiling, landedGround };
}
