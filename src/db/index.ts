import { clear, createStore, get, set } from "idb-keyval";
import { BUILTIN_TEMPLATES } from "@/domain/templates";
import type { GameTemplate, Match, Player, Round } from "@/domain/types";

/** Todo lo que vive en el dispositivo. */
export interface Snapshot {
  players: Player[];
  templates: GameTemplate[];
  matches: Match[];
  rounds: Round[];
}

export type Collection = keyof Snapshot;

const EMPTY: Snapshot = { players: [], templates: [], matches: [], rounds: [] };

/**
 * idb-keyval no lleva bien varios object stores sobre la misma base, así que se
 * guarda una colección entera por clave. A escala de "las partidas de una casa"
 * el coste de reescribir un array es irrelevante, y a cambio la isla puede
 * tener todo en memoria y persistir sin coordinar transacciones.
 */
const store = createStore("scoreboard", "data");

/** IndexedDB no existe al renderizar en servidor. */
const available = () => typeof indexedDB !== "undefined";

export const read = async <K extends Collection>(
  key: K
): Promise<Snapshot[K]> => {
  if (!available()) return EMPTY[key];
  return (await get<Snapshot[K]>(key, store)) ?? EMPTY[key];
};

export const write = async <K extends Collection>(
  key: K,
  value: Snapshot[K]
): Promise<void> => {
  if (!available()) return;
  await set(key, value, store);
};

/**
 * Añade las plantillas de fábrica que falten, sin tocar las que el usuario haya
 * editado ni resucitar las que haya borrado por id.
 */
const seedTemplates = (existing: GameTemplate[]): GameTemplate[] => {
  const known = new Set(existing.map((template) => template.id));
  const missing = BUILTIN_TEMPLATES.filter(
    (template) => !known.has(template.id)
  );

  return missing.length === 0 ? existing : [...existing, ...missing];
};

/** Carga el estado completo, sembrando las plantillas de fábrica si hace falta. */
export async function loadSnapshot(): Promise<Snapshot> {
  if (!available()) return EMPTY;

  const [players, templates, matches, rounds] = await Promise.all([
    read("players"),
    read("templates"),
    read("matches"),
    read("rounds"),
  ]);

  const seeded = seedTemplates(templates);
  if (seeded !== templates) await write("templates", seeded);

  return { players, templates: seeded, matches, rounds };
}

/** Copia de seguridad barata mientras no haya backend. */
export const exportSnapshot = (snapshot: Snapshot): string =>
  JSON.stringify({ version: 1, exportedAt: Date.now(), ...snapshot }, null, 2);

export async function importSnapshot(snapshot: Snapshot): Promise<void> {
  await Promise.all([
    write("players", snapshot.players),
    write("templates", snapshot.templates),
    write("matches", snapshot.matches),
    write("rounds", snapshot.rounds),
  ]);
}

export async function wipe(): Promise<void> {
  if (!available()) return;
  await clear(store);
}
