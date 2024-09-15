import { atom } from "nanostores";

interface Player {
  index: number;
  name: string;
  totalPoints: number;
}

interface Scoreboard {
  players: Player[];
  rounds: Array<number[]>;
}

const localScoreboard = localStorage.getItem("scoreboard");

const initalScoreboard: Scoreboard = localScoreboard
  ? JSON.parse(localScoreboard)
  : {
      players: [],
      rounds: [],
    };

export const $scoreboard = atom<Scoreboard>(initalScoreboard);

$scoreboard.subscribe((value) => {
  localStorage.setItem("scoreboard", JSON.stringify(value));
});

export const addPlayer = (player: string) => {
  const scoreboard = $scoreboard.get();

  const playerExists = scoreboard.players.some(
    (actualPlayer) => actualPlayer.name === player
  );
  if (playerExists) throw new Error("Player already exists");

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

  const maxPoints = scoreboard.players.reduce(
    (max, player) => (max > player.totalPoints ? max : player.totalPoints),
    0
  );

  $scoreboard.set({
    players: [
      ...scoreboard.players,
      {
        name: player,
        totalPoints: maxPoints + 1,
        index: scoreboard.players.length,
      },
    ],
    rounds: scoreboard.rounds.map((round, index) =>
      index === scoreboard.rounds.length - 1
        ? [...round, maxPoints + 1]
        : [...round, 0]
    ),
  });
};

export const addRound = (round: number[]) => {
  const scoreboard = $scoreboard.get();

  if (scoreboard.players.length === 0) throw new Error("No players");
  if (scoreboard.players.length !== round.length)
    throw new Error("Invalid round");

  $scoreboard.set({
    players: scoreboard.players.map((player) => ({
      ...player,
      totalPoints: player.totalPoints + (round[player.index] ?? 0),
    })),
    rounds: [...scoreboard.rounds, round],
  });
};
