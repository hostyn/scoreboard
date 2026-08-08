import { $games, deleteGame, selectGame } from "@/stores/games";
import { getScoreboard } from "@/stores/scoreboard";
import { dateFormatter } from "@/util/formatters";
import { sortPlayers } from "@/util/sorting";
import { MdIconButton } from "@/wrappers/materialWeb";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { DeleteIcon } from "./icons";

export default function Games() {
  const games = useStore($games);
  const [gameToDelete, setGameToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (games.games.length === 0) {
    return (
      <p className="md-typescale-body-large text-onSurfaceVariant text-center py-8">
        No games yet. Create one to start keeping score.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {[...games.games]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .map((game) => {
          const gameData = getScoreboard(game.id);
          if (!gameData) return null;

          const topPlayers = sortPlayers(
            gameData.players,
            gameData.morePointsWins
          );

          return (
            <div
              key={game.id}
              className="bg-surface rounded-[12px] border border-outlineVariant flex items-center"
            >
              <button
                className="p-4 text-left flex justify-between items-center gap-4 w-full"
                onClick={() => {
                  selectGame(game.id);
                  window.location.href = "/game";
                }}
              >
                <div className="min-w-0">
                  <h2 className="md-typescale-title-medium truncate">
                    {gameData.name || "Untitled game"}
                  </h2>
                  <p className="md-typescale-body-medium text-onSurfaceVariant">
                    {dateFormatter.format(game.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-col text-right min-w-0">
                  {topPlayers[0] && (
                    <span className="md-typescale-body-medium text-gold truncate">
                      1. {topPlayers[0].name}
                    </span>
                  )}
                  {topPlayers[1] && (
                    <span className="md-typescale-body-medium text-silver truncate">
                      2. {topPlayers[1].name}
                    </span>
                  )}
                  {topPlayers[2] && (
                    <span className="md-typescale-body-medium text-bronze truncate">
                      3. {topPlayers[2].name}
                    </span>
                  )}
                </div>
              </button>
              <MdIconButton
                className="mr-2"
                aria-label={`Delete ${gameData.name || "game"}`}
                onClick={() =>
                  setGameToDelete({ id: game.id, name: gameData.name })
                }
              >
                <DeleteIcon className="fill-onSurfaceVariant" />
              </MdIconButton>
            </div>
          );
        })}

      <ConfirmDialog
        open={gameToDelete !== null}
        headline="Delete game"
        body={
          gameToDelete
            ? `"${
                gameToDelete.name || "Untitled game"
              }" and all its rounds will be deleted. This cannot be undone.`
            : ""
        }
        onConfirm={() => {
          if (gameToDelete) deleteGame(gameToDelete.id);
          setGameToDelete(null);
        }}
        onCancel={() => setGameToDelete(null)}
      />
    </div>
  );
}
