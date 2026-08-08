import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  // Tiza sobre el tapete: la acción primaria no compite con ningún jugador.
  primary: "bg-chalk text-felt hover:bg-chalk-dim",
  secondary:
    "border border-line-strong text-ink hover:bg-felt-overlay hover:border-ink-faint",
  ghost: "text-ink-muted hover:bg-felt-raised hover:text-ink",
  danger: "text-danger hover:bg-danger/10",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Ocupa todo el ancho: para las acciones primarias del tercio inferior. */
  block?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "secondary",
  block = false,
  icon,
  className,
  children,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "tap inline-flex items-center justify-center gap-2 rounded-key px-5",
        "font-ui text-[0.95rem] font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        block && "w-full",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obligatorio: estos botones no tienen texto que leer. */
  label: string;
  variant?: Variant;
}

export function IconButton({
  label,
  variant = "ghost",
  className,
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "tap inline-flex items-center justify-center rounded-key transition-colors",
        "disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
