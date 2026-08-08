import { useState } from "react";
import { MoreVertical, Pencil, Play, Trash2, Undo2 } from "lucide-react";
import { getStandings } from "@/domain/standings";
import type { Match, Round } from "@/domain/types";
import { Button, IconButton } from "./Button";
import { Chip, ChipGroup } from "./Chip";
import { cn } from "./cn";
import { Dialog } from "./Dialog";
import { Field, RadioCards, Switch, TextInput } from "./Field";
import { Menu, MenuItem, MenuSeparator } from "./Menu";
import { playerBg, playerText } from "./players";
import { Toaster, useToast } from "./Toast";

/* Andamio temporal: sirve para validar el sistema visual antes de aplicarlo a
   las pantallas. Se borra cuando el rediseño esté terminado. */

const PLAYERS = [
  { id: "p0", name: "Rubén", colorIndex: 0 },
  { id: "p1", name: "Marta", colorIndex: 1 },
  { id: "p2", name: "Nacho", colorIndex: 2 },
  { id: "p3", name: "Lucía", colorIndex: 3 },
];

const MATCH: Match = {
  id: "demo",
  templateId: "builtin-chinchon",
  rules: {
    name: "Chinchón",
    direction: "lowest",
    endCondition: { type: "points", value: 100 },
    shortcuts: [-10, 5, 10, 25],
    allowNegative: true,
  },
  name: null,
  playerIds: PLAYERS.map((player) => player.id),
  createdAt: Date.now(),
  finishedAt: null,
  overrideEnd: false,
};

const ROUNDS: Round[] = [
  { id: "r0", matchId: "demo", index: 0, scores: { p0: 12, p1: 0, p2: 34, p3: 12 }, createdAt: 0 },
  { id: "r1", matchId: "demo", index: 1, scores: { p0: 5, p1: 21, p2: -10, p3: 5 }, createdAt: 1 },
  { id: "r2", matchId: "demo", index: 2, scores: { p0: 18, p1: 7, p2: 25, p3: null }, createdAt: 2 },
];

const byId = Object.fromEntries(PLAYERS.map((player) => [player.id, player]));

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xs uppercase tracking-widest text-ink-faint">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Vista previa de la clasificación: una sola lista, sin podio ni medallas. */
function StandingsPreview() {
  const standings = getStandings(MATCH, ROUNDS);

  return (
    <ul className="flex flex-col rounded-card border border-line bg-felt-raised">
      {standings.map((standing, index) => {
        const player = byId[standing.playerId]!;
        const leader = standing.rank === 1;

        return (
          <li
            key={standing.playerId}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              index > 0 && "border-t border-line"
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
              className={cn("size-2.5 shrink-0 rounded-full", playerBg(player.colorIndex))}
            />
            <span className="grow truncate">{player.name}</span>
            {standing.lastDelta !== null && (
              <span className="numeric text-sm text-ink-faint">
                {standing.lastDelta > 0 ? "+" : ""}
                {standing.lastDelta}
              </span>
            )}
            <span className="numeric w-14 text-right text-2xl">{standing.total}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** El elemento firma: una columna por jugador, una fila por ronda. */
function NotebookPreview() {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-felt-sunken">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left text-xs font-normal text-ink-faint">#</th>
            {PLAYERS.map((player) => (
              <th key={player.id} className="p-3 text-right text-xs font-medium">
                <span className={playerText(player.colorIndex)}>{player.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROUNDS.map((round) => (
            <tr key={round.id} className="border-t border-line">
              <td className="numeric p-3 text-sm text-ink-faint">{round.index + 1}</td>
              {PLAYERS.map((player) => {
                const value = round.scores[player.id];
                return (
                  <td key={player.id} className="numeric p-3 text-right">
                    {value ?? <span className="text-ink-faint">·</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Interactive() {
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [game, setGame] = useState("chinchon");
  const [selected, setSelected] = useState<string[]>(["p0", "p1"]);
  const [direction, setDirection] = useState("lowest");
  const [negatives, setNegatives] = useState(true);

  return (
    <>
      <Section title="Botones">
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" icon={<Play size={18} />}>
            Empezar partida
          </Button>
          <Button variant="secondary">Editar reglas</Button>
          <Button variant="ghost" icon={<Undo2 size={18} />}>
            Deshacer
          </Button>
          <Button variant="danger">Borrar partida</Button>
          <Button variant="primary" disabled>
            Deshabilitado
          </Button>
        </div>
      </Section>

      <Section title="Chips — juego (una opción)">
        <ChipGroup
          type="single"
          value={game}
          onValueChange={(value) => value && setGame(value)}
        >
          <Chip value="chinchon">Chinchón</Chip>
          <Chip value="rummy">Rummy</Chip>
          <Chip value="libre">Puntos libres</Chip>
        </ChipGroup>
      </Section>

      <Section title="Chips — jugadores (varias)">
        <ChipGroup type="multiple" value={selected} onValueChange={setSelected}>
          {PLAYERS.map((player) => (
            <Chip key={player.id} value={player.id} colorIndex={player.colorIndex}>
              {player.name}
            </Chip>
          ))}
        </ChipGroup>
        <p className="text-sm text-ink-muted">
          {selected.length} seleccionados
        </p>
      </Section>

      <Section title="Formulario">
        <Field label="Nombre del juego">
          <TextInput placeholder="Chinchón" defaultValue="Chinchón" />
        </Field>
        <RadioCards
          ariaLabel="Dirección de victoria"
          value={direction}
          onValueChange={setDirection}
          options={[
            { value: "lowest", label: "Gana quien menos suma", hint: "Chinchón, golf" },
            { value: "highest", label: "Gana quien más suma", hint: "Rummy, canasta" },
          ]}
        />
        <Switch checked={negatives} onCheckedChange={setNegatives} label="Admite negativos" />
      </Section>

      <Section title="Superpuestos">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setDialogOpen(true)}>Abrir diálogo</Button>
          <Button
            onClick={() =>
              toast({
                message: "Ronda 3 guardada · 1 jugador sin puntuar",
                action: { label: "Deshacer", onAction: () => {} },
              })
            }
          >
            Lanzar aviso
          </Button>
          <Menu
            trigger={
              <IconButton label="Menú de la partida" variant="secondary">
                <MoreVertical size={20} />
              </IconButton>
            }
          >
            <MenuItem icon={<Pencil size={18} />} onSelect={() => {}}>
              Renombrar
            </MenuItem>
            <MenuSeparator />
            <MenuItem danger icon={<Trash2 size={18} />} onSelect={() => {}}>
              Borrar partida
            </MenuItem>
          </Menu>
        </div>
      </Section>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Borrar la ronda 2"
        description="Los totales se recalculan y las rondas siguientes se renumeran."
        footer={
          <>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setDialogOpen(false)}>
              Borrar
            </Button>
          </>
        }
      />
    </>
  );
}

export default function Showcase() {
  return (
    <Toaster>
      <main className="mx-auto flex max-w-2xl flex-col gap-10 p-5 pb-24">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-3xl">Sistema visual</h1>
          <p className="text-sm text-ink-muted">
            Andamio temporal para validar tokens y componentes.
          </p>
        </header>

        <Section title="Superficies">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["felt", "bg-felt"],
              ["felt-sunken", "bg-felt-sunken"],
              ["felt-raised", "bg-felt-raised"],
              ["felt-overlay", "bg-felt-overlay"],
            ].map(([name, klass]) => (
              <div
                key={name}
                className={cn("rounded-key border border-line p-4 text-xs", klass)}
              >
                {name}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tinta">
          <div className="flex flex-col gap-1 rounded-card border border-line bg-felt-raised p-4">
            <p className="text-ink">ink · texto principal, blanco cálido</p>
            <p className="text-ink-muted">ink-muted · secundario</p>
            <p className="text-ink-faint">ink-faint · terciario</p>
            <p className="text-danger">danger · destructivo</p>
          </div>
        </Section>

        <Section title="Color de jugador">
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex items-center gap-2 rounded-full border border-line px-3 py-2">
                <span className={cn("size-3 rounded-full", playerBg(index))} />
                <span className="numeric text-sm">player-{index}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tipografía">
          <div className="flex flex-col gap-3 rounded-card border border-line bg-felt-raised p-4">
            <p className="font-display text-2xl">Space Grotesk · titulares</p>
            <p className="numeric text-4xl">1234567890</p>
            <p className="numeric text-4xl">1111111111</p>
            <p className="text-xs text-ink-faint">
              Las dos filas de cifras deben medir exactamente lo mismo.
            </p>
            <p className="font-ui">Inter · texto de interfaz, párrafos y etiquetas.</p>
          </div>
        </Section>

        <Section title="Clasificación">
          <StandingsPreview />
          <p className="text-xs text-ink-faint">
            Una sola lista con getStandings(). Sin podio, sin medallas. El líder
            se marca en la posición.
          </p>
        </Section>

        <Section title="Libreta de rondas">
          <NotebookPreview />
          <p className="text-xs text-ink-faint">
            Elemento firma. El punto es un hueco sin puntuar, distinto de un 0.
          </p>
        </Section>

        <Interactive />
      </main>
    </Toaster>
  );
}
