import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'rewrite-dashboard',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/dashboard' || req.url === '/portal') {
            req.url = '/portal.html';
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html'),
        map: resolve(__dirname, 'map.html'),
        portal: resolve(__dirname, 'portal.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
});
