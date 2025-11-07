// @ts-ignore
import { $typst } from '@myriaddreamin/typst.ts';

export class TypstRenderer {
  private initialized: boolean = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await $typst.init();
      this.initialized = true;
      console.log('Typst renderer initialized');
    } catch (error) {
      console.error('Failed to initialize Typst:', error);
      throw error;
    }
  }

  async renderToSVG(typstCode: string): Promise<string> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const result = await $typst.svg({
        mainContent: typstCode
      });

      return result;
    } catch (error) {
      console.error('Typst rendering error:', error);
      throw error;
    }
  }

  async renderToPNG(typstCode: string): Promise<Uint8Array> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const result = await $typst.png({
        mainContent: typstCode
      });

      return result;
    } catch (error) {
      console.error('Typst rendering error:', error);
      throw error;
    }
  }
}
