// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    react({
      include: ['**/react/**'],
      experimentalReactChildren: true
    }), 
    sitemap(), 
    tailwind()
  ],
  adapter: cloudflare({
    imageService: "passthrough"
  }),
  vite: {
    ssr: {
      noExternal: ['react', 'react-dom', '@astrojs/react'],
      target: 'webworker',
      external: ['node:buffer', 'node:stream', 'node:util', 'node:events']
    },
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.browser'
      }
    },
    build: {
      minify: false
    }
  }
});
