import {
  $newRound,
  addPointsToPlayer,
  addRound,
  reset,
  updatePlayerPoints,
} from "@/stores/newRound";
import { $scoreboard } from "@/stores/scoreboard";
import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";

export default function NewRoundModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const scoreboard = useStore($scoreboard);
  const newRound = useStore($newRound);

  return (
    <>
      <button
        className="bg-primary-300 rounded-sm px-2 py-1 w-fit"
        onClick={() => {
          reset();
          setModalOpen(true);
        }}
      >
        New round
      </button>
      <dialog
        open={modalOpen}
        className="absolute top-0 bottom-0 left-0 right-0 p-8 bg-primary-950 text-white z-10 rounded-md w-[700px] max-w-[100vw] max-h-[100vh] overflow-scroll"
      >
        <form
          className="m-auto flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            setModalOpen(false);
            addRound();
          }}
        >
          <h2 className="text-xl font-semibold mb-4">
            Round {scoreboard.rounds.length}
          </h2>
          {newRound.map((playerRound) => (
            <div
              key={playerRound.index}
              className="flex items-center border-b border-primary-500/20 py-2"
            >
              <span className="w-full text-gray-300">{playerRound.name}</span>
              <div className="flex gap-2 flex-col items-center md:flex-row">
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
                  className="w-12 bg-transparent text-center font-bold"
                  value={playerRound.points}
                  type="number"
                  placeholder="0"
                  onChange={(e) => {
                    updatePlayerPoints(
                      playerRound.index,
                      e.currentTarget.valueAsNumber
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
            </div>
          ))}
          <div className="flex w-full justify-between mt-4">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
              }}
              className="text-red-400 font-bold hover:bg-red-900 hover:text-red-100 px-3 py-1 rounded-sm transition-colors"
            >
              Cancel
            </button>
            <button className="bg-green-600 hover:bg-green-500 transition-colors rounded-sm px-3 py-1">
              Add round
            </button>
          </div>
        </form>
      </dialog>
      <div
        className={`absolute w-screen h-screen top-0 bottom-0 left-0 right-0 backdrop-blur-sm bg-primary-400/15 ${
          modalOpen ? "" : "hidden"
        }`}
        onClick={() => setModalOpen(false)}
      />
    </>
  );
}
