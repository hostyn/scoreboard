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
      // La app es 100% estática y guarda las partidas en IndexedDB, así que
      // precachearla entera la deja utilizable sin conexión.
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,ico}",
          // Solo el subset latino, que es el que cubre el español entero. Los
          // demás alfabetos se siguen sirviendo por red: precachearlos
          // cuadruplicaba el peso para algo que esta interfaz no usa.
          "**/*-latin-wght-normal*.woff2",
        ],
        navigateFallback: "/",
      },
      manifest: {
        name: "Scoreboard",
        short_name: "Scoreboard",
        description:
          "Lleva la cuenta de tus partidas de mesa y cartas. Funciona sin conexión y sin cuenta.",
        lang: "es",
        dir: "ltr",
        theme_color: "#101a16",
        background_color: "#101a16",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          // Con su propio margen de seguridad: Android recorta el icono a la
          // forma del lanzador y el de "any" perdería las fichas de las puntas.
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
