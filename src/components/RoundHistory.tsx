import { openRoundModal } from "@/stores/newRound";
import { $scoreboard, removeRound } from "@/stores/scoreboard";
import { MdIconButton } from "@/wrappers/materialWeb";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { DeleteIcon, EditIcon } from "./icons";

export default function RoundHistory() {
  const scoreboard = useStore($scoreboard);
  const [roundToDelete, setRoundToDelete] = useState<number | null>(null);

  if (!scoreboard || scoreboard.rounds.length === 0) return null;

  const players = [...scoreboard.players].sort((a, b) => a.index - b.index);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="md-typescale-title-medium">Rounds</h2>

      {/* Con muchos jugadores la tabla no cabe en móvil, así que scrollea sola. */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="md-typescale-label-medium text-onSurfaceVariant">
              <th className="text-left p-2 font-normal">#</th>
              {players.map((player) => (
                <th
                  key={player.index}
                  className="p-2 font-normal text-right max-w-24 truncate"
                >
                  {player.name}
                </th>
              ))}
              <th className="p-2" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {scoreboard.rounds.map((round, roundIndex) => (
              <tr
                key={roundIndex}
                className="border-t border-outlineVariant md-typescale-body-medium"
              >
                <td className="p-2 text-onSurfaceVariant">{roundIndex + 1}</td>
                {players.map((player) => (
                  <td key={player.index} className="p-2 text-right tabular-nums">
                    {round[player.index] ?? 0}
                  </td>
                ))}
                <td className="p-2">
                  <div className="flex justify-end">
                    <MdIconButton
                      aria-label={`Edit round ${roundIndex + 1}`}
                      onClick={() => openRoundModal(roundIndex)}
                    >
                      <EditIcon className="fill-onSurfaceVariant" />
                    </MdIconButton>
                    <MdIconButton
                      aria-label={`Delete round ${roundIndex + 1}`}
                      onClick={() => setRoundToDelete(roundIndex)}
                    >
                      <DeleteIcon className="fill-onSurfaceVariant" />
                    </MdIconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={roundToDelete !== null}
        headline="Delete round"
        body={
          roundToDelete === null
            ? ""
            : `Round ${
                roundToDelete + 1
              } will be removed and every total recalculated.`
        }
        onConfirm={() => {
          if (roundToDelete !== null) removeRound(roundToDelete);
          setRoundToDelete(null);
        }}
        onCancel={() => setRoundToDelete(null)}
      />
    </section>
  );
}
