// @ts-ignore
import { $typst } from '@myriaddreamin/typst-all-in-one.ts';

export class TypstRenderer {
  private initialized: boolean = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('Initializing Typst renderer...');

      // The all-in-one package initializes automatically
      this.initialized = true;
      console.log('Typst renderer initialized successfully');
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
      // Use $typst.svg() from all-in-one package
      const svg = await $typst.svg({
        mainContent: typstCode,
      });

      return svg;
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
      // Use $typst.png() from all-in-one package
      const png = await $typst.png({
        mainContent: typstCode,
      });

      return png;
    } catch (error) {
      console.error('Typst rendering error:', error);
      throw error;
    }
  }
}
