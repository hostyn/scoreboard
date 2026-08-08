import { describe, expect, it } from "vitest";
import { getLeaders, getStandings, hasClearLeader } from "./standings";
import type { Direction, Match, Round } from "./types";

const makeMatch = (playerIds: string[], direction: Direction = "highest"): Match => ({
  id: "m1",
  templateId: "t1",
  rules: {
    name: "Test",
    direction,
    endCondition: { type: "manual" },
    shortcuts: [1, 2, 5, 10],
    allowNegative: true,
  },
  name: null,
  playerIds,
  createdAt: 0,
  finishedAt: null,
  overrideEnd: false,
});

const makeRound = (
  index: number,
  scores: Record<string, number | null>,
  matchId = "m1"
): Round => ({ id: `r${index}`, matchId, index, scores, createdAt: index });

/** Atajo de lectura: [playerId, total, rank] por fila. */
const shape = (match: Match, rounds: Round[]) =>
  getStandings(match, rounds).map((s) => [s.playerId, s.total, s.rank]);

describe("getStandings", () => {
  it("suma los valores no nulos y ordena de más a menos si gana quien más puntúa", () => {
    const match = makeMatch(["a", "b", "c"]);
    const rounds = [
      makeRound(0, { a: 10, b: 5, c: 1 }),
      makeRound(1, { a: 3, b: 8, c: 2 }),
    ];

    expect(shape(match, rounds)).toEqual([
      ["a", 13, 1],
      ["b", 13, 1],
      ["c", 3, 3],
    ]);
  });

  it("invierte el orden si gana quien menos puntúa", () => {
    const match = makeMatch(["a", "b", "c"], "lowest");
    const rounds = [makeRound(0, { a: 10, b: 5, c: 1 })];

    expect(shape(match, rounds)).toEqual([
      ["c", 1, 1],
      ["b", 5, 2],
      ["a", 10, 3],
    ]);
  });

  it("da la misma posición a los empatados y salta la siguiente (1, 1, 3)", () => {
    const match = makeMatch(["a", "b", "c", "d"]);
    const rounds = [makeRound(0, { a: 5, b: 5, c: 5, d: 1 })];

    expect(shape(match, rounds)).toEqual([
      ["a", 5, 1],
      ["b", 5, 1],
      ["c", 5, 1],
      ["d", 1, 4],
    ]);
  });

  it("desempata por el orden de playerIds, no por el de las claves de scores", () => {
    const match = makeMatch(["c", "a", "b"]);
    // Las claves van en otro orden a propósito.
    const rounds = [makeRound(0, { b: 5, a: 5, c: 5 })];

    expect(getStandings(match, rounds).map((s) => s.playerId)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("con cero rondas empatan todos a 0 en la posición 1", () => {
    const match = makeMatch(["a", "b", "c"]);

    expect(shape(match, [])).toEqual([
      ["a", 0, 1],
      ["b", 0, 1],
      ["c", 0, 1],
    ]);
    expect(hasClearLeader(getStandings(match, []))).toBe(false);
    expect(getLeaders(getStandings(match, []))).toHaveLength(3);
  });

  it("cuenta los huecos como 0 sin confundirlos con un 0 anotado", () => {
    const match = makeMatch(["a", "b"]);
    const rounds = [makeRound(0, { a: null, b: 0 }), makeRound(1, { a: 4, b: 1 })];
    const standings = getStandings(match, rounds);

    expect(standings.map((s) => [s.playerId, s.total])).toEqual([
      ["a", 4],
      ["b", 1],
    ]);
  });

  it("expone el delta de la última ronda, null si el jugador no puntuó", () => {
    const match = makeMatch(["a", "b"]);
    const rounds = [makeRound(0, { a: 10, b: 10 }), makeRound(1, { a: 5, b: null })];
    const byId = Object.fromEntries(
      getStandings(match, rounds).map((s) => [s.playerId, s.lastDelta])
    );

    expect(byId).toEqual({ a: 5, b: null });
  });

  it("no tiene delta cuando no hay rondas", () => {
    const match = makeMatch(["a"]);
    expect(getStandings(match, [])[0]!.lastDelta).toBeNull();
  });

  it("ignora las rondas de otras partidas", () => {
    const match = makeMatch(["a"]);
    const rounds = [makeRound(0, { a: 5 }), makeRound(0, { a: 99 }, "otra")];

    expect(getStandings(match, rounds)[0]!.total).toBe(5);
  });

  it("respeta el índice de la ronda aunque lleguen desordenadas", () => {
    const match = makeMatch(["a"]);
    const rounds = [makeRound(1, { a: 2 }), makeRound(0, { a: 1 })];

    expect(getStandings(match, rounds)[0]!.lastDelta).toBe(2);
  });

  it("maneja negativos en juegos de menos puntos gana", () => {
    const match = makeMatch(["a", "b"], "lowest");
    const rounds = [makeRound(0, { a: -10, b: 5 })];

    expect(shape(match, rounds)).toEqual([
      ["a", -10, 1],
      ["b", 5, 2],
    ]);
  });

  it("no muta el array de rondas que recibe", () => {
    const match = makeMatch(["a"]);
    const rounds = [makeRound(1, { a: 2 }), makeRound(0, { a: 1 })];

    getStandings(match, rounds);

    expect(rounds.map((r) => r.index)).toEqual([1, 0]);
  });
});
