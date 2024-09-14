import { useStore } from "@nanostores/preact";
import { $scoreboard, addPlayer, addRound } from "../stores/scoreboard";
import { useEffect } from "preact/hooks";

export const Component = () => {
  const scoreboard = useStore($scoreboard);

  useEffect(() => {
    console.log(scoreboard);
  }, [scoreboard]);

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
          addRound([20, 15, 10]);
        }}
      >
        Add round
      </button>

      <table>
        <tr>
          <th></th>
          <th>Player</th>
          {scoreboard.rounds.map((_round, index) => (
            <th key={index}>Round {index + 1}</th>
          ))}
          <th>Total</th>
        </tr>
        {scoreboard.players
          .sort((a, b) => (a.totalPoints > b.totalPoints ? 1 : -1))
          .map((player, index) => (
            <tr key={player.index}>
              <td>{index + 1}</td>
              <td>{player.name}</td>
              {scoreboard.rounds.map((round, roundIndex) => (
                <td key={roundIndex}>{round[player.index]}</td>
              ))}
              <td>{player.totalPoints}</td>
            </tr>
          ))}
      </table>
    </div>
  );
};
