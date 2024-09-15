import { reset } from "@/stores/scoreboard";
import { useState } from "preact/hooks";

export default function ResetScoreboardButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        className="bg-red-700 rounded-sm px-2 py-1 w-fit"
        onClick={() => setModalOpen(true)}
      >
        Reset
      </button>
      <dialog
        open={modalOpen}
        className="absolute top-0 bottom-0 left-0 right-0 p-8 bg-primary-950 text-white z-10 rounded-md w-96 max-w-[100vw] max-h-[100vh] overflow-auto"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Reset scoreboard?</h2>
          <p className="text-gray-300">
            This action will remove all players and rounds.
          </p>
          <div className="flex justify-between">
            <button onClick={() => setModalOpen(false)}>Cancel</button>
            <button
              className="bg-red-700 rounded-sm px-2 py-1"
              onClick={() => {
                reset();
                setModalOpen(false);
              }}
            >
              Reset
            </button>
          </div>
        </div>
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
