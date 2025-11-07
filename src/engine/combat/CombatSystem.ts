import { Character } from '../character/Character';
import { Enemy, createEnemy } from './Enemy';
import { createItem } from '../item/Item';

export type CombatLogType = 'damage' | 'heal' | 'victory' | 'loot' | 'levelup' | 'death';

export interface CombatLogEntry {
  timestamp: number;
  type: CombatLogType;
  message: string;
}

export class CombatSystem {
  character: Character;
  currentEnemy: Enemy | null = null;
  combatLog: CombatLogEntry[] = [];
  isActive: boolean = false;
  totalKills: number = 0;
  totalDamageDealt: number = 0;

  private maxLogEntries: number = 50;

  constructor(character: Character) {
    this.character = character;
  }

  startCombat(): void {
    if (this.isActive) return;
    this.isActive = true;
    this.spawnEnemy();
  }

  stopCombat(): void {
    this.isActive = false;
  }

  private spawnEnemy(): void {
    this.currentEnemy = createEnemy(this.character.level);
    this.addLog('damage', `${this.currentEnemy.name} (Lv.${this.currentEnemy.level})이(가) 나타났다!`);
  }

  private addLog(type: CombatLogType, message: string): void {
    this.combatLog.unshift({
      timestamp: Date.now(),
      type,
      message
    });

    // 로그가 너무 많으면 오래된 것 삭제
    if (this.combatLog.length > this.maxLogEntries) {
      this.combatLog = this.combatLog.slice(0, this.maxLogEntries);
    }
  }

  tick(): void {
    if (!this.isActive || !this.currentEnemy) return;

    // 속도 비교로 선공 결정
    if (this.character.stats.speed >= this.currentEnemy.speed) {
      this.playerAttack();
      if (!this.currentEnemy.isDead()) {
        this.enemyAttack();
      }
    } else {
      this.enemyAttack();
      if (!this.character.isDead()) {
        this.playerAttack();
      }
    }

    // 전투 결과 처리
    if (this.currentEnemy && this.currentEnemy.isDead()) {
      this.onEnemyDefeated();
    }

    if (this.character.isDead()) {
      this.onPlayerDeath();
    }
  }

  private playerAttack(): void {
    if (!this.currentEnemy) return;

    let damage = this.character.stats.attack;

    // 크리티컬 확률 체크
    const critChance = this.character.getCritChance();
    const isCrit = Math.random() < critChance;
    if (isCrit) {
      damage *= 2;
    }

    const actualDamage = this.currentEnemy.takeDamage(damage);
    this.totalDamageDealt += actualDamage;

    const critText = isCrit ? ' [크리티컬!]' : '';
    this.addLog('damage', `${this.character.name}의 공격! ${actualDamage} 피해${critText}`);
  }

  private enemyAttack(): void {
    if (!this.currentEnemy) return;

    const damage = this.currentEnemy.attack;
    const actualDamage = this.character.takeDamage(damage);

    this.addLog('damage', `${this.currentEnemy.name}의 공격! ${actualDamage} 피해를 받았다`);

    // 반격 확률 체크
    const counterChance = this.character.getCounterChance();
    if (Math.random() < counterChance) {
      const counterDamage = Math.floor(actualDamage * 0.5);
      const actualCounterDamage = this.currentEnemy.takeDamage(counterDamage);
      this.addLog('damage', `[반격!] ${actualCounterDamage} 피해 반사!`);
    }
  }

  private onEnemyDefeated(): void {
    if (!this.currentEnemy) return;

    this.totalKills++;
    this.addLog('victory', `${this.currentEnemy.name}을(를) 처치했다!`);

    // 경험치 획득
    const expGained = this.currentEnemy.expReward;
    const leveledUp = this.character.gainExp(expGained);
    this.addLog('loot', `경험치 +${expGained}`);

    if (leveledUp) {
      this.addLog('levelup', `⭐ 레벨 업! Lv.${this.character.level} (HP/MP 회복)`);
    }

    // 골드 획득
    const goldGained = this.currentEnemy.goldReward;
    this.character.gainGold(goldGained);
    this.addLog('loot', `골드 +${goldGained}G`);

    // 아이템 드롭
    const drops = this.currentEnemy.getDrops();
    for (const drop of drops) {
      const item = createItem(drop.itemId);
      if (item) {
        const added = this.character.inventory.addItem(item, drop.quantity);
        if (added) {
          this.addLog('loot', `${item.name} x${drop.quantity} 획득!`);
        } else {
          this.addLog('loot', `인벤토리가 가득 차서 ${item.name}을(를) 획득하지 못했다`);
        }
      }
    }

    // 다음 적 생성
    if (this.isActive) {
      this.spawnEnemy();
    } else {
      this.currentEnemy = null;
    }
  }

  private onPlayerDeath(): void {
    this.addLog('death', '💀 전투 불능 상태가 되었다...');
    this.stopCombat();

    // 사망 페널티: 골드 10% 감소
    const goldLost = Math.floor(this.character.currency.gold * 0.1);
    this.character.currency.removeGold(goldLost);
    this.addLog('death', `골드 ${goldLost}G를 잃었다`);

    // HP 회복
    this.character.heal(this.character.stats.maxHp);
    this.addLog('heal', 'HP가 완전히 회복되었다');
  }

  getRecentLogs(count: number = 20): CombatLogEntry[] {
    return this.combatLog.slice(0, count);
  }

  toJSON() {
    return {
      currentEnemy: this.currentEnemy ? {
        name: this.currentEnemy.name,
        level: this.currentEnemy.level,
        hp: this.currentEnemy.hp,
        maxHp: this.currentEnemy.maxHp
      } : null,
      combatLog: this.getRecentLogs(),
      isActive: this.isActive,
      totalKills: this.totalKills,
      totalDamageDealt: this.totalDamageDealt
    };
  }
}
