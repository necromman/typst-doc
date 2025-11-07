export class Currency {
  gold: number;

  constructor(initialGold: number = 0) {
    this.gold = initialGold;
  }

  addGold(amount: number): void {
    this.gold += amount;
  }

  removeGold(amount: number): boolean {
    if (this.gold < amount) return false;
    this.gold -= amount;
    return true;
  }

  hasGold(amount: number): boolean {
    return this.gold >= amount;
  }

  toJSON() {
    return {
      gold: this.gold
    };
  }
}
