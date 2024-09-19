import { $games, selectGame } from "@/stores/games";
import { getScoreboard } from "@/stores/scoreboard";
import { useStore } from "@nanostores/preact";
import NewGameModal from "./NewGameModal";

export default function Games() {
  const games = useStore($games);

  return (
    <div>
      <h1>Games</h1>
      <div className="flex flex-col gap-4">
        {games.games
          .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
          .map((game) => {
            const gameData = getScoreboard(game.id);
            if (!gameData) return null;

            return (
              <div className="bg-gray-800">
                <h2>{gameData.name}</h2>
                <p>{game.updatedAt.toTimeString()}</p>
                <button
                  key={game.id}
                  onClick={() => {
                    selectGame(game.id);
                    window.location.href = "/game";
                  }}
                >
                  play
                </button>
              </div>
            );
          })}
      </div>
      <NewGameModal />
    </div>
  );
}
