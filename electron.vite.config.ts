import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      watch: {}
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      watch: {}
    }
  },
  renderer: {
    // Load VITE_* from project-root .env (dev) or process.env (CI build) and inline at compile time.
    envDir: resolve('.'),
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()],
    server: {
      watch: {
        ignored: ['**/landing/**', '**/release/**', '**/out/**']
      }
    }
  }
})
