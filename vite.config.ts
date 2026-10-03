import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the site under /<repo-name>/; CI passes the real name.
const base = process.env.BASE_PATH ?? '/ristoview/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    svelte(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ristoview',
        short_name: 'ristoview',
        description: 'Le nostre cene, un regalo al mese.',
        lang: 'it',
        theme_color: '#f4a7be',
        background_color: '#fdeef2',
        display: 'standalone',
        start_url: base,
        scope: base,
        // Rendered from assets/*.svg by `bun run icons`.
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png', purpose: 'any' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'monochrome-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'monochrome' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Data never goes through the service worker: always fresh from GitHub.
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
})
