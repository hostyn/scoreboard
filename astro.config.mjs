// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  vite: {
    // Tailwind 4 se integra como plugin de Vite; @astrojs/tailwind está
    // deprecado y ya no soporta v4.
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    AstroPWA({
      registerType: "autoUpdate",
      // El registro lo hace Layout.astro a mano, no hace falta registerSW.js.
      injectRegister: null,
      // La app es 100% estática y guarda las partidas en localStorage, así que
      // precachearla entera la deja utilizable sin conexión.
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/",
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
