import { useLocation } from "react-router-dom";
import { FiveToolsClient } from "../services/fiveToolsClient";
import { useEffect, useState } from "react";
import type { EncounterState } from "../types/encounter";
import { InitiativeBoard } from "../components/InitiativeBoard";


export default function Board(){
    const location = useLocation();
    const { players, token } = location.state || {};
    const [encounter, setEncounter] = useState<EncounterState>({
        round: 0,
        currentTurnId: null,
        combatants: []
    })

    useEffect(() => {
        const init = async () => {
        try {
            const client = new FiveToolsClient(players, token);
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