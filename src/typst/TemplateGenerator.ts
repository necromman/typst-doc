import { GameState } from '../engine/GameState';

export class TemplateGenerator {
  static generate(gameState: GameState): string {
    const data = gameState.toJSON();
    if (!data) {
      return this.generateWelcomeScreen();
    }

    const { character, combat, playTime } = data;

    return `
#set page(width: 21cm, height: 29.7cm, margin: 1.5cm)
#set text(font: "Noto Sans KR", size: 11pt, lang: "ko")
#set par(justify: false, leading: 0.65em)
#set heading(numbering: none)

// 색상 정의
#let primary = rgb("#2563eb")
#let success = rgb("#16a34a")
#let danger = rgb("#dc2626")
#let warning = rgb("#ea580c")
#let muted = rgb("#6b7280")

// 프로그레스 바 함수
#let progress-bar(current, max, color) = {
  let percentage = calc.min(100, (current / max) * 100)
  box(
    width: 100%,
    height: 1.2em,
    stroke: 0.5pt + muted,
    radius: 2pt,
    {
      if percentage > 0 {
        place(
          left,
          box(
            width: percentage * 1%,
            height: 100%,
            fill: color,
            radius: 2pt
          )
        )
      }
      place(
        center + horizon,
        text(size: 9pt, fill: white, weight: "bold")[
          #current / #max (#calc.round(percentage, digits: 1)%)
        ]
      )
    }
  )
}

// 스탯 박스
#let stat-box(label, value) = {
  box(
    width: 100%,
    inset: 8pt,
    fill: rgb("#f3f4f6"),
    radius: 4pt,
    {
      text(size: 9pt, fill: muted)[#label]
      linebreak()
      text(size: 13pt, weight: "bold")[#value]
    }
  )
}

// 메인 타이틀
#align(center)[
  #text(size: 24pt, weight: "bold", fill: primary)[
    ⚔️ ${character.name}의 모험 일지
  ]
  #v(0.3em)
  #text(size: 11pt, fill: muted)[
    ${character.class} • Lv.${character.level} • 플레이 시간: ${this.formatPlayTime(playTime)}
  ]
]

#v(1em)
#line(length: 100%, stroke: 0.5pt + muted)
#v(1em)

// 2단 레이아웃
#grid(
  columns: (1fr, 1fr),
  gutter: 1.5em,

  // 왼쪽 열
  [
    = 📊 캐릭터 상태

    #v(0.5em)

    *생명력 (HP)*
    #progress-bar(${character.stats.hp}, ${character.stats.maxHp}, danger)

    #v(0.5em)

    *마나 (MP)*
    #progress-bar(${character.stats.mp}, ${character.stats.maxMp}, primary)

    #v(0.5em)

    *경험치*
    #progress-bar(${character.exp}, ${character.expToNextLevel}, success)

    #v(1em)

    #grid(
      columns: (1fr, 1fr, 1fr),
      gutter: 0.5em,
      stat-box("공격력", "${character.stats.attack}"),
      stat-box("방어력", "${character.stats.defense}"),
      stat-box("속도", "${character.stats.speed}")
    )

    #v(1em)

    = 💎 재화

    #v(0.5em)

    #box(
      width: 100%,
      inset: 10pt,
      fill: rgb("#fef3c7"),
      radius: 4pt,
      stroke: 1pt + rgb("#f59e0b"),
      text(size: 16pt, weight: "bold", fill: rgb("#92400e"))[
        🪙 ${character.currency.gold.toLocaleString()} 골드
      ]
    )

    #v(1em)

    = ⭐ 클래스 특성

    #v(0.5em)

    ${this.generateTraits(character.classTraits)}

  ],

  // 오른쪽 열
  [
    = ⚔️ 전투 현황

    #v(0.5em)

    ${this.generateCombatStatus(combat)}

    #v(1em)

    = 📜 전투 기록

    #v(0.5em)

    ${this.generateCombatLog(combat.combatLog)}
  ]
)

#v(1em)

= 🎒 인벤토리 (${character.inventory.slots.length}/${character.inventory.maxSlots})

#v(0.5em)

${this.generateInventory(character.inventory)}

#v(1em)

#align(center)[
  #text(size: 8pt, fill: muted)[
    총 처치: ${combat.totalKills}마리 | 총 피해량: ${combat.totalDamageDealt.toLocaleString()}
  ]
]
`;
  }

  private static generateWelcomeScreen(): string {
    return `
#set page(width: 21cm, height: 29.7cm, margin: 2cm)
#set text(font: "Noto Sans KR", size: 12pt, lang: "ko")

#align(center + horizon)[
  #text(size: 32pt, weight: "bold")[
    ⚔️ Typst RPG
  ]

  #v(1em)

  #text(size: 14pt, fill: rgb("#6b7280"))[
    문서로 즐기는 방치형 RPG
  ]

  #v(2em)

  #text(size: 11pt)[
    캐릭터를 생성하고 자동 사냥을 시작하세요!
  ]
]
`;
  }

  private static generateTraits(traits: any[]): string {
    return traits.map(trait => `
    #box(
      width: 100%,
      inset: 8pt,
      fill: rgb("#ede9fe"),
      radius: 4pt,
      stroke: 0.5pt + rgb("#7c3aed"),
      [
        *${trait.name}*
        #v(0.2em)
        #text(size: 9pt, fill: rgb("#6b7280"))[${trait.description}]
      ]
    )
    #v(0.5em)
    `).join('\n');
  }

  private static generateCombatStatus(combat: any): string {
    if (!combat.currentEnemy) {
      return `
    #box(
      width: 100%,
      inset: 10pt,
      fill: rgb("#f3f4f6"),
      radius: 4pt,
      align(center)[
        #text(fill: rgb("#6b7280"))[전투 중이 아닙니다]
      ]
    )
      `;
    }

    const { currentEnemy } = combat;
    const status = combat.isActive ? '전투 중' : '일시 정지';
    const statusColor = combat.isActive ? 'rgb("#16a34a")' : 'rgb("#ea580c")';

    return `
    #box(
      width: 100%,
      inset: 10pt,
      fill: rgb("#fef2f2"),
      radius: 4pt,
      stroke: 1pt + rgb("#dc2626"),
      [
        #text(size: 12pt, weight: "bold")[
          ${currentEnemy.name} (Lv.${currentEnemy.level})
        ]
        #h(1fr)
        #text(size: 9pt, fill: ${statusColor}, weight: "bold")[${status}]

        #v(0.5em)

        #let hp-percent = ${currentEnemy.hp} / ${currentEnemy.maxHp} * 100
        #box(
          width: 100%,
          height: 1em,
          stroke: 0.5pt + rgb("#6b7280"),
          radius: 2pt,
          place(
            left,
            box(
              width: hp-percent * 1%,
              height: 100%,
              fill: rgb("#dc2626"),
              radius: 2pt
            )
          )
        )

        #v(0.3em)

        #text(size: 9pt)[
          HP: ${currentEnemy.hp} / ${currentEnemy.maxHp}
        ]
      ]
    )
    `;
  }

  private static generateCombatLog(logs: any[]): string {
    if (logs.length === 0) {
      return `
    #box(
      width: 100%,
      inset: 10pt,
      fill: rgb("#f9fafb"),
      radius: 4pt,
      align(center)[
        #text(size: 9pt, fill: rgb("#9ca3af"))[전투 기록이 없습니다]
      ]
    )
      `;
    }

    const logEntries = logs.slice(0, 15).map(log => {
      const icon = this.getLogIcon(log.type);
      const color = this.getLogColor(log.type);

      return `
      #box(
        width: 100%,
        inset: 6pt,
        fill: rgb("#ffffff"),
        stroke: 0.5pt + rgb("#e5e7eb"),
        radius: 2pt,
        [
          #text(fill: ${color})[${icon}]
          #h(0.3em)
          #text(size: 9pt)[${log.message}]
        ]
      )
      #v(0.3em)
      `;
    }).join('\n');

    return `
    #box(
      width: 100%,
      height: 25em,
      inset: 8pt,
      fill: rgb("#f9fafb"),
      radius: 4pt,
      stroke: 0.5pt + rgb("#d1d5db"),
      [
        ${logEntries}
      ]
    )
    `;
  }

  private static generateInventory(inventory: any): string {
    if (inventory.slots.length === 0) {
      return `
#box(
  width: 100%,
  inset: 10pt,
  fill: rgb("#f9fafb"),
  radius: 4pt,
  align(center)[
    #text(fill: rgb("#9ca3af"))[인벤토리가 비어있습니다]
  ]
)
      `;
    }

    const items = inventory.slots.map((slot: any) => {
      const rarityColor = this.getRarityColor(slot.item.rarity);
      const typeIcon = this.getItemTypeIcon(slot.item.type);

      return `
      [
        #box(
          inset: 6pt,
          fill: ${rarityColor},
          radius: 3pt,
          stroke: 0.5pt + rgb("#d1d5db"),
          [
            ${typeIcon} *${slot.item.name}*
            ${slot.quantity > 1 ? ` x${slot.quantity}` : ''}
          ]
        )
      ]
      `;
    }).join(',\n');

    return `
#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  gutter: 0.5em,
  ${items}
)
    `;
  }

  private static getLogIcon(type: string): string {
    const icons: Record<string, string> = {
      damage: '⚔️',
      heal: '💚',
      victory: '🏆',
      loot: '📦',
      levelup: '⭐',
      death: '💀'
    };
    return icons[type] || '•';
  }

  private static getLogColor(type: string): string {
    const colors: Record<string, string> = {
      damage: 'rgb("#dc2626")',
      heal: 'rgb("#16a34a")',
      victory: 'rgb("#2563eb")',
      loot: 'rgb("#7c3aed")',
      levelup: 'rgb("#ea580c")',
      death: 'rgb("#000000")'
    };
    return colors[type] || 'rgb("#6b7280")';
  }

  private static getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: 'rgb("#f3f4f6")',
      uncommon: 'rgb("#dcfce7")',
      rare: 'rgb("#dbeafe")',
      epic: 'rgb("#e9d5ff")',
      legendary: 'rgb("#fef3c7")'
    };
    return colors[rarity] || 'rgb("#f3f4f6")';
  }

  private static getItemTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      equipment: '⚔️',
      consumable: '🧪',
      material: '📦'
    };
    return icons[type] || '•';
  }

  private static formatPlayTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    } else {
      return `${seconds}초`;
    }
  }
}
