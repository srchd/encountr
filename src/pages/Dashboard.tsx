import { usePlayers } from "../hooks/usePlayers";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Dashboard() {
  const { players, addPlayer, deletePlayer } = usePlayers();
  const { logout, user } = useAuth();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  return (
    <div>
      <h2>Welcome {user?.email}</h2>
      <button onClick={logout}>Logout</button>

      <h3>Add Player</h3>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Avatar URL"
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
      />
      <button onClick={() => addPlayer(name, avatar)}>
        Add
      </button>

      <h3>Your Players</h3>
      {players.map(p => (
        <div key={p.id}>
          <img src={p.avatarUrl} width={40} />
          {p.name}
          <button onClick={() => deletePlayer(p.id)}>X</button>
        </div>
      ))}
    </div>
  );
}
