import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Build a fully self-contained single-file app in dist/index.html.
// Every asset (JS/CSS/textures) is inlined, so the game runs 100% offline —
// double-click dist/index.html, host it anywhere, or wrap it in a WebView APK.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000,
  },
});
