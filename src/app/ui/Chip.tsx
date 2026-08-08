import * as ToggleGroup from "@radix-ui/react-toggle-group";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "./cn";
import { playerBg, playerBorderOn } from "./players";

/**
 * Grupo de chips. Radix aporta el foco itinerante y el estado accesible; el
 * aspecto lo pone Tailwind.
 */
export function ChipGroup({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ToggleGroup.Root>) {
  return (
    <ToggleGroup.Root
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  );
}

interface ChipProps
  extends Omit<ComponentPropsWithoutRef<typeof ToggleGroup.Item>, "color"> {
  /** Color del jugador, si el chip representa a uno. */
  colorIndex?: number;
  children: ReactNode;
}

export function Chip({
  colorIndex,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <ToggleGroup.Item
      className={cn(
        "tap inline-flex items-center gap-2 rounded-full border px-4",
        "font-ui text-[0.95rem] transition-colors",
        "border-line text-ink-muted hover:border-line-strong hover:text-ink",
        // El seleccionado se marca con su propio color, no con un genérico.
        colorIndex === undefined
          ? "data-[state=on]:border-chalk data-[state=on]:bg-chalk data-[state=on]:text-felt"
          : cn(
              "data-[state=on]:bg-felt-overlay data-[state=on]:text-ink",
              playerBorderOn(colorIndex)
            ),
        className
      )}
      {...props}
    >
      {colorIndex !== undefined && (
        <span
          aria-hidden
          className={cn("size-2.5 rounded-full", playerBg(colorIndex))}
        />
      )}
      {children}
    </ToggleGroup.Item>
  );
}
