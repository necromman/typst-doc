export enum CharacterClass {
  WARRIOR = "전사",
  MAGE = "마법사",
  ROGUE = "도적"
}

export interface Stats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface ClassTrait {
  name: string;
  description: string;
  effects: {
    statMultipliers?: Partial<Record<keyof Stats, number>>;
    critChance?: number;
    counterChance?: number;
    goldBonus?: number;
    expBonus?: number;
  };
}

export const CLASS_TRAITS: Record<CharacterClass, ClassTrait[]> = {
  [CharacterClass.WARRIOR]: [
    {
      name: "강인한 체력",
      description: "최대 HP가 30% 증가합니다",
      effects: {
        statMultipliers: { maxHp: 1.3 }
      }
    },
    {
      name: "철벽 방어",
      description: "방어력이 50% 증가합니다",
      effects: {
        statMultipliers: { defense: 1.5 }
      }
    },
    {
      name: "반격의 달인",
      description: "10% 확률로 받은 피해의 50%를 반사합니다",
      effects: {
        counterChance: 0.1
      }
    }
  ],
  [CharacterClass.MAGE]: [
    {
      name: "마나의 흐름",
      description: "최대 MP가 50% 증가합니다",
      effects: {
        statMultipliers: { maxMp: 1.5 }
      }
    },
    {
      name: "마법 증폭",
      description: "공격력이 40% 증가합니다",
      effects: {
        statMultipliers: { attack: 1.4 }
      }
    },
    {
      name: "지식의 축적",
      description: "경험치 획득량이 20% 증가합니다",
      effects: {
        expBonus: 0.2
      }
    }
  ],
  [CharacterClass.ROGUE]: [
    {
      name: "그림자 은신",
      description: "속도가 60% 증가합니다",
      effects: {
        statMultipliers: { speed: 1.6 }
      }
    },
    {
      name: "치명타",
      description: "25% 확률로 2배의 피해를 입힙니다",
      effects: {
        critChance: 0.25
      }
    },
    {
      name: "노련한 약탈",
      description: "골드 획득량이 30% 증가합니다",
      effects: {
        goldBonus: 0.3
      }
    }
  ]
};

export function getBaseStats(characterClass: CharacterClass, level: number): Stats {
  const baseStats: Record<CharacterClass, Stats> = {
    [CharacterClass.WARRIOR]: {
      hp: 100,
      maxHp: 100,
      mp: 30,
      maxMp: 30,
      attack: 15,
      defense: 12,
      speed: 8
    },
    [CharacterClass.MAGE]: {
      hp: 60,
      maxHp: 60,
      mp: 100,
      maxMp: 100,
      attack: 25,
      defense: 5,
      speed: 10
    },
    [CharacterClass.ROGUE]: {
      hp: 75,
      maxHp: 75,
      mp: 50,
      maxMp: 50,
      attack: 20,
      defense: 8,
      speed: 15
    }
  };

  const base = baseStats[characterClass];
  const levelMultiplier = 1 + (level - 1) * 0.1;

  return {
    hp: Math.floor(base.maxHp * levelMultiplier),
    maxHp: Math.floor(base.maxHp * levelMultiplier),
    mp: Math.floor(base.maxMp * levelMultiplier),
    maxMp: Math.floor(base.maxMp * levelMultiplier),
    attack: Math.floor(base.attack * levelMultiplier),
    defense: Math.floor(base.defense * levelMultiplier),
    speed: Math.floor(base.speed * levelMultiplier)
  };
}

export function applyTraitEffects(stats: Stats, traits: ClassTrait[]): Stats {
  const modified = { ...stats };

  for (const trait of traits) {
    if (trait.effects.statMultipliers) {
      for (const [stat, multiplier] of Object.entries(trait.effects.statMultipliers)) {
        const key = stat as keyof Stats;
        modified[key] = Math.floor(modified[key] * multiplier);
      }
    }
  }

  // HP와 MP는 최대값으로 회복
  modified.hp = modified.maxHp;
  modified.mp = modified.maxMp;

  return modified;
}
