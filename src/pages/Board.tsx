import { useLocation } from "react-router-dom";
import { FiveToolsClient } from "../services/fiveToolsClient";
import { useEffect, useRef, useState } from "react";
import type { EncounterState } from "../types/encounter";
import { InitiativeBoard } from "../components/InitiativeBoard";
import { usePlayers } from "../hooks/usePlayers";
import { useToken } from "../hooks/useToken";


export default function Board(){
    const location = useLocation();
    const state = location.state || {};

    // On a hard refresh / back-forward, navigation state is lost, so fall back
    // to the values persisted in Firebase.
    const { players: savedPlayers } = usePlayers();
    const { token: savedToken } = useToken();

    const players = state.players ?? savedPlayers;
    const token = state.token ?? savedToken;

    const [encounter, setEncounter] = useState<EncounterState>({
        round: 0,
        currentTurnId: null,
        combatants: []
    })

    const initialized = useRef(false);

    useEffect(() => {
        // Wait for a token to be available (it loads asynchronously from Firebase
        // on refresh) and only ever connect once.
        if (initialized.current || !token) return;

        initialized.current = true;

        try {
            const client = new FiveToolsClient(players, token);
            client.onStateUpdate(setEncounter);
        } catch (err) {
            console.error(err);
        }
    }, [players, token]);

    return (
        <div style={{ background: "#0b0f19", minHeight: "100vh", color: "white" }} className="h-screen w-screen bg-slate-900 text-white overflow-hidden">
            <InitiativeBoard encounter={encounter} />
        </div>
    )
}