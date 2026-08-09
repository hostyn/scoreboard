import { defineConfig } from "vitest/config";

// `domain/` es TypeScript puro sin nada de Astro ni de UI, así que no hace
// falta arrancar la config de Astro para testearlo.
export default defineConfig({
  resolve: {
    // Ruta relativa a la raíz del proyecto: evita depender de @types/node.
    alias: { "@": "/src" },
  },
  test: {
    // `domain/` es lo que el briefing exige cubrir; se incluye también la
    // lógica pura de `app/` (fechas, resúmenes de reglas) por el mismo motivo.
    include: ["src/{domain,app}/**/*.test.ts"],
  },
});
