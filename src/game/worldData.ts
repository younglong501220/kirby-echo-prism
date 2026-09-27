import { RoomData } from '../types/game';

export const INITIAL_ROOMS: RoomData[] = [
  // ==========================================
  // SECTOR 0: 中央神殿 (Prism Sanctuary Hub)
  // ==========================================
  {
    id: 'room_sanctuary_hub',
    sectorId: 'sec_sanctuary',
    name: '中央稜鏡神殿',
    gridX: 4,
    gridY: 3,
    width: 640,
    height: 360,
    theme: 'sanctuary',
    bgGradient: ['#1a0933', '#311452'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 }, // floor
      { x: 0, y: 0, w: 20, h: 360 },   // left wall
      { x: 620, y: 0, w: 20, h: 360 }, // right wall
      { x: 0, y: 0, w: 640, h: 20 },   // ceiling
      // Upper sanctuary platforms
      { x: 40, y: 220, w: 120, h: 16 },
      { x: 190, y: 160, w: 110, h: 16 },
      { x: 340, y: 160, w: 110, h: 16 },
      { x: 480, y: 220, w: 120, h: 16 },
      { x: 260, y: 250, w: 120, h: 16 }, // center pedestal
    ],
    doors: [
      // 7 mirror portals to 7 outer sectors + 1 master portal
      { id: 'd_hub_grove', x: 60, y: 165, w: 36, h: 55, targetRoomId: 'room_grove_1', targetX: 60, targetY: 260, isMirrorPortal: true, label: '靜謐綠野' },
      { id: 'd_hub_forge', x: 200, y: 105, w: 36, h: 55, targetRoomId: 'room_forge_1', targetX: 60, targetY: 260, isMirrorPortal: true, label: '烈焰深窟' },
      { id: 'd_hub_frost', x: 400, y: 105, w: 36, h: 55, targetRoomId: 'room_frost_1', targetX: 60, targetY: 260, isMirrorPortal: true, label: '永凍霜峰' },
      { id: 'd_hub_ruins', x: 540, y: 165, w: 36, h: 55, targetRoomId: 'room_ruins_1', targetX: 60, targetY: 260, isMirrorPortal: true, label: '雷霆廢墟' },
      { id: 'd_hub_boulder', x: 60, y: 255, w: 36, h: 55, targetRoomId: 'room_boulder_1', targetX: 60, targetY: 260, isMirrorPortal: true, label: '巨石礦坑' },
      { id: 'd_hub_shadow', x: 160, y: 255, w: 36, h: 55, targetRoomId: 'room_shadow_1', targetX: 60, targetY: 260, isMirrorPortal: true, label: '幽影地宮' },
      { id: 'd_hub_sky', x: 440, y: 255, w: 36, h: 55, targetRoomId: 'room_sky_1', targetX: 60, targetY: 260, isMirrorPortal: true, label: '雲端空島' },
      { id: 'd_hub_core', x: 540, y: 255, w: 36, h: 55, targetRoomId: 'room_core_boss', targetX: 60, targetY: 260, isMirrorPortal: true, label: '鏡界核心' },
    ],
    puzzles: [],
    chests: [
      { id: 'chest_hub_battery', x: 300, y: 220, w: 28, h: 26, type: 'battery', opened: false }
    ],
    enemies: [],
    checkpoint: { x: 300, y: 270 }
  },

  // ==========================================
  // SECTOR 1: 靜謐綠野 (Emerald Grove)
  // ==========================================
  {
    id: 'room_grove_1',
    sectorId: 'sec_grove',
    name: '綠野入口廊道',
    gridX: 3,
    gridY: 3,
    width: 640,
    height: 360,
    theme: 'grove',
    bgGradient: ['#123524', '#205c3b'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      // Platforms
      { x: 140, y: 240, w: 100, h: 18 },
      { x: 280, y: 190, w: 110, h: 18 },
      { x: 430, y: 140, w: 130, h: 18 },
    ],
    doors: [
      { id: 'd_grove1_hub', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_sanctuary_hub', targetX: 70, targetY: 220, isMirrorPortal: true, label: '返回神殿' },
      { id: 'd_grove1_grove2', x: 570, y: 85, w: 36, h: 55, targetRoomId: 'room_grove_2', targetX: 40, targetY: 260, label: '林苑深處' }
    ],
    puzzles: [
      // Vine blocking upper ledge leading to grove 2
      { id: 'vine_grove_1', x: 410, y: 140, w: 20, h: 80, type: 'vine', state: 'active' }
    ],
    chests: [
      { id: 'chest_grove_tomato', x: 320, y: 160, w: 28, h: 26, type: 'tomato', opened: false }
    ],
    enemies: [
      { type: 'waddle', x: 200, y: 290 },
      { type: 'blade_knight', x: 330, y: 170 }, // drops sword
      { type: 'cutter_bird', x: 480, y: 120 }    // drops cutter
    ]
  },
  {
    id: 'room_grove_2',
    sectorId: 'sec_grove',
    name: '林苑祈願祭壇',
    gridX: 2,
    gridY: 3,
    width: 640,
    height: 360,
    theme: 'grove',
    bgGradient: ['#0f2c1d', '#1d4d33'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      // Gate wall
      { x: 480, y: 180, w: 24, h: 130 },
      { x: 480, y: 20, w: 24, h: 100 },
    ],
    doors: [
      { id: 'd_grove2_grove1', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_grove_1', targetX: 550, targetY: 140, label: '林道' }
    ],
    puzzles: [
      // 4-coop pressure plates! Calling companions via Phone (C) activates them!
      { id: 'plate_grove_1', x: 140, y: 302, w: 32, h: 8, type: 'coop_plate', state: 'active', targetGateId: 'gate_grove' },
      { id: 'plate_grove_2', x: 220, y: 302, w: 32, h: 8, type: 'coop_plate', state: 'active', targetGateId: 'gate_grove' },
      { id: 'plate_grove_3', x: 300, y: 302, w: 32, h: 8, type: 'coop_plate', state: 'active', targetGateId: 'gate_grove' },
      { id: 'plate_grove_4', x: 380, y: 302, w: 32, h: 8, type: 'coop_plate', state: 'active', targetGateId: 'gate_grove' },
      { id: 'gate_grove', x: 480, y: 120, w: 24, h: 60, type: 'locked_gate', state: 'active' },
    ],
    chests: [
      { id: 'chest_shard_1', x: 540, y: 280, w: 30, h: 28, type: 'shard', shardIndex: 0, opened: false }
    ],
    enemies: [
      { type: 'waddle', x: 180, y: 290 },
      { type: 'waddle', x: 340, y: 290 }
    ]
  },

  // ==========================================
  // SECTOR 2: 烈焰深窟 (Crimson Cavern)
  // ==========================================
  {
    id: 'room_forge_1',
    sectorId: 'sec_forge',
    name: '熔火迴廊',
    gridX: 3,
    gridY: 2,
    width: 640,
    height: 360,
    theme: 'forge',
    bgGradient: ['#3b110e', '#661b17'],
    blocks: [
      { x: 0, y: 310, w: 220, h: 50 },
      { x: 380, y: 310, w: 260, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      // Floating lava bridges
      { x: 180, y: 230, w: 90, h: 16 },
      { x: 320, y: 180, w: 100, h: 16 },
    ],
    spikes: [
      { x: 220, y: 340, w: 160, h: 20 } // lava pit
    ],
    doors: [
      { id: 'd_forge1_hub', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_sanctuary_hub', targetX: 210, targetY: 160, isMirrorPortal: true, label: '神殿' },
      { id: 'd_forge1_forge2', x: 570, y: 255, w: 36, h: 55, targetRoomId: 'room_forge_2', targetX: 40, targetY: 260, label: '深窟核心' }
    ],
    puzzles: [
      // Fuse bomb obstacle - ignite with Fire to blow up gate
      { id: 'fuse_bomb_1', x: 440, y: 270, w: 30, h: 40, type: 'fuse_bomb', state: 'active', targetGateId: 'gate_forge_1' },
      { id: 'gate_forge_1', x: 490, y: 230, w: 24, h: 80, type: 'locked_gate', state: 'active' }
    ],
    chests: [
      { id: 'chest_forge_battery', x: 350, y: 150, w: 28, h: 26, type: 'battery', opened: false }
    ],
    enemies: [
      { type: 'flamer', x: 220, y: 210 }, // drops fire
      { type: 'flamer', x: 400, y: 290 }
    ]
  },
  {
    id: 'room_forge_2',
    sectorId: 'sec_forge',
    name: '熔岩凍結室',
    gridX: 2,
    gridY: 2,
    width: 640,
    height: 360,
    theme: 'forge',
    bgGradient: ['#2e0c0a', '#541511'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      { x: 200, y: 230, w: 240, h: 20 }
    ],
    doors: [
      { id: 'd_forge2_forge1', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_forge_1', targetX: 540, targetY: 260, label: '熔火廊道' }
    ],
    puzzles: [
      // Giant ice block encasing the shard - melt with Fire!
      { id: 'ice_shard_2', x: 380, y: 250, w: 46, h: 60, type: 'ice_block', state: 'active' }
    ],
    chests: [
      { id: 'chest_shard_2', x: 450, y: 280, w: 30, h: 28, type: 'shard', shardIndex: 1, opened: false }
    ],
    enemies: [
      { type: 'flamer', x: 260, y: 200 },
      { type: 'waddle', x: 150, y: 290 }
    ]
  },

  // ==========================================
  // SECTOR 3: 永凍霜峰 (Frost Peak)
  // ==========================================
  {
    id: 'room_frost_1',
    sectorId: 'sec_frost',
    name: '冰川絕壁',
    gridX: 5,
    gridY: 2,
    width: 640,
    height: 360,
    theme: 'frost',
    bgGradient: ['#0d2238', '#1a3e61'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      // Stepping ice peaks
      { x: 120, y: 250, w: 90, h: 20 },
      { x: 260, y: 190, w: 100, h: 20 },
      { x: 420, y: 140, w: 110, h: 20 },
    ],
    doors: [
      { id: 'd_frost1_hub', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_sanctuary_hub', targetX: 410, targetY: 160, isMirrorPortal: true, label: '神殿' },
      { id: 'd_frost1_frost2', x: 570, y: 85, w: 36, h: 55, targetRoomId: 'room_frost_2', targetX: 40, targetY: 260, label: '雪峰頂殿' }
    ],
    puzzles: [
      // Ice block blocking the upper climb
      { id: 'ice_frost_block', x: 240, y: 190, w: 30, h: 60, type: 'ice_block', state: 'active' }
    ],
    chests: [
      { id: 'chest_frost_tomato', x: 460, y: 110, w: 28, h: 26, type: 'tomato', opened: false }
    ],
    enemies: [
      { type: 'flamer', x: 150, y: 230 }, // can get fire here if player lost it
      { type: 'cutter_bird', x: 320, y: 160 }
    ]
  },
  {
    id: 'room_frost_2',
    sectorId: 'sec_frost',
    name: '霜晶冰冠王座',
    gridX: 6,
    gridY: 2,
    width: 640,
    height: 360,
    theme: 'frost',
    bgGradient: ['#091829', '#132d47'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      { x: 180, y: 220, w: 120, h: 18 },
      { x: 340, y: 220, w: 120, h: 18 },
    ],
    doors: [
      { id: 'd_frost2_frost1', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_frost_1', targetX: 550, targetY: 140, label: '絕壁' }
    ],
    puzzles: [
      { id: 'ice_frost_shard', x: 470, y: 250, w: 40, h: 60, type: 'ice_block', state: 'active' }
    ],
    chests: [
      { id: 'chest_shard_3', x: 530, y: 280, w: 30, h: 28, type: 'shard', shardIndex: 2, opened: false }
    ],
    enemies: [
      { type: 'waddle', x: 220, y: 200 },
      { type: 'cutter_bird', x: 380, y: 190 }
    ]
  },

  // ==========================================
  // SECTOR 4: 雷霆廢墟 (Thunder Spire)
  // ==========================================
  {
    id: 'room_ruins_1',
    sectorId: 'sec_ruins',
    name: '雷電古塔前廊',
    gridX: 5,
    gridY: 3,
    width: 640,
    height: 360,
    theme: 'ruins',
    bgGradient: ['#301f0c', '#543615'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      // Elevated circuitry platforms
      { x: 160, y: 220, w: 100, h: 16 },
      { x: 360, y: 200, w: 120, h: 16 },
    ],
    doors: [
      { id: 'd_ruins1_hub', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_sanctuary_hub', targetX: 550, targetY: 220, isMirrorPortal: true, label: '神殿' },
      { id: 'd_ruins1_ruins2', x: 570, y: 255, w: 36, h: 55, targetRoomId: 'room_ruins_2', targetX: 40, targetY: 260, label: '發電機核心' }
    ],
    puzzles: [
      // Generator pylon - hit with Spark to power gate
      { id: 'gen_ruins_1', x: 420, y: 260, w: 36, h: 50, type: 'generator', state: 'active', targetGateId: 'gate_ruins_1' },
      { id: 'gate_ruins_1', x: 510, y: 210, w: 24, h: 100, type: 'locked_gate', state: 'active' }
    ],
    chests: [
      { id: 'chest_ruins_battery', x: 200, y: 190, w: 28, h: 26, type: 'battery', opened: false }
    ],
    enemies: [
      { type: 'sparky', x: 190, y: 190 }, // drops Spark
      { type: 'waddle', x: 310, y: 290 }
    ]
  },
  {
    id: 'room_ruins_2',
    sectorId: 'sec_ruins',
    name: '超導超電核心',
    gridX: 6,
    gridY: 3,
    width: 640,
    height: 360,
    theme: 'ruins',
    bgGradient: ['#211508', '#3b250d'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      { x: 240, y: 210, w: 160, h: 16 },
    ],
    doors: [
      { id: 'd_ruins2_ruins1', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_ruins_1', targetX: 540, targetY: 260, label: '前廊' }
    ],
    puzzles: [
      { id: 'gen_ruins_2', x: 300, y: 160, w: 36, h: 50, type: 'generator', state: 'active', targetGateId: 'gate_ruins_2' },
      { id: 'gate_ruins_2', x: 450, y: 210, w: 24, h: 100, type: 'locked_gate', state: 'active' }
    ],
    chests: [
      { id: 'chest_shard_4', x: 530, y: 280, w: 30, h: 28, type: 'shard', shardIndex: 3, opened: false }
    ],
    enemies: [
      { type: 'sparky', x: 150, y: 290 },
      { type: 'sparky', x: 380, y: 290 }
    ]
  },

  // ==========================================
  // SECTOR 5: 巨石礦坑 (Boulder Quarry)
  // ==========================================
  {
    id: 'room_boulder_1',
    sectorId: 'sec_boulder',
    name: '礦坑打樁場',
    gridX: 3,
    gridY: 4,
    width: 640,
    height: 360,
    theme: 'cavern',
    bgGradient: ['#1f2429', '#38424b'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      { x: 180, y: 230, w: 100, h: 18 },
      { x: 380, y: 230, w: 100, h: 18 },
    ],
    doors: [
      { id: 'd_boulder1_hub', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_sanctuary_hub', targetX: 70, targetY: 300, isMirrorPortal: true, label: '神殿' },
      { id: 'd_boulder1_boulder2', x: 570, y: 255, w: 36, h: 55, targetRoomId: 'room_boulder_2', targetX: 40, targetY: 260, label: '巨石深淵' }
    ],
    puzzles: [
      // Ground stake to pound with Hammer
      { id: 'stake_boulder_1', x: 300, y: 280, w: 28, h: 30, type: 'ground_stake', state: 'active', targetGateId: 'gate_boulder_1' },
      { id: 'gate_boulder_1', x: 490, y: 210, w: 24, h: 100, type: 'locked_gate', state: 'active' }
    ],
    chests: [
      { id: 'chest_boulder_tomato', x: 210, y: 200, w: 28, h: 26, type: 'tomato', opened: false }
    ],
    enemies: [
      { type: 'wood_bonker', x: 220, y: 200 }, // drops Hammer
      { type: 'waddle', x: 360, y: 290 }
    ]
  },
  {
    id: 'room_boulder_2',
    sectorId: 'sec_boulder',
    name: '四人協力巨石室',
    gridX: 2,
    gridY: 4,
    width: 640,
    height: 360,
    theme: 'cavern',
    bgGradient: ['#171b1e', '#293036'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      { x: 100, y: 200, w: 100, h: 18 },
    ],
    doors: [
      { id: 'd_boulder2_boulder1', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_boulder_1', targetX: 540, targetY: 260, label: '打樁場' }
    ],
    puzzles: [
      // Heavy Boulder puzzle! Needs player + 3 companions to push together!
      { id: 'heavy_boulder_1', x: 300, y: 240, w: 60, h: 70, type: 'heavy_boulder', state: 'active', currentX: 300 },
      { id: 'gate_boulder_2', x: 480, y: 210, w: 24, h: 100, type: 'locked_gate', state: 'active' }
    ],
    chests: [
      { id: 'chest_shard_5', x: 540, y: 280, w: 30, h: 28, type: 'shard', shardIndex: 4, opened: false }
    ],
    enemies: [
      { type: 'waddle', x: 180, y: 290 }
    ]
  },

  // ==========================================
  // SECTOR 6: 幽影地宮 (Shadow Catacombs)
  // ==========================================
  {
    id: 'room_shadow_1',
    sectorId: 'sec_shadow',
    name: '迷惘黑曜廊',
    gridX: 4,
    gridY: 4,
    width: 640,
    height: 360,
    theme: 'cavern',
    bgGradient: ['#111722', '#1d273a'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      { x: 160, y: 240, w: 110, h: 18 },
      { x: 370, y: 190, w: 110, h: 18 },
    ],
    doors: [
      { id: 'd_shadow1_hub', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_sanctuary_hub', targetX: 170, targetY: 300, isMirrorPortal: true, label: '神殿' },
      { id: 'd_shadow1_shadow2', x: 570, y: 255, w: 36, h: 55, targetRoomId: 'room_shadow_2', targetX: 40, targetY: 260, label: '巨像守衛廳' }
    ],
    puzzles: [
      // Vine blocking path
      { id: 'vine_shadow_1', x: 320, y: 230, w: 20, h: 80, type: 'vine', state: 'active' }
    ],
    chests: [
      { id: 'chest_shadow_battery', x: 400, y: 160, w: 28, h: 26, type: 'battery', opened: false }
    ],
    enemies: [
      { type: 'blade_knight', x: 200, y: 220 },
      { type: 'wood_bonker', x: 410, y: 170 }
    ]
  },
  {
    id: 'room_shadow_2',
    sectorId: 'sec_shadow',
    name: '石像守衛大殿',
    gridX: 4,
    gridY: 5,
    width: 640,
    height: 360,
    theme: 'cavern',
    bgGradient: ['#0d121c', '#151c2a'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      { x: 100, y: 220, w: 80, h: 18 },
      { x: 460, y: 220, w: 80, h: 18 },
    ],
    doors: [
      { id: 'd_shadow2_shadow1', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_shadow_1', targetX: 540, targetY: 260, label: '黑曜廊' }
    ],
    puzzles: [],
    chests: [
      { id: 'chest_shard_6', x: 540, y: 280, w: 30, h: 28, type: 'shard', shardIndex: 5, opened: false }
    ],
    enemies: [
      // Mini-boss Golem!
      { type: 'boss_golem', x: 320, y: 270 }
    ]
  },

  // ==========================================
  // SECTOR 7: 雲端空島 (Sky Sanctum)
  // ==========================================
  {
    id: 'room_sky_1',
    sectorId: 'sec_sky',
    name: '乘風空島群',
    gridX: 5,
    gridY: 4,
    width: 640,
    height: 360,
    theme: 'storm',
    bgGradient: ['#0a2f30', '#155254'],
    blocks: [
      { x: 0, y: 310, w: 160, h: 50 },
      { x: 480, y: 310, w: 160, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      // Floating sky islands
      { x: 190, y: 250, w: 80, h: 18 },
      { x: 310, y: 200, w: 90, h: 18 },
      { x: 410, y: 260, w: 70, h: 18 },
    ],
    doors: [
      { id: 'd_sky1_hub', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_sanctuary_hub', targetX: 450, targetY: 300, isMirrorPortal: true, label: '神殿' },
      { id: 'd_sky1_sky2', x: 570, y: 255, w: 36, h: 55, targetRoomId: 'room_sky_2', targetX: 40, targetY: 260, label: '風之祭壇' }
    ],
    puzzles: [],
    chests: [
      { id: 'chest_sky_tomato', x: 330, y: 170, w: 28, h: 26, type: 'tomato', opened: false }
    ],
    enemies: [
      { type: 'cutter_bird', x: 230, y: 220 },
      { type: 'cutter_bird', x: 440, y: 230 }
    ]
  },
  {
    id: 'room_sky_2',
    sectorId: 'sec_sky',
    name: '萬風懸壁台',
    gridX: 6,
    gridY: 4,
    width: 640,
    height: 360,
    theme: 'storm',
    bgGradient: ['#072223', '#0e3a3c'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      { x: 160, y: 220, w: 100, h: 18 },
      { x: 360, y: 160, w: 100, h: 18 },
    ],
    doors: [
      { id: 'd_sky2_sky1', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_sky_1', targetX: 540, targetY: 260, label: '空島群' }
    ],
    puzzles: [
      // Ground stake or vine puzzle
      { id: 'vine_sky_rope', x: 440, y: 180, w: 20, h: 90, type: 'vine', state: 'active', targetGateId: 'gate_sky_1' },
      { id: 'gate_sky_1', x: 490, y: 210, w: 24, h: 100, type: 'locked_gate', state: 'active' }
    ],
    chests: [
      { id: 'chest_shard_7', x: 540, y: 280, w: 30, h: 28, type: 'shard', shardIndex: 6, opened: false }
    ],
    enemies: [
      { type: 'cutter_bird', x: 200, y: 190 },
      { type: 'blade_knight', x: 400, y: 130 }
    ]
  },

  // ==========================================
  // SECTOR 8: 鏡界核心 (Prism Core Final Boss)
  // ==========================================
  {
    id: 'room_core_boss',
    sectorId: 'sec_core',
    name: '鏡界核心・暗影祭壇',
    gridX: 4,
    gridY: 2,
    width: 640,
    height: 360,
    theme: 'core',
    bgGradient: ['#280838', '#4b1066'],
    blocks: [
      { x: 0, y: 310, w: 640, h: 50 },
      { x: 0, y: 0, w: 20, h: 360 },
      { x: 620, y: 0, w: 20, h: 360 },
      { x: 0, y: 0, w: 640, h: 20 },
      // Side battle perches
      { x: 60, y: 220, w: 90, h: 18 },
      { x: 490, y: 220, w: 90, h: 18 },
    ],
    doors: [
      { id: 'd_core_hub', x: 30, y: 255, w: 34, h: 55, targetRoomId: 'room_sanctuary_hub', targetX: 550, targetY: 300, isMirrorPortal: true, label: '神殿' }
    ],
    puzzles: [],
    chests: [
      { id: 'chest_shard_8', x: 305, y: 280, w: 30, h: 28, type: 'shard', shardIndex: 7, opened: false }
    ],
    enemies: [
      // Final Boss: Shadow Phantom
      { type: 'boss_shadow', x: 320, y: 200 }
    ]
  }
];
