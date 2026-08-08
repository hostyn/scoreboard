import * as ToastPrimitive from "@radix-ui/react-toast";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "./cn";

interface ToastSpec {
  /** Texto plano: dice qué pasó, no celebra nada. */
  message: string;
  action?: { label: string; onAction: () => void };
}

interface Entry extends ToastSpec {
  id: number;
}

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
    setEntries((current) => [...current, { ...spec, id: Date.now() + Math.random() }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="down" duration={6000}>
        {children}

        {entries.map((entry) => (
          <ToastPrimitive.Root
            key={entry.id}
            onOpenChange={(open) => !open && dismiss(entry.id)}
            className={cn(
              "flex items-center gap-4 rounded-card border border-line",
              "bg-felt-overlay px-4 py-3 font-ui text-sm text-ink shadow-xl"
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
                  className="shrink-0 font-medium text-chalk underline underline-offset-4"
                >
                  {entry.action.label}
                </button>
              </ToastPrimitive.Action>
            )}
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex flex-col gap-2 p-4",
            // Por encima de la barra inferior y de la zona segura del sistema.
            "pb-[calc(1rem+env(safe-area-inset-bottom))]",
            "mx-auto max-w-md outline-none"
          )}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
