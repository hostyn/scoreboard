import { $scoreboard, type Player } from "@/stores/scoreboard";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import NewPlayerModal from "./NewPlayerModal";

export default function Scoreboard() {
  const scoreboard = useStore($scoreboard);

  useEffect(() => {
    if (!scoreboard) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        {scoreboard?.players
          .sort((a, b) =>
            scoreboard.morePointsWins
              ? a.totalPoints < b.totalPoints
                ? 1
                : -1
              : a.totalPoints > b.totalPoints
              ? 1
              : -1
          )
          .map((player, index) => (
            <Player key={player.name} player={player} position={index + 1} />
          ))}
      </div>
      <NewPlayerModal />
    </div>
  );
}

const Player = ({ player, position }: { player: Player; position: number }) => (
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
    <span className="md-typescale-body-large text-left w-full">
      {player.name}
    </span>
    <span className="md-typescale-title-medium min-w-max">
      {player.totalPoints} pts.
    </span>
  </div>
);
