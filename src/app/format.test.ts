import { describe, expect, it } from "vitest";
import type { MatchRules } from "@/domain/types";
import { describeRules, formatDayGroup, formatDelta } from "./format";

const at = (y: number, m: number, d: number, h = 12) =>
  new Date(y, m - 1, d, h).getTime();

describe("formatDayGroup", () => {
  const now = at(2026, 8, 9);

  it("llama hoy a cualquier hora del mismo día", () => {
    expect(formatDayGroup(at(2026, 8, 9, 0), now)).toBe("Hoy");
    expect(formatDayGroup(at(2026, 8, 9, 23), now)).toBe("Hoy");
  });

  it("llama ayer al día anterior aunque solo disten unas horas", () => {
    // 23:00 de ayer y 01:00 de hoy distan 2 horas pero son días distintos.
    expect(formatDayGroup(at(2026, 8, 8, 23), at(2026, 8, 9, 1))).toBe("Ayer");
  });

  it("usa día y mes dentro del mismo año", () => {
    expect(formatDayGroup(at(2026, 8, 1), now)).toBe("1 de agosto");
  });

  it("añade el año cuando cambia", () => {
    expect(formatDayGroup(at(2025, 12, 31), now)).toBe("31 de diciembre de 2025");
  });

  it("no se descuadra al cruzar el cambio de hora", () => {
    // En España el horario de verano acaba el último domingo de octubre.
    const sunday = at(2026, 10, 25);
    const saturday = at(2026, 10, 24);

    expect(formatDayGroup(saturday, sunday)).toBe("Ayer");
    expect(formatDayGroup(sunday, sunday)).toBe("Hoy");
  });
});

describe("describeRules", () => {
  const base: MatchRules = {
    name: "Chinchón",
    direction: "lowest",
    endCondition: { type: "points", value: 100 },
    shortcuts: [-10, 5, 10, 25],
    allowNegative: true,
  };

  it("resume dirección y límite de puntos", () => {
    expect(describeRules(base)).toBe("Gana quien menos suma · hasta 100 puntos");
  });

  it("resume el límite de rondas", () => {
    expect(
      describeRules({ ...base, direction: "highest", endCondition: { type: "rounds", value: 9 } })
    ).toBe("Gana quien más suma · a 9 rondas");
  });

  it("resume el final manual", () => {
    expect(describeRules({ ...base, endCondition: { type: "manual" } })).toBe(
      "Gana quien menos suma · sin final fijado"
    );
  });
});

describe("formatDelta", () => {
  it("marca el signo solo cuando suma", () => {
    expect(formatDelta(5)).toBe("+5");
    expect(formatDelta(-5)).toBe("-5");
    expect(formatDelta(0)).toBe("0");
  });
});
