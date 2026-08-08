import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "./Button";
import { cn } from "./cn";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

/**
 * Reservado para confirmaciones y renombrados. Las acciones principales del
 * juego son pantallas, no diálogos: en mitad de una partida no se interrumpe.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: Props) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <RadixDialog.Content
          className={cn(
            "fixed z-50 flex flex-col gap-4",
            "border border-line bg-felt-raised p-5 text-ink shadow-xl",
            // En móvil sube desde abajo y respeta la zona segura; en escritorio
            // se centra como un diálogo normal.
            "inset-x-0 bottom-0 rounded-t-card pb-[calc(1.25rem+env(safe-area-inset-bottom))]",
            "sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[26rem]",
            "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-card sm:pb-5"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <RadixDialog.Title className="font-display text-lg font-medium">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="text-sm text-ink-muted">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <IconButton label="Cerrar" className="-mr-2 -mt-2">
                <X size={20} />
              </IconButton>
            </RadixDialog.Close>
          </div>

          {children}

          {footer && <div className="flex justify-end gap-2">{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
