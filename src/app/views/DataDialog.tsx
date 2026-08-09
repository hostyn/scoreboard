import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import { exportSnapshot } from "@/db";
import type { GameTemplate, Match, Player, Round } from "@/domain/types";
import {
  $matches,
  $players,
  $rounds,
  $templates,
  replaceAll,
} from "../stores/app";
import { S } from "../strings";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { useToast } from "../ui/Toast";

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

/** Validación mínima: que las cuatro colecciones existan y sean listas. */
function parseSnapshot(raw: string) {
  const data = JSON.parse(raw) as Record<string, unknown>;

  if (
    !isArray(data.players) ||
    !isArray(data.templates) ||
    !isArray(data.matches) ||
    !isArray(data.rounds)
  ) {
    throw new Error("formato inesperado");
  }

  return {
    players: data.players as Player[],
    templates: data.templates as GameTemplate[],
    matches: data.matches as Match[],
    rounds: data.rounds as Round[],
  };
}

/** Sustituto barato del backup mientras no haya backend. */
export function DataDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const download = () => {
    const json = exportSnapshot({
      players: $players.get(),
      templates: $templates.get(),
      matches: $matches.get(),
      rounds: $rounds.get(),
    });

    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" })
    );
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `scoreboard-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file: File) => {
    try {
      replaceAll(parseSnapshot(await file.text()));
      toast({ message: S.data.imported });
      onOpenChange(false);
    } catch {
      toast({ message: S.data.importFailed });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={S.data.title}>
      <p className="text-sm text-ink-muted">{S.data.body}</p>

      <div className="flex gap-2">
        <Button icon={<Download size={18} />} onClick={download}>
          {S.data.export}
        </Button>
        <Button
          icon={<Upload size={18} />}
          onClick={() => fileRef.current?.click()}
        >
          {S.data.import}
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void upload(file);
          event.currentTarget.value = "";
        }}
      />
    </Dialog>
  );
}
