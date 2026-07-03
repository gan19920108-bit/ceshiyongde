import { Lorebook, LorebookEntry, CharacterPreset } from './types';

export class SillyTavernImporter {
  /**
   * Parses SillyTavern Lorebook (World Book) JSON export format.
   */
  static parseLorebook(jsonStr: string, defaultName: string = '导入的世界书'): Lorebook {
    const data = JSON.parse(jsonStr);
    const id = `lore_${Date.now()}`;
    const name = data.name || data.title || defaultName;

    const entries: LorebookEntry[] = [];

    // SillyTavern saves entries either in an array (v2) or in a dictionary (v1)
    const rawEntries = data.entries || data.content || {};

    if (Array.isArray(rawEntries)) {
      rawEntries.forEach((raw: any, index: number) => {
        entries.push(SillyTavernImporter.mapRawEntry(raw, index));
      });
    } else if (typeof rawEntries === 'object') {
      Object.entries(rawEntries).forEach(([key, raw]: [string, any], index: number) => {
        entries.push(SillyTavernImporter.mapRawEntry(raw, index));
      });
    }

    return {
      id,
      name,
      entries,
      isGlobalEnabled: true,
      lastModified: Date.now(),
    };
  }

  private static mapRawEntry(raw: any, index: number): LorebookEntry {
    const keys: string[] = [];
    if (Array.isArray(raw.key)) {
      raw.key.forEach((k: any) => {
        if (typeof k === 'string') keys.push(k);
      });
    } else if (typeof raw.key === 'string') {
      keys.push(...raw.key.split(',').map((k: string) => k.trim()));
    } else if (raw.keys) {
      if (Array.isArray(raw.keys)) {
        raw.keys.forEach((k: any) => {
          if (typeof k === 'string') keys.push(k);
        });
      } else if (typeof raw.keys === 'string') {
        keys.push(...raw.keys.split(',').map((k: string) => k.trim()));
      }
    }

    return {
      id: raw.id || `le_${Date.now()}_${index}`,
      keys: keys.filter(k => k !== ''),
      content: raw.content || raw.entry || '',
      comment: raw.comment || '',
      isEnabled: raw.enabled !== undefined ? !!raw.enabled : true,
      isConstant: raw.constant !== undefined ? !!raw.constant : false,
      priority: typeof raw.priority === 'number' ? raw.priority : 10,
      order: typeof raw.order === 'number' ? raw.order : index,
      recursive: !!raw.recursive,
    };
  }

  /**
   * Export Lorebook as standard SillyTavern JSON format
   */
  static exportLorebook(lorebook: Lorebook): string {
    const stFormat = {
      name: lorebook.name,
      description: 'SillyTavern compatible worldbook exported from AI Studio',
      entries: lorebook.entries.reduce((acc: Record<string, any>, entry, index) => {
        acc[index.toString()] = {
          uid: index,
          key: entry.keys,
          content: entry.content,
          comment: entry.comment || '',
          enabled: entry.isEnabled,
          constant: entry.isConstant,
          priority: entry.priority,
          order: entry.order,
          recursive: !!entry.recursive,
        };
        return acc;
      }, {}),
    };
    return JSON.stringify(stFormat, null, 2);
  }

  /**
   * Parses Character Preset JSON.
   */
  static parsePreset(jsonStr: string): CharacterPreset {
    const data = JSON.parse(jsonStr);
    
    return {
      id: `preset_${Date.now()}`,
      charName: data.charName || data.name || '未命名说书人',
      avatar: data.avatar || '🎭',
      title: data.title || '江湖隐客',
      faction: data.faction || '无门无派',
      charPersonality: data.charPersonality || data.personality || data.description || '',
      systemPrompt: data.systemPrompt || data.system_prompt || '',
      scenario: data.scenario || data.world_scenario || '',
      mesExample: data.mesExample || data.mes_example || '',
      firstMes: data.firstMes || data.first_mes || '“开场白故事开始...”',
      lastModified: Date.now(),
    };
  }
}
