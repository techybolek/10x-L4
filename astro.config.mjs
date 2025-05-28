// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  server: {
    port: 3000
  },
  integrations: [react(), sitemap(), tailwind()],
  adapter: process.env.DEPLOYMENT_ENV === 'cloudflare' 
    ? cloudflare()
    : node({
        mode: "standalone",
        port: 3000
      }),
  env: {
    schema: {
      SUPABASE_URL: envField.string({ 
        context: "server", 
        access: "public" 
      }),
      SUPABASE_KEY: envField.string({ 
        context: "server", 
        access: process.env.DEPLOYMENT_ENV === 'cloudflare' ? "secret" : "public"
      }),
      OPENROUTER_API_KEY: envField.string({ 
        context: "server", 
        access: process.env.DEPLOYMENT_ENV === 'cloudflare' ? "secret" : "public"
      }),
    }
  },
  vite: {
    resolve: {
      alias: process.env.DEPLOYMENT_ENV === 'cloudflare' 
        ? {
            'react-dom/server': 'react-dom/server.edge',
            'react-dom/server.browser': 'react-dom/server.edge',
          }
        : {}
    },
    build: {
      minify: false
    }
  }
});