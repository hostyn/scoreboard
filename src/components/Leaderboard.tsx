import { $scoreboard } from "@/stores/scoreboard";
import { useStore } from "@nanostores/react";

export default function Leaderboard() {
  const scoreboard = useStore($scoreboard);

  if (!scoreboard) return;

  const topPlayers = scoreboard.players.sort((a, b) =>
    a.totalPoints <= b.totalPoints ? 1 : -1
  );

  return (
    <div className="grid grid-cols-3 justify-items-center items-end gap-2">
      {topPlayers[2] && (
        <div className="flex flex-col items-center justify-center w-full col-start-1 bg-bronze/35 rounded-3xl h-[100px] p-2">
          <span className="md-typescale-display-small">🥉</span>
          <span className="md-typescale-title-medium max-w-full text-ellipsis whitespace-nowrap overflow-hidden">
            {topPlayers[2].name}
          </span>
          <span className="md-typescale-body-small">
            {topPlayers[2].totalPoints} pts.
          </span>
        </div>
      )}
      {topPlayers[0] && (
        <div className="flex flex-col items-center justify-center w-full col-start-2 bg-gold/35 rounded-3xl h-[150px] p-2">
          <span className="md-typescale-display-small">🥇</span>
          <span className="md-typescale-title-medium max-w-full text-ellipsis whitespace-nowrap overflow-hidden">
            {topPlayers[0].name}
          </span>
          <span className="md-typescale-body-small">
            {topPlayers[0].totalPoints} pts.
          </span>
        </div>
      )}
      {topPlayers[1] && (
        <div className="flex flex-col items-center justify-center w-full col-start-3 bg-silver/35 rounded-3xl h-[125px] p-2">
          <span className="md-typescale-display-small">🥈</span>
          <span className="md-typescale-title-medium max-w-full text-ellipsis whitespace-nowrap overflow-hidden">
            {topPlayers[1].name}
          </span>
          <span className="md-typescale-body-small">
            {topPlayers[1].totalPoints} pts.
          </span>
        </div>
      )}
    </div>
  );
}
