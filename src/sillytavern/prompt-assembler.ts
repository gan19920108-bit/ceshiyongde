import { CharacterPreset } from './types';
import { Character, Skill, InventoryItem, Relation, Quest, GameTime, TavernMessage } from '../types';

export class PromptAssembler {
  /**
   * Assembles the ultimate system prompt and player state context.
   */
  static assemble(params: {
    preset: CharacterPreset;
    lorebookContent: string;
    character: Character;
    skills: Skill[];
    inventory: InventoryItem[];
    relations: Relation[];
    quests: Quest[];
    time: GameTime;
    recentHistory: TavernMessage[];
    userInput: string;
    customSystemInstructions?: string;
  }): string {
    const {
      preset,
      lorebookContent,
      character,
      skills,
      inventory,
      relations,
      quests,
      time,
      recentHistory,
      userInput,
      customSystemInstructions,
    } = params;

    // 1. Format the Player State Variables Block
    const playerVariablesBlock = `
=== CURRENT PLAYER CHAR STATE VARIABLES (VARS) ===
{
  "name": "${character.name}",
  "title": "${character.title}",
  "faction": "${character.faction}",
  "phase": "${character.phase}",
  "hp": ${character.hp},
  "maxHp": ${character.maxHp},
  "mp": ${character.mp},
  "maxMp": ${character.maxMp},
  "exp": ${character.exp},
  "maxExp": ${character.maxExp},
  "coin": ${character.coin},
  "stone": ${character.stone},
  "reputation": ${character.reputation},
  "stats": ${JSON.stringify(character.stats)},
  "skills": [
    ${skills.map((s) => `{"name": "${s.name}", "level": ${s.level}, "type": "${s.type}"}`).join(',\n    ')}
  ],
  "inventory": [
    ${inventory.map((i) => `{"name": "${i.name}", "count": ${i.count}, "type": "${i.type}"}`).join(',\n    ')}
  ],
  "quests": [
    ${quests.filter(q => q.status === 'active').map((q) => `{"title": "${q.title}", "target": "${q.target}", "progress": ${q.progress}, "maxProgress": ${q.maxProgress}}`).join(',\n    ')}
  ],
  "relations": [
    ${relations.map((r) => `{"name": "${r.name}", "relationship": "${r.relationship}", "favorability": ${r.favorability}}`).join(',\n    ')}
  ],
  "time": {
    "eraYear": ${time.eraYear},
    "season": "${time.season}",
    "month": ${time.month},
    "day": "${time.day}",
    "shichen": "${time.shichen}",
    "weather": "${time.weather}",
    "location": "${time.location}"
  }
}
==================================================
`;

    // 2. Format History
    // We only take the last N messages to fit in the context window
    const historyBlock = recentHistory
      .map((msg) => {
        const senderLabel = msg.sender === 'player' ? '玩家 (云长风)' : '说书人天演';
        return `[${msg.timestamp}] ${senderLabel}: ${msg.text}`;
      })
      .join('\n\n');

    // 3. Assemble Custom or Global System Instructions
    const systemPromptText = customSystemInstructions || preset.systemPrompt;

    // 4. Combine Everything
    const fullPrompt = `${systemPromptText}

【背景设定大纲】
${preset.scenario}

【人物性格描述】
${preset.charPersonality}

【例句语气】
${preset.mesExample}
${lorebookContent}
${playerVariablesBlock}

【剧情近期记录】
${historyBlock}

[当前时间] ${time.eraYear}年 ${time.month}月 ${time.day} ${time.shichen}时 (天气: ${time.weather}) | 地点: ${time.location}

玩家下一步行动指令：
“${userInput}”

请按照说书人要求进行本回合的推演，切记输出完整的 XML 格式（含 <thinking>、<maintext>、<option>、<sum>、<vars> 标签）。属性变更仅输出更新或新增的部分，例如 {"hp": -10, "stone": 1}，数值将深合并。`;

    return fullPrompt;
  }
}
