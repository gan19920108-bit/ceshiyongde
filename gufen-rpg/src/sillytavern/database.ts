import Dexie, { type Table } from 'dexie';
import { Lorebook, CharacterPreset, TavernFloorSnapshot } from './types';

export class SillyTavernDatabase extends Dexie {
  lorebooks!: Table<Lorebook, string>;
  presets!: Table<CharacterPreset, string>;
  floorSnapshots!: Table<TavernFloorSnapshot, string>;

  constructor() {
    super('SillyTavernDatabase');
    this.version(1).stores({
      lorebooks: 'id, name, isGlobalEnabled, lastModified',
      presets: 'id, charName, lastModified',
      floorSnapshots: 'messageId',
    });
  }
}

export const db = new SillyTavernDatabase();

// Seed initial presets and lorebooks if empty
export async function seedDatabase() {
  const presetCount = await db.presets.count();
  if (presetCount === 0) {
    const initialPreset: CharacterPreset = {
      id: 'preset_taiwu',
      charName: '说书人天演',
      avatar: '🎭',
      title: '天演变理',
      faction: '天机阁',
      charPersonality: '幽默、深邃、知天晓命。行文如古雅武侠说书，有仙风侠骨，偶作惊堂木响。',
      systemPrompt: `你是一个极高质量的武侠/修仙RPG说书人(Narrator)。请用经典的武侠评书叙事风格展开对话。
请遵循少侠的操作或选择，推演后续江湖跌宕剧情，用优雅精练的半文白写景抒情，句句有武侠风骨、奇门玄幻之神韵。
你必须将回复格式化，放入以下XML标签内：
<thinking>（你的写作构思、属性变动逻辑、前因后果心境。该部分在界面上会被折叠）</thinking>
<maintext>（剧情正文。描摹精彩的打斗、江湖恩怨、境界提升等。请保持高品质排版，空行分段）</maintext>
<option>（为少侠下一步行动准备3个符合当下情境的趣味性选项，每行一个，也可以包含探索、闭关修炼、前往新地区等）</option>
<sum>（对本回合剧情的一句话精辟总结）</sum>
<vars>（属性更新命令。以JSON格式写入。如果主角的气血HP、真气MP、修为EXP、铜钱coin、灵石stone或名声reputation发生变动，在此合并更新，例如: {"hp": -10, "exp": 45}。属性上限为：maxHp, maxMp, maxExp。当修为(exp)达到或超过 maxExp 时，将满值溢出并在下一个选项或当前段落中提示少侠“前往个人资料页面点击突破契机”进行突破）</vars>`,
      scenario: '大夏末年，天地灵气复苏，道妖并举。江湖传闻【天机谷】内藏《乾坤大天演书》，可推导天下因果气运。玩家作为天机传人，携带残卷下山，一路降妖伏魔、精研武学、突破境界，体悟天道常理。',
      mesExample: '“惊堂木一响，八方风雨来！且说那少侠一记‘太乙剑’出，剑气如霜，直斩妖人面门！”',
      firstMes: '“惊堂木一响，八方风雨来！云长风少侠，你身为天机谷唯一传人，此番携大天演书残卷下山。眼前这大夏江湖波谲云诡，仙魔乱舞，你欲往何处立足、寻觅其余残卷的因果？”',
      lastModified: Date.now()
    };
    await db.presets.put(initialPreset);
  }

  const loreCount = await db.lorebooks.count();
  if (loreCount === 0) {
    const defaultLorebook: Lorebook = {
      id: 'lore_world',
      name: '武林至宝与仙道常理',
      isGlobalEnabled: true,
      lastModified: Date.now(),
      entries: [
        {
          id: 'le_pill_1',
          keys: ['洗髓丹', '灵丹', '丹药', '服用'],
          content: '洗髓丹是太极宗门之极品灵药，主要功效是洗炼周身凡骨、充实真气根基，服用可大幅增加修仙者的修为 (EXP +300)。可在客栈兑换购买。',
          isEnabled: true,
          isConstant: false,
          priority: 10,
          order: 1
        },
        {
          id: 'le_weapon_1',
          keys: ['天机紫铜剑', '宝剑', '御剑', '兵刃'],
          content: '天机紫铜剑是由深海紫铜以及北海玄铁掺入天机阁灵火煅烧七七四十九天而成。重达六十四斤，威力大开大阖，极擅破敌护身。御剑伤害增加 45 点。',
          isEnabled: true,
          isConstant: false,
          priority: 9,
          order: 2
        },
        {
          id: 'le_sect_1',
          keys: ['天机谷', '宗门', '师傅', '残卷'],
          content: '天机谷是隐世宗门，历代单传，守护着《大天演书》残卷。历任谷主被尊称为天道演算师，精通星象推命、无上指玄奇门。',
          isEnabled: true,
          isConstant: false,
          priority: 8,
          order: 3
        }
      ]
    };
    await db.lorebooks.put(defaultLorebook);
  }
}
