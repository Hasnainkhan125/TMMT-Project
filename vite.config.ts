import path from 'path';
import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgr(),
    react(),
    tailwindcss(),
    nodePolyfills({
      protocolImports: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    "process.env": {},
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['ethers'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
