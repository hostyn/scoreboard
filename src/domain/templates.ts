import type { GameTemplate, MatchRules } from "./types";

/**
 * Plantillas precargadas para que "Nueva partida" funcione en el primer
 * arranque sin configurar nada.
 */
export const BUILTIN_TEMPLATES: GameTemplate[] = [
  {
    id: "builtin-chinchon",
    name: "Chinchón",
    direction: "lowest",
    endCondition: { type: "points", value: 100 },
    shortcuts: [-10, 5, 10, 25],
    allowNegative: true,
    builtin: true,
  },
  {
    id: "builtin-rummy",
    name: "Rummy",
    direction: "highest",
    endCondition: { type: "points", value: 500 },
    shortcuts: [5, 10, 25, 50],
    allowNegative: false,
    builtin: true,
  },
  {
    id: "builtin-libre",
    name: "Puntos libres",
    direction: "highest",
    endCondition: { type: "manual" },
    shortcuts: [1, 2, 5, 10],
    allowNegative: true,
    builtin: true,
  },
];

/** Congela una plantilla en la copia que se lleva la partida. */
export const toRules = (template: GameTemplate): MatchRules => ({
  name: template.name,
  direction: template.direction,
  endCondition: { ...template.endCondition },
  shortcuts: [...template.shortcuts],
  allowNegative: template.allowNegative,
});
