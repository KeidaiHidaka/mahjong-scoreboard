import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // ← 追加
import path from 'path';

export default defineConfig({
  base: "/mahjong-scoreboard/",
  plugins: [
    react(),
    tailwindcss(), // ← 追加
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
