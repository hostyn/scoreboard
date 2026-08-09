import { useEffect } from "react";

/**
 * Mantiene la pantalla encendida mientras hay una partida en curso: nadie
 * quiere desbloquear el móvil entre ronda y ronda.
 *
 * Degrada en silencio donde la API no existe (Safari antiguo, Firefox) y
 * vuelve a pedirlo al recuperar el foco, porque el sistema lo suelta solo al
 * cambiar de pestaña.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const next = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void next.release();
          return;
        }
        sentinel = next;
      } catch {
        // Denegado o el documento no está visible: no es un error que contar.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release();
    };
  }, [active]);
}
