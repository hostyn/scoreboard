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
    data: "Datos",
    empty: {
      title: "Aquí se llevan las cuentas",
      body: "Crea una partida, elige quién juega y anota cada ronda. Todo se queda en este dispositivo.",
    },
  },

  newMatch: {
    title: "Nueva partida",
    game: "Juego",
    newGame: "Nuevo",
    editRules: "Editar reglas",
    players: "Jugadores",
    addPlayer: "Añadir",
    selected: (n: number) => `${n} seleccionados`,
    start: "Empezar partida",
    needTwo: "Elige al menos dos jugadores",
    needGame: "Elige un juego",
    playerName: "Nombre",
    save: "Guardar",
    emptyPlayers: "Todavía no hay nadie. Añade a quien juegue.",
  },

  template: {
    newTitle: "Nuevo juego",
    editTitle: "Editar juego",
    name: "Nombre",
    namePlaceholder: "Chinchón",
    direction: "Quién gana",
    lowest: "Quien menos suma",
    lowestHint: "Chinchón, golf",
    highest: "Quien más suma",
    highestHint: "Rummy, canasta",
    end: "Cuándo termina",
    endPoints: "Al llegar a puntos",
    endRounds: "Tras un número de rondas",
    endManual: "Cuando yo lo diga",
    limit: "Límite",
    shortcuts: "Atajos del teclado",
    shortcutsHint: "Cuatro valores que aparecen sobre el teclado numérico.",
    allowNegative: "Admite puntuaciones negativas",
    save: "Guardar juego",
    delete: "Borrar juego",
    builtin: "Este juego viene de fábrica. Al guardar se crea una copia tuya.",
    nameRequired: "Ponle un nombre al juego",
  },

  match: {
    round: (n: number) => `Ronda ${n}`,
    newRound: "Nueva ronda",
    rounds: "Rondas",
    noRounds: "Aún no hay rondas. Anota la primera.",
    menu: "Opciones de la partida",
    rename: "Renombrar",
    finish: "Terminar partida",
    reopen: "Seguir jugando",
    delete: "Borrar partida",
    deleteTitle: "Borrar la partida",
    deleteBody: "Se borran también todas sus rondas. No se puede recuperar.",
    renameTitle: "Renombrar la partida",
    finishedTitle: "Partida terminada",
    finishedTied: "Terminó en empate",
    editRound: (n: number) => `Editar la ronda ${n}`,
    deleteRound: (n: number) => `Borrar la ronda ${n}`,
    deleteRoundBody: "Los totales se recalculan y las rondas siguientes se renumeran.",
    unscored: "sin puntuar",
  },

  round: {
    newTitle: "Nueva ronda",
    editTitle: (n: number) => `Ronda ${n}`,
    save: "Guardar ronda",
    next: "Siguiente",
    clear: "Borrar",
    sign: "Cambiar signo",
    savedWith: (n: number) =>
      n === 1 ? "1 jugador sin puntuar" : `${n} jugadores sin puntuar`,
    saved: "Ronda guardada",
    finished: "Partida terminada",
  },

  data: {
    title: "Datos",
    body: "Todo se guarda en este dispositivo. Exporta si quieres una copia.",
    export: "Exportar",
    import: "Importar",
    imported: "Datos importados",
    importFailed: "El archivo no tiene el formato esperado",
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
    close: "Cerrar",
    undo: "Deshacer",
    undone: (what: string) => `${what}: deshecho`,
    back: "Volver",
    loading: "Cargando",
    delete: "Borrar",
    notFound: "Esa partida ya no existe",
  },
} as const;
