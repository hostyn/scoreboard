import { atom } from "nanostores";
import { loadSnapshot, write } from "@/db";
import { getStandings } from "@/domain/standings";
import type {
  GameTemplate,
  Match,
  MatchId,
  Player,
  Round,
} from "@/domain/types";

/**
 * La isla mantiene todo en memoria y escribe la colección que cambia. El
 * volumen es el de las partidas de una casa, así que no compensa nada más fino.
 */
export const $players = atom<Player[]>([]);
export const $templates = atom<GameTemplate[]>([]);
export const $matches = atom<Match[]>([]);
export const $rounds = atom<Round[]>([]);

/** Hasta que no se lee IndexedDB no se puede distinguir "vacío" de "cargando". */
export const $ready = atom(false);

export async function bootstrap(): Promise<void> {
  const snapshot = await loadSnapshot();

  $players.set(snapshot.players);
  $templates.set(snapshot.templates);
  $matches.set(snapshot.matches);
  $rounds.set(snapshot.rounds);
  $ready.set(true);
}

export const setPlayers = (next: Player[]) => {
  $players.set(next);
  void write("players", next);
};

export const setTemplates = (next: GameTemplate[]) => {
  $templates.set(next);
  void write("templates", next);
};

export const setMatches = (next: Match[]) => {
  $matches.set(next);
  void write("matches", next);
};

export const setRounds = (next: Round[]) => {
  $rounds.set(next);
  void write("rounds", next);
};

export const newId = (): string => crypto.randomUUID();

export const findMatch = (id: MatchId): Match | undefined =>
  $matches.get().find((match) => match.id === id);

/** Rondas de una partida, sin ordenar (getStandings ya lo hace). */
export const roundsOf = (id: MatchId): Round[] =>
  $rounds.get().filter((round) => round.matchId === id);

export const playersByIdMap = (): Map<string, Player> =>
  new Map($players.get().map((player) => [player.id, player]));

/**
 * "Repetir": misma plantilla y mismos jugadores, sin pasar por configuración.
 * Se lleva una copia fresca de las reglas de la partida anterior, no de la
 * plantilla, para que repetir signifique repetir lo que se jugó.
 */
export function repeatMatch(source: Match): Match {
  const now = Date.now();

  const match: Match = {
    id: newId(),
    templateId: source.templateId,
    rules: structuredClone(source.rules),
    name: null,
    playerIds: [...source.playerIds],
    createdAt: now,
    finishedAt: null,
    overrideEnd: false,
  };

  setMatches([...$matches.get(), match]);
  touchPlayers(match.playerIds, now);

  return match;
}

/** Marca a los jugadores como usados: ordena los chips por uso reciente. */
export function touchPlayers(ids: string[], at = Date.now()): void {
  const target = new Set(ids);

  setPlayers(
    $players.get().map((player) =>
      target.has(player.id) ? { ...player, lastPlayedAt: at } : player
    )
  );
}

/** Clasificación de una partida, siempre por la misma función. */
export const standingsOf = (match: Match) =>
  getStandings(match, roundsOf(match.id));
