import { $scoreboard } from "@/stores/scoreboard";
import { useStore } from "@nanostores/preact";

export default function Leaderboard() {
  const scoreboard = useStore($scoreboard);

  const topPlayers = scoreboard.players.sort((a, b) =>
    a.totalPoints <= b.totalPoints ? 1 : -1
  );

  return (
    <div className="grid grid-cols-3 justify-items-center items-end">
      {topPlayers[1] && (
        <div className="flex flex-col items-center gap-2 w-52 max-w-full">
          <span className="text-5xl">🥈</span>
          <span className="font-bold text-gray-300 text-xl">
            {topPlayers[1].name}
          </span>
          <span className="pb-4 bg-gray-300/15 text-slate-300 w-full text-center">
            {topPlayers[1].totalPoints} pts.
          </span>
        </div>
      )}
      {topPlayers[0] && (
        <div className="flex flex-col items-center gap-2 w-52 max-w-full">
          <span className="text-5xl">🥇</span>
          <span className="font-bold text-yellow-300 text-xl">
            {topPlayers[0].name}
          </span>
          <span className="pb-8 bg-yellow-300/15 text-slate-300 w-full text-center">
            {topPlayers[0].totalPoints} pts.
          </span>
        </div>
      )}
      {topPlayers[2] && (
        <div className="flex flex-col items-center gap-2 w-52 max-w-full">
          <span className="text-5xl">🥉</span>
          <span className="font-bold text-yellow-600 text-xl">
            {topPlayers[2].name}
          </span>
          <span className="bg-yellow-600/15 text-slate-300 w-full text-center">
            {topPlayers[2].totalPoints} pts.
          </span>
        </div>
      )}
    </div>
  );
}
