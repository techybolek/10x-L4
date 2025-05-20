// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap(), tailwind()],
  server: { port: 3000 },
  adapter: netlify(),
  experimental: {
    session: true
  },
  vite: {
    ssr: {
      noExternal: ['path-to-regexp']
    }
  }
});
