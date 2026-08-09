import { LOCALE } from "@/domain/match";
import type { MatchRules } from "@/domain/types";
import { S } from "./strings";

const dayMonth = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "long",
});

const dayMonthYear = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const startOfDay = (timestamp: number) => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const DAY = 86_400_000;

/** Cabecera del grupo de partidas terminadas. */
export function formatDayGroup(timestamp: number, now = Date.now()): string {
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY);

  if (days <= 0) return S.time.today;
  if (days === 1) return S.time.yesterday;

  const sameYear =
    new Date(timestamp).getFullYear() === new Date(now).getFullYear();

  return sameYear
    ? dayMonth.format(timestamp)
    : dayMonthYear.format(timestamp);
}

/** Resumen de reglas de una línea: "Gana quien menos suma · hasta 100 puntos". */
export function describeRules(rules: MatchRules): string {
  const direction =
    rules.direction === "lowest" ? S.rules.lowest : S.rules.highest;

  const end =
    rules.endCondition.type === "points"
      ? S.rules.toPoints(rules.endCondition.value)
      : rules.endCondition.type === "rounds"
      ? S.rules.toRounds(rules.endCondition.value)
      : S.rules.manual;

  return `${direction} · ${end}`;
}

/** Con signo explícito, para los deltas de la última ronda. */
export const formatDelta = (value: number): string =>
  value > 0 ? `+${value}` : String(value);
