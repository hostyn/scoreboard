import { atom } from "nanostores";
import { loadSnapshot, write } from "@/db";
import { emptyScores, reindexRounds, shouldFinish } from "@/domain/match";
import { getStandings } from "@/domain/standings";
import { toRules } from "@/domain/templates";
import type {
  GameTemplate,
  Match,
  MatchId,
  Player,
  PlayerId,
  Round,
} from "@/domain/types";
import { nextColorIndex } from "../ui/players";

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

const setPlayers = (next: Player[]) => {
  $players.set(next);
  void write("players", next);
};

const setTemplates = (next: GameTemplate[]) => {
  $templates.set(next);
  void write("templates", next);
};

const setMatches = (next: Match[]) => {
  $matches.set(next);
  void write("matches", next);
};

const setRounds = (next: Round[]) => {
  $rounds.set(next);
  void write("rounds", next);
};

export const newId = (): string => crypto.randomUUID();

/* ------------------------------------------------------------------ lecturas */

export const findMatch = (id: MatchId): Match | undefined =>
  $matches.get().find((match) => match.id === id);

export const findTemplate = (id: string): GameTemplate | undefined =>
  $templates.get().find((template) => template.id === id);

/**
 * Plantillas por uso reciente. No se guarda un `lastUsedAt`: se deduce de la
 * última partida que las usó, que es el mismo dato sin duplicarlo.
 */
export function templatesByRecentUse(
  templates: GameTemplate[],
  matches: Match[]
): GameTemplate[] {
  const lastUsed = new Map<string, number>();

  for (const match of matches) {
    const previous = lastUsed.get(match.templateId) ?? 0;
    if (match.createdAt > previous) lastUsed.set(match.templateId, match.createdAt);
  }

  return [...templates].sort(
    (a, b) => (lastUsed.get(b.id) ?? 0) - (lastUsed.get(a.id) ?? 0)
  );
}

/** Deja seleccionada la plantilla recién creada al volver a "nueva partida". */
export const $preselectedTemplate = atom<string | null>(null);

export const roundsOf = (id: MatchId): Round[] =>
  $rounds.get().filter((round) => round.matchId === id);

export const standingsOf = (match: Match) =>
  getStandings(match, roundsOf(match.id));

/* -------------------------------------------------------------------- deshacer */

interface UndoEntry {
  label: string;
  matches: Match[];
  rounds: Round[];
}

/** Deshacer está disponible durante toda la partida, no solo al guardar. */
export const $undo = atom<UndoEntry[]>([]);

const UNDO_DEPTH = 25;

function checkpoint(label: string): void {
  const entry: UndoEntry = {
    label,
    matches: $matches.get(),
    rounds: $rounds.get(),
  };

  $undo.set([...$undo.get(), entry].slice(-UNDO_DEPTH));
}

/** Devuelve la etiqueta de lo deshecho, o null si no había nada. */
export function undo(): string | null {
  const stack = $undo.get();
  const entry = stack.at(-1);

  if (!entry) return null;

  setMatches(entry.matches);
  setRounds(entry.rounds);
  $undo.set(stack.slice(0, -1));

  return entry.label;
}

/* ------------------------------------------------------------------ jugadores */

export function createPlayer(name: string): Player {
  const trimmed = name.trim();
  const players = $players.get();
  const existing = players.find(
    (player) => player.name.toLowerCase() === trimmed.toLowerCase()
  );

  // Reaparecer con el mismo nombre reutiliza a la persona: el historial cuenta.
  if (existing) {
    if (existing.archived) {
      setPlayers(
        players.map((player) =>
          player.id === existing.id ? { ...player, archived: false } : player
        )
      );
    }
    return existing;
  }

  const now = Date.now();
  const player: Player = {
    id: newId(),
    name: trimmed,
    colorIndex: nextColorIndex(players.map((p) => p.colorIndex)),
    createdAt: now,
    lastPlayedAt: now,
    archived: false,
  };

  setPlayers([...players, player]);
  return player;
}

/** Los jugadores no se borran: si están en una partida, romperían el historial. */
export function archivePlayer(id: PlayerId): void {
  setPlayers(
    $players.get().map((player) =>
      player.id === id ? { ...player, archived: true } : player
    )
  );
}

function touchPlayers(ids: PlayerId[], at = Date.now()): void {
  const target = new Set(ids);

  setPlayers(
    $players.get().map((player) =>
      target.has(player.id) ? { ...player, lastPlayedAt: at } : player
    )
  );
}

/* ------------------------------------------------------------------ plantillas */

export function saveTemplate(template: GameTemplate): GameTemplate {
  const templates = $templates.get();
  const exists = templates.some((item) => item.id === template.id);

  setTemplates(
    exists
      ? templates.map((item) => (item.id === template.id ? template : item))
      : [...templates, template]
  );

  return template;
}

export function deleteTemplate(id: string): void {
  setTemplates($templates.get().filter((template) => template.id !== id));
}

/* --------------------------------------------------------------------- partidas */

export function createMatch(
  template: GameTemplate,
  playerIds: PlayerId[]
): Match {
  const now = Date.now();

  const match: Match = {
    id: newId(),
    templateId: template.id,
    rules: toRules(template),
    name: null,
    playerIds: [...playerIds],
    createdAt: now,
    finishedAt: null,
    overrideEnd: false,
  };

  checkpoint("Partida creada");
  setMatches([...$matches.get(), match]);
  touchPlayers(playerIds, now);

  return match;
}

/**
 * "Repetir": misma plantilla y mismos jugadores, sin pasar por configuración.
 * Copia las reglas de la partida anterior, no las de la plantilla: repetir
 * significa repetir lo que se jugó, aunque la plantilla haya cambiado desde
 * entonces.
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

  checkpoint("Partida repetida");
  setMatches([...$matches.get(), match]);
  touchPlayers(match.playerIds, now);

  return match;
}

const patchMatch = (id: MatchId, patch: Partial<Match>) =>
  setMatches(
    $matches.get().map((match) =>
      match.id === id ? { ...match, ...patch } : match
    )
  );

export function renameMatch(id: MatchId, name: string): void {
  const trimmed = name.trim();
  checkpoint("Nombre cambiado");
  patchMatch(id, { name: trimmed === "" ? null : trimmed });
}

export function finishMatch(id: MatchId): void {
  checkpoint("Partida terminada");
  patchMatch(id, { finishedAt: Date.now() });
}

/** "Seguir jugando": nada es irreversible, ni siquiera terminar. */
export function reopenMatch(id: MatchId): void {
  checkpoint("Partida reabierta");
  patchMatch(id, { finishedAt: null, overrideEnd: true });
}

export function deleteMatch(id: MatchId): void {
  checkpoint("Partida borrada");
  setMatches($matches.get().filter((match) => match.id !== id));
  setRounds($rounds.get().filter((round) => round.matchId !== id));
}

/* ----------------------------------------------------------------------- rondas */

export const blankScores = (match: Match) => emptyScores(match.playerIds);

/**
 * Guarda una ronda nueva o reemplaza una existente y reevalúa el fin de
 * partida. Devuelve si la partida ha quedado terminada.
 */
export function saveRound(
  match: Match,
  scores: Record<PlayerId, number | null>,
  roundIndex: number | null
): { finished: boolean } {
  checkpoint(roundIndex === null ? "Ronda guardada" : "Ronda editada");

  const mine = roundsOf(match.id);
  const others = $rounds.get().filter((round) => round.matchId !== match.id);

  const updated =
    roundIndex === null
      ? [
          ...mine,
          {
            id: newId(),
            matchId: match.id,
            index: mine.length,
            scores,
            createdAt: Date.now(),
          },
        ]
      : mine.map((round) =>
          round.index === roundIndex ? { ...round, scores } : round
        );

  const next = reindexRounds(updated);
  setRounds([...others, ...next]);

  const finished = shouldFinish(match, next);
  if (finished) patchMatch(match.id, { finishedAt: Date.now() });

  return { finished };
}

export function deleteRound(match: Match, roundIndex: number): void {
  checkpoint("Ronda borrada");

  const others = $rounds.get().filter((round) => round.matchId !== match.id);
  const kept = reindexRounds(
    roundsOf(match.id).filter((round) => round.index !== roundIndex)
  );

  setRounds([...others, ...kept]);
}

/* --------------------------------------------------------------- copia de datos */

export function replaceAll(snapshot: {
  players: Player[];
  templates: GameTemplate[];
  matches: Match[];
  rounds: Round[];
}): void {
  setPlayers(snapshot.players);
  setTemplates(snapshot.templates);
  setMatches(snapshot.matches);
  setRounds(snapshot.rounds);
  $undo.set([]);
}
