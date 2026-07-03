import { Character, Skill, InventoryItem, Relation, Quest, GameTime } from '../types';

export interface LorebookEntry {
  id: string;
  keys: string[];       // 触发词
  content: string;      // 设定正文
  comment?: string;     // 注释
  isEnabled: boolean;   // 是否激活
  isConstant: boolean;  // 是否常驻 (无需触发)
  priority: number;     // 优先级 (数字越大越优先插入)
  order: number;        // 插入顺序
  weight?: number;      // 权重
  recursive?: boolean;  // 递归匹配
}

export interface Lorebook {
  id: string;
  name: string;
  entries: LorebookEntry[];
  isGlobalEnabled: boolean;
  lastModified: number;
}

export interface CharacterPreset {
  id: string;
  charName: string;
  avatar: string;
  title: string;
  faction: string;
  charPersonality: string;  // 人物性格/生平
  systemPrompt: string;     // 系统指令
  scenario: string;         // 背景设定/修真大纲
  mesExample: string;       // 语气示范/例句
  firstMes: string;         // 首条消息 (NPC开场白)
  creatorComment?: string;
  lastModified: number;
}

export interface SillyTavernSettings {
  activeLorebooks: string[];      // 激活的世界书ID列表
  selectedPresetId: string;       // 激活的角色预设ID
  secondaryApiEnabled: boolean;   // 是否启用次级API (用于变量计算/剧情总结)
  systemInstructionOverride: string; // 自定义全局系统提示词覆盖
  customTags: string[];           // 期望的LLM输出标签集 (默认 ['thinking', 'maintext', 'option', 'sum', 'vars'])
  temperature: number;
  topP: number;
  maxContextLength: number;       // 上下文最大Token/长度
}

export interface TavernFloorSnapshot {
  messageId: string;
  character: Character;
  skills: Skill[];
  inventory: InventoryItem[];
  relations: Relation[];
  quests: Quest[];
  time: GameTime;
}

export interface ParsedStream {
  thinking: string;
  maintext: string;
  options: string[];
  sum: string;
  vars: Record<string, any>;
  raw: string;
}
