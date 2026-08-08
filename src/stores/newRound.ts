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
    [...scoreboard.players]
      .sort((a, b) => a.index - b.index)
      .map((player) => ({
        name: player.name,
        index: player.index,
        points: undefined,
      }))
  );
};

const setPoints = (
  index: number,
  update: (current: number | undefined) => number | undefined
) => {
  const newRound = [...$newRound.get()];
  const playerIndex = newRound.findIndex((player) => player.index === index);

  if (playerIndex === -1) throw new Error("Player not found");

  newRound[playerIndex] = {
    ...newRound[playerIndex]!,
    points: update(newRound[playerIndex]!.points),
  };

  $newRound.set(newRound);
};

export const addPointsToPlayer = (index: number, points: number) => {
  setPoints(index, (current) => (current ?? 0) + points);
};

export const updatePlayerPoints = (index: number, points?: number) => {
  setPoints(index, () => points);
};

export const addRound = () => {
  const newRound = [...$newRound.get()]
    .sort((a, b) => a.index - b.index)
    .map((player) => player.points ?? 0);

  addRoundToScoreboard(newRound);

  reset();
};
