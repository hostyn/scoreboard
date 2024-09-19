import { atom } from "nanostores";
import { $games, updateGame } from "./games";

export interface Player {
  index: number;
  name: string;
  totalPoints: number;
}

export interface Scoreboard {
  name: string;
  morePointsWins: boolean;
  players: Player[];
  rounds: Array<number[]>;
}

export const getScoreboard = (gameId: string): Scoreboard | null => {
  const localScoreboard = localStorage.getItem(gameId);
  return localScoreboard ? (JSON.parse(localScoreboard) as Scoreboard) : null;
};

export const $scoreboard = atom<Scoreboard | null>(
  getScoreboard($games.get().actualGame)
);

$scoreboard.subscribe((value) => {
  if (value === null) return;
  localStorage.setItem($games.get().actualGame, JSON.stringify(value));
});

export const addPlayer = (player: string) => {
  const scoreboard = $scoreboard.get();

  if (!scoreboard) throw new Error("No game selected");

  const playerExists = scoreboard.players.some(
    (actualPlayer) => actualPlayer.name === player
  );
  if (playerExists) throw new Error("Player already exists");

  updateGame();

  if (scoreboard.rounds.length === 0) {
    $scoreboard.set({
      ...scoreboard,
      players: [
        ...scoreboard.players,
        { name: player, totalPoints: 0, index: scoreboard.players.length },
      ],
    });

    return;
  }

  const newPoints = scoreboard.morePointsWins
    ? scoreboard.players.reduce(
        (min, player) => (player.totalPoints < min ? player.totalPoints : min),
        NaN
      ) - 1
    : scoreboard.players.reduce(
        (max, player) => (max > player.totalPoints ? max : player.totalPoints),
        NaN
      ) + 1;

  $scoreboard.set({
    ...scoreboard,
    players: [
      ...scoreboard.players,
      {
        name: player,
        totalPoints: newPoints,
        index: scoreboard.players.length,
      },
    ],
    rounds: scoreboard.rounds.map((round, index) =>
      index === scoreboard.rounds.length - 1
        ? [...round, newPoints]
        : [...round, 0]
    ),
  });
};

export const addRound = (round: number[]) => {
  const scoreboard = $scoreboard.get();

  if (!scoreboard) throw new Error("No game selected");

  if (scoreboard.players.length === 0) throw new Error("No players");
  if (scoreboard.players.length !== round.length)
    throw new Error("Invalid round");

  updateGame();

  $scoreboard.set({
    ...scoreboard,
    players: scoreboard.players.map((player) => ({
      ...player,
      totalPoints: player.totalPoints + (round[player.index] ?? 0),
    })),
    rounds: [...scoreboard.rounds, round],
  });
};
