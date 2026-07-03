import { Character, Skill, InventoryItem, MapLocation, Relation, Quest, WorldEvent, TavernMessage, GameTime } from './types';

export const INITIAL_CHARACTER: Character = {
  name: '云长风',
  avatar: '👤',
  faction: '天机传人',
  title: '初入江湖',
  phase: '筑基初期',
  hp: 240,
  maxHp: 300,
  mp: 80,
  maxMp: 150,
  exp: 420,
  maxExp: 1000,
  stats: {
    strength: 42,
    agility: 38,
    constitution: 45,
    comprehension: 55,
    charisma: 48,
    luck: 30,
  },
  coin: 1500,
  stone: 15,
  reputation: 120,
};

export const INITIAL_SKILLS: Skill[] = [
  {
    id: 's1',
    name: '沛然诀',
    type: 'internal',
    level: 3,
    maxLevel: 10,
    description: '天机传人之本源内功，中和纯正，调理五脏，容纳诸般真气。',
    effect: '最大气血 +50，真气流转速度提升 15%',
    rarity: 'rare',
  },
  {
    id: 's2',
    name: '无极太乙剑',
    type: 'external',
    level: 2,
    maxLevel: 9,
    description: '剑走阴阳，行云流水，剑风清丽脱俗，隐有道门太极之神韵。',
    effect: '御剑伤害 +35，招式拆解概率 +5%',
    rarity: 'epic',
  },
  {
    id: 's3',
    name: '飞霜踏雪步',
    type: 'qinggong',
    level: 1,
    maxLevel: 5,
    description: '踏雪无痕，行止如霜风拂枝，身姿飘逸，灵敏难测。',
    effect: '身法闪避 +20%，移动消耗降低 10%',
    rarity: 'common',
  },
  {
    id: 's4',
    name: '九星指玄法',
    type: 'magic',
    level: 1,
    maxLevel: 7,
    description: '借北斗九星之位演算天机、引动煞气之奇门法术，高深莫测。',
    effect: '法术奇袭概率 +12%，敌人防备降低 10%',
    rarity: 'legendary',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'i1',
    name: '青锋剑',
    type: 'weapon',
    description: '普通钢剑，淬以天青石粉，锋刃锐利，泛出隐隐青芒。',
    count: 1,
    rarity: 'common',
    price: 300,
    effect: '御剑伤害 +15',
  },
  {
    id: 'i2',
    name: '玄木软甲',
    type: 'armor',
    description: '天机谷匠人秘制的玄木软甲，韧性极佳，能避寻常金石利刃。',
    count: 1,
    rarity: 'rare',
    price: 800,
    effect: '体质护甲 +40，降低外伤 10%',
  },
  {
    id: 'i3',
    name: '小还丹',
    type: 'pill',
    description: '少林秘传外门药丸，散发淡淡药香。服之可迅速气血充盈。',
    count: 3,
    rarity: 'common',
    price: 150,
    effect: '恢复 100 点气血 (HP)',
  },
  {
    id: 'i4',
    name: '养神芝',
    type: 'material',
    description: '生于阴湿处的灵芝，得地脉真气滋养，是炼制驻颜或养神丹药的主料。',
    count: 5,
    rarity: 'rare',
    price: 250,
  },
  {
    id: 'i5',
    name: '易筋经残卷',
    type: 'book',
    description: '佛门无上神功《易筋经》之残篇，字迹斑驳，暗藏玄机，极难领悟。',
    count: 1,
    rarity: 'legendary',
    price: 5000,
    effect: '研读可解锁无上佛法真意，大幅提升体质。',
  },
  {
    id: 'i6',
    name: '灵虚玉液',
    type: 'pill',
    description: '仙家仙酿，香气扑鼻，凡人服之伐毛洗髓，修士服之大增真气。',
    count: 1,
    rarity: 'epic',
    price: 1200,
    effect: '恢复 100 点真气 (MP)，增加 200 点修为 (EXP)',
  },
];

export const INITIAL_LOCATIONS: MapLocation[] = [
  {
    id: 'l1',
    name: '天机谷',
    description: '群山环抱之隐秘古谷，天机传人的发祥地，翠竹摇曳，民风淳朴。',
    coordinate: { x: 50, y: 50 },
    safety: 'safe',
    npcs: ['徐掌柜', '小乞丐', '天机后人'],
  },
  {
    id: 'l2',
    name: '百花谷',
    description: '地处川蜀奇峰峻岭之中，谷内奇花异草遍地，药香扑鼻，乃杏林圣地。',
    coordinate: { x: 30, y: 70 },
    safety: 'safe',
    npcs: ['百花仙子', '神医葛洪'],
  },
  {
    id: 'l3',
    name: '铸剑山庄',
    description: '烈火熔炉，铁锤叮咚。依熔岩火山而建，以煅烧天下至尊神兵闻名。',
    coordinate: { x: 75, y: 65 },
    safety: 'dangerous',
    npcs: ['庄主欧阳铸', '赤焰铁匠'],
  },
  {
    id: 'l4',
    name: '竹林深处',
    description: '阴翳蔽日的古老竹海，其间幽风阵阵，时有妖兽蛰伏，也有隐士修行。',
    coordinate: { x: 45, y: 35 },
    safety: 'dangerous',
    npcs: ['隐逸竹贤', '竹妖'],
  },
  {
    id: 'l5',
    name: '武当古观',
    description: '群峰插天，紫气东来。道家无上洞天福地，云雾缭绕间隐现青砖黛瓦。',
    coordinate: { x: 60, y: 25 },
    safety: 'safe',
    npcs: ['冲虚道长', '守观小童'],
  },
  {
    id: 'l6',
    name: '魔教荒原',
    description: '残阳如血，焦土绵延。赤地千里的幽府荒野，魔焰滔天，凶险异常。',
    coordinate: { x: 20, y: 30 },
    safety: 'hostile',
    npcs: ['魔教护法', '血衣厉鬼'],
  },
];

export const INITIAL_RELATIONS: Relation[] = [
  {
    id: 'r1',
    name: '隐逸竹贤',
    avatar: '👴',
    faction: '逍遥散人',
    relationship: 'master',
    favorability: 85,
    status: '正在竹林中坐忘参禅，思虑天机传承。',
    level: '金丹后期',
  },
  {
    id: 'r2',
    name: '百花仙子',
    avatar: '👩',
    faction: '百花谷',
    relationship: 'friend',
    favorability: 60,
    status: '于谷中调制“百花玉露丸”，急需养神芝。',
    level: '筑基后期',
  },
  {
    id: 'r3',
    name: '庄主欧阳铸',
    avatar: '🧔',
    faction: '铸剑山庄',
    relationship: 'neutral',
    favorability: 10,
    status: '正在熔炉旁筹划铸造新一柄“天机玄神剑”。',
    level: '元婴初期',
  },
  {
    id: 'r4',
    name: '赤炎魔君',
    avatar: '👿',
    faction: '九幽魔教',
    relationship: 'enemy',
    favorability: -90,
    status: '听闻天机传人重出江湖，誓要灭杀火种。',
    level: '金丹初期',
  },
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: '天机遗志：伏魔',
    type: 'main',
    description: '寻找并消灭潜伏在魔教荒原的赤炎魔君麾下护法，收回天机神剑之印。',
    target: '击败魔教护法',
    progress: 0,
    maxProgress: 1,
    reward: {
      coin: 1000,
      stone: 10,
      exp: 500,
      items: ['灵虚玉液'],
    },
    status: 'active',
  },
  {
    id: 'q2',
    title: '神医的委托',
    type: 'side',
    description: '百花谷神医葛洪急需“养神芝”来炼制百花玉露丸，听闻竹林深处时常有其踪迹。',
    target: '收集养神芝 0/5',
    progress: 0,
    maxProgress: 5,
    reward: {
      coin: 500,
      exp: 200,
    },
    status: 'active',
  },
];

export const INITIAL_EVENTS: WorldEvent[] = [
  {
    id: 'e1',
    title: '太乙剑典出世',
    date: '宣德三年 四月 上旬',
    description: '传闻有武林散人自古墓中带出一卷失落的《太乙剑典》，各大门派齐聚武当。',
    influence: '中原各大门派',
    duration: 6,
    type: 'treasure',
  },
  {
    id: 'e2',
    title: '地脉煞气泄露',
    date: '宣德三年 六月 中旬',
    description: '魔教荒原地底有九幽煞气喷涌，周遭生灵异化，魔教势力伺机扩散。',
    influence: '西北边疆、天机谷周边',
    duration: 12,
    type: 'natural',
  },
  {
    id: 'e3',
    title: '百花谷炼药大典',
    date: '宣德三年 八月 下旬',
    description: '百花谷神医葛洪昭告天下，将于下月开启仙炉炼制“九转还魂丹”，邀同道护法。',
    influence: '天下修士、丹药世家',
    duration: 18,
    type: 'sect',
  },
];

export const INITIAL_MESSAGES: TavernMessage[] = [
  {
    id: 'm1',
    sender: 'narrator',
    senderName: '江湖传言',
    text: '“一纸天机令，引得乾坤动。伏魔殿封印松动，魔道诸邪蠢蠢欲动，中原武林危机四伏……”',
    timestamp: '子时 晴',
  },
  {
    id: 'm2',
    sender: 'npc',
    senderName: '徐掌柜',
    text: '（一边擦着酒碗，一边低声叹道）“这位少侠，老朽看你骨骼惊奇、气度不凡，莫非就是传说中，代代相承的‘天机传人’？如今铸剑山庄、武当古观、百花谷诸方大佬都在暗中探查伏魔令的下落，你可得小心呐。”',
    timestamp: '子时 晴',
  },
  {
    id: 'm3',
    sender: 'player',
    senderName: '云长风',
    text: '“多谢掌柜提点。既然世事动荡，长风定会担起重任，绝不负天机传承之名。”',
    timestamp: '子时 晴',
  },
  {
    id: 'm4',
    sender: 'narrator',
    senderName: '局势变幻',
    text: '你端起粗瓷茶碗，碗内微波荡漾，你体内的沛然真气似乎也随之产生了一丝玄奥的共鸣……前方是天机谷的幽暗竹林，你会做出什么选择？',
    timestamp: '丑时 阴',
  },
];

export const INITIAL_TIME: GameTime = {
  eraYear: 3,
  month: 4,
  day: 10,
  season: 'spring',
  shichen: '丑时',
  weather: 'cloudy',
  location: '天机谷',
};

export const SIMULATED_RESPONSES = [
  "你提气轻身，运转《飞霜踏雪步》，整个人如同飘飞的霜雪般掠过竹林。周围的竹枝在剑气激荡下沙沙作响，突然，林间深处似有一声清亮的剑鸣，与你体内的沛然真气交相呼应。你隐隐察觉，这似乎是百年前祖师在此地留下的剑痕剑意。",
  "你从怀中取出一枚精莹圆润的【小还丹】，就着清冽的泉水服下。药丸入口即化，化作一道温热的暖流游走于你的四肢百骸，你原本滞碍的经脉瞬间通畅。你深深吐出一口浊气，只觉得气血大增，原本的疲惫一扫而空，甚至隐隐听到了经脉扩充的潮汐之声。",
  "你行至铸剑山庄前。只见一尊数十丈高的赤火青铜神炉屹立在熔岩河畔，无数半裸上身的铁匠正赤红着脸挥槌打造兵器。庄主欧阳铸见你到来，神色严峻：“天机少侠！你来得正好，老夫方才感应到，在魔教荒原方向，神兵残片的气息再次暴动。看来，一场席卷武林的浩劫已然不可避免，你需要加紧修炼，突破现有的筑基境界！”",
  "你在天机谷的石井旁遇到了隐逸竹贤。这位白发长须的老者正自顾自地手握一卷《沛然诀》残篇。瞧见你后，他微微一哂：“长风小友，你体内的先天真气混元合一，极具道家法度。老夫今天便传你几句口诀：‘太极纯一，无物无我，抱元守缺，真气沛然。’ 闭目凝神，随老夫一同运转周天！”",
  "随着你对江湖秘闻的刺探，你得知赤炎魔君正在筹怀魔教祭典，意图利用九幽煞气冲开伏魔殿。百花仙子也派人送来飞鸽传书，恳请各大名门正派赶往魔教荒原。看来，你需要整合各大门派的力量，在限期之内制止这场邪恶仪式。"
];

export const EVENT_RESPONSES = [
  "【世界变迁】一阵寒风卷过，漫天云雾四散开来。随着天时推移，世间灵力脉动随之潮涨潮落，你感觉体内的气血真气也在呼应着天地的吐纳。",
  "【修行感悟】你席地而坐，闭目垂帘。体内丹田中的《沛然诀》真气按照奇经八脉的路线周而复始。运行一个大周天之后，浑身毛孔舒张，心境清明，对武学大道的领悟又深了一分。",
  "【风云诡谲】不远处传来魔教探子的诡异笑声，但在你体内的《飞霜踏雪步》气势下，敌踪眨眼即逝。你暗自戒备，江湖险恶，切莫大意。"
];
