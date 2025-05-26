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
  adapter: cloudflare(),
  vite: {
    resolve: {
      alias: {
        // Ensure that for server-side rendering in edge environments,
        // the edge-compatible version of react-dom/server is used.
        'react-dom/server': 'react-dom/server.edge',
        // You might also want to explicitly alias the .browser version if it's somehow still being picked up
        'react-dom/server.browser': 'react-dom/server.edge',
      }
    },
    build: {
      minify: false // Good for debugging, consider setting to true or removing for production builds for smaller bundle sizes
    }
  }
});