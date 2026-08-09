import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { S } from "../strings";
import { IconButton } from "./Button";
import { cn } from "./cn";

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  /** Se pega arriba en la pantalla de partida, que es la que scrollea. */
  sticky?: boolean;
}

export function Header({ title, subtitle, onBack, actions, sticky }: Props) {
  return (
    <header
      className={cn(
        "flex items-center gap-2 px-3 py-3",
        // El borde de la cabecera pegajosa necesita aire debajo: sin él el
        // contenido arranca tocándolo. El margen va aquí y no en cada vista
        // porque el problema es de la cabecera, no de lo que venga detrás.
        sticky &&
          "sticky top-0 z-20 mb-4 border-b border-line bg-felt/95 backdrop-blur"
      )}
    >
      {onBack && (
        <IconButton label={S.common.back} onClick={onBack} className="shrink-0">
          <ArrowLeft size={20} />
        </IconButton>
      )}

      <div className="flex min-w-0 grow flex-col px-1">
        <h1 className="truncate font-display text-xl leading-tight">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs text-ink-faint">{subtitle}</p>
        )}
      </div>

      {actions}
    </header>
  );
}
