export interface Character {
  name: string;
  avatar: string;
  faction: string;
  title: string;
  phase: string; // 境界: 炼气、筑基、金丹、元婴、化神 等
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  exp: number;
  maxExp: number;
  stats: {
    strength: number;     // 臂力
    agility: number;      // 身法
    constitution: number; // 体质
    comprehension: number;// 悟性
    charisma: number;     // 魅力
    luck: number;         // 机缘
  };
  coin: number;           // 铜钱
  stone: number;          // 灵石
  reputation: number;     // 名声
}

export interface Skill {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'qinggong' | 'magic'; // 内功, 外功/剑法, 轻功, 奇门
  level: number;
  maxLevel: number;
  description: string;
  effect: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary'; // 凡品, 精妙, 极品, 神品
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'pill' | 'book' | 'material';
  description: string;
  count: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  effect?: string;
}

export interface MapLocation {
  id: string;
  name: string;
  description: string;
  coordinate: { x: number; y: number };
  safety: 'safe' | 'dangerous' | 'hostile'; // 安全, 危险, 极度危险
  npcs: string[];
}

export interface Relation {
  id: string;
  name: string;
  avatar: string;
  faction: string;
  relationship: 'master' | 'friend' | 'neutral' | 'rival' | 'enemy' | 'lover';
  favorability: number; // -100 to 100
  status: string; // 现状
  level: string; // 境界
}

export interface Quest {
  id: string;
  title: string;
  type: 'main' | 'side' | 'sect';
  description: string;
  target: string;
  progress: number;
  maxProgress: number;
  reward: {
    coin?: number;
    stone?: number;
    exp?: number;
    items?: string[];
  };
  status: 'active' | 'completed' | 'failed';
}

export interface WorldEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  influence: string; // 影响范围
  duration: number; // 剩余旬数
  type: 'natural' | 'war' | 'treasure' | 'sect';
}

export interface TavernMessage {
  id: string;
  sender: 'player' | 'narrator' | 'npc';
  senderName: string;
  text: string;
  timestamp: string;
  editing?: boolean;
}

export interface GameTime {
  eraYear: number; // 宣德三年
  month: number;   // 月 (1-12)
  day: number;     // 日 (上旬, 中旬, 下旬)
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  shichen: string;  // 子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥
  weather: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'windy' | 'foggy';
  location: string; // 当前位置
}
