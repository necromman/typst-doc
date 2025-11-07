import { Stats } from '../character/CharacterClass';

export type ItemType = 'equipment' | 'consumable' | 'material';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipSlot = 'weapon' | 'armor' | 'accessory';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  equipSlot?: EquipSlot;
  stats?: Partial<Stats>;
  effect?: ItemEffect;
  metadata?: Record<string, any>;
}

export interface ItemEffect {
  type: 'heal' | 'damage' | 'buff';
  value: number;
  duration?: number;
}

export const ITEM_DATABASE: Item[] = [
  // 무기
  {
    id: 'sword_basic',
    name: '낡은 검',
    type: 'equipment',
    rarity: 'common',
    description: '오래되어 녹슬었지만 아직 쓸만한 검',
    equipSlot: 'weapon',
    stats: { attack: 5 }
  },
  {
    id: 'sword_iron',
    name: '철제 검',
    type: 'equipment',
    rarity: 'uncommon',
    description: '단단한 철로 만든 검',
    equipSlot: 'weapon',
    stats: { attack: 12 }
  },
  {
    id: 'staff_basic',
    name: '나무 지팡이',
    type: 'equipment',
    rarity: 'common',
    description: '마법사들이 사용하는 기본 지팡이',
    equipSlot: 'weapon',
    stats: { attack: 8, maxMp: 10 }
  },
  {
    id: 'dagger_basic',
    name: '강철 단검',
    type: 'equipment',
    rarity: 'common',
    description: '날카로운 단검',
    equipSlot: 'weapon',
    stats: { attack: 7, speed: 3 }
  },

  // 방어구
  {
    id: 'armor_leather',
    name: '가죽 갑옷',
    type: 'equipment',
    rarity: 'common',
    description: '가벼운 가죽 갑옷',
    equipSlot: 'armor',
    stats: { defense: 3, maxHp: 20 }
  },
  {
    id: 'armor_chain',
    name: '사슬 갑옷',
    type: 'equipment',
    rarity: 'uncommon',
    description: '튼튼한 사슬로 만든 갑옷',
    equipSlot: 'armor',
    stats: { defense: 8, maxHp: 50 }
  },

  // 장신구
  {
    id: 'ring_health',
    name: '생명의 반지',
    type: 'equipment',
    rarity: 'rare',
    description: '생명력을 증가시키는 신비한 반지',
    equipSlot: 'accessory',
    stats: { maxHp: 100 }
  },

  // 소비 아이템
  {
    id: 'potion_health_small',
    name: '작은 생명력 물약',
    type: 'consumable',
    rarity: 'common',
    description: 'HP를 50 회복합니다',
    effect: { type: 'heal', value: 50 }
  },
  {
    id: 'potion_health_medium',
    name: '생명력 물약',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'HP를 150 회복합니다',
    effect: { type: 'heal', value: 150 }
  },

  // 재료
  {
    id: 'material_leather',
    name: '가죽 조각',
    type: 'material',
    rarity: 'common',
    description: '가죽 제작에 사용되는 재료'
  },
  {
    id: 'material_iron',
    name: '철광석',
    type: 'material',
    rarity: 'common',
    description: '무기 제작에 사용되는 철광석'
  }
];

export function getItemById(id: string): Item | undefined {
  return ITEM_DATABASE.find(item => item.id === id);
}

export function createItem(id: string): Item | undefined {
  const template = getItemById(id);
  if (!template) return undefined;

  return { ...template };
}
