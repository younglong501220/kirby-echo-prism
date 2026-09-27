export type AbilityType = 'normal' | 'sword' | 'fire' | 'hammer' | 'spark' | 'cutter';

export type SpiritColor = 'pink' | 'yellow' | 'green' | 'blue';

export interface AbilityInfo {
  id: AbilityType;
  name: string;
  hatColor: string;
  hatType: 'none' | 'sword_cap' | 'fire_crown' | 'hammer_band' | 'spark_sparkle' | 'cutter_helmet';
  description: string;
  puzzleUse: string;
  icon: string;
}

export type EnemyType = 
  | 'waddle'       // basic walker, normal star
  | 'blade_knight' // drops sword
  | 'flamer'       // drops fire
  | 'sparky'       // drops spark
  | 'wood_bonker'  // drops hammer
  | 'cutter_bird'  // drops cutter
  | 'boss_golem'   // mini-boss
  | 'boss_shadow';  // final boss

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Door {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  targetRoomId: string;
  targetX: number;
  targetY: number;
  isMirrorPortal?: boolean; // ornate mirror door
  label?: string;
  requiresShardCount?: number;
}

export interface PuzzleObject {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 
    | 'vine'         // cut by sword / cutter
    | 'ice_block'    // melted by fire
    | 'ground_stake' // pounded by hammer
    | 'generator'    // charged by spark
    | 'heavy_boulder'// pushed by 3+ spirits together
    | 'coop_plate'   // pressure plate needing standing spirits
    | 'locked_gate'  // opened by puzzle trigger
    | 'fuse_bomb';   // lit by fire to blow open wall
  state: 'active' | 'cleared' | 'charging' | 'depressed';
  targetGateId?: string;
  chargeTimer?: number;
  currentX?: number; // for pushable boulders
  currentY?: number; // for pounded stakes
}

export interface Chest {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'battery' | 'tomato' | 'shard' | 'map';
  opened: boolean;
  shardIndex?: number; // 0-7
}

export interface RoomData {
  id: string;
  sectorId: string;
  name: string;
  gridX: number; // for map viewer
  gridY: number;
  width: number;
  height: number;
  theme: 'sanctuary' | 'grove' | 'forge' | 'frost' | 'ruins' | 'storm' | 'cavern' | 'core';
  bgGradient: [string, string];
  blocks: Rect[];
  doors: Door[];
  puzzles: PuzzleObject[];
  chests: Chest[];
  enemies: {
    type: EnemyType;
    x: number;
    y: number;
    initialFacing?: 1 | -1;
  }[];
  waterAreas?: Rect[];
  spikes?: Rect[];
  checkpoint?: { x: number; y: number };
}

export interface SectorInfo {
  id: string;
  name: string;
  subName: string;
  theme: RoomData['theme'];
  primaryColor: string;
  description: string;
  shardIndex: number; // 0-7
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  type: 'star' | 'air' | 'sword_beam' | 'fire_ball' | 'cutter_blade' | 'spark_ring' | 'hammer_wave' | 'enemy_bullet';
  fromPlayer: boolean;
  life: number;
  maxLife: number;
  damage: number;
  piercing?: boolean;
  ownerId?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'star' | 'sparkle' | 'smoke' | 'flame' | 'leaf';
}

export interface DroppedStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ability: AbilityType;
  timer: number;
}

export interface IngameItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'tomato' | 'battery' | 'apple' | 'shard';
  shardIndex?: number;
  life: number;
}
