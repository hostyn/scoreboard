import { addGame } from "@/stores/games";
import { useEffect, useRef, useState } from "react";
import "@material/web/fab/fab";
import {
  MdDialog,
  MdFab,
  MdFilledButton,
  MdFilledTextField,
  MdFilledTonalButton,
  MdIconButton,
  MdTextButton,
} from "@/wrappers/materialWeb";
import { AddIcon, CheckIcon, DeleteIcon, PersonIcon } from "./icons";
import type { MdDialog as MdDialogType } from "@material/web/dialog/dialog";
import type { MdFilledTextField as MdFilledTextFieldType } from "@material/web/textfield/filled-text-field";

export default function NewGameModal() {
  const [players, setPlayers] = useState<string[]>([]);
  const [morePointsWins, setMorePointsWins] = useState(true);

  const dialogRef = useRef<MdDialogType>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<MdFilledTextFieldType>(null);
  const newPlayerInputRef = useRef<MdFilledTextFieldType>(null);

  const handleCreateGame = () => {
    addGame({
      name: nameInputRef.current?.value || "",
      morePointsWins,
      players,
    });

    window.location.href = "/game";
  };

  const addPlayer = (player: string) => {
    if (player.trim() === "") {
      return;
    }

    setPlayers([...players, player]);
  };

  useEffect(() => {
    const resetForm = () => {
      nameInputRef.current?.reset();
      formRef.current?.reset();
      setMorePointsWins(true);
      setPlayers([]);
    };

    dialogRef.current?.addEventListener("close", resetForm);

    return () => {
      dialogRef.current?.removeEventListener("close", resetForm);
    };
  }, [dialogRef, formRef]);

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
          <MdFilledTextField label="Game name" name="name" ref={nameInputRef} />

          <div className="flex flex-wrap gap-2">
            {!morePointsWins ? (
              <MdFilledButton onClick={() => setMorePointsWins(false)}>
                Less points wins
                <CheckIcon slot="icon" />
              </MdFilledButton>
            ) : (
              <MdFilledTonalButton onClick={() => setMorePointsWins(false)}>
                Less points wins
              </MdFilledTonalButton>
            )}
            {morePointsWins ? (
              <MdFilledButton onClick={() => setMorePointsWins(true)}>
                More points wins
                <CheckIcon slot="icon" />
              </MdFilledButton>
            ) : (
              <MdFilledTonalButton onClick={() => setMorePointsWins(true)}>
                More points wins
              </MdFilledTonalButton>
            )}
          </div>

          <h2 className="md-typescale-title-medium">Players</h2>

          {players.length > 0 && (
            <div>
              {players.map((player) => (
                <PlayerItem
                  key={player}
                  player={player}
                  onClick={() => {
                    setPlayers(players.filter((p) => p !== player));
                  }}
                />
              ))}
            </div>
          )}

          <form
            id="new-player"
            ref={formRef}
            className="flex gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              console.log("hoal");

              const playerName = new FormData(e.currentTarget).get(
                "player"
              ) as string;
              addPlayer(playerName);
            }}
          >
            <MdFilledTextField
              ref={newPlayerInputRef}
              label="Player name"
              name="player"
              className="w-full"
              required
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPlayer((e.target as any).value);
                  formRef.current?.reset();
                }
              }}
            >
              <PersonIcon slot="leading-icon" />
            </MdFilledTextField>
            <MdFab
              lowered
              variant="primary"
              onClick={(e) => {
                e.preventDefault();

                const playerName = formRef.current
                  ? (new FormData(formRef.current).get("player") as string)
                  : "";

                addPlayer(playerName);
                formRef.current?.reset();
                newPlayerInputRef.current?.focus();
              }}
            >
              <AddIcon slot="icon" />
            </MdFab>
          </form>
        </div>
        <div slot="actions">
          <form slot="actions" method="dialog">
            <MdTextButton>Cancel</MdTextButton>
          </form>
          <MdTextButton onClick={handleCreateGame}>Create game</MdTextButton>
        </div>
      </MdDialog>
    </>
  );
}

const PlayerItem = ({
  player,
  onClick,
}: {
  player: string;
  onClick: () => void;
}) => (
  <div className="flex gap-4 py-2 items-center h-14">
    <div className="size-10 min-w-10 rounded-full bg-primaryContainer flex items-center justify-center">
      <PersonIcon className="fill-onSurfaceVariant" />
    </div>
    <p className="w-full md-typescale-body-medium text-onSurface">{player}</p>
    <MdIconButton className="size-10 min-w-10" onClick={onClick}>
      <DeleteIcon className="fill-onSurfaceVariant" />
    </MdIconButton>
  </div>
);
