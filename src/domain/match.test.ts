import { describe, expect, it } from "vitest";
import {
  emptyScores,
  getMatchName,
  reindexRounds,
  shouldFinish,
  unscoredCount,
} from "./match";
import { getStandings } from "./standings";
import type { EndCondition, Direction, Match, Round } from "./types";

const makeMatch = (
  endCondition: EndCondition,
  direction: Direction = "highest",
  overrides: Partial<Match> = {}
): Match => ({
  id: "m1",
  templateId: "t1",
  rules: {
    name: "Chinchón",
    direction,
    endCondition,
    shortcuts: [1, 2, 5, 10],
    allowNegative: true,
  },
  name: null,
  playerIds: ["a", "b"],
  createdAt: Date.UTC(2026, 7, 9),
  finishedAt: null,
  overrideEnd: false,
  ...overrides,
});

const makeRound = (index: number, scores: Record<string, number | null>): Round => ({
  id: `r${index}`,
  matchId: "m1",
  index,
  scores,
  createdAt: index,
});

describe("shouldFinish", () => {
  it("nunca termina sola una partida manual", () => {
    const match = makeMatch({ type: "manual" });
    const rounds = [makeRound(0, { a: 9999, b: 0 })];

    expect(shouldFinish(match, rounds)).toBe(false);
  });

  it("termina al alcanzar el número de rondas", () => {
    const match = makeMatch({ type: "rounds", value: 2 });

    expect(shouldFinish(match, [makeRound(0, { a: 1, b: 1 })])).toBe(false);
    expect(
      shouldFinish(match, [makeRound(0, { a: 1, b: 1 }), makeRound(1, { a: 1, b: 1 })])
    ).toBe(true);
  });

  it("termina cuando alguien alcanza el límite de puntos", () => {
    const match = makeMatch({ type: "points", value: 100 });

    expect(shouldFinish(match, [makeRound(0, { a: 99, b: 0 })])).toBe(false);
    expect(shouldFinish(match, [makeRound(0, { a: 100, b: 0 })])).toBe(true);
  });

  it("también termina si lo cruza sin pisarlo exacto", () => {
    const match = makeMatch({ type: "points", value: 100 });
    expect(shouldFinish(match, [makeRound(0, { a: 140, b: 0 })])).toBe(true);
  });

  it("en menos-puntos-gana el límite sigue siendo un techo de eliminación", () => {
    // Chinchón: gana quien menos suma, pero se sale al llegar a 100.
    const match = makeMatch({ type: "points", value: 100 }, "lowest");

    expect(shouldFinish(match, [makeRound(0, { a: 100, b: 3 })])).toBe(true);
    expect(shouldFinish(match, [makeRound(0, { a: 20, b: 3 })])).toBe(false);
  });

  it("con límite negativo se cruza bajando", () => {
    const match = makeMatch({ type: "points", value: -50 }, "lowest");

    expect(shouldFinish(match, [makeRound(0, { a: -49, b: 0 })])).toBe(false);
    expect(shouldFinish(match, [makeRound(0, { a: -50, b: 0 })])).toBe(true);
  });

  it("no vuelve a terminar si el usuario eligió seguir jugando", () => {
    const match = makeMatch({ type: "points", value: 100 }, "highest", {
      overrideEnd: true,
    });

    expect(shouldFinish(match, [makeRound(0, { a: 500, b: 0 })])).toBe(false);
  });

  it("no termina una partida ya terminada", () => {
    const match = makeMatch({ type: "points", value: 100 }, "highest", {
      finishedAt: 1,
    });

    expect(shouldFinish(match, [makeRound(0, { a: 500, b: 0 })])).toBe(false);
  });

  it("los huecos no disparan el fin por su cuenta", () => {
    const match = makeMatch({ type: "points", value: 10 });
    expect(shouldFinish(match, [makeRound(0, { a: null, b: null })])).toBe(false);
  });
});

describe("edición de rondas", () => {
  it("borrar una ronda intermedia deja los totales correctos y los índices consecutivos", () => {
    const match = makeMatch({ type: "manual" });
    const rounds = [
      makeRound(0, { a: 10, b: 1 }),
      makeRound(1, { a: 20, b: 2 }),
      makeRound(2, { a: 30, b: 3 }),
    ];

    const kept = reindexRounds(rounds.filter((round) => round.index !== 1));

    expect(kept.map((round) => round.index)).toEqual([0, 1]);
    expect(getStandings(match, kept).map((s) => [s.playerId, s.total])).toEqual([
      ["a", 40],
      ["b", 4],
    ]);
    // El delta que se muestra pasa a ser el de la que quedó última.
    expect(getStandings(match, kept)[0]!.lastDelta).toBe(30);
  });

  it("reindexar no toca las rondas que ya estaban en su sitio", () => {
    const rounds = [makeRound(0, { a: 1 }), makeRound(1, { a: 2 })];
    const result = reindexRounds(rounds);

    expect(result[0]).toBe(rounds[0]);
    expect(result[1]).toBe(rounds[1]);
  });

  it("reindexar no muta el array recibido", () => {
    const rounds = [makeRound(5, { a: 1 }), makeRound(2, { a: 2 })];
    reindexRounds(rounds);

    expect(rounds.map((r) => r.index)).toEqual([5, 2]);
  });
});

describe("rondas incompletas", () => {
  it("cuenta los jugadores sin puntuar", () => {
    const round = makeRound(0, { a: 5, b: null });
    expect(unscoredCount(round, ["a", "b"])).toBe(1);
  });

  it("un 0 anotado sí cuenta como puntuado", () => {
    const round = makeRound(0, { a: 0, b: 0 });
    expect(unscoredCount(round, ["a", "b"])).toBe(0);
  });

  it("un jugador ausente del objeto cuenta como sin puntuar", () => {
    const round = makeRound(0, { a: 5 });
    expect(unscoredCount(round, ["a", "b"])).toBe(1);
  });

  it("emptyScores deja a todos sin puntuar", () => {
    expect(emptyScores(["a", "b"])).toEqual({ a: null, b: null });
  });
});

describe("getMatchName", () => {
  it("deriva nombre de las reglas y la fecha cuando no hay uno propio", () => {
    expect(getMatchName(makeMatch({ type: "manual" }))).toMatch(/^Chinchón · 9 ago/);
  });

  it("respeta el nombre que puso el usuario", () => {
    const match = makeMatch({ type: "manual" }, "highest", {
      name: "La del cumple de Nacho",
    });

    expect(getMatchName(match)).toBe("La del cumple de Nacho");
  });
});
