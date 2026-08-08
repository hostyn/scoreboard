// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    AstroPWA({
      registerType: "autoUpdate",
      // El registro lo hace Layout.astro a mano, no hace falta registerSW.js.
      injectRegister: null,
      // La app es 100% estática y guarda las partidas en localStorage, así que
      // precachearla entera la deja utilizable sin conexión.
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ttf,woff2}"],
        navigateFallback: "/",
        // La fuente RobotoFlex sola pesa 1.7 MB.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: "Scoreboard",
        short_name: "Scoreboard",
        description: "Keep score for your board and card games.",
        lang: "en",
        theme_color: "#141218",
        background_color: "#141218",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
