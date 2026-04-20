import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

/**
 * EventFlow AI - Vite Configuration
 * 
 * Manages the frontend build pipeline and development server state.
 * Configured to explicitly disable HMR and file watching to prevent 
 * WebSocket connectivity noise in the sandboxed dev environment.
 */
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Direct HMR deactivation to stop the 'failed to connect to websocket' logs.
      hmr: false,
      watch: {
        // Halt file watching to prevent unintended re-renders during code generation.
        ignored: ['**'],
      },
    },
  };
});
