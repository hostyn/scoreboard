export type PlayerId = string;
export type TemplateId = string;
export type MatchId = string;
export type RoundId = string;

/** Quién gana: el que menos puntos acumula o el que más. */
export type Direction = "lowest" | "highest";

export type EndCondition =
  | { type: "points"; value: number }
  | { type: "rounds"; value: number }
  | { type: "manual" };

export interface Player {
  id: PlayerId;
  name: string;
  /** Índice en la paleta de jugadores. Identifica a la persona, no su posición. */
  colorIndex: number;
  createdAt: number;
  /** Para ordenar los chips por uso reciente. */
  lastPlayedAt: number;
  /**
   * Los jugadores no se borran: si aparecen en una partida guardada, borrarlos
   * rompería el historial. En la UI el gesto es deseleccionar.
   */
  archived: boolean;
}

export interface GameTemplate {
  id: TemplateId;
  name: string;
  direction: Direction;
  endCondition: EndCondition;
  /** Exactamente cuatro, los que alimentan la fila de atajos de la ronda. */
  shortcuts: number[];
  allowNegative: boolean;
  builtin: boolean;
}

/** Las reglas tal y como quedaron congeladas en una partida. */
export type MatchRules = Omit<GameTemplate, "id" | "builtin">;

export interface Match {
  id: MatchId;
  templateId: TemplateId;
  /**
   * Copia, no referencia. Si la plantilla se edita en noviembre, las partidas
   * de septiembre no pueden cambiar de resultado.
   */
  rules: MatchRules;
  /** null => el nombre se deriva de las reglas y la fecha. */
  name: string | null;
  /** El orden importa: es el desempate estable de la clasificación. */
  playerIds: PlayerId[];
  createdAt: number;
  finishedAt: number | null;
  /** "Seguir jugando" pese a haberse cumplido la condición de fin. */
  overrideEnd: boolean;
}

export interface Round {
  id: RoundId;
  matchId: MatchId;
  /** 0-based y consecutivo: al borrar una ronda intermedia se recalcula. */
  index: number;
  /** null = sin puntuar, que no es lo mismo que un 0 anotado. */
  scores: Record<PlayerId, number | null>;
  createdAt: number;
}

export interface Standing {
  playerId: PlayerId;
  total: number;
  /** Competición estándar: en empate comparten posición y la siguiente salta (1, 1, 3). */
  rank: number;
  lastDelta: number | null;
}
