import { $scoreboard } from "@/stores/scoreboard";
import { useStore } from "@nanostores/preact";
import AddNewPlayer from "./AddNewPlayer";

export default function Scoreboard() {
  const scoreboard = useStore($scoreboard);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th className="text-left">#</th>
            <th className="text-left">Player</th>
            {scoreboard.rounds.map((_round, index) => (
              <th key={index} className="text-left">
                {index + 1}.
              </th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {scoreboard.players
            .sort((a, b) => (a.totalPoints < b.totalPoints ? 1 : -1))
            .map((player, index) => (
              <tr key={player.index}>
                <td
                  class={`min-w-6 text-xl font-bold ${
                    (index === 0 && "text-yellow-300") ||
                    (index === 1 && "text-gray-300") ||
                    (index === 2 && "text-yellow-600") ||
                    "text-slate-600"
                  }`}
                >
                  {index + 1}
                </td>
                <td className="w-full">{player.name}</td>
                {scoreboard.rounds.map((round, roundIndex) => (
                  <td key={roundIndex} className="min-w-10">
                    {round[player.index]}
                  </td>
                ))}
                <td className="text-center min-w-24">
                  {player.totalPoints} pts.
                </td>
              </tr>
            ))}
          <tr>
            <td></td>
            <td className="w-full">
              <AddNewPlayer />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
