import { atom } from "nanostores";
import type { Scoreboard } from "./scoreboard";

interface Game {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Games {
  actualGame: string;
  games: Game[];
}

const localScoreboard = localStorage.getItem("games");

const initalScoreboard: Games = localScoreboard
  ? JSON.parse(localScoreboard)
  : {
      actualGame: null,
      games: [],
    };

export const $games = atom<Games>({
  ...initalScoreboard,
  games: initalScoreboard.games.map((game) => ({
    ...game,
    updatedAt: new Date(game.updatedAt),
    createdAt: new Date(game.createdAt),
  })),
});

$games.subscribe((value) => {
  localStorage.setItem("games", JSON.stringify(value));
});

export const addGame = (newGame: {
  name: string;
  morePointsWins: boolean;
  players: string[];
}) => {
  const uuid = crypto.randomUUID();

  $games.set({
    actualGame: uuid,
    games: [
      ...$games.get().games,
      { id: uuid, createdAt: new Date(), updatedAt: new Date() },
    ],
  });

  localStorage.setItem(
    uuid,
    JSON.stringify({
      ...newGame,
      players: newGame.players.map((player, index) => ({
        index,
        name: player,
        totalPoints: 0,
      })),
      rounds: [],
    } satisfies Scoreboard)
  );
};

export const selectGame = (game: string) => {
  const games = $games.get();

  if (!games.games.find((g) => g.id === game)) {
    throw new Error("Game not found");
  }

  $games.set({
    ...$games.get(),
    actualGame: game,
  });
};

export const updateGame = () => {
  const games = $games.get();

  if (!games.games.find((g) => g.id === games.actualGame)) {
    throw new Error("Game not found");
  }

  $games.set({
    ...games,
    games: games.games.map((game) =>
      game.id === games.actualGame ? { ...game, updatedAt: new Date() } : game
    ),
  });
};
