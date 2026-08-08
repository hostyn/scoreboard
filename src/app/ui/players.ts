/**
 * El color identifica a la persona, no su posición: el mismo tono en el chip de
 * selección, en la fila de la clasificación y en su columna de la libreta.
 *
 * Las clases van literales porque Tailwind escanea el código fuente y no vería
 * una construida con plantillas.
 */
const PLAYER_TEXT = [
  "text-player-0",
  "text-player-1",
  "text-player-2",
  "text-player-3",
  "text-player-4",
  "text-player-5",
] as const;

const PLAYER_BG = [
  "bg-player-0",
  "bg-player-1",
  "bg-player-2",
  "bg-player-3",
  "bg-player-4",
  "bg-player-5",
] as const;

const PLAYER_BORDER = [
  "border-player-0",
  "border-player-1",
  "border-player-2",
  "border-player-3",
  "border-player-4",
  "border-player-5",
] as const;

/** Borde en el color del jugador solo cuando el chip está seleccionado. */
const PLAYER_BORDER_ON = [
  "data-[state=on]:border-player-0",
  "data-[state=on]:border-player-1",
  "data-[state=on]:border-player-2",
  "data-[state=on]:border-player-3",
  "data-[state=on]:border-player-4",
  "data-[state=on]:border-player-5",
] as const;

export const PLAYER_COLOR_COUNT = PLAYER_TEXT.length;

const at = (palette: readonly string[], colorIndex: number) =>
  palette[((colorIndex % palette.length) + palette.length) % palette.length]!;

export const playerText = (colorIndex: number) => at(PLAYER_TEXT, colorIndex);
export const playerBg = (colorIndex: number) => at(PLAYER_BG, colorIndex);
export const playerBorder = (colorIndex: number) =>
  at(PLAYER_BORDER, colorIndex);
export const playerBorderOn = (colorIndex: number) =>
  at(PLAYER_BORDER_ON, colorIndex);

/** Siguiente color libre, o el menos usado si ya se dieron todos. */
export function nextColorIndex(taken: number[]): number {
  const counts = new Array<number>(PLAYER_COLOR_COUNT).fill(0);
  for (const index of taken) counts[at2(index)]! += 1;

  let best = 0;
  for (let i = 1; i < counts.length; i += 1) {
    if (counts[i]! < counts[best]!) best = i;
  }
  return best;
}

const at2 = (colorIndex: number) =>
  ((colorIndex % PLAYER_COLOR_COUNT) + PLAYER_COLOR_COUNT) % PLAYER_COLOR_COUNT;
