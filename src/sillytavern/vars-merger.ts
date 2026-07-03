import { Character, Skill, InventoryItem, Relation, Quest, GameTime } from '../types';

export class VarsMerger {
  /**
   * Deep merges variable adjustments from the AI into the game state.
   * Handles clamping, leveling up/overflow notifications, and inventory updates.
   */
  static merge(
    vars: Record<string, any>,
    currentState: {
      character: Character;
      skills: Skill[];
      inventory: InventoryItem[];
      relations: Relation[];
      quests: Quest[];
      time: GameTime;
    },
    addNotification: (text: string, type: 'success' | 'warn' | 'info') => void
  ): {
    character: Character;
    skills: Skill[];
    inventory: InventoryItem[];
    relations: Relation[];
    quests: Quest[];
    time: GameTime;
  } {
    // Clone states to keep everything pure and trigger React re-renders
    const character = { ...currentState.character, stats: { ...currentState.character.stats } };
    let skills = [...currentState.skills];
    let inventory = [...currentState.inventory];
    let relations = [...currentState.relations];
    let quests = [...currentState.quests];
    const time = { ...currentState.time };

    if (!vars || Object.keys(vars).length === 0) {
      return { character, skills, inventory, relations, quests, time };
    }

    // --- 1. Basic Stats relative merge ---
    const numberFields: (keyof Character)[] = ['hp', 'mp', 'exp', 'coin', 'stone', 'reputation', 'maxHp', 'maxMp', 'maxExp'];
    
    numberFields.forEach((field) => {
      if (typeof vars[field] === 'number') {
        const adjustment = vars[field];
        if (adjustment === 0) return;

        const original = character[field] as number;
        let updated = original + adjustment;

        // Clamping logic
        if (field === 'hp') {
          updated = Math.max(0, Math.min(character.maxHp, updated));
          const changeText = adjustment > 0 ? `气血恢复了 ${adjustment} 点` : `气血流失了 ${Math.abs(adjustment)} 点`;
          addNotification(`【气血变动】${changeText} (${updated}/${character.maxHp})`, adjustment > 0 ? 'success' : 'warn');
        } else if (field === 'mp') {
          updated = Math.max(0, Math.min(character.maxMp, updated));
          const changeText = adjustment > 0 ? `真气提升了 ${adjustment} 点` : `真气消耗了 ${Math.abs(adjustment)} 点`;
          addNotification(`【真气变动】${changeText} (${updated}/${character.maxMp})`, adjustment > 0 ? 'success' : 'warn');
        } else if (field === 'exp') {
          updated = Math.max(0, updated); // Can overflow maxExp, wait for user to click breakthrough
          addNotification(`【修行为功】获得修为经验 +${adjustment} 点 (当前: ${updated}/${character.maxExp})`, 'success');
        } else if (field === 'coin') {
          updated = Math.max(0, updated);
          const changeText = adjustment > 0 ? `赚得 ${adjustment} 铜钱` : `花费 ${Math.abs(adjustment)} 铜钱`;
          addNotification(`【金银往来】${changeText}`, adjustment > 0 ? 'success' : 'info');
        } else if (field === 'stone') {
          updated = Math.max(0, updated);
          const changeText = adjustment > 0 ? `获得灵石 +${adjustment} 颗` : `消耗灵石 -${Math.abs(adjustment)} 颗`;
          addNotification(`【灵材变现】${changeText}`, adjustment > 0 ? 'success' : 'info');
        } else if (field === 'reputation') {
          updated = Math.max(0, updated);
          const changeText = adjustment > 0 ? `江湖名声提升 ${adjustment} 点` : `清名受损 ${Math.abs(adjustment)} 点`;
          addNotification(`【声名鹊起】${changeText}`, adjustment > 0 ? 'success' : 'warn');
        } else {
          updated = Math.max(1, updated);
          addNotification(`【属性上限】${field} 变更 ${adjustment > 0 ? '+' : ''}${adjustment}`, 'info');
        }

        (character[field] as number) = updated;
      }
    });

    // --- 2. Stats (attributes) relative merge ---
    if (vars.stats && typeof vars.stats === 'object') {
      const statsFields = ['strength', 'agility', 'constitution', 'comprehension', 'charisma', 'luck'];
      statsFields.forEach((sField) => {
        const sVal = vars.stats[sField];
        if (typeof sVal === 'number' && sVal !== 0) {
          const orig = character.stats[sField as keyof typeof character.stats] || 0;
          const updated = Math.max(1, orig + sVal);
          character.stats[sField as keyof typeof character.stats] = updated;
          
          let attrName = '';
          if (sField === 'strength') attrName = '臂力';
          else if (sField === 'agility') attrName = '身法';
          else if (sField === 'constitution') attrName = '体质';
          else if (sField === 'comprehension') attrName = '悟性';
          else if (sField === 'charisma') attrName = '魅力';
          else if (sField === 'luck') attrName = '机缘';

          addNotification(`【周身潜能】根骨洗炼，${attrName} ${sVal > 0 ? '+' : ''}${sVal} (当前: ${updated})`, 'success');
        }
      });
    }

    // --- 3. Inventory relative merge ---
    // Example vars: { "items": { "洗髓丹": 1, "青锋剑": -1 } }
    if (vars.items && typeof vars.items === 'object') {
      Object.entries(vars.items).forEach(([itemName, val]) => {
        if (typeof val !== 'number' || val === 0) return;
        
        const existingItemIndex = inventory.findIndex((item) => item.name === itemName);
        if (existingItemIndex !== -1) {
          const item = inventory[existingItemIndex];
          const newCount = Math.max(0, item.count + val);
          if (newCount === 0) {
            // Remove item
            inventory = inventory.filter((_, idx) => idx !== existingItemIndex);
            addNotification(`【行囊变动】“${itemName}” 已悉数耗尽/典当`, 'info');
          } else {
            inventory[existingItemIndex] = { ...item, count: newCount };
            addNotification(`【行囊变动】“${itemName}” 数量变动 ${val > 0 ? '+' : ''}${val} (当前: ${newCount})`, val > 0 ? 'success' : 'info');
          }
        } else if (val > 0) {
          // Add as new material/common item if not exists
          const newItem: InventoryItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            name: itemName,
            type: itemName.includes('丹') || itemName.includes('散') ? 'pill' : itemName.includes('剑') || itemName.includes('刀') ? 'weapon' : itemName.includes('甲') || itemName.includes('衣') ? 'armor' : itemName.includes('诀') || itemName.includes('录') ? 'book' : 'material',
            description: `说书天演推衍而得的奇珍异宝 “${itemName}”，内涵道法造化。`,
            count: val,
            rarity: itemName.includes('紫铜') || itemName.includes('玄') ? 'epic' : 'common',
            price: 150
          };
          inventory.push(newItem);
          addNotification(`【意外收获】获得物品 “${itemName}” x${val}`, 'success');
        }
      });
    }

    // --- 4. Skills relative merge ---
    // Example: { "skills": { "沛然诀": 1 } }
    if (vars.skills && typeof vars.skills === 'object') {
      Object.entries(vars.skills).forEach(([skillName, val]) => {
        if (typeof val !== 'number' || val === 0) return;

        const existingSkillIndex = skills.findIndex((s) => s.name === skillName);
        if (existingSkillIndex !== -1) {
          const s = skills[existingSkillIndex];
          const newLvl = Math.max(1, Math.min(s.maxLevel, s.level + val));
          skills[existingSkillIndex] = { ...s, level: newLvl };
          addNotification(`【武技进境】“${skillName}” 突破至第 ${newLvl} 重！`, 'success');
        } else if (val > 0) {
          const newSkill: Skill = {
            id: `skill_${Date.now()}`,
            name: skillName,
            type: 'magic',
            level: 1,
            maxLevel: 10,
            description: `机缘巧合下领悟出的妙术绝艺 “${skillName}”。`,
            effect: '说书人秘授武学。',
            rarity: 'rare'
          };
          skills.push(newSkill);
          addNotification(`【偶得神功】福至心灵，你竟悟出了新武学 “${skillName}”！`, 'success');
        }
      });
    }

    // --- 5. Relations relative merge ---
    // Example: { "relations": { "冷无霜": 15 } }
    if (vars.relations && typeof vars.relations === 'object') {
      Object.entries(vars.relations).forEach(([npcName, val]) => {
        if (typeof val !== 'number' || val === 0) return;

        const existingNpcIndex = relations.findIndex((r) => r.name === npcName);
        if (existingNpcIndex !== -1) {
          const r = relations[existingNpcIndex];
          const newFavor = Math.max(-100, Math.min(100, r.favorability + val));
          
          let relationship: Relation['relationship'] = r.relationship;
          if (newFavor >= 80) relationship = 'lover';
          else if (newFavor >= 40) relationship = 'friend';
          else if (newFavor <= -50) relationship = 'enemy';
          else if (newFavor <= -20) relationship = 'rival';
          else relationship = 'neutral';

          relations[existingNpcIndex] = { ...r, favorability: newFavor, relationship };
          const levelChange = val > 0 ? '好感度上升' : '好感度下跌';
          addNotification(`【江湖恩怨】你与 ${npcName} 的关系发生了微妙变动：${levelChange} ${val > 0 ? '+' : ''}${val} (当前: ${newFavor})`, val > 0 ? 'success' : 'warn');
        } else {
          // Meet a new friend
          const newRelation: Relation = {
            id: `relation_${Date.now()}`,
            name: npcName,
            avatar: '👤',
            faction: '江湖散人',
            relationship: val > 0 ? 'friend' : 'neutral',
            favorability: val,
            status: '天演推导新交结的江湖过客。',
            level: '炼气期'
          };
          relations.push(newRelation);
          addNotification(`【偶遇奇人】你结识了武林同道 “${npcName}”，好感度 ${val > 0 ? '+' : ''}${val}`, 'success');
        }
      });
    }

    // --- 6. Quests progress merge ---
    // Example: { "quests": { "q1": 1 } }
    if (vars.quests && typeof vars.quests === 'object') {
      Object.entries(vars.quests).forEach(([qIdOrTitle, val]) => {
        const questIndex = quests.findIndex((q) => q.id === qIdOrTitle || q.title === qIdOrTitle);
        if (questIndex !== -1) {
          const q = quests[questIndex];
          if (typeof val === 'number') {
            const newProgress = Math.min(q.maxProgress, q.progress + val);
            quests[questIndex] = { ...q, progress: newProgress };
            addNotification(`【功行指日】任务 “${q.title}” 进度更新 (${newProgress}/${q.maxProgress})`, 'info');
          } else if (typeof val === 'string') {
            if (val === 'completed') {
              quests[questIndex] = { ...q, status: 'completed', progress: q.maxProgress };
              addNotification(`【任务圆满】任务 “${q.title}” 功行圆满！请前往界面领取奖励。`, 'success');
            } else if (val === 'failed') {
              quests[questIndex] = { ...q, status: 'failed' };
              addNotification(`【功亏一篑】任务 “${q.title}” 抱憾失败！`, 'warn');
            }
          }
        }
      });
    }

    // --- 7. Time step and weather ---
    if (vars.advance_time) {
      // Advance by 1 Xun (10 days)
      let nextDay = time.day + 10;
      let nextMonth = time.month;
      let nextYear = time.eraYear;

      if (nextDay > 30) {
        nextDay = 10;
        nextMonth += 1;
        if (nextMonth > 12) {
          nextMonth = 1;
          nextYear += 1;
        }
      }

      time.eraYear = nextYear;
      time.month = nextMonth;
      time.day = nextDay;

      const seasons: Record<number, GameTime['season']> = {
        1: 'spring', 2: 'spring', 3: 'spring',
        4: 'summer', 5: 'summer', 6: 'summer',
        7: 'autumn', 8: 'autumn', 9: 'autumn',
        10: 'winter', 11: 'winter', 12: 'winter'
      };
      time.season = seasons[nextMonth];
      const dayText = nextDay === 10 ? '上旬' : nextDay === 20 ? '中旬' : '下旬';
      addNotification(`【时日流转】江湖时历推进到了 宣德${time.eraYear}年 ${time.month}月 ${dayText}`, 'info');
    }

    if (vars.location) {
      time.location = vars.location;
      addNotification(`【斗转星移】你来到了新地点 “${vars.location}”`, 'success');
    }

    return { character, skills, inventory, relations, quests, time };
  }
}
