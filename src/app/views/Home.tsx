import { useStore } from "@nanostores/react";
import { Plus, RotateCcw } from "lucide-react";
import { getMatchName } from "@/domain/match";
import { getStandings, hasClearLeader } from "@/domain/standings";
import type { Match, Player, Round } from "@/domain/types";
import { formatDayGroup } from "../format";
import { navigate } from "../router";
import {
  $matches,
  $players,
  $ready,
  $rounds,
  repeatMatch,
} from "../stores/app";
import { S } from "../strings";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";
import { playerBg } from "../ui/players";

export default function Home() {
  const ready = useStore($ready);
  const matches = useStore($matches);
  const players = useStore($players);
  const rounds = useStore($rounds);

  const byId = new Map(players.map((player) => [player.id, player]));

  const ongoing = matches
    .filter((match) => match.finishedAt === null)
    .sort((a, b) => b.createdAt - a.createdAt);

  const finished = matches
    .filter((match) => match.finishedAt !== null)
    .sort((a, b) => b.finishedAt! - a.finishedAt!);

  return (
    <div className="mx-auto flex w-full max-w-2xl grow flex-col">
      <header className="px-5 pb-2 pt-6">
        <h1 className="font-display text-2xl">{S.home.title}</h1>
      </header>

      <div className="flex grow flex-col gap-8 px-5 pb-32">
        {!ready ? (
          <Skeleton />
        ) : matches.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {ongoing.length > 0 && (
              <Section title={S.home.ongoing}>
                {ongoing.map((match) => (
                  <OngoingCard
                    key={match.id}
                    match={match}
                    rounds={rounds}
                    players={byId}
                  />
                ))}
              </Section>
            )}

            {finished.length > 0 && (
              <FinishedList
                matches={finished}
                rounds={rounds}
                players={byId}
              />
            )}
          </>
        )}
      </div>

      <BottomBar />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-xs uppercase tracking-widest text-ink-faint">
        {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

/** Mientras se lee IndexedDB, para no enseñar el estado vacío por un instante. */
const Skeleton = () => (
  <div className="flex flex-col gap-2" aria-busy aria-label={S.common.loading}>
    {[0, 1].map((row) => (
      <div
        key={row}
        className="h-20 animate-pulse rounded-card border border-line bg-felt-raised"
      />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex grow flex-col justify-center gap-3 py-12">
    <h2 className="font-display text-3xl leading-tight">
      {S.home.empty.title}
    </h2>
    <p className="max-w-sm text-ink-muted">{S.home.empty.body}</p>
  </div>
);

/** Quién va ganando, o el empate cuando aún no hay líder claro. */
function leaderLine(
  match: Match,
  rounds: Round[],
  players: Map<string, Player>
): { text: string; colorIndex: number | null } {
  const standings = getStandings(match, rounds);
  const played = rounds.filter((round) => round.matchId === match.id).length;

  if (played === 0) return { text: S.home.noRounds, colorIndex: null };

  const top = standings[0]!;

  if (!hasClearLeader(standings)) {
    return { text: S.home.tied(top.total), colorIndex: null };
  }

  const player = players.get(top.playerId);
  return {
    text: match.finishedAt === null
      ? S.home.leading(player?.name ?? "")
      : S.home.winner(player?.name ?? ""),
    colorIndex: player?.colorIndex ?? null,
  };
}

const cardClass =
  "flex w-full items-center gap-4 rounded-card border border-line bg-felt-raised p-4 text-left transition-colors hover:border-line-strong";

function OngoingCard({
  match,
  rounds,
  players,
}: {
  match: Match;
  rounds: Round[];
  players: Map<string, Player>;
}) {
  const played = rounds.filter((round) => round.matchId === match.id).length;
  const leader = leaderLine(match, rounds, players);

  return (
    <button
      className={cardClass}
      onClick={() => navigate({ name: "match", matchId: match.id })}
    >
      <div className="flex min-w-0 grow flex-col gap-1">
        <span className="truncate font-display text-lg">
          {getMatchName(match)}
        </span>
        <span className="flex items-center gap-2 text-sm text-ink-muted">
          {leader.colorIndex !== null && (
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-full", playerBg(leader.colorIndex))}
            />
          )}
          <span className="truncate">{leader.text}</span>
        </span>
      </div>
      <span className="numeric shrink-0 text-sm text-ink-faint">
        {S.home.round(played + 1)}
      </span>
    </button>
  );
}

function FinishedList({
  matches,
  rounds,
  players,
}: {
  matches: Match[];
  rounds: Round[];
  players: Map<string, Player>;
}) {
  // Agrupadas por día, conservando el orden de llegada.
  const groups: Array<{ label: string; matches: Match[] }> = [];

  for (const match of matches) {
    const label = formatDayGroup(match.finishedAt!);
    const last = groups.at(-1);

    if (last?.label === label) last.matches.push(match);
    else groups.push({ label, matches: [match] });
  }

  return (
    <Section title={S.home.finished}>
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-2">
          <h3 className="pt-2 text-xs text-ink-faint">{group.label}</h3>
          {group.matches.map((match) => (
            <FinishedCard
              key={match.id}
              match={match}
              rounds={rounds}
              players={players}
            />
          ))}
        </div>
      ))}
    </Section>
  );
}

function FinishedCard({
  match,
  rounds,
  players,
}: {
  match: Match;
  rounds: Round[];
  players: Map<string, Player>;
}) {
  const winner = leaderLine(match, rounds, players);

  return (
    <div className={cn(cardClass, "hover:border-line")}>
      <button
        className="flex min-w-0 grow flex-col gap-1 text-left"
        onClick={() => navigate({ name: "match", matchId: match.id })}
      >
        <span className="truncate font-display text-lg">
          {getMatchName(match)}
        </span>
        <span className="flex items-center gap-2 text-sm text-ink-muted">
          {winner.colorIndex !== null && (
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-full", playerBg(winner.colorIndex))}
            />
          )}
          <span className="truncate">{winner.text}</span>
        </span>
      </button>

      {/* El camino del 80% de las noches: un toque y a jugar. */}
      <Button
        variant="secondary"
        icon={<RotateCcw size={16} />}
        className="shrink-0 px-3"
        onClick={() => {
          const next = repeatMatch(match);
          navigate({ name: "match", matchId: next.id });
        }}
      >
        {S.home.repeat}
      </Button>
    </div>
  );
}

/** Acción primaria al alcance del pulgar, sobre la zona segura del sistema. */
const BottomBar = () => (
  <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-felt/95 backdrop-blur">
    <div className="mx-auto w-full max-w-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <Button
        variant="primary"
        block
        icon={<Plus size={18} />}
        onClick={() => navigate({ name: "new-match" })}
      >
        {S.home.newMatch}
      </Button>
    </div>
  </div>
);
