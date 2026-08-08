import type { Player } from "@/stores/scoreboard";

/**
 * Devuelve una copia ordenada de mejor a peor. En juegos de `morePointsWins`
 * gana quien más puntos tiene; en el resto, quien menos.
 */
export const sortPlayers = (players: Player[], morePointsWins: boolean) =>
  [...players].sort((a, b) =>
    morePointsWins ? b.totalPoints - a.totalPoints : a.totalPoints - b.totalPoints
  );
