import { atom } from "nanostores";

export type Route =
  | { name: "home" }
  | { name: "new-match" }
  | { name: "match"; matchId: string }
  | { name: "round"; matchId: string; roundIndex: number | null }
  | { name: "template"; templateId: string | null }
  | { name: "not-found" };

/** Las rutas están en español, igual que el resto de la interfaz. */
export function href(route: Route): string {
  switch (route.name) {
    case "home":
      return "/";
    case "new-match":
      return "/nueva";
    case "match":
      return `/partida/${route.matchId}`;
    case "round":
      return route.roundIndex === null
        ? `/partida/${route.matchId}/ronda`
        : `/partida/${route.matchId}/ronda/${route.roundIndex}`;
    case "template":
      return route.templateId === null
        ? "/juego/nuevo"
        : `/juego/${route.templateId}`;
    case "not-found":
      return "/";
  }
}

export function parse(pathname: string): Route {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return { name: "home" };

  if (parts[0] === "nueva" && parts.length === 1) return { name: "new-match" };

  if (parts[0] === "juego" && parts.length === 2) {
    return {
      name: "template",
      templateId: parts[1] === "nuevo" ? null : parts[1]!,
    };
  }

  if (parts[0] === "partida" && parts[1]) {
    const matchId = parts[1];

    if (parts.length === 2) return { name: "match", matchId };

    if (parts[2] === "ronda") {
      if (parts.length === 3) return { name: "round", matchId, roundIndex: null };

      const index = Number(parts[3]);
      if (Number.isInteger(index) && index >= 0) {
        return { name: "round", matchId, roundIndex: index };
      }
    }
  }

  return { name: "not-found" };
}

const initial = (): Route =>
  typeof window === "undefined"
    ? { name: "home" }
    : parse(window.location.pathname);

export const $route = atom<Route>(initial());

export function navigate(route: Route, { replace = false } = {}): void {
  const url = href(route);

  if (replace) window.history.replaceState({}, "", url);
  else window.history.pushState({}, "", url);

  $route.set(route);
}

export function goBack(): void {
  window.history.back();
}

/** Sincroniza el store cuando el usuario usa atrás/adelante del navegador. */
export function listenToHistory(): () => void {
  const onPopState = () => $route.set(parse(window.location.pathname));

  window.addEventListener("popstate", onPopState);
  return () => window.removeEventListener("popstate", onPopState);
}
