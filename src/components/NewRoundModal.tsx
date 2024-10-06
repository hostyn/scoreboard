import {
  $newRound,
  addPointsToPlayer,
  addRound,
  reset,
  updatePlayerPoints,
} from "@/stores/newRound";
import { MdDialog, MdFab, MdTextButton } from "@/wrappers/materialWeb";
import { useStore } from "@nanostores/react";
import { useEffect, useRef } from "react";
import { AddIcon } from "./icons";
import type { MdDialog as MdDialogType } from "@material/web/dialog/dialog";

export default function NewRoundModal() {
  const newRound = useStore($newRound);

  const dialogRef = useRef<MdDialogType>(null);

  const handleCreateGame = () => {
    addRound();
    dialogRef.current?.close();
  };

  useEffect(() => {
    const resetForm = () => {
      reset();
    };

    dialogRef.current?.addEventListener("close", resetForm);

    return () => {
      dialogRef.current?.removeEventListener("close", resetForm);
    };
  }, [dialogRef]);

  return (
    <>
      <MdFab
        variant="primary"
        size="large"
        className="fixed bottom-4 right-4"
        onClick={() => dialogRef.current?.show()}
      >
        <AddIcon slot="icon" />
      </MdFab>

      <MdDialog ref={dialogRef}>
        <div slot="headline">
          <h1 className="md-typescale-headline-small">Create new game</h1>
        </div>

        <div slot="content" id="new-game" className="flex flex-col gap-4">
          {newRound.map((playerRound, index) => [
            <div key={playerRound.index} className="flex items-center py-2">
              <span className="w-full text-gray-300">{playerRound.name}</span>
              <div className="flex gap-2 flex-col-reverse items-center md:flex-row">
                <div className="flex gap-2">
                  {[10, 5, 2, 1].map((points) => (
                    <button
                      type="button"
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
                  key={playerRound.index}
                  className="w-12 bg-transparent text-center font-bold"
                  value={playerRound.points ?? ""}
                  type="number"
                  placeholder="0"
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
                  {[1, 2, 5, 10].map((points) => (
                    <button
                      type="button"
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
            </div>,
            index < newRound.length - 1 && (
              <hr key={`hr-${playerRound.index}`} />
            ),
          ])}
        </div>

        <div slot="actions">
          <form slot="actions" method="dialog">
            <MdTextButton>Cancel</MdTextButton>
          </form>
          <MdTextButton onClick={handleCreateGame}>Add new round</MdTextButton>
        </div>
      </MdDialog>
    </>
  );
}
