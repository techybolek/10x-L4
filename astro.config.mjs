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
      noExternal: ['react-dom'],
      external: ['node:buffer', 'node:stream', 'node:util', 'node:events']
    },

    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.browser'
      }
    },
    build: {
      minify: false // This helps with debugging if needed
    }
  }
});
