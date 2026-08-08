import type { Match, PlayerId, Round, Standing } from "./types";

/** Rondas de una partida, en orden. */
export const matchRounds = (match: Match, rounds: Round[]): Round[] =>
  rounds
    .filter((round) => round.matchId === match.id)
    .sort((a, b) => a.index - b.index);

/** Suma de los valores no nulos. Un hueco cuenta como 0 pero se guarda como null. */
export const totalFor = (rounds: Round[], playerId: PlayerId): number =>
  rounds.reduce((sum, round) => sum + (round.scores[playerId] ?? 0), 0);

/**
 * La única fuente de verdad de posiciones y totales. Cualquier componente que
 * muestre orden o posición consume esto; nada calcula rankings por su cuenta.
 */
export function getStandings(match: Match, rounds: Round[]): Standing[] {
  const played = matchRounds(match, rounds);
  const last = played.at(-1);

  // Se itera playerIds, nunca las claves de `scores`: el orden de iteración de
  // un objeto no es un desempate estable.
  const entries = match.playerIds.map((playerId, seat) => ({
    playerId,
    seat,
    total: totalFor(played, playerId),
    lastDelta: last ? last.scores[playerId] ?? null : null,
  }));

  const sorted = entries.sort((a, b) =>
    a.total !== b.total
      ? match.rules.direction === "lowest"
        ? a.total - b.total
        : b.total - a.total
      : a.seat - b.seat
  );

  let rank = 1;
  return sorted.map((entry, position) => {
    // Los empatados comparten posición y la siguiente salta: 1, 1, 3.
    if (position > 0 && sorted[position - 1]!.total !== entry.total) {
      rank = position + 1;
    }

    return {
      playerId: entry.playerId,
      total: entry.total,
      rank,
      lastDelta: entry.lastDelta,
    };
  });
}

/**
 * Los jugadores en cabeza. Devuelve más de uno cuando hay empate arriba, que es
 * la señal de que la UI no debe coronar a nadie todavía.
 */
export const getLeaders = (standings: Standing[]): Standing[] =>
  standings.filter((standing) => standing.rank === 1);

/** Hay un único líder destacable (con cero rondas, todos empatan a 0 y no lo hay). */
export const hasClearLeader = (standings: Standing[]): boolean =>
  getLeaders(standings).length === 1;
