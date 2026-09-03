import { defineConfig } from 'vite';

// GitHub Pages はリポジトリ名のサブパスで配信されるため、
// ビルド時に環境変数 BASE_PATH で base を差し替えられるようにしておく。
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
  },
});
