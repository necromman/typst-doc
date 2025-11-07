import { CharacterClass, Stats, ClassTrait, CLASS_TRAITS, getBaseStats, applyTraitEffects } from './CharacterClass';
import { Inventory } from '../item/Inventory';
import { Currency } from '../item/Currency';

export class Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  exp: number;
  expToNextLevel: number;
  stats: Stats;
  classTraits: ClassTrait[];
  inventory: Inventory;
  currency: Currency;

  constructor(name: string, characterClass: CharacterClass) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.class = characterClass;
    this.level = 1;
    this.exp = 0;
    this.expToNextLevel = this.calculateExpToNextLevel();
    this.classTraits = CLASS_TRAITS[characterClass];

    const baseStats = getBaseStats(characterClass, this.level);
    this.stats = applyTraitEffects(baseStats, this.classTraits);

    this.inventory = new Inventory(20);
    this.currency = new Currency();
  }

  private calculateExpToNextLevel(): number {
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
  }

  gainExp(amount: number): boolean {
    // 경험치 보너스 적용
    const expBonus = this.classTraits.reduce((total, trait) =>
      total + (trait.effects.expBonus || 0), 0);

    const finalExp = Math.floor(amount * (1 + expBonus));
    this.exp += finalExp;

    // 레벨업 체크
    if (this.exp >= this.expToNextLevel) {
      this.levelUp();
      return true;
    }
    return false;
  }

  private levelUp(): void {
    this.level++;
    this.exp -= this.expToNextLevel;
    this.expToNextLevel = this.calculateExpToNextLevel();

    // 스탯 재계산
    const baseStats = getBaseStats(this.class, this.level);
    const oldMaxHp = this.stats.maxHp;
    const oldMaxMp = this.stats.maxMp;

    this.stats = applyTraitEffects(baseStats, this.classTraits);

    // HP/MP는 증가량만큼 회복
    const hpIncrease = this.stats.maxHp - oldMaxHp;
    const mpIncrease = this.stats.maxMp - oldMaxMp;
    this.stats.hp = Math.min(this.stats.hp + hpIncrease, this.stats.maxHp);
    this.stats.mp = Math.min(this.stats.mp + mpIncrease, this.stats.maxMp);
  }

  gainGold(amount: number): void {
    // 골드 보너스 적용
    const goldBonus = this.classTraits.reduce((total, trait) =>
      total + (trait.effects.goldBonus || 0), 0);

    const finalGold = Math.floor(amount * (1 + goldBonus));
    this.currency.addGold(finalGold);
  }

  takeDamage(damage: number): number {
    const actualDamage = Math.max(1, damage - this.stats.defense);
    this.stats.hp = Math.max(0, this.stats.hp - actualDamage);
    return actualDamage;
  }

  heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.hp + amount, this.stats.maxHp);
  }

  isDead(): boolean {
    return this.stats.hp <= 0;
  }

  getCounterChance(): number {
    return this.classTraits.reduce((total, trait) =>
      total + (trait.effects.counterChance || 0), 0);
  }

  getCritChance(): number {
    return this.classTraits.reduce((total, trait) =>
      total + (trait.effects.critChance || 0), 0);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      class: this.class,
      level: this.level,
      exp: this.exp,
      expToNextLevel: this.expToNextLevel,
      stats: this.stats,
      classTraits: this.classTraits,
      inventory: this.inventory.toJSON(),
      currency: this.currency.toJSON()
    };
  }
}
