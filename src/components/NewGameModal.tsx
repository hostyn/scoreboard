import { addGame } from "@/stores/games";
import { useRef, useState } from "react";
import "@material/web/fab/fab";
import { MdFab } from "@/wrappers/materialWeb";
import { AddIcon } from "./icons";

export default function NewGameModal() {
  const [modalOpened, setModalOpened] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [addingPlayer, setAddingPlayer] = useState(false);

  const formElement = useRef<HTMLFormElement>(null);
  const newPlayerInput = useRef<HTMLInputElement>(null);

  const handleCreateGame = () => {
    const formData = new FormData(formElement.current as HTMLFormElement);
    const gameData = Object.fromEntries(formData);

    addGame({
      name: gameData.name as string,
      morePointsWins: gameData.mode === "1",
      players,
    });

    window.location.href = "/game";
  };

  return (
    <>
      <MdFab
        variant="primary"
        size="large"
        className="fixed bottom-4 right-4"
        onClick={() => setModalOpened(true)}
      >
        <AddIcon />
      </MdFab>
      <dialog
        open={modalOpened}
        className="absolute top-0 bottom-0 left-0 right-0 p-8 bg-primary-950 text-white z-10 rounded-md w-[700px] max-w-[100vw] max-h-[100vh] overflow-auto"
      >
        <div className="flex flex-col gap-2">
          <h1>New Game</h1>
          <form
            ref={formElement}
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              console.log(Object.fromEntries(new FormData(e.currentTarget)));
            }}
          >
            <label className="flex flex-col">
              Name
              <input
                type="text"
                className="bg-transparent"
                placeholder="Chinchon"
                name="name"
              />
            </label>
            <fieldset className="flex gap-2">
              <legend className="flex items-center">Mode</legend>
              <label className="has-[:checked]:bg-primary-800 px-2 py-1 cursor-pointer rounded-md bg-primary-900">
                Less points wins
                <input type="radio" value={0} name="mode" className="hidden" />
              </label>
              <label className="has-[:checked]:bg-primary-800 px-2 py-1 cursor-pointer rounded-md bg-primary-900">
                More points wins
                <input type="radio" value={1} name="mode" className="hidden" />
              </label>
            </fieldset>
          </form>

          <label>Players</label>
          <div>
            {players.map((player) => (
              <p
                key={player}
                className="bg-primary-800"
                onClick={() => {
                  setPlayers(
                    players.filter((actualPlayer) => player !== actualPlayer)
                  );
                }}
              >
                {player}
              </p>
            ))}
            {addingPlayer ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const playerName = new FormData(e.currentTarget).get(
                    "player"
                  ) as string;

                  const playerExists = players.includes(playerName);
                  if (playerExists) return;

                  setPlayers([...players, playerName]);
                  e.currentTarget.reset();
                }}
              >
                <input
                  className="bg-transparent"
                  name="player"
                  ref={newPlayerInput}
                  onBlur={(e) => {
                    const playerName = e.currentTarget.value;
                    if (!playerName) {
                      setAddingPlayer(false);
                      return;
                    }

                    const playerExists = players.includes(playerName);

                    if (playerExists) {
                      setAddingPlayer(false);
                      return;
                    }

                    setPlayers([...players, playerName]);
                    setAddingPlayer(false);
                  }}
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAddingPlayer(true);
                  setTimeout(() => {
                    newPlayerInput.current?.focus();
                  }, 0);
                }}
              >
                Add player
              </button>
            )}
          </div>
          <button onClick={handleCreateGame}>Create game</button>
        </div>
      </dialog>
      <div
        className={`absolute w-screen h-screen top-0 bottom-0 left-0 right-0 backdrop-blur-sm bg-primary-400/15 ${
          modalOpened ? "" : "hidden"
        }`}
        onClick={() => setModalOpened(false)}
      />
    </>
  );
}
