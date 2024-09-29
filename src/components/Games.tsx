import { $games, selectGame } from "@/stores/games";
import { getScoreboard } from "@/stores/scoreboard";
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
              className="bg-surface rounded-[12px] border border-outlineVariant p-4 text-left"
              onClick={() => {
                selectGame(game.id);
                window.location.href = "/game";
              }}
            >
              <h2>{gameData.name}</h2>
              <p>{game.updatedAt.toTimeString()}</p>
            </button>
          );
        })}
    </div>
  );
}
