import { useStore } from "@nanostores/preact";
import { $scoreboard, addPlayer, addRound } from "../stores/scoreboard";

export const Component = () => {
  const scoreboard = useStore($scoreboard);

  const topPlayers = scoreboard.players.sort((a, b) =>
    a.totalPoints > b.totalPoints ? 1 : -1
  );

  return (
    <div>
      <h1>Component</h1>
      <button
        onClick={() => {
          addPlayer("player4");
        }}
      >
        Add players
      </button>

      <button
        onClick={() => {
          addRound([20, 15, 10, 10, 10]);
        }}
      >
        Add round
      </button>

      <div className="grid grid-cols-3 justify-items-center items-end my-16">
        {topPlayers[1] && (
          <div className="flex flex-col items-center mb-4">
            <span className="text-7xl">🥈</span>
            <span>{topPlayers[1].name}</span>
            <span>{topPlayers[1].totalPoints} pts.</span>
          </div>
        )}
        {topPlayers[0] && (
          <div className="flex flex-col items-center mb-8">
            <span className="text-7xl">🥇</span>
            <span>{topPlayers[0].name}</span>
            <span>{topPlayers[0].totalPoints} pts.</span>
          </div>
        )}
        {topPlayers[2] && (
          <div className="flex flex-col items-center">
            <span className="text-7xl">🥉</span>
            <span>{topPlayers[2].name}</span>
            <span>{topPlayers[2].totalPoints} pts.</span>
          </div>
        )}
      </div>

      <table>
        <tr>
          <th></th>
          <th className="text-left">Player</th>
          {scoreboard.rounds.map((_round, index) => (
            <th key={index}>{index + 1}.</th>
          ))}
          <th>Total</th>
        </tr>
        {scoreboard.players
          .sort((a, b) => (a.totalPoints > b.totalPoints ? 1 : -1))
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
      </table>
    </div>
  );
};
