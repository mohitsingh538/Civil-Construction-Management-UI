import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  // Monorepo: VITE_* vars live in repo-root `.env`, not `web/.env`
  envDir: path.resolve(__dirname, '..'),
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, '../core'),
      '@core/ai-invoice': path.resolve(__dirname, '../core/ai-invoice'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
