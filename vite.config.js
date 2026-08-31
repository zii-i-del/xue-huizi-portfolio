import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { sites } from '@openai/sites-vite-plugin'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    sites(),
    cloudflare({
      viteEnvironment: { name: 'server' },
      config: {
        name: 'xue-huizi-portfolio',
        main: './src/worker.js',
        compatibility_date: '2026-05-15',
        compatibility_flags: ['nodejs_compat'],
        assets: {
          directory: './dist/client',
        },
      },
    }),
  ],
  base: './',
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: {
            main: `${rootDir}index.html`,
            jidu: `${rootDir}work/jidu/index.html`,
            xiwu: `${rootDir}work/xiwu/index.html`,
            vrEnglish: `${rootDir}work/vr-english/index.html`,
            youjia: `${rootDir}work/youjia/index.html`,
          },
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
