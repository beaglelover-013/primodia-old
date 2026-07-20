export type TagTone =
  | 'warning'
  | 'spicy'
  | 'sweet'
  | 'sour'
  | 'savory'
  | 'fresh'
  | 'floral'
  | 'smoky'
  | 'rich'
  | 'texture'
  | 'craft'
  | 'earth'
  | 'cool'
  | 'neutral';

const TAG_TONE_RULES: Array<[TagTone, RegExp]> = [
  ['warning', /焦苦|苦涩|腥|膻|馊|腐|霉|酸败|寡淡|淡而无味|杂乱|冲突|柴散|水烂|夹生|烧焦|过咸|齁甜|油腻|粗粝|干硬/],
  ['spicy', /辛辣|辛香|麻辣|椒麻|辣|胡椒|花椒|姜辛|刺激|灼热|提神/],
  ['sweet', /甜|蜜|糖|焦糖|甘美|甘甜|果脯|蜜饯/],
  ['sour', /酸|醋|清冽|爽口|开胃|果酸/],
  ['savory', /咸|鲜|旨味|肉香|汤鲜|醇鲜|海味|骨香/],
  ['fresh', /清新|青草|草木|草本|香草|薄荷|葱|蒜|蔬菜|青涩|叶香/],
  ['floral', /花香|果香|芳香|芬芳|柑橘|莓果|苹果|梨香|荔枝|玫瑰/],
  ['smoky', /烟熏|熏香|焦香|炭烤|柴火|火香|炉香|烘烤香/],
  ['rich', /浓郁|醇厚|丰腴|奶香|奶油|黄油|脂香|油润|肉脂|荤脂|肥美/],
  ['texture', /酥脆|爽脆|脆|软嫩|嫩|软糯|糯|滑|弹|酥|绵|多汁|紧实|筋道|嚼劲|细腻|松软/],
  ['craft', /水煮|清蒸|炖|焖|煎|炸|烤|腌|发酵|酿|风干|慢煮|熬制|凉拌/],
  ['earth', /泥土|土香|根茎|坚果|菌菇|木香|谷物|麦香|豆香/],
  ['cool', /冰凉|清凉|凉爽|冷冽|冰镇/],
];

export function tagTone(tag: unknown): TagTone {
  const value = String(tag ?? '').trim();
  if (!value) return 'neutral';
  return TAG_TONE_RULES.find(([, pattern]) => pattern.test(value))?.[0] ?? 'neutral';
}

export function tagToneClass(tag: unknown): string {
  return `tag-tone-${tagTone(tag)}`;
}
