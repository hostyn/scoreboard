import { $games, selectGame } from "@/stores/games";
import { getScoreboard } from "@/stores/scoreboard";
import { dateFormatter } from "@/util/formatters";
import { useStore } from "@nanostores/react";

export default function Games() {
  const games = useStore($games);

  return (
    <div className="flex flex-col gap-4">
      {games.games
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .map((game) => {
          const gameData = getScoreboard(game.id);
          if (!gameData) return null;

          return (
            <button
              key={game.id}
              className="bg-surface rounded-[12px] border border-outlineVariant p-4 text-left flex justify-between items-center"
              onClick={() => {
                selectGame(game.id);
                window.location.href = "/game";
              }}
            >
              <div>
                <h2 className="md-typescale-title-medium">{gameData.name}</h2>
                <p className="md-typescale-body-medium">
                  {dateFormatter.format(game.updatedAt)}
                </p>
              </div>
              <div className="flex flex-col text-right">
                {gameData.players[0] && (
                  <span className="md-typescale-body-medium text-yellow-300">
                    1. {gameData.players[0]?.name}
                  </span>
                )}
                {gameData.players[1] && (
                  <span className="md-typescale-body-medium text-gray-300">
                    2. {gameData.players[1]?.name}
                  </span>
                )}
                {gameData.players[1] && (
                  <span className="md-typescale-body-medium text-yellow-600">
                    3. {gameData.players[1]?.name}
                  </span>
                )}
              </div>
            </button>
          );
        })}
    </div>
  );
}
