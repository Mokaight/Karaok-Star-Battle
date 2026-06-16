import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['avatars/*.png', 'icons/*.png'],
      manifest: {
        name: 'Karaok Star Battle',
        short_name: 'KaraokStar',
        description: 'Chante, défie tes amis, deviens une star !',
        theme_color: '#C9A8E0',
        background_color: '#FDF6FF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})
