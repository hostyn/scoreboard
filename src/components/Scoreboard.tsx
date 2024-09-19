import { $scoreboard, addPlayer } from "@/stores/scoreboard";
import { useStore } from "@nanostores/preact";
import { useEffect, useRef, useState } from "preact/hooks";

export default function Scoreboard() {
  const scoreboard = useStore($scoreboard);

  const [addingPlayer, setAddingPlayer] = useState(false);
  const addPlayerInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scoreboard) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th className="text-left">#</th>
            <th className="text-left">Player</th>
            {scoreboard?.rounds.map((_round, index) => (
              <th key={index} className="text-left">
                {index + 1}.
              </th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {scoreboard?.players
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
              {addingPlayer ? (
                <form
                  onSubmit={() => {
                    const playerName = addPlayerInput.current?.value;

                    if (playerName) {
                      addPlayer(playerName);
                    }

                    setAddingPlayer(false);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Player name"
                    className="bg-transparent"
                    ref={addPlayerInput}
                    onBlur={() => {
                      const playerName = addPlayerInput.current?.value;

                      if (playerName) {
                        addPlayer(playerName);
                      }

                      setAddingPlayer(false);
                    }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => {
                    setAddingPlayer(true);
                    setTimeout(() => {
                      addPlayerInput.current?.focus();
                    }, 0);
                  }}
                >
                  + Add player
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
