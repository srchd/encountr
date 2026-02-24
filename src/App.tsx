import { useEffect, useState } from "react"
import type { EncounterState } from "./domain/encounter"
import { FiveToolsClient } from "./network/fiveToolsClient"
import { InitiativeBoard } from "./components/InitiativeBoard"
import { loadPlayersJson } from "./utils/playerService"

declare const PeerVeClient: any;

export default function App() {
  const [encounter, setEncounter] = useState<EncounterState>({
    round: 0,
    currentTurnId: null,
    combatants: []
  })

  useEffect(() => {
    const init = async () => {
      try {
        const players = await loadPlayersJson();

        const client = new FiveToolsClient(players);
        client.onStateUpdate(setEncounter);
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, []);

  return (
    <div style={{ background: "#0b0f19", minHeight: "100vh", color: "white" }} className="h-screen w-screen bg-slate-900 text-white overflow-hidden">
      <InitiativeBoard encounter={encounter} />
    </div>
  )
}
