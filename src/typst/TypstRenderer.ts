import {
  createTypstCompiler,
  createTypstRenderer,
  preloadRemoteFonts
} from '@myriaddreamin/typst.ts';

export class TypstRenderer {
  private compiler: any = null;
  private renderer: any = null;
  private initialized: boolean = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('Initializing Typst compiler and renderer...');

      // Preload fonts
      await preloadRemoteFonts();

      // Create compiler
      this.compiler = createTypstCompiler();
      await this.compiler.init();

      // Create renderer
      this.renderer = createTypstRenderer();
      await this.renderer.init();

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
      // Compile typst code to document
      const doc = await this.compiler.compile({
        mainContent: typstCode,
      });

      // Render document to SVG
      const svg = await this.renderer.renderSvg({
        document: doc,
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
      // Compile typst code to document
      const doc = await this.compiler.compile({
        mainContent: typstCode,
      });

      // Render document to PNG
      const png = await this.renderer.renderPng({
        document: doc,
      });

      return png;
    } catch (error) {
      console.error('Typst rendering error:', error);
      throw error;
    }
  }
}
