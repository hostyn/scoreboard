import { atom } from "nanostores";
import { $games, updateGame } from "./games";

export interface Player {
  index: number;
  name: string;
  /** Puntos con los que el jugador entró a la partida. Cero salvo que se una a mitad. */
  startingPoints: number;
  /** Derivado: startingPoints + su columna en `rounds`. Nunca se edita a mano. */
  totalPoints: number;
}

export interface Scoreboard {
  name: string;
  morePointsWins: boolean;
  players: Player[];
  rounds: Array<number[]>;
}

/** Recalcula `totalPoints` de cada jugador a partir de las rondas. */
const withTotals = (scoreboard: Scoreboard): Scoreboard => ({
  ...scoreboard,
  players: scoreboard.players.map((player) => ({
    ...player,
    totalPoints:
      player.startingPoints +
      scoreboard.rounds.reduce(
        (sum, round) => sum + (round[player.index] ?? 0),
        0
      ),
  })),
});

/**
 * Las partidas creadas antes de `startingPoints` guardaban el total suelto.
 * Lo reconstruimos como la diferencia con la suma de rondas para no alterar
 * ningún marcador ya existente.
 */
const migrate = (scoreboard: Scoreboard): Scoreboard =>
  withTotals({
    ...scoreboard,
    players: scoreboard.players.map((player) => ({
      ...player,
      startingPoints:
        player.startingPoints ??
        player.totalPoints -
          scoreboard.rounds.reduce(
            (sum, round) => sum + (round[player.index] ?? 0),
            0
          ),
    })),
  });

export const getScoreboard = (gameId: string | null): Scoreboard | null => {
  if (!gameId) return null;
  const localScoreboard = localStorage.getItem(gameId);
  return localScoreboard
    ? migrate(JSON.parse(localScoreboard) as Scoreboard)
    : null;
};

export const $scoreboard = atom<Scoreboard | null>(
  getScoreboard($games.get().actualGame)
);

$scoreboard.subscribe((value) => {
  const actualGame = $games.get().actualGame;
  if (value === null || actualGame === null) return;
  localStorage.setItem(actualGame, JSON.stringify(value));
});

/** Aplica un cambio al marcador actual, recalcula totales y marca la partida como usada. */
const update = (change: (scoreboard: Scoreboard) => Scoreboard) => {
  const scoreboard = $scoreboard.get();

  if (!scoreboard) throw new Error("No game selected");

  updateGame();
  $scoreboard.set(withTotals(change(scoreboard)));
};

/**
 * Puntos por defecto para quien se une a mitad de partida: uno peor que el
 * peor clasificado, para que no entre con ventaja.
 */
const adaptedPoints = (scoreboard: Scoreboard) => {
  if (scoreboard.players.length === 0) return 0;

  const totals = scoreboard.players.map((player) => player.totalPoints);

  return scoreboard.morePointsWins
    ? Math.min(...totals) - 1
    : Math.max(...totals) + 1;
};

export const addPlayer = (player: string, points?: number) => {
  update((scoreboard) => {
    const name = player.trim();

    if (name === "") throw new Error("Player name is required");
    if (scoreboard.players.some((actual) => actual.name === name)) {
      throw new Error("Player already exists");
    }

    return {
      ...scoreboard,
      players: [
        ...scoreboard.players,
        {
          name,
          index: scoreboard.players.length,
          startingPoints: points ?? adaptedPoints(scoreboard),
          totalPoints: 0,
        },
      ],
      // Mantiene las rondas rectangulares: el nuevo jugador no puntuó en ellas.
      rounds: scoreboard.rounds.map((round) => [...round, 0]),
    };
  });
};

export const renamePlayer = (index: number, player: string) => {
  update((scoreboard) => {
    const name = player.trim();

    if (name === "") throw new Error("Player name is required");
    if (
      scoreboard.players.some(
        (actual) => actual.name === name && actual.index !== index
      )
    ) {
      throw new Error("Player already exists");
    }

    return {
      ...scoreboard,
      players: scoreboard.players.map((actual) =>
        actual.index === index ? { ...actual, name } : actual
      ),
    };
  });
};

export const removePlayer = (index: number) => {
  update((scoreboard) => {
    if (!scoreboard.players.some((player) => player.index === index)) {
      throw new Error("Player not found");
    }

    return {
      ...scoreboard,
      // Los índices son posiciones dentro de cada ronda, así que al quitar un
      // jugador hay que quitar su columna y recolocar a los de la derecha.
      players: scoreboard.players
        .filter((player) => player.index !== index)
        .map((player) => ({
          ...player,
          index: player.index > index ? player.index - 1 : player.index,
        })),
      rounds: scoreboard.rounds.map((round) =>
        round.filter((_, column) => column !== index)
      ),
    };
  });
};

export const addRound = (round: number[]) => {
  update((scoreboard) => {
    if (scoreboard.players.length === 0) throw new Error("No players");
    if (scoreboard.players.length !== round.length) {
      throw new Error("Invalid round");
    }

    return { ...scoreboard, rounds: [...scoreboard.rounds, round] };
  });
};

export const updateRound = (roundIndex: number, round: number[]) => {
  update((scoreboard) => {
    if (!scoreboard.rounds[roundIndex]) throw new Error("Round not found");
    if (scoreboard.players.length !== round.length) {
      throw new Error("Invalid round");
    }

    return {
      ...scoreboard,
      rounds: scoreboard.rounds.map((actual, index) =>
        index === roundIndex ? round : actual
      ),
    };
  });
};

export const removeRound = (roundIndex: number) => {
  update((scoreboard) => {
    if (!scoreboard.rounds[roundIndex]) throw new Error("Round not found");

    return {
      ...scoreboard,
      rounds: scoreboard.rounds.filter((_, index) => index !== roundIndex),
    };
  });
};
