import { GameState } from './engine/GameState';
import { CharacterClass } from './engine/character/CharacterClass';
import { TemplateGenerator } from './typst/TemplateGenerator';
import { TypstRenderer } from './typst/TypstRenderer';

class GameApp {
  private gameState: GameState;
  private renderer: TypstRenderer;
  private selectedClass: CharacterClass | null = null;
  private gameLoopInterval: number | null = null;
  private renderInterval: number | null = null;

  constructor() {
    this.gameState = new GameState();
    this.renderer = new TypstRenderer();
    this.init();
  }

  private async init(): Promise<void> {
    console.log('Initializing Typst RPG...');

    // Initialize Typst renderer
    try {
      await this.renderer.init();
      console.log('Typst renderer ready');
    } catch (error) {
      console.error('Failed to initialize Typst renderer:', error);
      alert('Typst 렌더러 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
      return;
    }

    this.setupEventListeners();
    this.showCharacterCreation();
  }

  private setupEventListeners(): void {
    // Class selection
    const classCards = document.querySelectorAll('.class-card');
    console.log('Found class cards:', classCards.length);

    classCards.forEach(card => {
      card.addEventListener('click', () => {
        console.log('Class card clicked:', card.getAttribute('data-class'));
        classCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const classType = card.getAttribute('data-class') as keyof typeof CharacterClass;
        this.selectedClass = CharacterClass[classType];
        console.log('Selected class:', this.selectedClass);

        const createBtn = document.getElementById('create-character-btn') as HTMLButtonElement;
        createBtn.disabled = false;
      });
    });

    // Create character
    const createBtn = document.getElementById('create-character-btn');
    createBtn?.addEventListener('click', () => this.createCharacter());

    // Character name input - Enter key
    const nameInput = document.getElementById('character-name') as HTMLInputElement;
    nameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !createBtn?.hasAttribute('disabled')) {
        this.createCharacter();
      }
    });

    // Game controls
    document.getElementById('start-hunt-btn')?.addEventListener('click', () => this.startAutoHunt());
    document.getElementById('stop-hunt-btn')?.addEventListener('click', () => this.stopAutoHunt());
    document.getElementById('reset-game-btn')?.addEventListener('click', () => this.resetGame());
  }

  private showCharacterCreation(): void {
    document.getElementById('character-creation')?.classList.remove('hidden');
    document.getElementById('game-screen')?.classList.add('hidden');
  }

  private showGameScreen(): void {
    document.getElementById('character-creation')?.classList.add('hidden');
    document.getElementById('game-screen')?.classList.remove('hidden');
  }

  private createCharacter(): void {
    const nameInput = document.getElementById('character-name') as HTMLInputElement;
    const name = nameInput.value.trim();

    if (!name) {
      alert('캐릭터 이름을 입력해주세요!');
      return;
    }

    if (!this.selectedClass) {
      alert('클래스를 선택해주세요!');
      return;
    }

    // Create character
    this.gameState.createCharacter(name, this.selectedClass);
    console.log('Character created:', name, this.selectedClass);

    // Show game screen
    this.showGameScreen();

    // Initial render
    this.renderGame();
  }

  private startAutoHunt(): void {
    if (!this.gameState.character) return;

    console.log('Starting auto hunt...');
    this.gameState.startAutoHunt();

    // Update UI
    document.getElementById('start-hunt-btn')?.classList.add('hidden');
    document.getElementById('stop-hunt-btn')?.classList.remove('hidden');

    // Start game loop (combat tick every 1 second)
    this.gameLoopInterval = window.setInterval(() => {
      this.gameState.tick();
    }, 1000);

    // Start render loop (update UI every 500ms for smooth updates)
    this.renderInterval = window.setInterval(() => {
      this.renderGame();
    }, 500);

    // Initial render
    this.renderGame();
  }

  private stopAutoHunt(): void {
    console.log('Stopping auto hunt...');
    this.gameState.stopAutoHunt();

    // Update UI
    document.getElementById('start-hunt-btn')?.classList.remove('hidden');
    document.getElementById('stop-hunt-btn')?.classList.add('hidden');

    // Stop loops
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }

    if (this.renderInterval) {
      clearInterval(this.renderInterval);
      this.renderInterval = null;
    }

    // Final render
    this.renderGame();
  }

  private async renderGame(): Promise<void> {
    try {
      // Generate Typst code
      const typstCode = TemplateGenerator.generate(this.gameState);

      // Render to SVG
      const svg = await this.renderer.renderToSVG(typstCode);

      // Display
      const outputContainer = document.getElementById('typst-output');
      if (outputContainer) {
        outputContainer.innerHTML = svg;
      }
    } catch (error) {
      console.error('Rendering error:', error);
      const outputContainer = document.getElementById('typst-output');
      if (outputContainer) {
        outputContainer.innerHTML = `
          <div class="loading" style="color: #dc2626;">
            렌더링 오류가 발생했습니다.<br>
            <small>${error}</small>
          </div>
        `;
      }
    }
  }

  private resetGame(): void {
    if (!confirm('정말로 게임을 초기화하시겠습니까?')) {
      return;
    }

    this.stopAutoHunt();
    this.gameState = new GameState();
    this.selectedClass = null;

    // Reset UI
    const nameInput = document.getElementById('character-name') as HTMLInputElement;
    if (nameInput) nameInput.value = '';

    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach(c => c.classList.remove('selected'));

    const createBtn = document.getElementById('create-character-btn') as HTMLButtonElement;
    if (createBtn) createBtn.disabled = true;

    this.showCharacterCreation();
  }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
