import { useEffect, type RefObject } from "react";

/**
 * Publica la altura de la barra inferior en `--bottom-inset`, para que los
 * avisos se posicionen justo encima de ella.
 *
 * Se mide en lugar de cablearse porque no todas miden lo mismo: la barra de
 * una acción ronda los 80px y el teclado de la ronda pasa de 380px, y ambos
 * cambian con la zona segura del sistema y con el ancho de la pantalla.
 */
export function useBottomInset(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const root = document.documentElement;
    const update = () =>
      root.style.setProperty("--bottom-inset", `${element.offsetHeight}px`);

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      observer.disconnect();
      // Sin esto, una pantalla sin barra heredaría la altura de la anterior.
      root.style.removeProperty("--bottom-inset");
    };
  }, [ref]);
}
