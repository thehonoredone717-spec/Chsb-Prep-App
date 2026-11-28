import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'copy-sw-script',
        apply: 'build',
        closeBundle() {
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcSw = path.resolve(import.meta.dirname, 'public/sw.js');
          const destSw = path.resolve(distDir, 'sw.js');
          if (fs.existsSync(srcSw)) {
            fs.copyFileSync(srcSw, destSw);
          }
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/firebase/')) return 'vendor-firebase';
            if (id.includes('/node_modules/lucide-react/')) return 'vendor-icons';
            if (id.includes('/node_modules/motion/') || id.includes('/node_modules/framer-motion/')) {
              return 'vendor-motion';
            }
            if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('/src/data/')) {
              return 'question-banks';
            }
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
