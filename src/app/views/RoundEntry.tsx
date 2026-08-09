import { useStore } from "@nanostores/react";
import { Delete } from "lucide-react";
import { useMemo, useState } from "react";
import { unscoredCount } from "@/domain/match";
import { totalFor } from "@/domain/standings";
import type { Player, PlayerId } from "@/domain/types";
import { formatDelta } from "../format";
import { navigate } from "../router";
import { $matches, $players, $rounds, roundsOf, saveRound } from "../stores/app";
import { S } from "../strings";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";
import { Header } from "../ui/Header";
import { playerBg } from "../ui/players";
import { useToast } from "../ui/Toast";
import Missing from "./Missing";

/** Buffers de texto para poder distinguir "" (sin puntuar) de "0" (anotado). */
type Drafts = Record<PlayerId, string>;

const toScore = (draft: string): number | null => {
  if (draft === "" || draft === "-") return null;
  const value = Number(draft);
  return Number.isFinite(value) ? value : null;
};

export default function RoundEntry({
  matchId,
  roundIndex,
}: {
  matchId: string;
  roundIndex: number | null;
}) {
  const matches = useStore($matches);
  const players = useStore($players);
  useStore($rounds);
  const toast = useToast();

  const match = matches.find((item) => item.id === matchId);
  const rounds = match ? roundsOf(match.id) : [];
  const editing =
    roundIndex === null
      ? undefined
      : rounds.find((round) => round.index === roundIndex);

  const seated = useMemo(
    () =>
      (match?.playerIds ?? [])
        .map((id) => players.find((player) => player.id === id))
        .filter((player): player is Player => player !== undefined),
    [match, players]
  );

  const [drafts, setDrafts] = useState<Drafts>(() =>
    Object.fromEntries(
      (match?.playerIds ?? []).map((id) => {
        const value = editing?.scores[id];
        return [id, value === null || value === undefined ? "" : String(value)];
      })
    )
  );

  const [active, setActive] = useState<PlayerId | null>(
    match?.playerIds[0] ?? null
  );

  if (!match) return <Missing />;
  if (roundIndex !== null && !editing) return <Missing />;

  // Los totales previos excluyen la ronda que se está editando: así el
  // "antes → después" enseña la consecuencia real del cambio.
  const previous = rounds.filter((round) => round.index !== roundIndex);

  const edit = (change: (current: string) => string) => {
    if (!active) return;
    setDrafts((current) => ({ ...current, [active]: change(current[active] ?? "") }));
  };

  const press = (digit: string) =>
    edit((current) =>
      // Un 0 solo es el valor anotado; el siguiente dígito lo sustituye.
      current === "0" ? digit : current === "-0" ? `-${digit}` : current + digit
    );

  const toggleSign = () =>
    edit((current) =>
      current.startsWith("-") ? current.slice(1) : `-${current}`
    );

  const backspace = () => edit((current) => current.slice(0, -1));

  const next = () => {
    const position = seated.findIndex((player) => player.id === active);
    const following = seated[(position + 1) % seated.length];
    if (following) setActive(following.id);
  };

  const save = () => {
    const scores = Object.fromEntries(
      match.playerIds.map((id) => [id, toScore(drafts[id] ?? "")])
    ) as Record<PlayerId, number | null>;

    const { finished } = saveRound(match, scores, roundIndex);

    const blanks = unscoredCount(
      { id: "", matchId: match.id, index: 0, scores, createdAt: 0 },
      match.playerIds
    );

    // Aviso, nunca un modal que corte la partida.
    toast({
      message: finished
        ? S.round.finished
        : blanks > 0
        ? `${S.round.saved} · ${S.round.savedWith(blanks)}`
        : S.round.saved,
    });

    navigate({ name: "match", matchId: match.id });
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl grow flex-col">
      <Header
        sticky
        title={
          roundIndex === null
            ? S.round.newTitle
            : S.round.editTitle(roundIndex + 1)
        }
        onBack={() => navigate({ name: "match", matchId: match.id })}
      />

      <div className="flex grow flex-col gap-1 px-3 pb-2">
        {seated.map((player) => {
          const draft = drafts[player.id] ?? "";
          const value = toScore(draft);
          const before = totalFor(previous, player.id);
          const isActive = player.id === active;

          return (
            <button
              key={player.id}
              onClick={() => setActive(player.id)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-key border px-3 text-left transition-colors",
                isActive
                  ? "border-line-strong bg-felt-raised"
                  : "border-transparent hover:bg-felt-raised/60"
              )}
            >
              <span
                aria-hidden
                className={cn("size-2.5 shrink-0 rounded-full", playerBg(player.colorIndex))}
              />
              <span className="grow truncate">{player.name}</span>

              {/* Ver la consecuencia mientras se teclea es lo que evita errores. */}
              <span className="numeric flex shrink-0 items-baseline gap-2 text-sm text-ink-faint">
                <span>{before}</span>
                <span aria-hidden>→</span>
                <span className={cn("text-lg", value !== null && "text-ink")}>
                  {before + (value ?? 0)}
                </span>
              </span>

              <span
                className={cn(
                  "numeric w-14 shrink-0 text-right text-xl",
                  value === null && "text-ink-faint"
                )}
              >
                {draft === "" ? "—" : draft}
              </span>
            </button>
          );
        })}
      </div>

      <Keypad
        shortcuts={match.rules.shortcuts}
        allowNegative={match.rules.allowNegative}
        onShortcut={(value) => edit(() => String(value))}
        onDigit={press}
        onSign={toggleSign}
        onBackspace={backspace}
        onNext={next}
        onSave={save}
      />
    </div>
  );
}

const KEY_CLASS =
  "flex min-h-14 items-center justify-center rounded-key border border-line bg-felt-raised numeric text-xl transition-colors hover:bg-felt-overlay active:bg-felt-overlay";

/**
 * Teclado propio en lugar del nativo: el del sistema ocupa media pantalla,
 * tiene teclas de 30px y esconde el signo menos.
 */
function Keypad({
  shortcuts,
  allowNegative,
  onShortcut,
  onDigit,
  onSign,
  onBackspace,
  onNext,
  onSave,
}: {
  shortcuts: number[];
  allowNegative: boolean;
  onShortcut: (value: number) => void;
  onDigit: (digit: string) => void;
  onSign: () => void;
  onBackspace: () => void;
  onNext: () => void;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-0 flex flex-col gap-2 border-t border-line bg-felt p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 gap-2">
        {shortcuts.map((value, position) => (
          <button
            key={position}
            type="button"
            onClick={() => onShortcut(value)}
            className={cn(KEY_CLASS, "min-h-12 text-base text-ink-muted")}
          >
            {formatDelta(value)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <button
            key={digit}
            type="button"
            className={KEY_CLASS}
            onClick={() => onDigit(digit)}
          >
            {digit}
          </button>
        ))}

        {allowNegative ? (
          <button
            type="button"
            className={KEY_CLASS}
            onClick={onSign}
            aria-label={S.round.sign}
          >
            ±
          </button>
        ) : (
          <span />
        )}

        <button type="button" className={KEY_CLASS} onClick={() => onDigit("0")}>
          0
        </button>

        <button
          type="button"
          className={KEY_CLASS}
          onClick={onBackspace}
          aria-label={S.round.clear}
        >
          <Delete size={20} />
        </button>
      </div>

      <div className="flex gap-2">
        <Button onClick={onNext} className="shrink-0">
          {S.round.next}
        </Button>
        <Button variant="primary" block onClick={onSave}>
          {S.round.save}
        </Button>
      </div>
    </div>
  );
}
