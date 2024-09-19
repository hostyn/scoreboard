import { atom } from "nanostores";
import { $scoreboard, addRound as addRoundToScoreboard } from "./scoreboard";

interface PlayerRound {
  name: string;
  index: number;
  points: number | undefined;
}

export const $newRound = atom<PlayerRound[]>([]);

export const reset = () => {
  const scoreboard = $scoreboard.get();

  if (!scoreboard) throw new Error("No game selected");

  $newRound.set(
    scoreboard.players
      .sort((a, b) => (a.index > b.index ? 1 : -1))
      .map((player) => ({
        name: player.name,
        index: player.index,
        points: undefined,
      }))
  );
};

export const addPointsToPlayer = (index: number, points: number) => {
  const newRound = [...$newRound.get()];
  const playerIndex = newRound.findIndex((player) => player.index === index);

  if (playerIndex === -1) throw new Error("Player not found");
  if (newRound[index] === undefined) throw new Error("Player not found");

  newRound[index].points = newRound[index]?.points
    ? newRound[index]?.points + points
    : points;

  $newRound.set(newRound);
};

export const updatePlayerPoints = (index: number, points?: number) => {
  const newRound = [...$newRound.get()];
  const playerIndex = newRound.findIndex((player) => player.index === index);

  if (playerIndex === -1) throw new Error("Player not found");
  if (newRound[index] === undefined) throw new Error("Player not found");

  newRound[index].points = points;
  $newRound.set(newRound);
};

export const addRound = () => {
  const newRound = $newRound
    .get()
    .sort((a, b) => (a.index > b.index ? 1 : -1))
    .map((player) => player.points ?? 0);

  addRoundToScoreboard(newRound);

  reset();
};
