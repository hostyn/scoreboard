import { beforeEach, describe, expect, it } from "vitest";
import { getStandings } from "@/domain/standings";
import { BUILTIN_TEMPLATES } from "@/domain/templates";
import type { GameTemplate } from "@/domain/types";
import {
  $matches,
  $players,
  $rounds,
  $templates,
  $undo,
  createMatch,
  createPlayer,
  deleteRound,
  repeatMatch,
  roundsOf,
  saveRound,
  undo,
} from "./app";

/**
 * En node no hay IndexedDB, y la capa de datos lo detecta y no escribe. Eso
 * deja el store probable tal cual, sin dobles ni mocks.
 */
const reset = () => {
  $players.set([]);
  $templates.set(BUILTIN_TEMPLATES);
  $matches.set([]);
  $rounds.set([]);
  $undo.set([]);
};

const chinchon = () => BUILTIN_TEMPLATES[0]!;

const manual: GameTemplate = {
  ...chinchon(),
  id: "manual",
  endCondition: { type: "manual" },
};

const start = (template = manual) => {
  const a = createPlayer("Ana");
  const b = createPlayer("Bea");
  return { match: createMatch(template, [a.id, b.id]), a, b };
};

const totals = (matchId: string) => {
  const match = $matches.get().find((item) => item.id === matchId)!;
  return getStandings(match, $rounds.get()).map((s) => [s.playerId, s.total]);
};

beforeEach(reset);

describe("jugadores", () => {
  it("reutiliza a quien ya existe en vez de duplicarlo", () => {
    const first = createPlayer("Ana");
    const again = createPlayer("  ana  ");

    expect(again.id).toBe(first.id);
    expect($players.get()).toHaveLength(1);
  });

  it("da un color distinto a cada uno mientras haya libres", () => {
    const colors = ["a", "b", "c", "d", "e", "f"].map(
      (name) => createPlayer(name).colorIndex
    );

    expect(new Set(colors).size).toBe(6);
  });
});

describe("rondas", () => {
  it("guarda una ronda nueva al final y suma los totales", () => {
    const { match, a, b } = start();

    saveRound(match, { [a.id]: 10, [b.id]: 3 }, null);
    saveRound(match, { [a.id]: 5, [b.id]: 1 }, null);

    expect(roundsOf(match.id).map((r) => r.index)).toEqual([0, 1]);
    expect(totals(match.id)).toEqual([
      [b.id, 4],
      [a.id, 15],
    ]);
  });

  it("editar una ronda del medio recalcula los totales", () => {
    const { match, a, b } = start();

    saveRound(match, { [a.id]: 10, [b.id]: 0 }, null);
    saveRound(match, { [a.id]: 10, [b.id]: 0 }, null);
    saveRound(match, { [a.id]: 10, [b.id]: 0 }, null);

    saveRound(match, { [a.id]: 1, [b.id]: 0 }, 1);

    expect(totals(match.id)).toEqual([
      [b.id, 0],
      [a.id, 21],
    ]);
  });

  it("borrar una ronda del medio renumera y deja los totales bien", () => {
    const { match, a, b } = start();

    saveRound(match, { [a.id]: 1, [b.id]: 0 }, null);
    saveRound(match, { [a.id]: 20, [b.id]: 0 }, null);
    saveRound(match, { [a.id]: 300, [b.id]: 0 }, null);

    deleteRound(match, 1);

    expect(roundsOf(match.id).map((r) => r.index)).toEqual([0, 1]);
    expect(totals(match.id)).toEqual([
      [b.id, 0],
      [a.id, 301],
    ]);
  });

  it("los huecos se guardan como null, no como cero", () => {
    const { match, a, b } = start();
    saveRound(match, { [a.id]: 5, [b.id]: null }, null);

    expect(roundsOf(match.id)[0]!.scores[b.id]).toBeNull();
  });

  it("no toca las rondas de otras partidas", () => {
    const { match: first, a, b } = start();
    const second = createMatch(manual, [a.id, b.id]);

    saveRound(first, { [a.id]: 1, [b.id]: 1 }, null);
    saveRound(second, { [a.id]: 9, [b.id]: 9 }, null);
    deleteRound(first, 0);

    expect(roundsOf(first.id)).toHaveLength(0);
    expect(roundsOf(second.id)).toHaveLength(1);
  });
});

describe("fin de partida", () => {
  it("se marca terminada al cruzar el límite de puntos", () => {
    const { match, a, b } = start(chinchon());

    expect(saveRound(match, { [a.id]: 40, [b.id]: 0 }, null).finished).toBe(false);
    expect($matches.get()[0]!.finishedAt).toBeNull();

    expect(saveRound(match, { [a.id]: 60, [b.id]: 0 }, null).finished).toBe(true);
    expect($matches.get()[0]!.finishedAt).not.toBeNull();
  });

  it("una partida manual no termina sola", () => {
    const { match, a, b } = start();
    expect(saveRound(match, { [a.id]: 9999, [b.id]: 0 }, null).finished).toBe(false);
  });
});

describe("deshacer", () => {
  it("devuelve las rondas al estado anterior", () => {
    const { match, a, b } = start();

    saveRound(match, { [a.id]: 10, [b.id]: 0 }, null);
    saveRound(match, { [a.id]: 10, [b.id]: 0 }, null);
    expect(totals(match.id)[1]).toEqual([a.id, 20]);

    undo();

    expect(roundsOf(match.id)).toHaveLength(1);
    expect(totals(match.id)[1]).toEqual([a.id, 10]);
  });

  it("deshace también el borrado de una ronda", () => {
    const { match, a, b } = start();
    saveRound(match, { [a.id]: 7, [b.id]: 0 }, null);

    deleteRound(match, 0);
    expect(roundsOf(match.id)).toHaveLength(0);

    undo();
    expect(roundsOf(match.id)).toHaveLength(1);
  });

  it("devuelve null cuando no queda nada por deshacer", () => {
    expect(undo()).toBeNull();
  });
});

describe("repetir", () => {
  it("copia las reglas que se jugaron, no las de la plantilla actual", () => {
    const { match, a, b } = start();
    void a;
    void b;

    // La plantilla cambia después de haber jugado la partida.
    $templates.set([{ ...manual, endCondition: { type: "rounds", value: 3 } }]);

    const again = repeatMatch($matches.get()[0]!);

    expect(again.rules.endCondition).toEqual({ type: "manual" });
    expect(again.playerIds).toEqual(match.playerIds);
    expect(again.id).not.toBe(match.id);
  });
});
