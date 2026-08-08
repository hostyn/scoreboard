import { matchRounds, totalFor } from "./standings";
import type { Match, PlayerId, Round } from "./types";

export const LOCALE = "es-ES";

const shortDate = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
});

/** El nombre que el usuario puso, o uno derivado de las reglas y la fecha. */
export const getMatchName = (match: Match): string =>
  match.name ?? `${match.rules.name} · ${shortDate.format(match.createdAt)}`;

export const isFinished = (match: Match): boolean => match.finishedAt !== null;

/**
 * Si un total ha alcanzado o cruzado el límite de puntos.
 *
 * El cruce se evalúa según el signo del límite, no según `direction`: en los
 * juegos de "menos puntos gana" el límite es un techo de eliminación (en el
 * chinchón se sale a los 100), así que también se alcanza subiendo.
 */
const reachesLimit = (total: number, limit: number): boolean =>
  limit >= 0 ? total >= limit : total <= limit;

/**
 * Si la partida debería darse por terminada tras la última ronda. No decide
 * nada por su cuenta: quien guarda la ronda es quien marca `finishedAt`.
 */
export function shouldFinish(match: Match, rounds: Round[]): boolean {
  if (match.overrideEnd || isFinished(match)) return false;

  const played = matchRounds(match, rounds);
  const condition = match.rules.endCondition;

  switch (condition.type) {
    case "manual":
      return false;
    case "rounds":
      return played.length >= condition.value;
    case "points":
      return match.playerIds.some((playerId) =>
        reachesLimit(totalFor(played, playerId), condition.value)
      );
  }
}

/** Jugadores sin puntuar en una ronda, para el aviso discreto del §6.2. */
export const unscoredCount = (round: Round, playerIds: PlayerId[]): number =>
  playerIds.filter((playerId) => round.scores[playerId] == null).length;

/**
 * Renumera las rondas para que `index` siga siendo 0-based y consecutivo tras
 * borrar una intermedia.
 */
export const reindexRounds = (rounds: Round[]): Round[] =>
  [...rounds]
    .sort((a, b) => a.index - b.index)
    .map((round, index) => (round.index === index ? round : { ...round, index }));

/** Una ronda vacía lista para editar: todos los jugadores sin puntuar. */
export const emptyScores = (
  playerIds: PlayerId[]
): Record<PlayerId, number | null> =>
  Object.fromEntries(playerIds.map((playerId) => [playerId, null]));
