import { useCallback, useLayoutEffect, useRef } from "react";

const DURATION = 300;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Anima el reordenamiento de una lista con la técnica FLIP: se mide dónde
 * estaba cada fila, se la coloca de vuelta en su sitio anterior y se la deja
 * caer al nuevo.
 *
 * Es el único momento con movimiento de la app: verlo adelantar es lo que
 * cuenta quién ha pasado a quién, en lugar de que la lista salte.
 */
export function useFlip(order: string[]) {
  const nodes = useRef(new Map<string, HTMLElement>());
  const previous = useRef(new Map<string, number>());

  const register = useCallback(
    (key: string) => (element: HTMLElement | null) => {
      if (element) nodes.current.set(key, element);
      else nodes.current.delete(key);
    },
    []
  );

  useLayoutEffect(() => {
    const measured = new Map<string, number>();

    for (const [key, element] of nodes.current) {
      const top = element.getBoundingClientRect().top;
      measured.set(key, top);

      const before = previous.current.get(key);
      if (before === undefined || before === top) continue;
      if (prefersReducedMotion()) continue;

      element.animate(
        [
          { transform: `translateY(${before - top}px)` },
          { transform: "translateY(0)" },
        ],
        { duration: DURATION, easing: EASING }
      );
    }

    previous.current = measured;
  }, [order.join("|")]);

  return register;
}
