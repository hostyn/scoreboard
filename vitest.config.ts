import { defineConfig } from "vitest/config";

// `domain/` es TypeScript puro sin nada de Astro ni de UI, así que no hace
// falta arrancar la config de Astro para testearlo.
export default defineConfig({
  resolve: {
    // Ruta relativa a la raíz del proyecto: evita depender de @types/node.
    alias: { "@": "/src" },
  },
  test: {
    include: ["src/domain/**/*.test.ts"],
  },
});
