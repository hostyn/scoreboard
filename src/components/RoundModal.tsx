import {
  $editingRound,
  $newRound,
  $roundModalOpen,
  addPointsToPlayer,
  closeRoundModal,
  openRoundModal,
  saveRound,
  updatePlayerPoints,
} from "@/stores/newRound";
import { $scoreboard } from "@/stores/scoreboard";
import { MdDialog, MdFab, MdTextButton } from "@/wrappers/materialWeb";
import { useStore } from "@nanostores/react";
import { useEffect, useRef } from "react";
import { AddIcon } from "./icons";
import type { MdDialog as MdDialogType } from "@material/web/dialog/dialog";

const QUICK_POINTS = [1, 2, 5, 10];

export default function RoundModal() {
  const newRound = useStore($newRound);
  const editingRound = useStore($editingRound);
  const open = useStore($roundModalOpen);
  const scoreboard = useStore($scoreboard);

  const dialogRef = useRef<MdDialogType>(null);

  // El estado de apertura vive en el store porque el historial también abre
  // este mismo modal, en modo edición.
  useEffect(() => {
    if (open) dialogRef.current?.show();
    else dialogRef.current?.close();
  }, [open]);

  useEffect(() => {
    const onClosed = () => closeRoundModal();

    dialogRef.current?.addEventListener("closed", onClosed);
    return () => {
      dialogRef.current?.removeEventListener("closed", onClosed);
    };
  }, [dialogRef]);

  const handleSave = () => {
    saveRound();
    closeRoundModal();
  };

  const hasPlayers = (scoreboard?.players.length ?? 0) > 0;

  return (
    <>
      {/* Sin jugadores no hay ronda que registrar. */}
      {hasPlayers && (
        <MdFab
          variant="primary"
          size="large"
          className="fixed bottom-4 right-4"
          aria-label="Add round"
          onClick={() => openRoundModal()}
        >
          <AddIcon slot="icon" />
        </MdFab>
      )}

      <MdDialog ref={dialogRef}>
        <div slot="headline">
          <h1 className="md-typescale-headline-small">
            {editingRound === null
              ? "New round"
              : `Edit round ${editingRound + 1}`}
          </h1>
        </div>

        <div slot="content" className="flex flex-col gap-4">
          {newRound.map((playerRound, index) => (
            <div key={playerRound.index}>
              <div className="flex items-center py-2">
                <span className="w-full md-typescale-body-large">
                  {playerRound.name}
                </span>
                <div className="flex gap-2 flex-col-reverse items-center md:flex-row">
                  <div className="flex gap-2">
                    {[...QUICK_POINTS].reverse().map((points) => (
                      <button
                        key={points}
                        type="button"
                        aria-label={`Subtract ${points} from ${playerRound.name}`}
                        onClick={() =>
                          addPointsToPlayer(playerRound.index, -points)
                        }
                        className="bg-red-800 hover:bg-red-700 transition-colors rounded-sm min-w-8 aspect-square text-center text-sm"
                      >
                        -{points}
                      </button>
                    ))}
                  </div>

                  <input
                    className="w-12 bg-transparent text-center font-bold"
                    value={playerRound.points ?? ""}
                    type="number"
                    placeholder="0"
                    aria-label={`Points for ${playerRound.name}`}
                    onChange={(e) => {
                      updatePlayerPoints(
                        playerRound.index,
                        Number.isNaN(e.currentTarget.valueAsNumber)
                          ? undefined
                          : e.currentTarget.valueAsNumber
                      );
                    }}
                  />

                  <div className="flex gap-2">
                    {QUICK_POINTS.map((points) => (
                      <button
                        key={points}
                        type="button"
                        aria-label={`Add ${points} to ${playerRound.name}`}
                        onClick={() =>
                          addPointsToPlayer(playerRound.index, points)
                        }
                        className="bg-green-800 hover:bg-green-700 transition-colors rounded-sm min-w-8 aspect-square text-center text-sm"
                      >
                        +{points}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {index < newRound.length - 1 && (
                <hr className="border-outlineVariant" />
              )}
            </div>
          ))}
        </div>

        <div slot="actions">
          <MdTextButton onClick={closeRoundModal}>Cancel</MdTextButton>
          <MdTextButton onClick={handleSave}>
            {editingRound === null ? "Add round" : "Save changes"}
          </MdTextButton>
        </div>
      </MdDialog>
    </>
  );
}
