export interface DropTableEntry {
  itemId: string;
  chance: number; // 0-1
  quantityMin: number;
  quantityMax: number;
}

export class Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  expReward: number;
  goldReward: number;
  dropTable: DropTableEntry[];

  constructor(
    name: string,
    level: number,
    baseHp: number,
    baseAttack: number,
    baseDefense: number,
    baseSpeed: number,
    dropTable: DropTableEntry[] = []
  ) {
    this.name = name;
    this.level = level;

    const levelMultiplier = 1 + (level - 1) * 0.15;
    this.maxHp = Math.floor(baseHp * levelMultiplier);
    this.hp = this.maxHp;
    this.attack = Math.floor(baseAttack * levelMultiplier);
    this.defense = Math.floor(baseDefense * levelMultiplier);
    this.speed = Math.floor(baseSpeed * levelMultiplier);

    this.expReward = Math.floor(50 * level * 1.2);
    this.goldReward = Math.floor(10 * level * 1.5);
    this.dropTable = dropTable;
  }

  takeDamage(damage: number): number {
    const actualDamage = Math.max(1, damage - this.defense);
    this.hp = Math.max(0, this.hp - actualDamage);
    return actualDamage;
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  getDrops(): { itemId: string; quantity: number }[] {
    const drops: { itemId: string; quantity: number }[] = [];

    for (const entry of this.dropTable) {
      if (Math.random() < entry.chance) {
        const quantity = Math.floor(
          Math.random() * (entry.quantityMax - entry.quantityMin + 1) + entry.quantityMin
        );
        drops.push({ itemId: entry.itemId, quantity });
      }
    }

    return drops;
  }
}

// 적 생성 템플릿
export const ENEMY_TEMPLATES = [
  {
    name: '슬라임',
    minLevel: 1,
    maxLevel: 5,
    hp: 40,
    attack: 5,
    defense: 2,
    speed: 5,
    dropTable: [
      { itemId: 'material_leather', chance: 0.3, quantityMin: 1, quantityMax: 2 },
      { itemId: 'potion_health_small', chance: 0.1, quantityMin: 1, quantityMax: 1 }
    ]
  },
  {
    name: '고블린',
    minLevel: 3,
    maxLevel: 10,
    hp: 60,
    attack: 10,
    defense: 4,
    speed: 8,
    dropTable: [
      { itemId: 'material_iron', chance: 0.2, quantityMin: 1, quantityMax: 1 },
      { itemId: 'sword_basic', chance: 0.05, quantityMin: 1, quantityMax: 1 },
      { itemId: 'potion_health_small', chance: 0.15, quantityMin: 1, quantityMax: 2 }
    ]
  },
  {
    name: '오크 전사',
    minLevel: 8,
    maxLevel: 15,
    hp: 100,
    attack: 18,
    defense: 8,
    speed: 6,
    dropTable: [
      { itemId: 'sword_iron', chance: 0.1, quantityMin: 1, quantityMax: 1 },
      { itemId: 'armor_leather', chance: 0.15, quantityMin: 1, quantityMax: 1 },
      { itemId: 'potion_health_medium', chance: 0.2, quantityMin: 1, quantityMax: 1 }
    ]
  },
  {
    name: '다크 메이지',
    minLevel: 12,
    maxLevel: 20,
    hp: 80,
    attack: 25,
    defense: 5,
    speed: 12,
    dropTable: [
      { itemId: 'staff_basic', chance: 0.15, quantityMin: 1, quantityMax: 1 },
      { itemId: 'ring_health', chance: 0.05, quantityMin: 1, quantityMax: 1 },
      { itemId: 'potion_health_medium', chance: 0.25, quantityMin: 1, quantityMax: 2 }
    ]
  },
  {
    name: '드래곤',
    minLevel: 18,
    maxLevel: 99,
    hp: 200,
    attack: 35,
    defense: 15,
    speed: 10,
    dropTable: [
      { itemId: 'armor_chain', chance: 0.2, quantityMin: 1, quantityMax: 1 },
      { itemId: 'ring_health', chance: 0.15, quantityMin: 1, quantityMax: 1 },
      { itemId: 'potion_health_medium', chance: 0.3, quantityMin: 2, quantityMax: 3 }
    ]
  }
];

export function createEnemy(playerLevel: number): Enemy {
  // 플레이어 레벨에 맞는 적 선택
  const suitableEnemies = ENEMY_TEMPLATES.filter(
    template => playerLevel >= template.minLevel && playerLevel <= template.maxLevel
  );

  if (suitableEnemies.length === 0) {
    // 적합한 적이 없으면 최고 레벨 적 선택
    const template = ENEMY_TEMPLATES[ENEMY_TEMPLATES.length - 1];
    return new Enemy(
      template.name,
      playerLevel,
      template.hp,
      template.attack,
      template.defense,
      template.speed,
      template.dropTable
    );
  }

  // 랜덤하게 선택
  const template = suitableEnemies[Math.floor(Math.random() * suitableEnemies.length)];
  const enemyLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);

  return new Enemy(
    template.name,
    enemyLevel,
    template.hp,
    template.attack,
    template.defense,
    template.speed,
    template.dropTable
  );
}
