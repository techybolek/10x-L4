// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap(), tailwind()],
  adapter: cloudflare({
    imageService: "cloudflare"
  }),
  vite: {
    ssr: {
      noExternal: ['react', 'react-dom', '@astrojs/react', 'scheduler'],
      external: ['node:buffer', 'node:stream', 'node:util', 'node:events']
    },
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.browser',
        'react-dom': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling'
      }
    },
    build: {
      minify: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'scheduler']
    }
  }
});
