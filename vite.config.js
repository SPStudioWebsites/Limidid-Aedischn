import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Inject <link rel="preload"> for the Latin Inter Variable and Bebas Neue fonts
// directly into the built index.html so the browser can fetch them in parallel
// with the CSS — removing fonts from the render-blocking dependency chain.
function fontPreloadPlugin() {
  // Match only the two font files the browser needs for a German page:
  // • inter-latin-wght: body text (Latin subset covers all German characters)
  // • bebas-neue-latin-400: display headings
  const WANTED = /inter-latin-wght-normal|bebas-neue-latin-400-normal/
  return {
    name: 'inject-font-preloads',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) return html
        const preloads = Object.keys(bundle)
          .filter(key => key.endsWith('.woff2') && WANTED.test(key))
          .map(key => `    <link rel="preload" as="font" type="font/woff2" crossorigin="" href="/${key}">`)
          .join('\n')
        return html.replace('</head>', `${preloads}\n  </head>`)
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), fontPreloadPlugin()],
  build: {
    // Raise the warning limit slightly — the main bundle will still be split
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        // Split vendor chunk (React) from app code so the browser can cache
        // React separately across deploys
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
