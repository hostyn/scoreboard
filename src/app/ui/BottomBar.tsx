import { useRef, type ReactNode } from "react";
import { cn } from "./cn";
import { useBottomInset } from "./useBottomInset";

/**
 * Barra fija con la acción primaria, al alcance del pulgar y sobre la zona
 * segura del sistema. Se mide sola para que los avisos caigan justo encima.
 */
export function BottomBar({
  children,
  width = "max-w-2xl",
}: {
  children: ReactNode;
  width?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useBottomInset(ref);

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-felt/95 backdrop-blur"
    >
      <div
        className={cn(
          "mx-auto flex w-full gap-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
          width
        )}
      >
        {children}
      </div>
    </div>
  );
}
