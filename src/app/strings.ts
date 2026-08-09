/**
 * Todas las cadenas de la interfaz, en un solo sitio.
 *
 * Copy: sentence case, verbo primero, sin admiraciones ni "por favor". Los
 * estados vacíos invitan a actuar; los errores dicen qué pasó y qué hacer.
 */
export const S = {
  app: {
    name: "Scoreboard",
    tagline: "Lleva la cuenta de tus partidas de mesa y cartas.",
  },

  home: {
    title: "Partidas",
    ongoing: "En curso",
    finished: "Terminadas",
    newMatch: "Nueva partida",
    repeat: "Repetir",
    round: (n: number) => `Ronda ${n}`,
    leading: (name: string) => `Va ${name}`,
    tied: (points: number) => `Empate a ${points}`,
    winner: (name: string) => `Ganó ${name}`,
    noRounds: "Sin rondas todavía",
    empty: {
      title: "Aquí se llevan las cuentas",
      body: "Crea una partida, elige quién juega y anota cada ronda. Todo se queda en este dispositivo.",
    },
  },

  rules: {
    lowest: "Gana quien menos suma",
    highest: "Gana quien más suma",
    toPoints: (points: number) => `hasta ${points} puntos`,
    toRounds: (rounds: number) => `a ${rounds} rondas`,
    manual: "sin final fijado",
  },

  time: {
    today: "Hoy",
    yesterday: "Ayer",
  },

  common: {
    cancel: "Cancelar",
    undo: "Deshacer",
    back: "Volver",
    loading: "Cargando",
  },

  soon: {
    title: "Todavía no está",
    body: "Esta pantalla llega en una fase posterior del rediseño.",
  },
} as const;
