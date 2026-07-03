import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Shield, ShieldAlert, Coins, Sparkles, MapPin, Swords, Heart, 
  BookOpen, Compass, Award, Calendar, ChevronRight, ShoppingBag, 
  Bookmark, User, Network, Flame, Info, RotateCcw
} from 'lucide-react';
import { 
  Character, Skill, InventoryItem, MapLocation, Relation, Quest, WorldEvent, GameTime 
} from '../types';

interface NavbarModalProps {
  activeTab: string;
  onClose: () => void;
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  skills: Skill[];
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  mapLocations: MapLocation[];
  relations: Relation[];
  setRelations: React.Dispatch<React.SetStateAction<Relation[]>>;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  worldEvents: WorldEvent[];
  time: GameTime;
  setTime: React.Dispatch<React.SetStateAction<GameTime>>;
  addNotification: (message: string, type: 'success' | 'warn' | 'info') => void;
  addTavernMessage: (sender: 'player' | 'narrator' | 'npc', senderName: string, text: string) => void;
  
  fontSize?: string;
  setFontSize?: (val: string) => void;
  colorScheme?: string;
  setColorScheme?: (val: string) => void;
  responseLength?: string;
  setResponseLength?: (val: string) => void;
  apiType?: string;
  setApiType?: (val: string) => void;
  sillyTavernUrl?: string;
  setSillyTavernUrl?: (val: string) => void;
  sillyTavernKey?: string;
  setSillyTavernKey?: (val: string) => void;
  onResetGame?: () => void;
  saveGameToSlot?: (slot: string) => void;
  loadGameFromSlot?: (slot: string) => void;
}

export default function NavbarModal({
  activeTab,
  onClose,
  character,
  setCharacter,
  inventory,
  setInventory,
  skills,
  setSkills,
  mapLocations,
  relations,
  setRelations,
  quests,
  setQuests,
  worldEvents,
  time,
  setTime,
  addNotification,
  addTavernMessage,
  
  fontSize = 'font-sans',
  setFontSize = () => {},
  colorScheme = 'classic-ink',
  setColorScheme = () => {},
  responseLength = 'medium',
  setResponseLength = () => {},
  apiType = 'gemini',
  sillyTavernUrl = 'http://localhost:8000',
  setSillyTavernUrl = () => {},
  sillyTavernKey = '',
  setSillyTavernKey = () => {},
  onResetGame = () => {},
  saveGameToSlot = () => {},
  loadGameFromSlot = () => {}
}: NavbarModalProps) {
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(inventory[0] || null);
  const [selectedRelation, setSelectedRelation] = useState<Relation | null>(relations[0] || null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(quests[0] || null);
  const [meridianActiveIndex, setMeridianActiveIndex] = useState<number>(-1);
  const [qiCirculationCount, setQiCirculationCount] = useState<number>(0);
  const [activeShopCategory, setActiveShopCategory] = useState<'buy' | 'sell'>('buy');

  // Merdians diagram
  const meridians = [
    { name: '督脉', coordinate: { x: 50, y: 15 }, color: '#8f3434', bonus: '外功气势 +5%', desc: '督脉主阳，贯通一身阳气，汇合各路奇经脉络。' },
    { name: '任脉', coordinate: { x: 50, y: 35 }, color: '#3d6e7a', bonus: '内力气势 +5%', desc: '任脉主阴，汇聚诸阴真气，滋养气血精元。' },
    { name: '冲脉', coordinate: { x: 38, y: 55 }, color: '#c2a672', bonus: '根骨体质 +5', desc: '冲脉为十二经脉之海，贯穿上下，调理血脉海纳。' },
    { name: '带脉', coordinate: { x: 62, y: 55 }, color: '#c2a672', bonus: '身法闪避 +2%', desc: '带脉环腰一周，束缚诸经，协调肢体敏捷轻灵。' },
    { name: '阳跷脉', coordinate: { x: 32, y: 75 }, color: '#8f3434', bonus: '机缘气运 +3', desc: '阳跷主一身左右之阳，调和足底至眼部阳气。' },
    { name: '阴跷脉', coordinate: { x: 68, y: 75 }, color: '#3d6e7a', bonus: '悟性资质 +4', desc: '阴跷主一身左右之阴，沉淀杂念，澄澈修行识海。' }
  ];

  // System shop item catalogue
  const shopCatalogue: Omit<InventoryItem, 'count'>[] = [
    { id: 'shop_1', name: '洗髓丹', type: 'pill', description: '太古神丹，伐毛洗髓，服之可大幅洗练筋骨、增加修为根基。', rarity: 'epic', price: 900, effect: '增加修为 (EXP) +300' },
    { id: 'shop_2', name: '百花玉露丸', type: 'pill', description: '百花谷至宝神药，以百种珍稀花露炼成，服之可令气血与真气齐鸣。', rarity: 'rare', price: 400, effect: '恢复 150 点气血 (HP)，100 点真气 (MP)' },
    { id: 'shop_3', name: '天机紫铜剑', type: 'weapon', description: '掺入深海紫铜打造的重剑，剑锋沉重沉稳，能破罡气。', rarity: 'epic', price: 1800, effect: '御剑伤害 +45' },
    { id: 'shop_4', name: '流光法袍', type: 'armor', description: '织入天蚕金丝的道袍，隐隐有流光运转，可避刀枪法术之灾。', rarity: 'legendary', price: 3500, effect: '体质护甲 +120，减少全系法术伤害 20%' },
    { id: 'shop_5', name: '太乙剑法秘籍', type: 'book', description: '记录着上古道门太乙正宗剑诀的手抄本，内藏无上剑理。', rarity: 'rare', price: 1200, effect: '研读可修习或精进剑法武学。' }
  ];

  // Helper function to translate rarities to visual style
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return { border: 'border-[#df9b3e]', bg: 'bg-[#402a12]', text: 'text-[#df9b3e]' };
      case 'epic': return { border: 'border-[#9c59d1]', bg: 'bg-[#29173b]', text: 'text-[#a260db]' };
      case 'rare': return { border: 'border-[#3f79d1]', bg: 'bg-[#15233d]', text: 'text-[#4886e0]' };
      default: return { border: 'border-[#a39e93]/50', bg: 'bg-[#242220]', text: 'text-[#dfdbd3]' };
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '神品';
      case 'epic': return '极品';
      case 'rare': return '精妙';
      default: return '凡品';
    }
  };

  // Helper: format copper coins/stones
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('zh-CN');
  };

  // Handle Item Use
  const handleUseItem = (item: InventoryItem) => {
    if (item.count <= 0) return;

    let hpRestored = 0;
    let mpRestored = 0;
    let expGained = 0;
    let message = '';

    if (item.id === 'i3') { // 小还丹
      hpRestored = 100;
      message = `服用了【${item.name}】，恢复了 ${hpRestored} 点气血！`;
    } else if (item.id === 'i6') { // 灵虚玉液
      mpRestored = 100;
      expGained = 200;
      message = `饮下了【${item.name}】，恢复了 ${mpRestored} 点真气，并增加 ${expGained} 点修为！`;
    } else if (item.id === 'shop_1') { // 洗髓丹
      expGained = 300;
      message = `服用了【${item.name}】，洗筋伐髓，增加了 ${expGained} 点修为根基！`;
    } else if (item.id === 'shop_2') { // 百花玉露丸
      hpRestored = 150;
      mpRestored = 100;
      message = `服用了【${item.name}】，只觉浑身清爽，气血恢复 ${hpRestored} 点，真气恢复 ${mpRestored} 点！`;
    } else if (item.type === 'book') {
      expGained = 150;
      message = `你秉烛夜读《${item.name}》，福至心灵，修为增加了 ${expGained} 点！`;
    } else if (item.type === 'weapon' || item.type === 'armor') {
      // Toggle equip
      message = `你成功装备了【${item.name}】，实力更上层楼！`;
    } else {
      message = `你使用了【${item.name}】，药效充沛。`;
    }

    // Apply stats update
    setCharacter(prev => {
      let nextHp = Math.min(prev.maxHp, prev.hp + hpRestored);
      let nextMp = Math.min(prev.maxMp, prev.mp + mpRestored);
      let nextExp = prev.exp + expGained;
      let nextLevel = prev.phase;
      
      if (nextExp >= prev.maxExp) {
        nextExp = nextExp - prev.maxExp;
        nextHp = prev.maxHp + 50;
        nextMp = prev.maxMp + 20;
        nextLevel = prev.phase.includes('初期') ? prev.phase.replace('初期', '中期') : 
                    prev.phase.includes('中期') ? prev.phase.replace('中期', '后期') : '金丹初期';
        addNotification(`恭喜突破！成功晋升至 【${nextLevel}】 境界！`, 'success');
        addTavernMessage('narrator', '天劫感应', `“轰隆隆——只听虚空一声雷响，少侠突破玄关，晋升【${nextLevel}】境界！浑身真气如江河奔腾，势不可挡！”`);
      }

      return {
        ...prev,
        hp: nextHp,
        mp: nextMp,
        exp: nextExp,
        maxHp: nextHp > prev.maxHp ? nextHp : prev.maxHp,
        maxMp: nextMp > prev.maxMp ? nextMp : prev.maxMp,
        phase: nextLevel
      };
    });

    // Reduce inventory item count
    setInventory(prev => {
      return prev.map(inv => {
        if (inv.id === item.id) {
          return { ...inv, count: inv.count - 1 };
        }
        return inv;
      }).filter(inv => inv.count > 0 || inv.type === 'weapon' || inv.type === 'armor'); // keep gear
    });

    // Update selected item visual
    if (item.count - 1 <= 0 && item.type !== 'weapon' && item.type !== 'armor') {
      setSelectedInventoryItem(null);
    } else {
      setSelectedInventoryItem({ ...item, count: item.count - 1 });
    }

    addNotification(message, 'success');
    addTavernMessage('player', character.name, `服用药物后，我的气血精神似乎都好了许多。`);
  };

  // Upgrades a skill
  const handleUpgradeSkill = (skill: Skill) => {
    if (skill.level >= skill.maxLevel) {
      addNotification(`《${skill.name}》已臻至化境（满级）！`, 'warn');
      return;
    }

    const expCost = skill.level * 150;
    if (character.exp < expCost) {
      addNotification(`修为不足！领悟《${skill.name}》需要 ${expCost} 修为，当前仅有 ${character.exp}。`, 'warn');
      return;
    }

    // Deduct EXP and upgrade skill
    setCharacter(prev => ({
      ...prev,
      exp: prev.exp - expCost
    }));

    setSkills(prev => {
      return prev.map(s => {
        if (s.id === skill.id) {
          return { ...s, level: s.level + 1 };
        }
        return s;
      });
    });

    addNotification(`领悟加深！《${skill.name}》提升至第 ${skill.level + 1} 重！`, 'success');
    addTavernMessage('narrator', '参悟武学', `“你席地静修，苦思《${skill.name}》的武道真意。一番豁然开朗之下，成功参透第【${skill.level + 1}】重难关！”`);
  };

  // Meridian Circulation (Qi game)
  const handleCirculateQi = (index: number, meridian: typeof meridians[0]) => {
    if (character.mp < 15) {
      addNotification('真气不足！运转周天需要消耗 15 点真气。', 'warn');
      return;
    }

    setMeridianActiveIndex(index);
    setCharacter(prev => {
      const addedExp = 45;
      let nextExp = prev.exp + addedExp;
      let nextLevel = prev.phase;
      
      if (nextExp >= prev.maxExp) {
        nextExp = nextExp - prev.maxExp;
        nextLevel = prev.phase.includes('初期') ? prev.phase.replace('初期', '中期') : 
                    prev.phase.includes('中期') ? prev.phase.replace('中期', '后期') : '金丹初期';
        addNotification(`天道酬勤！恭喜突破，晋升至 【${nextLevel}】 境界！`, 'success');
        addTavernMessage('narrator', '九霄天劫', `“忽有五彩祥云自太吾村顶聚拢，少侠运转周天功行圆满，一举破入【${nextLevel}】！”`);
      }

      return {
        ...prev,
        mp: prev.mp - 15,
        exp: nextExp,
        phase: nextLevel
      };
    });

    setQiCirculationCount(prev => prev + 1);
    addNotification(`成功运转【${meridian.name}】！修为 +45，消耗真气 15。(${meridian.bonus})`, 'success');
    
    setTimeout(() => {
      setMeridianActiveIndex(-1);
    }, 1000);
  };

  // Travelling on Map
  const handleTravel = (location: MapLocation) => {
    if (location.name === time.location) {
      addNotification(`你当前已在【${location.name}】。`, 'info');
      return;
    }

    if (character.mp < 20) {
      addNotification(`真气不足！御剑游历需要消耗 20 点真气，当前仅有 ${character.mp}。`, 'warn');
      return;
    }

    // Advance time and consume MP
    setCharacter(prev => ({
      ...prev,
      mp: prev.mp - 20
    }));

    // Update time: month/day
    setTime(prev => {
      let nextDay = prev.day + 10;
      let nextMonth = prev.month;
      let nextEra = prev.eraYear;
      let nextSeason = prev.season;

      if (nextDay > 30) {
        nextDay = 10;
        nextMonth += 1;
      }
      if (nextMonth > 12) {
        nextMonth = 1;
        nextEra += 1;
      }

      // seasons
      if (nextMonth >= 3 && nextMonth <= 5) nextSeason = 'spring';
      else if (nextMonth >= 6 && nextMonth <= 8) nextSeason = 'summer';
      else if (nextMonth >= 9 && nextMonth <= 11) nextSeason = 'autumn';
      else nextSeason = 'winter';

      // change weather randomly
      const weathers: GameTime['weather'][] = ['sunny', 'cloudy', 'rainy', 'windy', 'foggy', 'snowy'];
      const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];

      return {
        ...prev,
        day: nextDay,
        month: nextMonth,
        eraYear: nextEra,
        season: nextSeason,
        weather: nextWeather,
        location: location.name
      };
    });

    const travelLore = [
      `“你背负剑匣，足点虚空，化作一道长虹，破空直指【${location.name}】。穿过崇山峻岭与烟霞紫雾，你徐徐飘落，只见此地：${location.description}”`,
      `“清晨薄雾中，你行过逶迤山路，惊起一滩惊鸟，终是抵达【${location.name}】。四周云蒸霞蔚，气象万千，似乎是个修持武道之绝佳福地。”`
    ];

    addNotification(`已御剑游历至【${location.name}】！历时一旬。`, 'success');
    addTavernMessage('narrator', '山河游历', travelLore[Math.floor(Math.random() * travelLore.length)]);
    onClose();
  };

  // Interactions with NPC
  const handleNpcInteract = (npc: Relation, action: 'gift' | 'spar' | 'talk') => {
    let favorabilityDelta = 0;
    let text = '';
    
    if (action === 'gift') {
      // Check if player has healing pills or material to gift
      const hasPill = inventory.some(i => i.id === 'i3' && i.count > 0);
      const hasHerb = inventory.some(i => i.id === 'i4' && i.count > 0);
      
      if (!hasPill && !hasHerb) {
        addNotification('背包里没有拿得出手的丹药或药材！先在商城采购或在太吾村寻觅一番吧。', 'warn');
        return;
      }

      // Deduct one item
      setInventory(prev => {
        let deducted = false;
        return prev.map(i => {
          if ((i.id === 'i3' || i.id === 'i4') && !deducted && i.count > 0) {
            deducted = true;
            return { ...i, count: i.count - 1 };
          }
          return i;
        }).filter(i => i.count > 0 || i.type === 'weapon' || i.type === 'armor');
      });

      favorabilityDelta = 25;
      text = `（面带惊喜地接过赠礼）“少侠如此厚礼，老夫（身）愧不敢当！这【百花药材】极具灵气，刚好用来炼制绝世大丹。此情记下了！”`;
      addNotification(`赠礼成功！与 ${npc.name} 的好感度增加了 ${favorabilityDelta} 点！`, 'success');
    } else if (action === 'spar') {
      if (character.hp < 100) {
        addNotification('体虚气弱，当前状态极差（HP低于100），无法与他人切磋武艺！', 'warn');
        return;
      }

      // Cut player HP, give exp reward
      setCharacter(prev => ({
        ...prev,
        hp: prev.hp - 60,
        exp: Math.min(prev.maxExp, prev.exp + 120)
      }));

      favorabilityDelta = 10;
      text = `（长笑一声，拔出手中兵器）“哈哈哈！太吾传人的太乙剑招果真名不虚传！虽然招式稍显稚嫩，但内息绵密。来，这一招你可看好了，攻其不备！”。一番对拆你颇有领悟，修为 +120，消耗气血 60。`;
      addNotification(`切磋获益匪浅！气血 -60，修为 +120，好感度增加了 ${favorabilityDelta}！`, 'success');
    } else {
      // talk
      favorabilityDelta = 5;
      text = `“最近听闻武林大典召开在即，少侠还是要多多打熬真气，尽快在太吾碑前领悟神剑意蕴。如果有疑问，随时可以来寻我探讨沛然诀。”`;
      addNotification(`与之相谈甚欢！好感度微增。`, 'info');
    }

    // Update NPCs favorability
    setRelations(prev => prev.map(r => {
      if (r.id === npc.id) {
        const nextFav = Math.min(100, Math.max(-100, r.favorability + favorabilityDelta));
        return { ...r, favorability: nextFav };
      }
      return r;
    }));

    if (selectedRelation?.id === npc.id) {
      setSelectedRelation(prev => prev ? {
        ...prev,
        favorability: Math.min(100, Math.max(-100, prev.favorability + favorabilityDelta))
      } : null);
    }

    addTavernMessage('npc', npc.name, text);
    onClose();
  };

  // Buying items from shop
  const handleBuyItem = (shopItem: typeof shopCatalogue[0]) => {
    const isGold = shopItem.rarity === 'legendary' || shopItem.rarity === 'epic';
    const currencyType = isGold ? 'stone' : 'coin';
    const cost = shopItem.price;

    if (currencyType === 'coin' && character.coin < cost) {
      addNotification(`铜钱不足！购买需要 ${cost} 铜钱，当前仅有 ${character.coin}。`, 'warn');
      return;
    }
    if (currencyType === 'stone' && character.stone < cost) {
      addNotification(`灵石不足！购买需要 ${cost} 灵石，当前仅有 ${character.stone}。`, 'warn');
      return;
    }

    // Deduct money
    setCharacter(prev => ({
      ...prev,
      coin: currencyType === 'coin' ? prev.coin - cost : prev.coin,
      stone: currencyType === 'stone' ? prev.stone - cost : prev.stone,
    }));

    // Add to inventory
    setInventory(prev => {
      const existing = prev.find(i => i.name === shopItem.name);
      if (existing) {
        return prev.map(i => i.name === shopItem.name ? { ...i, count: i.count + 1 } : i);
      } else {
        const newInvItem: InventoryItem = {
          id: `inv_bought_${Date.now()}`,
          name: shopItem.name,
          type: shopItem.type,
          description: shopItem.description,
          count: 1,
          rarity: shopItem.rarity,
          price: Math.floor(shopItem.price * 0.4), // sell value is lower
          effect: shopItem.effect
        };
        return [...prev, newInvItem];
      }
    });

    addNotification(`成功购买【${shopItem.name}】！已存入背包。`, 'success');
    addTavernMessage('narrator', '天宝阁购买', `“你扣除 ${formatCurrency(cost)}${currencyType === 'coin' ? '铜钱' : '颗灵石'}，自天宝阁密使手中购得了一件宝物【${shopItem.name}】。”`);
  };

  // Selling items
  const handleSellItem = (item: InventoryItem) => {
    if (item.count <= 0) return;

    const sellValue = item.price;
    
    // Deduct from inventory
    setInventory(prev => {
      return prev.map(i => {
        if (i.id === item.id) {
          return { ...i, count: i.count - 1 };
        }
        return i;
      }).filter(i => i.count > 0 || i.type === 'weapon' || i.type === 'armor');
    });

    // Add gold to player
    setCharacter(prev => ({
      ...prev,
      coin: prev.coin + sellValue
    }));

    addNotification(`成功出售【${item.name}】，换取了 ${sellValue} 铜钱！`, 'success');
    addTavernMessage('narrator', '典当出售', `“你在典当铺将【${item.name}】出售，换回了 ${sellValue} 贯铜钱。”`);

    if (selectedInventoryItem?.id === item.id) {
      if (item.count - 1 <= 0) {
        setSelectedInventoryItem(null);
      } else {
        setSelectedInventoryItem({ ...item, count: item.count - 1 });
      }
    }
  };

  // Complete a Quest artificially (for Prototype progression)
  const handleCompleteQuest = (quest: Quest) => {
    if (quest.status !== 'active') return;

    // Give rewards
    setCharacter(prev => {
      let nextHp = prev.hp;
      let nextMp = prev.mp;
      let nextExp = prev.exp + (quest.reward.exp || 0);
      let nextLevel = prev.phase;
      
      if (nextExp >= prev.maxExp) {
        nextExp = nextExp - prev.maxExp;
        nextLevel = prev.phase.includes('初期') ? prev.phase.replace('初期', '中期') : 
                    prev.phase.includes('中期') ? prev.phase.replace('中期', '后期') : '金丹初期';
        addNotification(`天道感应！恭喜突破，晋升至 【${nextLevel}】 境界！`, 'success');
      }

      return {
        ...prev,
        coin: prev.coin + (quest.reward.coin || 0),
        stone: prev.stone + (quest.reward.stone || 0),
        exp: nextExp,
        phase: nextLevel
      };
    });

    // Add item rewards
    if (quest.reward.items && quest.reward.items.length > 0) {
      setInventory(prev => {
        let nextInv = [...prev];
        quest.reward.items?.forEach(rewardItem => {
          // Find if we have it already
          const existing = nextInv.find(i => i.name === rewardItem);
          if (existing) {
            nextInv = nextInv.map(i => i.name === rewardItem ? { ...i, count: i.count + 1 } : i);
          } else {
            nextInv.push({
              id: `quest_reward_${Date.now()}`,
              name: rewardItem,
              type: rewardItem.includes('丹') || rewardItem.includes('液') ? 'pill' : 'weapon',
              description: '历练得来的奇妙宝物。',
              count: 1,
              rarity: 'rare',
              price: 150
            });
          }
        });
        return nextInv;
      });
    }

    // Update quest status
    setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, progress: q.maxProgress, status: 'completed' } : q));
    addNotification(`任务【${quest.title}】已圆满完成！已发放奖励。`, 'success');
    addTavernMessage('narrator', '历练圆满', `“长风少侠成功达成了‘${quest.title}’之考验。门派上下无不叹服，特赐下灵石和修行大礼以资表彰！”`);
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'shop': return '神兵阁 · 天宝秘商';
      case 'country': return '江湖天下 · 势力分布';
      case 'profile': return '太吾真元 · 经脉冲穴';
      case 'map': return '华夏九州 · 江湖图志';
      case 'relations': return '红尘纠葛 · 人际因缘';
      case 'inventory': return '金丝锦囊 · 乾坤行囊';
      case 'skills': return '经武功法 · 武林绝艺';
      case 'quests': return '江湖悬赏 · 历练奇遇';
      case 'events': return '九州风云 · 纪事大事';
      default: return '江湖录';
    }
  };

  return (
    <div id="modal_container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        id="modal_card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-5xl h-[85vh] bg-[#1c1a18] rounded-none border-2 border-[#c2a672]/40 flex flex-col ink-box-shadow relative"
      >
        {/* Decorative corner borders (Taiwu style) */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#c2a672]"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#c2a672]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#c2a672]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#c2a672]"></div>

        {/* Modal Header */}
        <div id="modal_header" className="flex items-center justify-between px-6 py-4 border-b border-[#c2a672]/20 bg-[#262421]">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#8f3434]"></span>
            <h2 className="font-brush text-2xl tracking-wider text-[#c2a672]">{getTitle()}</h2>
          </div>
          <button 
            id="close_modal_btn"
            onClick={onClose}
            className="p-1 rounded-none text-neutral-400 hover:text-[#c2a672] transition-colors border border-transparent hover:border-[#c2a672]/30 bg-neutral-900/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content container */}
        <div id="modal_body" className="flex-1 overflow-y-auto p-6 bg-[#1a1817]">
          
          {/* PROFILE TAB (Restructured to remove Meridian Map completely) */}
          {activeTab === 'profile' && (
            <div id="tab_profile_panel" className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
              {/* Left Column: Core Identity and Vitals */}
              <div className="md:col-span-6 flex flex-col justify-between p-6 bg-[#242220] border border-[#c2a672]/15 relative">
                <div>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 bg-neutral-950 flex items-center justify-center text-5xl border border-[#c2a672]/30 select-none shadow-inner">
                      {character.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-brush text-2xl text-neutral-100">{character.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-[#8f3434]/20 border border-[#8f3434]/40 text-[#df8787]">{character.title}</span>
                      </div>
                      <p className="text-sm text-[#c2a672] font-mono mt-1">{character.faction} · {character.phase}</p>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-sm">
                    {/* HP Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                        <span>气血 (HP)</span>
                        <span>{character.hp} / {character.maxHp}</span>
                      </div>
                      <div className="w-full h-3 bg-neutral-950 border border-[#c2a672]/10 p-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-[#8f3434] to-[#c24646] transition-all duration-300" 
                          style={{ width: `${(character.hp / character.maxHp) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* MP Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                        <span>真气 (MP)</span>
                        <span>{character.mp} / {character.maxMp}</span>
                      </div>
                      <div className="w-full h-3 bg-neutral-950 border border-[#c2a672]/10 p-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-[#3d6e7a] to-[#5cb1c7] transition-all duration-300" 
                          style={{ width: `${(character.mp / character.maxMp) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* EXP Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                        <span>修为 (EXP)</span>
                        <span>{character.exp} / {character.maxExp}</span>
                      </div>
                      <div className="w-full h-3 bg-neutral-950 border border-[#c2a672]/10 p-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-[#9c59d1] to-[#b673eb] transition-all duration-300" 
                          style={{ width: `${(character.exp / character.maxExp) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#c2a672]/10 font-mono text-xs text-neutral-400 leading-relaxed">
                  <p className="flex items-center gap-1.5 text-[#c2a672] mb-1.5 font-brush text-sm">
                    <Info className="w-4 h-4 text-[#8f3434]" /> <span>少侠心境：</span>
                  </p>
                  当前所学甚多，根基平稳。于行囊中服用丹药、精研秘籍可助境界跃迁。若修行遇阻，可前往各大客栈倾听天演说书，推演后续剧情，感悟天道因果。
                </div>
              </div>

              {/* Right Column: Attribute Attributes Details and Standing Summary */}
              <div className="md:col-span-6 flex flex-col justify-between p-6 bg-neutral-950 border border-[#c2a672]/15 relative">
                <div>
                  <h4 className="font-brush text-[#c2a672] text-lg mb-4 pb-2 border-b border-[#c2a672]/10 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#8f3434]" /> 人物先天资质
                  </h4>
                  
                  {/* Character stats grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col p-3 bg-[#1c1a18]/40 border border-[#c2a672]/5">
                      <span className="text-xs text-neutral-400 mb-1 font-mono">臂力 (Strength)</span>
                      <span className="text-[#c2a672] font-mono text-xl font-bold">{character.stats.strength}</span>
                    </div>
                    <div className="flex flex-col p-3 bg-[#1c1a18]/40 border border-[#c2a672]/5">
                      <span className="text-xs text-neutral-400 mb-1 font-mono">身法 (Agility)</span>
                      <span className="text-[#c2a672] font-mono text-xl font-bold">{character.stats.agility}</span>
                    </div>
                    <div className="flex flex-col p-3 bg-[#1c1a18]/40 border border-[#c2a672]/5">
                      <span className="text-xs text-neutral-400 mb-1 font-mono">体质 (Constitution)</span>
                      <span className="text-[#c2a672] font-mono text-xl font-bold">{character.stats.constitution}</span>
                    </div>
                    <div className="flex flex-col p-3 bg-[#1c1a18]/40 border border-[#c2a672]/5">
                      <span className="text-xs text-neutral-400 mb-1 font-mono">悟性 (Comprehension)</span>
                      <span className="text-[#c2a672] font-mono text-xl font-bold">{character.stats.comprehension}</span>
                    </div>
                    <div className="flex flex-col p-3 bg-[#1c1a18]/40 border border-[#c2a672]/5">
                      <span className="text-xs text-neutral-400 mb-1 font-mono">魅力 (Charisma)</span>
                      <span className="text-[#c2a672] font-mono text-xl font-bold">{character.stats.charisma}</span>
                    </div>
                    <div className="flex flex-col p-3 bg-[#1c1a18]/40 border border-[#c2a672]/5">
                      <span className="text-xs text-neutral-400 mb-1 font-mono">机缘 (Luck)</span>
                      <span className="text-[#c2a672] font-mono text-xl font-bold">{character.stats.luck}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#c2a672]/10 font-mono text-xs text-neutral-400 leading-relaxed">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#c2a672]/5">
                    <span className="text-neutral-400">铜钱余额</span>
                    <span className="text-[#c2a672] font-bold">{formatCurrency(character.coin)} 文</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#c2a672]/5">
                    <span className="text-neutral-400">储蓄灵石</span>
                    <span className="text-amber-500 font-bold">{formatCurrency(character.stone)} 颗</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-neutral-400">江湖声望</span>
                    <span className="text-[#df8787] font-bold">{character.reputation} 点</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div id="tab_inventory_panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Item Grid */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto pr-1">
                  {inventory.map((item) => {
                    const style = getRarityStyle(item.rarity);
                    const isSelected = selectedInventoryItem?.id === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedInventoryItem(item)}
                        className={`p-3 border cursor-pointer flex flex-col justify-between h-28 relative transition-all ${style.bg} ${
                          isSelected ? 'ring-2 ring-[#c2a672] border-transparent' : style.border
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-brush text-sm text-neutral-100 truncate">{item.name}</span>
                            <span className={`text-[10px] px-1 border uppercase font-mono ${style.text} border-current bg-black/40`}>
                              {getRarityBadge(item.rarity)}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 block mt-1 font-mono truncate">
                            {item.type === 'pill' ? '丹药' : item.type === 'weapon' ? '神兵' : item.type === 'armor' ? '甲胄' : item.type === 'book' ? '典籍' : '材料'}
                          </span>
                        </div>
                        <div className="flex justify-between items-end mt-2 font-mono text-xs">
                          <span className="text-neutral-400">数量</span>
                          <span className="text-[#c2a672] font-semibold">{item.count}</span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {inventory.length === 0 && (
                    <div className="col-span-full py-20 text-center text-neutral-500 font-mono text-sm">
                      行囊空空如也，前去【系统商城】或游历中斩妖除魔吧。
                    </div>
                  )}
                </div>
              </div>

              {/* Item Details Panel */}
              <div className="lg:col-span-5 bg-[#242220] border border-[#c2a672]/15 p-5 flex flex-col justify-between">
                {selectedInventoryItem ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#c2a672]/10 pb-3 mb-4">
                        <h3 className={`font-brush text-xl ${getRarityStyle(selectedInventoryItem.rarity).text}`}>{selectedInventoryItem.name}</h3>
                        <span className="text-xs font-mono text-[#c2a672]">售价: {selectedInventoryItem.price} 铜钱</span>
                      </div>

                      <div className="space-y-4 text-sm font-mono text-neutral-300 leading-relaxed">
                        <p className="bg-neutral-900/40 p-3 text-xs italic text-neutral-400 border-l border-[#c2a672]/30">
                          “{selectedInventoryItem.description}”
                        </p>

                        {selectedInventoryItem.effect && (
                          <div className="p-3 bg-[#8f3434]/10 border border-[#8f3434]/30 rounded-none text-xs">
                            <strong className="text-[#df8787] block mb-1">使用效果：</strong>
                            <span className="text-neutral-200">{selectedInventoryItem.effect}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 space-y-2">
                      {selectedInventoryItem.type === 'pill' || selectedInventoryItem.type === 'book' ? (
                        <button
                          id="use_item_btn"
                          onClick={() => handleUseItem(selectedInventoryItem)}
                          className="w-full py-2.5 bg-[#8f3434] hover:bg-[#a13c3c] text-white rounded-none font-brush tracking-wider transition-colors cursor-pointer text-center text-sm"
                        >
                          服 用 / 研 读
                        </button>
                      ) : selectedInventoryItem.type === 'weapon' || selectedInventoryItem.type === 'armor' ? (
                        <button
                          id="equip_item_btn"
                          onClick={() => handleUseItem(selectedInventoryItem)}
                          className="w-full py-2.5 bg-[#3d6e7a] hover:bg-[#488291] text-white rounded-none font-brush tracking-wider transition-colors cursor-pointer text-center text-sm"
                        >
                          配 备 穿 戴
                        </button>
                      ) : (
                        <div className="p-3 bg-neutral-900 text-center text-xs text-neutral-400">
                          原材料可用于世界事件交付，或典当换钱。
                        </div>
                      )}
                      
                      <button
                        id="sell_item_btn"
                        onClick={() => handleSellItem(selectedInventoryItem)}
                        className="w-full py-2 text-center text-neutral-400 hover:text-white hover:bg-neutral-800 border border-[#c2a672]/20 rounded-none font-mono text-xs transition-colors cursor-pointer"
                      >
                        典当换钱 (+{selectedInventoryItem.price} 铜钱)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-neutral-500 font-mono text-xs py-10">
                    请选择行囊中的物品以查看详情
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div id="tab_skills_panel" className="space-y-4">
              <div className="bg-neutral-950 p-4 border border-[#c2a672]/10 mb-2">
                <div className="flex justify-between items-center text-xs font-mono text-[#c2a672]">
                  <span>修为根基 (可用 EXP)</span>
                  <span className="text-sm font-semibold">{character.exp} 点</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => {
                  const rStyle = getRarityStyle(skill.rarity);
                  const isMax = skill.level >= skill.maxLevel;
                  const expCost = skill.level * 150;
                  
                  return (
                    <div 
                      key={skill.id} 
                      className="p-4 bg-[#242220] border border-[#c2a672]/15 flex flex-col justify-between h-56 hover:border-[#c2a672]/40 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-xs px-2 py-0.5 border font-mono rounded-none uppercase bg-black/30 ${rStyle.text} ${rStyle.border} inline-block mb-1`}>
                              {getRarityBadge(skill.rarity)}
                            </span>
                            <h3 className="font-brush text-lg text-neutral-100">{skill.name}</h3>
                          </div>
                          <span className="font-mono text-xs text-neutral-400">
                            重数: <strong className="text-[#c2a672] text-sm">{skill.level}</strong> / {skill.maxLevel}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-400 mt-2 font-mono leading-relaxed h-10 overflow-hidden line-clamp-2">
                          “{skill.description}”
                        </p>

                        <div className="mt-3 p-2 bg-neutral-900/60 font-mono text-[11px] text-neutral-300 border-l-2 border-[#3d6e7a]">
                          <strong className="text-[#5cb1c7]">参悟效果：</strong>{skill.effect}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#c2a672]/10 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {isMax ? '已功德圆满' : `参悟消耗: ${expCost} 修为`}
                        </span>
                        
                        <button
                          onClick={() => handleUpgradeSkill(skill)}
                          disabled={isMax}
                          className={`px-3 py-1 text-xs font-brush tracking-wider border rounded-none transition-all cursor-pointer ${
                            isMax 
                              ? 'border-neutral-700 text-neutral-600 cursor-not-allowed bg-transparent'
                              : 'border-[#c2a672]/40 text-[#c2a672] hover:bg-[#c2a672]/10 hover:border-[#c2a672]'
                          }`}
                        >
                          {isMax ? '功行圆满' : '修 炼 领 悟'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAP TAB */}
          {activeTab === 'map' && (
            <div id="tab_map_panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Map Canvas Diagram */}
              <div className="lg:col-span-8 bg-neutral-950 border border-[#c2a672]/15 relative h-[420px] overflow-hidden select-none">
                {/* Background water ink wash grid simulation */}
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle, #c2a672 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}></div>

                {/* Decorative border titles */}
                <div className="absolute top-2 left-2 text-[10px] font-mono text-neutral-600">九州八荒 · 舆地图志</div>
                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-neutral-500">
                  当前位置: <strong className="text-[#c2a672]">{time.location}</strong>
                </div>

                {/* Simulated rivers & state boundaries */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <path d="M 20,30 Q 150,150 250,150 T 500,200 T 700,350" fill="none" stroke="#3d6e7a" strokeWidth="3" />
                  <path d="M 300,50 C 450,80 500,30 650,150" fill="none" stroke="#c2a672" strokeWidth="1" strokeDasharray="5,5" />
                </svg>

                {/* Location Plot Points */}
                {mapLocations.map((loc) => {
                  const isCurrent = loc.name === time.location;
                  const dotColor = loc.safety === 'safe' ? 'bg-green-500' : loc.safety === 'dangerous' ? 'bg-[#df8787]' : 'bg-red-600 animate-pulse';
                  return (
                    <motion.button
                      key={loc.id}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleTravel(loc)}
                      className={`absolute p-2.5 border rounded-none cursor-pointer flex flex-col items-center bg-[#1c1a18] group transition-all ${
                        isCurrent 
                          ? 'border-[#8f3434] shadow-[0_0_12px_rgba(143,52,52,0.6)]' 
                          : 'border-[#c2a672]/20 hover:border-[#c2a672]'
                      }`}
                      style={{ left: `${loc.coordinate.x}%`, top: `${loc.coordinate.y}%` }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span className="font-brush text-xs text-neutral-100 group-hover:text-[#c2a672] transition-colors">{loc.name}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[8px] bg-[#8f3434]/20 border border-[#8f3434]/40 text-[#df8787] px-1 mt-1 block scale-90">驻地</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Travel Info details Panel */}
              <div className="lg:col-span-4 bg-[#242220] border border-[#c2a672]/15 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-brush text-lg text-[#c2a672] border-b border-[#c2a672]/10 pb-2 mb-4">旅行见闻说明</h3>
                  <div className="space-y-4 text-xs font-mono text-neutral-400 leading-relaxed">
                    <p>
                      1. 御剑御气游历九州，每次旅行需要消耗 <strong className="text-[#3d6e7a]">20 点真气 (MP)</strong>。
                    </p>
                    <p>
                      2. 旅行耗时 <strong className="text-[#c2a672]">一旬（10天）</strong>，世界局势会随天时发生变迁，并刷新天气状况。
                    </p>
                    <p>
                      3. 在危险极度严重的敌对地图，有概率会偶遇绝代凶魔并展开神念斗法。
                    </p>
                  </div>
                  
                  <div className="mt-6 p-3 bg-neutral-900 border border-[#c2a672]/5">
                    <h4 className="font-brush text-sm text-neutral-200 mb-1">【当前环境】</h4>
                    <p className="font-mono text-xs text-[#c2a672]">位置：{time.location}</p>
                    <p className="font-mono text-xs text-neutral-400 mt-1">
                      此地乃宁静祥和之地。可在背包中打坐或跟酒馆里的NPC展开切磋，提升身手！
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-yellow-950/20 border border-yellow-900/40 text-[10px] text-neutral-400 font-mono mt-4">
                  提示：点击九州地图上的节点，即可御剑飞仙、穿梭时空！
                </div>
              </div>
            </div>
          )}

          {/* SOCIAL RELATIONS TAB */}
          {activeTab === 'relations' && (
            <div id="tab_relations_panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* NPC List */}
              <div className="lg:col-span-5 space-y-2 overflow-y-auto pr-1">
                {relations.map((rel) => {
                  const isSelected = selectedRelation?.id === rel.id;
                  const favColor = rel.favorability >= 50 ? 'text-green-400' : rel.favorability <= -30 ? 'text-red-500' : 'text-[#c2a672]';
                  return (
                    <div
                      key={rel.id}
                      onClick={() => setSelectedRelation(rel)}
                      className={`p-3 border cursor-pointer transition-all flex items-center justify-between bg-[#242220] hover:bg-[#2c2a27] ${
                        isSelected ? 'border-[#c2a672] shadow-[0_0_8px_rgba(194,166,114,0.3)]' : 'border-[#c2a672]/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-brush text-sm text-neutral-100">{rel.name}</h4>
                          <span className="text-[10px] text-neutral-400 font-mono">{rel.faction} · {rel.level}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="text-neutral-500">好感: </span>
                        <strong className={favColor}>{rel.favorability}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interact Panel */}
              <div className="lg:col-span-7 bg-[#242220] border border-[#c2a672]/15 p-5 flex flex-col justify-between">
                {selectedRelation ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 border-b border-[#c2a672]/10 pb-3 mb-4">
                        <div>
                          <h3 className="font-brush text-lg text-neutral-100">{selectedRelation.name}</h3>
                          <p className="text-xs text-[#c2a672] font-mono">{selectedRelation.faction} · {selectedRelation.level}</p>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs font-mono text-neutral-300">
                        <div>
                          <strong className="text-[#c2a672] block mb-1">因缘境界：</strong>
                          <span className="text-neutral-400">{selectedRelation.status}</span>
                        </div>

                        <div className="pt-2">
                          <strong className="text-[#c2a672] block mb-1">因果态度：</strong>
                          {selectedRelation.favorability >= 60 ? (
                            <span className="text-green-400">至交好友。引为红颜知己，愿倾力护持，赠礼极易获得指点。</span>
                          ) : selectedRelation.favorability >= 30 ? (
                            <span className="text-blue-400">和善友好。视你为后起之秀，言辞温良。</span>
                          ) : selectedRelation.favorability <= -50 ? (
                            <span className="text-red-500">不共戴天！对你切齿痛恨，随时有可能暗中加害！</span>
                          ) : (
                            <span className="text-neutral-400">平淡之交。萍水相逢，尚未见得深交。</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                      <button
                        onClick={() => handleNpcInteract(selectedRelation, 'talk')}
                        className="py-2 bg-neutral-900 border border-[#c2a672]/20 hover:border-[#c2a672] text-neutral-200 text-xs rounded-none font-brush tracking-wider transition-all cursor-pointer"
                      >
                        叙 话 交 谈
                      </button>
                      <button
                        onClick={() => handleNpcInteract(selectedRelation, 'gift')}
                        className="py-2 bg-neutral-900 border border-[#c2a672]/20 hover:border-[#c2a672] text-[#c2a672] text-xs rounded-none font-brush tracking-wider transition-all cursor-pointer"
                      >
                        呈 递 雅 礼
                      </button>
                      <button
                        onClick={() => handleNpcInteract(selectedRelation, 'spar')}
                        className="py-2 bg-[#8f3434]/20 border border-[#8f3434]/50 hover:bg-[#8f3434]/30 text-[#df8787] text-xs rounded-none font-brush tracking-wider transition-all cursor-pointer"
                      >
                        切 磋 较 艺
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-neutral-500 font-mono text-xs py-10">
                    请选择红尘人物进行神念交互
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SYSTEM SHOP TAB */}
          {activeTab === 'shop' && (
            <div id="tab_shop_panel" className="space-y-4">
              <div className="bg-neutral-950 p-4 border border-[#c2a672]/15 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span>铜钱残余:</span>
                    <strong className="text-neutral-100 text-sm">{formatCurrency(character.coin)} 贯</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>天外灵石:</span>
                    <strong className="text-neutral-100 text-sm">{character.stone} 颗</strong>
                  </div>
                </div>

                <div className="flex bg-[#242220] p-0.5 border border-[#c2a672]/20">
                  <button 
                    onClick={() => setActiveShopCategory('buy')}
                    className={`px-4 py-1 text-xs font-brush tracking-wider cursor-pointer transition-colors ${activeShopCategory === 'buy' ? 'bg-[#c2a672] text-[#1c1a18]' : 'text-neutral-400 hover:text-white'}`}
                  >
                    秘市选购
                  </button>
                  <button 
                    onClick={() => setActiveShopCategory('sell')}
                    className={`px-4 py-1 text-xs font-brush tracking-wider cursor-pointer transition-colors ${activeShopCategory === 'sell' ? 'bg-[#c2a672] text-[#1c1a18]' : 'text-neutral-400 hover:text-white'}`}
                  >
                    典当变货
                  </button>
                </div>
              </div>

              {activeTab === 'shop' && (
                <div id="tab_shop_inner_panel" className="space-y-4">
                  {activeShopCategory === 'buy' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shopCatalogue.map((shopItem) => {
                        const rStyle = getRarityStyle(shopItem.rarity);
                        const isGold = shopItem.rarity === 'legendary' || shopItem.rarity === 'epic';
                        const moneyUnit = isGold ? '灵石' : '铜钱';
                        const textUnitColor = isGold ? 'text-blue-400' : 'text-yellow-500';

                        return (
                          <div 
                            key={shopItem.id} 
                            className="p-4 bg-[#242220] border border-[#c2a672]/15 flex justify-between gap-4 hover:border-[#c2a672]/30 transition-all"
                          >
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <span className={`text-[10px] px-1.5 py-0.2 border uppercase font-mono bg-black/40 ${rStyle.text} ${rStyle.border} inline-block mb-1`}>
                                  {getRarityBadge(shopItem.rarity)}
                                </span>
                                <h3 className="font-brush text-base text-neutral-100">{shopItem.name}</h3>
                                <p className="text-xs text-neutral-400 mt-1.5 font-mono leading-relaxed h-10 overflow-hidden">
                                  “{shopItem.description}”
                                </p>
                              </div>
                              
                              <div className="mt-2 text-[10px] text-neutral-500 font-mono">
                                效果：{shopItem.effect || '凡尘灵材，炼药铸兵主料。'}
                              </div>
                            </div>

                            <div className="flex flex-col justify-between items-end min-w-[100px] border-l border-[#c2a672]/10 pl-4">
                              <div className="text-right font-mono">
                                <span className="text-[10px] text-neutral-500 block">兑换价格</span>
                                <span className={`text-sm font-semibold ${textUnitColor}`}>{shopItem.price} <span className="text-xs">{moneyUnit}</span></span>
                              </div>

                              <button
                                onClick={() => handleBuyItem(shopItem)}
                                className="px-3 py-1.5 bg-neutral-900 hover:bg-[#c2a672] hover:text-[#1c1a18] text-neutral-300 border border-[#c2a672]/30 rounded-none font-brush text-xs tracking-wider transition-all cursor-pointer"
                              >
                                兑 换
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-neutral-500 mb-2">可典当的随身物品（武器、盔甲、材料、药品皆可转出）：</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {inventory.map((invItem) => (
                          <div key={invItem.id} className="p-3 bg-[#242220] border border-[#c2a672]/10 flex justify-between items-center">
                            <div>
                              <h4 className="font-brush text-sm text-neutral-200">{invItem.name}</h4>
                              <span className="text-xs text-neutral-500 font-mono">存量: {invItem.count} | 单价: {invItem.price} 铜钱</span>
                            </div>
                            <button
                              onClick={() => handleSellItem(invItem)}
                              className="px-3 py-1.5 border border-yellow-800/40 text-yellow-500 hover:bg-yellow-950/20 text-xs font-brush tracking-wider transition-colors cursor-pointer"
                            >
                              典当
                            </button>
                          </div>
                        ))}
                        {inventory.length === 0 && (
                          <div className="col-span-full text-center py-10 font-mono text-neutral-500 text-xs">
                            行囊中没有可以典当的随身物品！
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* QUEST LIST TAB (Left List / Right Detail Layout) */}
          {activeTab === 'quests' && (
            <div id="tab_quests_panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Left Column: Quest titles list */}
              <div className="lg:col-span-5 space-y-2 overflow-y-auto pr-1">
                {quests.map((quest) => {
                  const isSelected = selectedQuest?.id === quest.id;
                  const isCompleted = quest.status === 'completed';
                  return (
                    <div
                      key={quest.id}
                      onClick={() => setSelectedQuest(quest)}
                      className={`p-3 border cursor-pointer transition-all flex flex-col justify-between bg-[#242220] hover:bg-[#2c2a27] ${
                        isSelected 
                          ? 'border-[#c2a672] shadow-[0_0_8px_rgba(194,166,114,0.3)]' 
                          : 'border-[#c2a672]/10'
                      } ${isCompleted ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] px-1.5 py-0.2 border font-mono uppercase ${
                            quest.type === 'main' ? 'text-red-400 border-red-500/30 bg-red-950/20' : 
                            quest.type === 'side' ? 'text-blue-400 border-blue-500/30 bg-blue-950/20' : 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                          }`}>
                            {quest.type === 'main' ? '主线' : quest.type === 'side' ? '支线' : '宗门'}
                          </span>
                          <h4 className="font-brush text-sm text-neutral-100 truncate">{quest.title}</h4>
                        </div>
                        {isCompleted && (
                          <span className="text-[9px] px-1 bg-teal-950/50 border border-teal-500/30 text-teal-400 font-mono">已圆满</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mt-1">
                        <span>进度: {quest.progress} / {quest.maxProgress}</span>
                        <span className="text-neutral-500 truncate max-w-[120px]">{quest.target}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Detailed selected quest details */}
              <div className="lg:col-span-7 bg-[#242220] border border-[#c2a672]/15 p-5 flex flex-col justify-between">
                {selectedQuest ? (
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#c2a672]/10 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 border font-mono uppercase ${
                            selectedQuest.type === 'main' ? 'text-red-400 border-red-500/30 bg-red-950/20' : 
                            selectedQuest.type === 'side' ? 'text-blue-400 border-blue-500/30 bg-blue-950/20' : 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                          }`}>
                            {selectedQuest.type === 'main' ? '主线悬赏' : selectedQuest.type === 'side' ? '江湖轶事' : '宗门要务'}
                          </span>
                          <h3 className="font-brush text-lg text-neutral-100">{selectedQuest.title}</h3>
                        </div>
                        {selectedQuest.status === 'completed' && (
                          <span className="text-xs px-2 py-0.5 bg-teal-950/50 border border-teal-500/40 text-teal-400 font-mono">功行圆满</span>
                        )}
                      </div>

                      <div className="space-y-4 text-xs font-mono text-neutral-300 leading-relaxed">
                        <div>
                          <strong className="text-[#c2a672] block mb-1 font-brush text-sm">历练描述：</strong>
                          <p className="p-3 bg-neutral-950 border border-[#c2a672]/5 text-neutral-400 leading-relaxed italic">
                            “{selectedQuest.description}”
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <strong className="text-[#c2a672] block mb-1">历练指标：</strong>
                            <span className="text-neutral-200">{selectedQuest.target}</span>
                          </div>
                          <div>
                            <strong className="text-[#c2a672] block mb-1">当前进境：</strong>
                            <span className="text-neutral-200">{selectedQuest.progress} / {selectedQuest.maxProgress}</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <strong className="text-[#c2a672] block mb-1">交付奖惩：</strong>
                          <div className="p-2.5 bg-neutral-900 border border-[#c2a672]/5 flex flex-wrap gap-x-4 gap-y-1">
                            {selectedQuest.reward.coin && <span className="text-yellow-500">+{selectedQuest.reward.coin} 铜钱</span>}
                            {selectedQuest.reward.stone && <span className="text-amber-500">+{selectedQuest.reward.stone} 灵石</span>}
                            {selectedQuest.reward.items && selectedQuest.reward.items.map((it, idx) => (
                              <span key={idx} className="text-purple-400">+{it}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#c2a672]/10 flex justify-end">
                      {selectedQuest.status === 'active' ? (
                        <button
                          onClick={() => handleCompleteQuest(selectedQuest)}
                          className="px-5 py-2.5 bg-[#8f3434] hover:bg-[#a13c3c] text-white border border-[#c2a672]/20 rounded-none font-brush text-sm tracking-wider transition-all cursor-pointer"
                        >
                          交 付 悬 赏 奖 励
                        </button>
                      ) : (
                        <div className="text-neutral-500 text-sm font-brush tracking-wide flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-[#c2a672]" /> 该任务已尘埃落定，因果圆满。
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-500 font-mono text-xs py-10">
                    请在左侧点选一桩江湖悬赏任务以查看详情。
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WORLD EVENTS TAB */}
          {activeTab === 'events' && (
            <div id="tab_events_panel" className="space-y-4">
              <p className="text-xs font-mono text-neutral-500">记叙当前神州结界与名门正派、邪修巨妖间近期的重大变故：</p>
              
              <div className="space-y-3">
                {worldEvents.map((evt) => (
                  <div key={evt.id} className="p-4 bg-[#242220] border border-[#c2a672]/15 flex items-start gap-4 hover:border-[#c2a672]/30 transition-all">
                    <span className="p-2 bg-neutral-900 text-[#c2a672] border border-[#c2a672]/15 rounded-none font-mono text-xs select-none">
                      {evt.type === 'treasure' ? '宝' : evt.type === 'natural' ? '劫' : '宗'}
                    </span>
                    <div className="space-y-1.5 flex-1 font-mono">
                      <div className="flex justify-between items-start">
                        <h4 className="font-brush text-base text-neutral-100">{evt.title}</h4>
                        <span className="text-xs text-neutral-500">{evt.date}</span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {evt.description}
                      </p>
                      <div className="text-[10px] text-[#c2a672] flex items-center gap-4">
                        <span>波及范围：{evt.influence}</span>
                        <span>剩余时日：{evt.duration} 旬</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COUNTRY OVERVIEW TAB */}
          {activeTab === 'country' && (
            <div id="tab_country_panel" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-900 border border-[#c2a672]/20 rounded-none font-mono">
                  <h4 className="font-brush text-base text-[#c2a672] mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> 大明皇朝 (中原正统)
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    居神州中央，以朝廷王法统辖黎庶。重武备、重科举，对武林中各大门派既拉拢亦严防。与九幽魔教常年血战边陲。
                  </p>
                  <div className="mt-3 text-xs flex justify-between">
                    <span className="text-neutral-500">阵营倾向</span>
                    <span className="text-green-400">秩序/中立</span>
                  </div>
                </div>

                <div className="p-4 bg-neutral-900 border border-[#c2a672]/20 rounded-none font-mono">
                  <h4 className="font-brush text-base text-[#c2a672] mb-2 flex items-center gap-2">
                    <Swords className="w-4 h-4" /> 九州宗门联盟
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    以少林、武当、峨眉、百花谷、铸剑山庄等名门正派组成的守望同盟。代代承托护持天下苍生、抗拒邪魔之古制。
                  </p>
                  <div className="mt-3 text-xs flex justify-between">
                    <span className="text-neutral-500">阵营倾向</span>
                    <span className="text-blue-400">善良/正义</span>
                  </div>
                </div>

                <div className="p-4 bg-neutral-900 border border-[#c2a672]/20 rounded-none font-mono">
                  <h4 className="font-brush text-base text-[#c2a672] mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> 九幽邪道 (魔门)
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    以赤炎魔君、白骨真君为首的逆天宗门。行吞噬血脉之恶法，祭祀远古妖邪，妄图冲开九重伏魔大阵，倾覆人间。
                  </p>
                  <div className="mt-3 text-xs flex justify-between">
                    <span className="text-neutral-500">阵营倾向</span>
                    <span className="text-red-500">狂暴/毁灭</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[#242220] border border-[#c2a672]/15 font-mono">
                <h3 className="font-brush text-base text-neutral-200 mb-3">神州地理变局：伏魔印裂隙</h3>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                  太吾传人自上古流传，背负天地浩劫枢纽之“伏魔令”。每当少侠在酒馆游历，或点击九州舆图游离诸峰时，九幽煞气就会有细微溢散。根据联盟星盘推演，魔道势力侵袭度为 <strong>38%</strong>，形式颇显紧迫。少侠需尽快去搜寻灵髓、斩妖除魔，维护龙脉周天！
                </p>
                <div className="w-full h-3 bg-neutral-950 p-0.5 border border-[#c2a672]/20">
                  <div className="h-full bg-gradient-to-right from-green-600 via-yellow-600 to-red-600" style={{ width: '38%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <span>生机充沛 (0%)</span>
                  <span>魔焰肆虐 (100%)</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div id="modal_footer" className="px-6 py-3 border-t border-[#c2a672]/20 bg-[#262421] flex justify-between items-center text-xs font-mono text-neutral-400">
          <span>《太吾传人志》九州前沿 · 游戏框架</span>
          <span className="text-[#c2a672]">按 ESC 键或点击右上角可返还江湖</span>
        </div>
      </motion.div>
    </div>
  );
}
