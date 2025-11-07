import { Character } from './character/Character';
import { CharacterClass } from './character/CharacterClass';
import { CombatSystem } from './combat/CombatSystem';

export class GameState {
  character: Character | null = null;
  combat: CombatSystem | null = null;
  gameStartTime: number = 0;

  createCharacter(name: string, characterClass: CharacterClass): void {
    this.character = new Character(name, characterClass);
    this.combat = new CombatSystem(this.character);
    this.gameStartTime = Date.now();
  }

  startAutoHunt(): void {
    if (!this.combat) return;
    this.combat.startCombat();
  }

  stopAutoHunt(): void {
    if (!this.combat) return;
    this.combat.stopCombat();
  }

  tick(): void {
    if (this.combat && this.combat.isActive) {
      this.combat.tick();
    }
  }

  toJSON() {
    if (!this.character || !this.combat) {
      return null;
    }

    return {
      character: this.character.toJSON(),
      combat: this.combat.toJSON(),
      gameStartTime: this.gameStartTime,
      playTime: Date.now() - this.gameStartTime
    };
  }
}
