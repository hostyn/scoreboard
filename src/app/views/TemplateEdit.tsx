import { useStore } from "@nanostores/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { EndCondition, GameTemplate } from "@/domain/types";
import { goBack, navigate } from "../router";
import {
  $preselectedTemplate,
  $templates,
  deleteTemplate,
  findTemplate,
  newId,
  saveTemplate,
} from "../stores/app";
import { S } from "../strings";
import { Button } from "../ui/Button";
import { Field, RadioCards, Switch, TextInput } from "../ui/Field";
import { Header } from "../ui/Header";
import { useToast } from "../ui/Toast";

const BLANK: GameTemplate = {
  id: "",
  name: "",
  direction: "highest",
  endCondition: { type: "manual" },
  shortcuts: [1, 2, 5, 10],
  allowNegative: true,
  builtin: false,
};

type EndType = EndCondition["type"];

export default function TemplateEdit({ templateId }: { templateId: string | null }) {
  useStore($templates);
  const toast = useToast();

  const source = templateId === null ? BLANK : findTemplate(templateId) ?? BLANK;

  const [draft, setDraft] = useState<GameTemplate>(source);
  const [limit, setLimit] = useState(
    source.endCondition.type === "manual" ? "" : String(source.endCondition.value)
  );

  const patch = (next: Partial<GameTemplate>) =>
    setDraft((current) => ({ ...current, ...next }));

  const setEndType = (type: EndType) => {
    if (type === "manual") return patch({ endCondition: { type: "manual" } });

    const value = Number(limit) || (type === "points" ? 100 : 9);
    setLimit(String(value));
    patch({ endCondition: { type, value } });
  };

  const setShortcut = (position: number, raw: string) => {
    const next = [...draft.shortcuts];
    next[position] = Number(raw) || 0;
    patch({ shortcuts: next });
  };

  const submit = () => {
    if (draft.name.trim() === "") return toast({ message: S.template.nameRequired });

    const end = draft.endCondition;
    const resolved: EndCondition =
      end.type === "manual" ? end : { type: end.type, value: Number(limit) || 1 };

    // Editar una plantilla de fábrica crea una copia tuya en vez de pisarla.
    const saved = saveTemplate({
      ...draft,
      name: draft.name.trim(),
      endCondition: resolved,
      id: draft.builtin || draft.id === "" ? newId() : draft.id,
      builtin: false,
    });

    // Volver y encontrarse seleccionado el juego que acabas de crear.
    $preselectedTemplate.set(saved.id);
    navigate({ name: "new-match" }, { replace: true });
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl grow flex-col">
      <Header
        title={templateId === null ? S.template.newTitle : S.template.editTitle}
        onBack={goBack}
      />

      <div className="flex grow flex-col gap-6 px-5 pb-32">
        {draft.builtin && (
          <p className="rounded-key border border-line bg-felt-raised p-3 text-sm text-ink-muted">
            {S.template.builtin}
          </p>
        )}

        <Field label={S.template.name}>
          <TextInput
            value={draft.name}
            placeholder={S.template.namePlaceholder}
            onChange={(event) => patch({ name: event.currentTarget.value })}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="font-ui text-sm text-ink-muted">
            {S.template.direction}
          </span>
          <RadioCards
            ariaLabel={S.template.direction}
            value={draft.direction}
            onValueChange={(direction) => patch({ direction })}
            options={[
              { value: "lowest", label: S.template.lowest, hint: S.template.lowestHint },
              { value: "highest", label: S.template.highest, hint: S.template.highestHint },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-ui text-sm text-ink-muted">{S.template.end}</span>
          <RadioCards
            ariaLabel={S.template.end}
            value={draft.endCondition.type}
            onValueChange={setEndType}
            options={[
              { value: "points", label: S.template.endPoints },
              { value: "rounds", label: S.template.endRounds },
              { value: "manual", label: S.template.endManual },
            ]}
          />

          {draft.endCondition.type !== "manual" && (
            <Field label={S.template.limit}>
              <TextInput
                type="number"
                inputMode="numeric"
                value={limit}
                onChange={(event) => setLimit(event.currentTarget.value)}
              />
            </Field>
          )}
        </div>

        <Field label={S.template.shortcuts} hint={S.template.shortcutsHint}>
          <div className="grid grid-cols-4 gap-2">
            {draft.shortcuts.map((value, position) => (
              <TextInput
                key={position}
                type="number"
                inputMode="numeric"
                className="numeric text-center"
                aria-label={`${S.template.shortcuts} ${position + 1}`}
                value={String(value)}
                onChange={(event) => setShortcut(position, event.currentTarget.value)}
              />
            ))}
          </div>
        </Field>

        <Switch
          checked={draft.allowNegative}
          onCheckedChange={(allowNegative) => patch({ allowNegative })}
          label={S.template.allowNegative}
        />

        {!draft.builtin && draft.id !== "" && (
          <Button
            variant="danger"
            className="self-start"
            icon={<Trash2 size={18} />}
            onClick={() => {
              deleteTemplate(draft.id);
              navigate({ name: "new-match" }, { replace: true });
            }}
          >
            {S.template.delete}
          </Button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-felt/95 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button variant="primary" block onClick={submit}>
            {S.template.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
