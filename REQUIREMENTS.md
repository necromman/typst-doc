# Typst RPG - 요구사항 및 구현 계획

## 📋 프로젝트 개요

**컨셉**: Typst로 렌더링되는 문서형 방치형 RPG
- 게임 상태를 Typst 문서로 표현
- 실시간 데이터 바인딩으로 문서 업데이트
- 소설책을 읽듯이 게임 진행 상황 확인

---

## 🎯 핵심 요구사항

### 1. 캐릭터 시스템
- [x] 캐릭터 이름 설정
- [x] 클래스 선택 (최소 3개)
- [x] 클래스별 고유 특성
- [x] 기본 스탯 시스템 (HP, MP, 공격력, 방어력 등)
- [x] 레벨업 시스템

### 2. 전투 시스템
- [x] 무한 전투 가능
- [x] 자동 사냥 기능
- [x] 전투 로그 기록
- [x] 경험치 획득 및 레벨업
- [x] 아이템 드롭

### 3. 아이템 & 재화 시스템
- [x] 인벤토리 시스템
- [x] 재화 (골드)
- [x] 아이템 타입 (장비, 소비, 재료)
- [x] 확장 가능한 아이템 구조

### 4. UI/UX
- [x] Typst로 렌더링되는 문서형 UI
- [x] 캐릭터 상태창
- [x] 전투 현황 & 로그
- [x] 인벤토리
- [x] 퀘스트/진행도 (POC에서는 간단히)

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────┐
│         Game Engine (TypeScript)         │
│  ┌────────────┐  ┌──────────────────┐   │
│  │ Character  │  │  Combat System   │   │
│  │  System    │  │  (Auto-hunting)  │   │
│  └────────────┘  └──────────────────┘   │
│  ┌────────────┐  ┌──────────────────┐   │
│  │ Inventory  │  │  Item/Currency   │   │
│  │  System    │  │     System       │   │
│  └────────────┘  └──────────────────┘   │
└─────────────────�────┬────────────────────┘
                      │ Game State
                      ↓
┌─────────────────────────────────────────┐
│      Typst Template Generator           │
│  - character-sheet.typ                  │
│  - combat-log.typ                       │
│  - inventory.typ                        │
└─────────────────┬───────────────────────┘
                  │ Typst Code
                  ↓
┌─────────────────────────────────────────┐
│      Typst Renderer (typst.ts)          │
│      → SVG/PDF Output                   │
└─────────────────┬───────────────────────┘
                  │ Rendered Document
                  ↓
┌─────────────────────────────────────────┐
│      Web UI (React/Vanilla)             │
│      - 문서 표시                         │
│      - 설정 UI (DOM)                     │
└─────────────────────────────────────────┘
```

---

## 📊 데이터 구조 설계

### Character
```typescript
interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  exp: number;
  expToNextLevel: number;

  stats: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
    speed: number;
  };

  classTraits: ClassTrait[];
  inventory: Inventory;
  currency: Currency;
}
```

### Class System
```typescript
enum CharacterClass {
  WARRIOR = "전사",
  MAGE = "마법사",
  ROGUE = "도적"
}

interface ClassTrait {
  name: string;
  description: string;
  effect: TraitEffect;
}

// 예시:
// 전사: 높은 HP, 방어력 보너스, 반격 확률
// 마법사: 높은 MP, 마법 공격력, 스킬 쿨다운 감소
// 도적: 높은 회피율, 크리티컬 확률, 골드 획득량 증가
```

### Combat System
```typescript
interface CombatState {
  isActive: boolean;
  currentEnemy: Enemy | null;
  combatLog: CombatLogEntry[];
  totalKills: number;
  totalDamageDealt: number;
}

interface Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
  dropTable: DropTableEntry[];
}

interface CombatLogEntry {
  timestamp: number;
  type: 'damage' | 'heal' | 'victory' | 'loot';
  message: string;
}
```

### Item & Currency
```typescript
interface Item {
  id: string;
  name: string;
  type: 'equipment' | 'consumable' | 'material';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;

  // 장비 전용
  equipSlot?: 'weapon' | 'armor' | 'accessory';
  stats?: Partial<Stats>;

  // 소비 아이템 전용
  effect?: ItemEffect;

  // 확장성을 위한 메타데이터
  metadata?: Record<string, any>;
}

interface Inventory {
  items: InventorySlot[];
  maxSlots: number;
}

interface InventorySlot {
  item: Item;
  quantity: number;
}

interface Currency {
  gold: number;
  // 확장 가능: gem, crystal 등
}
```

---

## 🎮 게임 플레이 플로우

```
1. 게임 시작
   ↓
2. 캐릭터 생성 (이름, 클래스 선택)
   ↓
3. 자동 사냥 시작
   ↓
4. [무한 루프]
   - 적 생성 (레벨에 맞는)
   - 전투 진행 (자동)
   - 경험치/골드/아이템 획득
   - 레벨업 체크
   - Typst 문서 업데이트
   ↓
5. 사용자는 실시간으로 문서 확인
   - 캐릭터 성장 관찰
   - 전투 로그 읽기
   - 인벤토리 확인
```

---

## 🚀 POC 구현 범위

### Phase 1: Core Systems (POC)
1. **캐릭터 시스템**
   - 3개 클래스 (전사, 마법사, 도적)
   - 각 클래스별 2-3개 특성
   - 기본 스탯 시스템

2. **전투 시스템**
   - 간단한 턴제 전투 (자동)
   - 5종류 적 (레벨별)
   - 기본 전투 로그

3. **아이템 시스템**
   - 10개 정도 아이템
   - 골드 시스템
   - 간단한 인벤토리

4. **Typst UI**
   - 캐릭터 시트
   - 전투 로그 (최근 20개)
   - 인벤토리 목록

### Phase 2: 확장 (POC 이후)
- 스킬 시스템
- 장비 강화
- 퀘스트 시스템
- 던전/보스
- 저장/불러오기

---

## 🛠️ 기술 스택

### Core
- **Game Engine**: TypeScript (순수)
- **Typst Renderer**: typst.ts (WASM) 또는 Typst CLI
- **Frontend**: Vanilla JS/TypeScript + HTML (POC), React (확장)

### Dev Tools
- **Build**: Vite
- **Type Checking**: TypeScript
- **Testing**: Vitest (선택)

---

## 📁 프로젝트 구조

```
typst-doc/
├── docs/
│   ├── REQUIREMENTS.md          # 이 문서
│   └── ARCHITECTURE.md          # 상세 아키텍처 (필요시)
│
├── src/
│   ├── engine/                  # 게임 엔진
│   │   ├── character/
│   │   │   ├── Character.ts
│   │   │   ├── CharacterClass.ts
│   │   │   └── ClassTraits.ts
│   │   ├── combat/
│   │   │   ├── CombatSystem.ts
│   │   │   ├── Enemy.ts
│   │   │   └── AutoHunter.ts
│   │   ├── item/
│   │   │   ├── Item.ts
│   │   │   ├── Inventory.ts
│   │   │   └── ItemDatabase.ts
│   │   └── GameState.ts
│   │
│   ├── typst/                   # Typst 관련
│   │   ├── templates/           # .typ 템플릿
│   │   │   ├── character-sheet.typ
│   │   │   ├── combat-log.typ
│   │   │   ├── inventory.typ
│   │   │   └── main.typ
│   │   ├── TemplateGenerator.ts # JS → Typst 변환
│   │   └── TypstRenderer.ts     # Typst 렌더러
│   │
│   ├── web/                     # 웹 UI
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   │
│   └── main.ts                  # 엔트리 포인트
│
├── typst-templates/             # 순수 Typst 템플릿
│   └── ...
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ✅ POC 체크리스트

### 게임 엔진
- [ ] Character 클래스 구현
- [ ] 3개 클래스 정의 및 특성
- [ ] CombatSystem 구현
- [ ] AutoHunter 구현
- [ ] Enemy 생성 로직
- [ ] Item 시스템
- [ ] Inventory 시스템
- [ ] 경험치/레벨업 시스템

### Typst 통합
- [ ] Typst 템플릿 작성
- [ ] TemplateGenerator 구현
- [ ] Typst 렌더링 통합 (WASM or CLI)
- [ ] 실시간 업데이트 로직

### 웹 UI
- [ ] 기본 HTML 구조
- [ ] 캐릭터 생성 UI
- [ ] 자동사냥 시작/정지 버튼
- [ ] Typst 렌더링 결과 표시

### 데이터
- [ ] 초기 적 데이터
- [ ] 초기 아이템 데이터
- [ ] 클래스 특성 데이터

---

## 🎯 성공 기준 (POC)

1. ✅ 캐릭터를 생성하고 클래스를 선택할 수 있다
2. ✅ 자동 사냥이 무한으로 진행된다
3. ✅ 전투 결과가 Typst 문서로 표현된다
4. ✅ 캐릭터가 레벨업한다
5. ✅ 아이템과 골드를 획득한다
6. ✅ 인벤토리를 Typst 문서로 확인할 수 있다
7. ✅ 문서가 아름답게 조판되어 있다

---

## 📅 개발 순서

1. **프로젝트 셋업** (5분)
   - package.json, tsconfig.json, vite.config.ts

2. **게임 엔진 Core** (30분)
   - Character, CharacterClass, Stats
   - Enemy, Combat 기본 로직
   - Item, Inventory 기본 구조

3. **Typst 템플릿** (20분)
   - character-sheet.typ
   - combat-log.typ
   - inventory.typ

4. **Typst 통합** (20분)
   - TemplateGenerator
   - TypstRenderer

5. **웹 UI** (15분)
   - HTML 구조
   - 기본 인터랙션

6. **통합 & 테스트** (10분)
   - 전체 연결
   - 버그 수정

**총 예상 시간: ~100분**

---

## 🔮 향후 확장 아이디어

- 스킬 시스템 (클래스별 고유 스킬)
- 장비 강화/제작
- 퀘스트 시스템
- 던전/레이드
- 길드 시스템
- PvP (턴제)
- 업적 시스템
- 랭킹 시스템
- 저장/불러오기 (LocalStorage)
- PDF 내보내기 (게임 기록서)
- 다양한 테마 (판타지, SF, 현대 등)
