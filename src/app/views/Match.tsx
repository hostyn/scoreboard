import { useStore } from "@nanostores/react";
import { Flag, MoreVertical, Pencil, Play, Plus, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { getMatchName } from "@/domain/match";
import { getStandings, hasClearLeader } from "@/domain/standings";
import type { Player, Round, Standing } from "@/domain/types";
import { describeRules, formatDelta } from "../format";
import { navigate } from "../router";
import {
  $matches,
  $players,
  $rounds,
  $undo,
  deleteMatch,
  deleteRound,
  finishMatch,
  renameMatch,
  reopenMatch,
  undo,
} from "../stores/app";
import { S } from "../strings";
import { BottomBar } from "../ui/BottomBar";
import { Button, IconButton } from "../ui/Button";
import { cn } from "../ui/cn";
import { Dialog } from "../ui/Dialog";
import { TextInput } from "../ui/Field";
import { Header } from "../ui/Header";
import { Menu, MenuItem, MenuSeparator } from "../ui/Menu";
import { playerBg, playerText } from "../ui/players";
import { useToast } from "../ui/Toast";
import { useFlip } from "../ui/useFlip";
import { useWakeLock } from "../ui/useWakeLock";
import Missing from "./Missing";

export default function Match({ matchId }: { matchId: string }) {
  const matches = useStore($matches);
  const players = useStore($players);
  const allRounds = useStore($rounds);
  const undoStack = useStore($undo);
  const toast = useToast();

  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState<number | null>(null);

  const match = matches.find((item) => item.id === matchId);

  // Mientras haya partida abierta, la pantalla no se apaga.
  useWakeLock(match !== undefined && match.finishedAt === null);

  if (!match) return <Missing />;

  const rounds = allRounds
    .filter((round) => round.matchId === match.id)
    .sort((a, b) => a.index - b.index);

  const standings = getStandings(match, allRounds);
  const byId = new Map(players.map((player) => [player.id, player]));
  const seated = match.playerIds
    .map((id) => byId.get(id))
    .filter((player): player is Player => player !== undefined);

  const finished = match.finishedAt !== null;

  return (
    <div className="mx-auto flex w-full max-w-5xl grow flex-col">
      <Header
        sticky
        title={getMatchName(match)}
        subtitle={`${S.match.round(rounds.length + (finished ? 0 : 1))} · ${describeRules(match.rules)}`}
        onBack={() => navigate({ name: "home" })}
        actions={
          <Menu
            trigger={
              <IconButton label={S.match.menu} className="shrink-0">
                <MoreVertical size={20} />
              </IconButton>
            }
          >
            <MenuItem
              icon={<Pencil size={18} />}
              onSelect={() => {
                setName(match.name ?? "");
                setRenaming(true);
              }}
            >
              {S.match.rename}
            </MenuItem>
            {finished ? (
              <MenuItem icon={<Play size={18} />} onSelect={() => reopenMatch(match.id)}>
                {S.match.reopen}
              </MenuItem>
            ) : (
              <MenuItem icon={<Flag size={18} />} onSelect={() => finishMatch(match.id)}>
                {S.match.finish}
              </MenuItem>
            )}
            <MenuSeparator />
            <MenuItem danger icon={<Trash2 size={18} />} onSelect={() => setDeleting(true)}>
              {S.match.delete}
            </MenuItem>
          </Menu>
        }
      />

      {/* En escritorio la libreta se despliega al lado en vez de dejar una
          columna estrecha flotando en el vacío. */}
      <div className="flex grow flex-col gap-8 px-5 pb-32 lg:flex-row lg:items-start lg:gap-6">
        <div className="flex flex-col gap-3 lg:sticky lg:top-20 lg:w-80 lg:shrink-0">
          {finished && (
            <p className="rounded-key border border-line bg-felt-raised px-4 py-2 text-sm text-ink-muted">
              {hasClearLeader(standings)
                ? S.home.winner(byId.get(standings[0]!.playerId)?.name ?? "")
                : S.match.finishedTied}
            </p>
          )}
          <Standings standings={standings} players={byId} />
        </div>

        <Notebook
          rounds={rounds}
          players={seated}
          onEdit={(index) =>
            navigate({ name: "round", matchId: match.id, roundIndex: index })
          }
          onDelete={setRoundToDelete}
        />
      </div>

      <MatchBar
        canUndo={undoStack.length > 0}
        onUndo={() => {
          const what = undo();
          if (what) toast({ message: S.common.undone(what) });
        }}
        onNewRound={() =>
          navigate({ name: "round", matchId: match.id, roundIndex: null })
        }
      />

      <Dialog
        open={renaming}
        onOpenChange={setRenaming}
        title={S.match.renameTitle}
        footer={
          <>
            <Button onClick={() => setRenaming(false)}>{S.common.cancel}</Button>
            <Button
              variant="primary"
              onClick={() => {
                renameMatch(match.id, name);
                setRenaming(false);
              }}
            >
              {S.newMatch.save}
            </Button>
          </>
        }
      >
        <TextInput
          autoFocus
          value={name}
          aria-label={S.match.renameTitle}
          onChange={(event) => setName(event.currentTarget.value)}
        />
      </Dialog>

      <Dialog
        open={deleting}
        onOpenChange={setDeleting}
        title={S.match.deleteTitle}
        description={S.match.deleteBody}
        footer={
          <>
            <Button onClick={() => setDeleting(false)}>{S.common.cancel}</Button>
            <Button
              variant="primary"
              onClick={() => {
                deleteMatch(match.id);
                navigate({ name: "home" });
              }}
            >
              {S.common.delete}
            </Button>
          </>
        }
      />

      <Dialog
        open={roundToDelete !== null}
        onOpenChange={(open) => !open && setRoundToDelete(null)}
        title={roundToDelete === null ? "" : S.match.deleteRound(roundToDelete + 1)}
        description={S.match.deleteRoundBody}
        footer={
          <>
            <Button onClick={() => setRoundToDelete(null)}>{S.common.cancel}</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (roundToDelete !== null) deleteRound(match, roundToDelete);
                setRoundToDelete(null);
              }}
            >
              {S.common.delete}
            </Button>
          </>
        }
      />
    </div>
  );
}

/** Una sola lista, sin podio ni medallas. El líder se marca en la posición. */
function Standings({
  standings,
  players,
}: {
  standings: Standing[];
  players: Map<string, Player>;
}) {
  const register = useFlip(standings.map((standing) => standing.playerId));
  const decided = hasClearLeader(standings);

  return (
    <ul className="flex flex-col overflow-hidden rounded-card border border-line bg-felt-raised">
      {standings.map((standing, position) => {
        const player = players.get(standing.playerId);
        const leader = standing.rank === 1 && decided;

        return (
          <li
            key={standing.playerId}
            ref={register(standing.playerId)}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              position > 0 && "border-t border-line"
            )}
          >
            <span
              className={cn(
                "numeric flex size-8 shrink-0 items-center justify-center rounded-full text-sm",
                leader ? "bg-chalk text-felt" : "text-ink-faint"
              )}
            >
              {standing.rank}
            </span>
            <span
              aria-hidden
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                playerBg(player?.colorIndex ?? 0)
              )}
            />
            <span className="grow truncate">{player?.name}</span>
            {standing.lastDelta !== null && (
              <span className="numeric shrink-0 text-sm text-ink-faint">
                {formatDelta(standing.lastDelta)}
              </span>
            )}
            <span
              className="numeric w-16 shrink-0 text-right text-2xl"
              aria-live="polite"
            >
              {standing.total}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** El elemento firma: una fila por ronda, una columna por jugador. */
function Notebook({
  rounds,
  players,
  onEdit,
  onDelete,
}: {
  rounds: Round[];
  players: Player[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <section className="flex min-w-0 grow flex-col gap-2">
      <h2 className="font-display text-xs uppercase tracking-widest text-ink-faint">
        {S.match.rounds}
      </h2>

      {rounds.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-ink-muted">
          {S.match.noRounds}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-felt-sunken">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left text-xs font-normal text-ink-faint">
                  #
                </th>
                {players.map((player) => (
                  <th
                    key={player.id}
                    className="max-w-24 truncate p-3 text-right text-xs font-medium"
                  >
                    <span className={playerText(player.colorIndex)}>
                      {player.name}
                    </span>
                  </th>
                ))}
                <th className="w-10 p-3">
                  <span className="sr-only">{S.match.menu}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((round) => (
                <tr key={round.id} className="border-t border-line">
                  <td className="numeric p-3 text-sm text-ink-faint">
                    {round.index + 1}
                  </td>
                  {players.map((player) => {
                    const value = round.scores[player.id];
                    return (
                      <td key={player.id} className="numeric p-3 text-right">
                        {value ?? (
                          <span
                            className="text-ink-faint"
                            title={S.match.unscored}
                          >
                            ·
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-1">
                    <Menu
                      trigger={
                        <IconButton
                          label={S.match.editRound(round.index + 1)}
                          className="size-10 min-h-10 min-w-10"
                        >
                          <MoreVertical size={16} />
                        </IconButton>
                      }
                    >
                      <MenuItem
                        icon={<Pencil size={18} />}
                        onSelect={() => onEdit(round.index)}
                      >
                        {S.match.editRound(round.index + 1)}
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem
                        danger
                        icon={<Trash2 size={18} />}
                        onSelect={() => onDelete(round.index)}
                      >
                        {S.common.delete}
                      </MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Deshacer a la izquierda, acción primaria a la derecha. Ambas para el pulgar. */
function MatchBar({
  canUndo,
  onUndo,
  onNewRound,
}: {
  canUndo: boolean;
  onUndo: () => void;
  onNewRound: () => void;
}) {
  return (
    <BottomBar width="max-w-5xl">
      <Button
        variant="ghost"
        icon={<Undo2 size={18} />}
        disabled={!canUndo}
        onClick={onUndo}
        className="shrink-0"
      >
        {S.common.undo}
      </Button>
      <Button
        variant="primary"
        block
        icon={<Plus size={18} />}
        onClick={onNewRound}
      >
        {S.match.newRound}
      </Button>
    </BottomBar>
  );
}
