import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
import { cn } from "./cn";

interface MenuProps {
  trigger: ReactNode;
  children: ReactNode;
}

export function Menu({ trigger, children }: MenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            "z-50 min-w-48 rounded-card border border-line bg-felt-overlay p-1",
            "font-ui text-ink shadow-xl"
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface ItemProps {
  onSelect: () => void;
  icon?: ReactNode;
  danger?: boolean;
  children: ReactNode;
}

export function MenuItem({ onSelect, icon, danger, children }: ItemProps) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={cn(
        "tap flex cursor-pointer select-none items-center gap-3 rounded-key px-3",
        "text-[0.95rem] outline-none",
        danger
          ? "text-danger data-[highlighted]:bg-danger/10"
          : "data-[highlighted]:bg-felt-raised"
      )}
    >
      {icon}
      {children}
    </DropdownMenu.Item>
  );
}

export const MenuSeparator = () => (
  <DropdownMenu.Separator className="my-1 h-px bg-line" />
);
