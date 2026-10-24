import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4286,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_PROXY || 'http://127.0.0.1:4285',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4286,
    strictPort: true,
  },
});
