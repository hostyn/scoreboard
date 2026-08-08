import {
  $scoreboard,
  removePlayer,
  renamePlayer,
  type Player,
} from "@/stores/scoreboard";
import { sortPlayers } from "@/util/sorting";
import {
  MdDialog,
  MdFilledTextField,
  MdIconButton,
  MdTextButton,
} from "@/wrappers/materialWeb";
import { useStore } from "@nanostores/react";
import { useEffect, useRef, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import NewPlayerModal from "./NewPlayerModal";
import { DeleteIcon, EditIcon } from "./icons";
import type { MdDialog as MdDialogType } from "@material/web/dialog/dialog";
import type { MdFilledTextField as MdFilledTextFieldType } from "@material/web/textfield/filled-text-field";

export default function Scoreboard() {
  const scoreboard = useStore($scoreboard);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [playerToRename, setPlayerToRename] = useState<Player | null>(null);

  useEffect(() => {
    if (!scoreboard) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        {scoreboard &&
          sortPlayers(scoreboard.players, scoreboard.morePointsWins).map(
            (player, index) => (
              <PlayerRow
                key={player.index}
                player={player}
                position={index + 1}
                onRename={() => setPlayerToRename(player)}
                onDelete={() => setPlayerToDelete(player)}
              />
            )
          )}
      </div>
      <NewPlayerModal />

      <ConfirmDialog
        open={playerToDelete !== null}
        headline="Remove player"
        body={
          playerToDelete
            ? `${playerToDelete.name} and their points in every round will be removed.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (playerToDelete) removePlayer(playerToDelete.index);
          setPlayerToDelete(null);
        }}
        onCancel={() => setPlayerToDelete(null)}
      />

      <RenamePlayerDialog
        player={playerToRename}
        onClose={() => setPlayerToRename(null)}
      />
    </div>
  );
}

const PlayerRow = ({
  player,
  position,
  onRename,
  onDelete,
}: {
  player: Player;
  position: number;
  onRename: () => void;
  onDelete: () => void;
}) => (
  <div className="flex items-center justify-between w-full h-14 gap-2">
    <span
      className={`md-typescale-title-large size-10 min-w-10 flex items-center justify-center rounded-full ${
        position === 1
          ? "bg-gold/35"
          : position === 2
          ? "bg-silver/35"
          : position === 3
          ? "bg-bronze/35"
          : "bg-surfaceContainer"
      }`}
    >
      {position}
    </span>
    <span className="md-typescale-body-large text-left w-full truncate">
      {player.name}
    </span>
    <span className="md-typescale-title-medium min-w-max tabular-nums">
      {player.totalPoints} pts.
    </span>
    <MdIconButton aria-label={`Rename ${player.name}`} onClick={onRename}>
      <EditIcon className="fill-onSurfaceVariant" />
    </MdIconButton>
    <MdIconButton aria-label={`Remove ${player.name}`} onClick={onDelete}>
      <DeleteIcon className="fill-onSurfaceVariant" />
    </MdIconButton>
  </div>
);

const RenamePlayerDialog = ({
  player,
  onClose,
}: {
  player: Player | null;
  onClose: () => void;
}) => {
  const dialogRef = useRef<MdDialogType>(null);
  const inputRef = useRef<MdFilledTextFieldType>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      // El diálogo no se desmonta entre aperturas, así que el valor inicial
      // hay que ponerlo a mano cada vez.
      if (inputRef.current) inputRef.current.value = player.name;
      dialogRef.current?.show();
    } else {
      dialogRef.current?.close();
    }
    setError(null);
  }, [player]);

  useEffect(() => {
    dialogRef.current?.addEventListener("closed", onClose);
    return () => {
      dialogRef.current?.removeEventListener("closed", onClose);
    };
  }, [dialogRef, onClose]);

  const handleRename = () => {
    if (!player) return;

    try {
      renamePlayer(player.index, inputRef.current?.value ?? "");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not rename the player");
    }
  };

  return (
    <MdDialog ref={dialogRef}>
      <div slot="headline">
        <h1 className="md-typescale-headline-small">Rename player</h1>
      </div>
      <div slot="content">
        <MdFilledTextField
          ref={inputRef}
          label="Player name"
          className="w-full"
          errorText={error ?? ""}
          error={error !== null}
        />
      </div>
      <div slot="actions">
        <MdTextButton onClick={onClose}>Cancel</MdTextButton>
        <MdTextButton onClick={handleRename}>Rename</MdTextButton>
      </div>
    </MdDialog>
  );
};
