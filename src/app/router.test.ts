import { describe, expect, it } from "vitest";
import { href, parse, type Route } from "./router";

const ROUTES: Route[] = [
  { name: "home" },
  { name: "new-match" },
  { name: "match", matchId: "abc" },
  { name: "round", matchId: "abc", roundIndex: null },
  { name: "round", matchId: "abc", roundIndex: 0 },
  { name: "round", matchId: "abc", roundIndex: 12 },
  { name: "template", templateId: null },
  { name: "template", templateId: "builtin-chinchon" },
];

describe("router", () => {
  it("cada ruta sobrevive a ida y vuelta por la URL", () => {
    for (const route of ROUTES) {
      expect(parse(href(route))).toEqual(route);
    }
  });

  it("tolera la barra final", () => {
    expect(parse("/partida/abc/")).toEqual({ name: "match", matchId: "abc" });
    expect(parse("/")).toEqual({ name: "home" });
    expect(parse("")).toEqual({ name: "home" });
  });

  it("distingue ronda nueva de ronda editada", () => {
    expect(parse("/partida/abc/ronda")).toEqual({
      name: "round",
      matchId: "abc",
      roundIndex: null,
    });
    expect(parse("/partida/abc/ronda/0")).toEqual({
      name: "round",
      matchId: "abc",
      roundIndex: 0,
    });
  });

  it("no acepta índices de ronda inválidos", () => {
    for (const bad of ["-1", "1.5", "abc"]) {
      expect(parse(`/partida/abc/ronda/${bad}`).name).not.toBe("round");
    }
  });

  it("una barra final tras ronda sigue siendo ronda nueva", () => {
    expect(parse("/partida/abc/ronda/")).toEqual({
      name: "round",
      matchId: "abc",
      roundIndex: null,
    });
  });

  it("manda a not-found lo que no reconoce", () => {
    for (const bad of ["/loquesea", "/partida", "/juego", "/nueva/otra"]) {
      expect(parse(bad)).toEqual({ name: "not-found" });
    }
  });
});
