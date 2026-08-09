import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { S } from "../strings";
import { cn } from "./cn";

interface ToastSpec {
  /** Texto plano: dice qué pasó, no celebra nada. */
  message: string;
  action?: { label: string; onAction: () => void };
}

interface Entry extends ToastSpec {
  id: number;
}

const DURATION = 6000;

/** Suficientes para encadenar un par de acciones, sin taparle la pantalla a nadie. */
const MAX_VISIBLE = 3;

const ToastContext = createContext<((spec: ToastSpec) => void) | null>(null);

/** Avisos discretos: nunca bloquean, nunca piden confirmación. */
export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast necesita estar dentro de <Toaster>");
  return push;
}

export function Toaster({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);

  const push = useCallback((spec: ToastSpec) => {
    setEntries((current) =>
      [...current, { ...spec, id: Date.now() + Math.random() }].slice(-MAX_VISIBLE)
    );
  }, []);

  const dismiss = useCallback((id: number) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={push}>
      <ToastPrimitive.Provider swipeDirection="up" duration={DURATION}>
        {children}

        {entries.map((entry) => (
          <ToastPrimitive.Root
            key={entry.id}
            onOpenChange={(open) => !open && dismiss(entry.id)}
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-card border border-line",
              "bg-felt-overlay py-2 pl-4 pr-2 font-ui text-sm text-ink shadow-xl",
              "data-[swipe=end]:opacity-0"
            )}
          >
            <ToastPrimitive.Title className="grow">
              {entry.message}
            </ToastPrimitive.Title>

            {entry.action && (
              <ToastPrimitive.Action
                asChild
                altText={entry.action.label}
                onClick={entry.action.onAction}
              >
                <button
                  type="button"
                  className="shrink-0 px-1 font-medium text-chalk underline underline-offset-4"
                >
                  {entry.action.label}
                </button>
              </ToastPrimitive.Action>
            )}

            {/* Sin esto solo quedaba esperar o deslizar, que no se adivina. */}
            <ToastPrimitive.Close asChild>
              <button
                type="button"
                aria-label={S.common.close}
                className="flex size-8 shrink-0 items-center justify-center rounded-key text-ink-muted transition-colors hover:bg-felt-raised hover:text-ink"
              >
                <X size={16} />
              </button>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        {/*
          Justo encima de la barra inferior, nunca sobre ella: `--bottom-inset`
          la publica cada pantalla midiéndose. Antes la franja se solapaba con
          la acción primaria, y como Radix pausa la cuenta atrás con
          `pointermove` sobre el viewport, pulsar el botón congelaba el aviso.

          `pointer-events-none` en la franja para que no intercepte nada cuando
          está vacía; cada aviso los reactiva por su cuenta.
        */}
        <ToastPrimitive.Viewport
          className={cn(
            // Por encima incluso de los diálogos: el aviso de importación
            // fallida salta con el diálogo de datos todavía abierto.
            "pointer-events-none fixed inset-x-0 z-[60] mx-auto flex max-w-md",
            "flex-col gap-2 px-3 pb-2 outline-none"
          )}
          style={{ bottom: "var(--bottom-inset, 0px)" }}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
