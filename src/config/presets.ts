import type { ParamDef, BikePreset, ColorDef } from '@/types/bike';

// Shared key lists — single source of truth for lerp/store loops
export const GEO_PARAM_KEYS = [
  'wheelDiameter', 'topTubeLength', 'seatTubeLength', 'headTubeAngle',
  'seatTubeAngle', 'chainstayLength', 'headTubeLength', 'bbDrop',
  'forkOffset', 'stemLength', 'handlebarWidth', 'crankLength',
  'seatpostExt', 'tireWidth',
] as const;

export const COLOR_PARAM_KEYS = [
  'frameColor', 'rimColor', 'tireColor', 'saddleColor', 'gripColor', 'accentColor',
  'barStyle', 'label', 'badgeBg', 'badgeBorder',
] as const;

// ============================================================
// Parameter definitions — ranges validated against real-world
// data from Giant, Merida, XDS, Decathlon (2024-2025 models).
// Covers XC/trail MTB → race/endurance road → city commuter.
// ============================================================
export const PARAM_DEFS: ParamDef[] = [
  {
    key: 'wheelDiameter', name: '轮径 Wheel Dia', unit: 'mm',
    min: 660, max: 760, step: 1,
    tip: '车轮含胎直径。700c公路车~682mm(25-28c)，29"山地~736mm(2.3")，27.5"山地~710mm，700c通勤~698mm(35-40c)',
  },
  {
    key: 'topTubeLength', name: '上管长 Top Tube', unit: 'mm',
    min: 500, max: 660, step: 1,
    tip: '等效水平上管长度。Giant TCR M码~545mm，Merida Big.Trail M码~603mm，决定Reach前伸量和骑行姿势',
  },
  {
    key: 'seatTubeLength', name: '立管长 Seat Tube', unit: 'mm',
    min: 380, max: 620, step: 1,
    tip: '五通中心到立管顶部距离。现代山地车~420-470mm(斜上管)，公路车~470-530mm，城市车~480-540mm',
  },
  {
    key: 'headTubeAngle', name: '头管角 Head Angle', unit: 'deg',
    min: 64, max: 74, step: 0.1,
    tip: '头管与地面夹角。Merida Big.Trail 64°(最松弛/高速稳定)，Giant TCR 73°(最灵敏)，Giant Talon 67.5°(居中)',
  },
  {
    key: 'seatTubeAngle', name: '立管角 Seat Angle', unit: 'deg',
    min: 71, max: 77, step: 0.1,
    tip: '立管与地面夹角。公路车~73-74°(传统)，现代山地车~75-77°(陡立管优化爬坡)，城市车~73°',
  },
  {
    key: 'chainstayLength', name: '后下叉 Chainstay', unit: 'mm',
    min: 400, max: 460, step: 1,
    tip: '五通到后轮轴水平距离。Giant TCR 405mm(加速快)，Merida Big.Trail 435mm(灵巧)，Giant Talon 455mm(稳定)',
  },
  {
    key: 'headTubeLength', name: '头管长 Head Tube', unit: 'mm',
    min: 85, max: 220, step: 1,
    tip: '头管长度。XC山地~90-110mm，公路车~130-170mm，耐力公路~150-200mm。越长Stack越高姿势越直立',
  },
  {
    key: 'bbDrop', name: '五通下沉 BB Drop', unit: 'mm',
    min: 40, max: 80, step: 1,
    tip: '五通低于轮轴中心。公路车~66-75mm(低重心)，山地车~40-60mm(离地间隙)，Giant Defy 75mm',
  },
  {
    key: 'forkOffset', name: '前叉偏移 Fork Rake', unit: 'mm',
    min: 38, max: 55, step: 1,
    tip: '前轮轴向前偏移量。公路车~43-50mm(Giant TCR 45mm)，山地车~44-51mm。影响Trail值和转向特性',
  },
  {
    key: 'stemLength', name: '把立长 Stem', unit: 'mm',
    min: 40, max: 140, step: 1,
    tip: '头管到车把水平距离。现代山地车40-60mm(短把立+宽把)，公路车90-120mm，城市车80-100mm',
  },
  {
    key: 'handlebarWidth', name: '车把宽 Bar Width', unit: 'mm',
    min: 380, max: 820, step: 1,
    tip: '车把总宽度。公路弯把380-440mm，山地直把740-800mm，城市车580-640mm。宽=操控稳，窄=风阻小',
  },
  {
    key: 'crankLength', name: '曲柄长 Crank', unit: 'mm',
    min: 165, max: 180, step: 1,
    tip: '曲柄臂长度。公路车170-175mm，山地车170-175mm，城市车170mm。影响踩踏力矩和膝盖弯曲角度',
  },
  {
    key: 'seatpostExt', name: '座管伸出 Seatpost', unit: 'mm',
    min: 50, max: 300, step: 1,
    tip: '座管从立管顶部继续伸出长度。冲刺姿势低(公路~200mm)，休闲姿势高(城市~160mm)，山地~170mm(含升降座管)',
  },
  {
    key: 'tireWidth', name: '胎宽 Tire Width', unit: 'mm',
    min: 23, max: 65, step: 1,
    tip: '轮胎宽度。公路车23-32mm(Giant TCR 25-28mm)，山地车50-65mm(2.0-2.5")，城市车32-47mm(1.25-1.85")',
  },
];

// ============================================================
// Presets — based on M-size geometry from real-world 2024-2025
// models: Giant Talon / Merida Big.Trail (MTB),
// Giant TCR/Defy / Merida Scultura (Road),
// Decathlon Elops / typical city bike (Commuter).
// ============================================================
export type PresetKey = 'mountain' | 'road' | 'commuter';

export const PRESETS: Record<PresetKey, BikePreset> = {
  mountain: {
    // ── Geometry: trail hardtail, 29" wheels ──
    wheelDiameter: 736,   // 29x2.3" tire diameter
    topTubeLength: 610,    // effective TT (Giant Talon M 604mm / Merida Big.Trail M 603mm)
    seatTubeLength: 440,   // sloping frame (Talon M 420mm / Big.Trail M 420mm)
    headTubeAngle: 67.0,   // versatile trail (Giant Talon 67.5° / Rockrider 940 66.5°)
    seatTubeAngle: 75.0,   // modern steep STA (Talon 74.5° / Big.Trail 76.5°)
    chainstayLength: 445,  // maneuverable (Big.Trail 435mm / Talon 455mm)
    headTubeLength: 110,   // Talon M 105mm / Big.Trail M 110mm
    bbDrop: 58,            // Talon 55mm / Big.Trail 70mm — compromise for clearance
    forkOffset: 46,        // typical 29er: Talon 44mm / Rockrider 44mm
    stemLength: 50,         // modern MTB short stem (Talon 50-60mm)
    handlebarWidth: 760,   // wide flat bar (typical trail MTB 740-780mm)
    crankLength: 175,      // standard MTB crank
    seatpostExt: 170,       // dropper post extended (125-170mm travel)
    tireWidth: 58,          // 29x2.3" (typical trail tire)
    // ── Appearance ──
    frameColor: '#3d8b40',   // forest green (Giant-style)
    rimColor: '#c0c0c0',
    tireColor: '#0a0a0a',
    saddleColor: '#0a0a0a',
    gripColor: '#0a0a0a',
    accentColor: '#ff8c00',  // orange accent
    // ── Style ──
    barStyle: 'flat',
    label: '山地车 MTB',
    badgeBg: '#1a2d1a',
    badgeBorder: '#3d8b40',
  },

  road: {
    // ── Geometry: endurance road, 700c wheels ──
    wheelDiameter: 682,    // 700c x 28mm tire diameter
    topTubeLength: 548,     // TCR M 545mm / Defy M ~550mm / Scultura M ~550mm
    seatTubeLength: 510,    // TCR M 470mm / Defy M 480mm / Scultura M 501mm
    headTubeAngle: 73.0,    // race-to-endurance (TCR 73° / Defy 72.5° / Scultura 73.5°)
    seatTubeAngle: 73.5,    // standard road (TCR 73.5° / Defy 73.5° / Scultura 73.5°)
    chainstayLength: 410,   // responsive (TCR 405mm / Defy 420mm / Scultura 408mm)
    headTubeLength: 150,    // endurance balance (TCR M 145mm / Defy M 150mm)
    bbDrop: 72,             // stable cornering (TCR ~70mm / Defy 75mm / Scultura 66mm)
    forkOffset: 45,         // standard race (TCR 45mm / Defy 50mm / Scultura ~45mm)
    stemLength: 100,         // standard road fit (90-110mm)
    handlebarWidth: 420,    // drop bar (typical M: 400-420mm)
    crankLength: 172.5,     // standard road crank
    seatpostExt: 210,        // road position (moderate saddle-to-bar drop)
    tireWidth: 28,           // 700x28c (modern road standard)
    // ── Appearance ──
    frameColor: '#d9414e',   // racing red (Merida/TCR-style)
    rimColor: '#d0d0d0',
    tireColor: '#0a0a0a',
    saddleColor: '#0a0a0a',
    gripColor: '#0a0a0a',
    accentColor: '#ff8c00',
    // ── Style ──
    barStyle: 'drop',
    label: '公路车 Road Bike',
    badgeBg: '#2d1a1d',
    badgeBorder: '#d9414e',
  },

  commuter: {
    // ── Geometry: city bike, 700c wheels ──
    wheelDiameter: 698,    // 700c x 38mm tire diameter
    topTubeLength: 575,     // relaxed TT (city bikes ~560-590mm)
    seatTubeLength: 500,    // taller ST for upright position
    headTubeAngle: 71.0,    // relaxed steering (commuter range 70-72°)
    seatTubeAngle: 73.0,    // moderate (commuter 72-74°, nearer road than MTB)
    chainstayLength: 440,   // stable + rack/fender clearance
    headTubeLength: 160,    // tall head tube for upright posture
    bbDrop: 68,             // low COG (commuter 65-70mm, Elops-like)
    forkOffset: 50,         // stable steering (commuter 45-50mm)
    stemLength: 90,         // moderate reach (Elops 900 M: 80mm)
    handlebarWidth: 620,    // flat bar (typical city: 580-640mm, Elops 900: 620mm)
    crankLength: 170,       // standard commuter crank
    seatpostExt: 160,        // upright position
    tireWidth: 38,           // 700x38c (Elops 900 spec)
    // ── Appearance ──
    frameColor: '#f4a261',   // warm sand orange (city-friendly)
    rimColor: '#c8b89a',     // brass/copper tone
    tireColor: '#1a1510',    // dark brown
    saddleColor: '#3d2817',  // brown leather look
    gripColor: '#2a1a0a',    // dark brown
    accentColor: '#e07b3a',  // warm orange
    // ── Style ──
    barStyle: 'flat',
    label: '通勤车 City Bike',
    badgeBg: '#2d2219',
    badgeBorder: '#f4a261',
  },
};

export const COLOR_DEFS: ColorDef[] = [
  { key: 'frameColor',  label: '车架 Frame' },
  { key: 'rimColor',    label: '轮圈 Rim' },
  { key: 'tireColor',   label: '轮胎 Tire' },
  { key: 'saddleColor', label: '座垫 Saddle' },
  { key: 'gripColor',   label: '把套 Grip' },
  { key: 'accentColor', label: '点缀 Accent' },
];

// Bike type display metadata — single source for Sidebar UI
export const BIKE_TYPE_META: Record<PresetKey, {
  dotClass: string;
  zh: string;
  en: string;
}> = {
  mountain: { dotClass: 'mtb', zh: '山地车', en: 'MTB' },
  road:     { dotClass: 'road', zh: '公路车', en: 'Road' },
  commuter: { dotClass: 'city', zh: '通勤车', en: 'City' },
};

// Re-export as array for iteration order guarantee
export const PRESET_KEYS = Object.keys(PRESETS) as PresetKey[];
