import { addPlayer } from "@/stores/scoreboard";
import { useState } from "preact/hooks";

export default function AddNewPlayer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [player, setPlayer] = useState("");

  return (
    <>
      <button onClick={() => setModalOpen(true)}>Add player</button>
      <dialog
        open={modalOpen}
        className="absolute bg-black/5 top-0 bottom-0 left-0 right-0 z-10"
      >
        <form
          className="p-4 bg-sky-950 rounded-md flex gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            addPlayer(player);
            setModalOpen(false);
            setPlayer("");
          }}
        >
          <input
            type="text"
            placeholder="Player name"
            className="bg-transparent border-b border-white text-white"
            onChange={(e) => setPlayer(e.currentTarget.value)}
            value={player}
          />
          <button className="text-white">Add</button>
        </form>
      </dialog>
      <div
        className={`absolute top-0 left-0 right-0 bottom-0 bg-black/5 backdrop-blur-sm ${
          modalOpen ? "" : "hidden"
        }`}
        onClick={() => setModalOpen(false)}
      />
    </>
  );
}
