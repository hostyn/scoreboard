import { useStore } from "@nanostores/react";
import { Pencil, Play, Plus } from "lucide-react";
import { useState } from "react";
import { describeRules } from "../format";
import { navigate } from "../router";
import {
  $matches,
  $players,
  $preselectedTemplate,
  $templates,
  createMatch,
  createPlayer,
  templatesByRecentUse,
} from "../stores/app";
import { S } from "../strings";
import { Button } from "../ui/Button";
import { Chip, ChipGroup } from "../ui/Chip";
import { Dialog } from "../ui/Dialog";
import { TextInput } from "../ui/Field";
import { Header } from "../ui/Header";
import { toRules } from "@/domain/templates";
import { useToast } from "../ui/Toast";

/** Dos elecciones, ninguna de ellas escribir. El nombre se deriva y se edita después. */
export default function NewMatch() {
  const allTemplates = useStore($templates);
  const matches = useStore($matches);
  const players = useStore($players);
  const toast = useToast();

  // Por uso reciente: el juego de anoche es el candidato más probable.
  const templates = templatesByRecentUse(allTemplates, matches);

  const [templateId, setTemplateId] = useState(() => {
    const preselected = $preselectedTemplate.get();
    $preselectedTemplate.set(null);
    return preselected ?? templates[0]?.id ?? "";
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const template = templates.find((item) => item.id === templateId);

  // Por uso reciente: quien jugó anoche está primero.
  const known = players
    .filter((player) => !player.archived)
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);

  const start = () => {
    // Enabled con mensaje al pulsar, no un botón gris muerto.
    if (!template) return toast({ message: S.newMatch.needGame });
    if (selected.length < 2) return toast({ message: S.newMatch.needTwo });

    const match = createMatch(template, selected);
    navigate({ name: "match", matchId: match.id });
  };

  const addPlayer = () => {
    if (name.trim() === "") return;

    const player = createPlayer(name);
    setSelected((current) =>
      current.includes(player.id) ? current : [...current, player.id]
    );
    setName("");
    setAdding(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl grow flex-col">
      <Header title={S.newMatch.title} onBack={() => navigate({ name: "home" })} />

      <div className="flex grow flex-col gap-8 px-5 pb-32">
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xs uppercase tracking-widest text-ink-faint">
            {S.newMatch.game}
          </h2>

          <ChipGroup
            type="single"
            value={templateId}
            onValueChange={(value) => value && setTemplateId(value)}
          >
            {templates.map((item) => (
              <Chip key={item.id} value={item.id}>
                {item.name}
              </Chip>
            ))}
            <button
              type="button"
              onClick={() => navigate({ name: "template", templateId: null })}
              className="tap inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 text-[0.95rem] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <Plus size={16} />
              {S.newMatch.newGame}
            </button>
          </ChipGroup>

          {template && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
              <span>{describeRules(toRules(template))}</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-chalk underline underline-offset-4"
                onClick={() =>
                  navigate({ name: "template", templateId: template.id })
                }
              >
                <Pencil size={14} />
                {S.newMatch.editRules}
              </button>
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xs uppercase tracking-widest text-ink-faint">
              {S.newMatch.players}
            </h2>
            <span className="numeric text-sm text-ink-faint">
              {S.newMatch.selected(selected.length)}
            </span>
          </div>

          {known.length === 0 && (
            <p className="text-sm text-ink-muted">{S.newMatch.emptyPlayers}</p>
          )}

          <ChipGroup type="multiple" value={selected} onValueChange={setSelected}>
            {known.map((player) => (
              <Chip
                key={player.id}
                value={player.id}
                colorIndex={player.colorIndex}
              >
                {player.name}
              </Chip>
            ))}
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="tap inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 text-[0.95rem] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <Plus size={16} />
              {S.newMatch.addPlayer}
            </button>
          </ChipGroup>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-felt/95 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button variant="primary" block icon={<Play size={18} />} onClick={start}>
            {S.newMatch.start}
          </Button>
        </div>
      </div>

      <Dialog
        open={adding}
        onOpenChange={(open) => {
          setAdding(open);
          if (!open) setName("");
        }}
        title={S.newMatch.addPlayer}
        footer={
          <>
            <Button onClick={() => setAdding(false)}>{S.common.cancel}</Button>
            <Button variant="primary" onClick={addPlayer}>
              {S.newMatch.save}
            </Button>
          </>
        }
      >
        <TextInput
          autoFocus
          value={name}
          placeholder={S.newMatch.playerName}
          aria-label={S.newMatch.playerName}
          onChange={(event) => setName(event.currentTarget.value)}
          onKeyDown={(event) => event.key === "Enter" && addPlayer()}
        />
      </Dialog>
    </div>
  );
}
