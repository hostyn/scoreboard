import { atom } from "nanostores";
import {
  $scoreboard,
  addRound as addRoundToScoreboard,
  updateRound as updateRoundInScoreboard,
} from "./scoreboard";

interface PlayerRound {
  name: string;
  index: number;
  points: number | undefined;
}

export const $newRound = atom<PlayerRound[]>([]);

/** Índice de la ronda que se está editando, o null si se está creando una nueva. */
export const $editingRound = atom<number | null>(null);

/** El modal vive en el layout, pero se abre desde el FAB y desde el historial. */
export const $roundModalOpen = atom(false);

export const openRoundModal = (roundIndex: number | null = null) => {
  reset(roundIndex);
  $roundModalOpen.set(true);
};

export const closeRoundModal = () => {
  $roundModalOpen.set(false);
};

/** Prepara el formulario: vacío para una ronda nueva, relleno para editar una existente. */
export const reset = (roundIndex: number | null = null) => {
  const scoreboard = $scoreboard.get();

  if (!scoreboard) throw new Error("No game selected");

  const round = roundIndex === null ? null : scoreboard.rounds[roundIndex];

  if (roundIndex !== null && !round) throw new Error("Round not found");

  $editingRound.set(roundIndex);
  $newRound.set(
    [...scoreboard.players]
      .sort((a, b) => a.index - b.index)
      .map((player) => ({
        name: player.name,
        index: player.index,
        points: round?.[player.index],
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

export const saveRound = () => {
  const round = [...$newRound.get()]
    .sort((a, b) => a.index - b.index)
    .map((player) => player.points ?? 0);

  const editing = $editingRound.get();

  if (editing === null) {
    addRoundToScoreboard(round);
  } else {
    updateRoundInScoreboard(editing, round);
  }

  reset();
};
