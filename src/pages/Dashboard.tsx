import { usePlayers } from "../hooks/usePlayers";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { players, addPlayer, deletePlayer } = usePlayers();
  const { logout, user, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [token, setToken] = useState("");

  const handleConnect = () => {
    if (!token.trim()) return;

    navigate("/board", {
      state: { players, token }
    });
  };

  const handleAccountDeletion = async () => {
    if (!user) return;

    await deleteAccount();
    navigate("/");
  }

  // TODO: Add a How To Use link to Dashboard, navigating to README on GitHub

  return (
    <div id="dashboard" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      position: "absolute",
      top: "0",
      bottom: "0",
      left: "0",
      right: "0",
      margin: "auto"
    }}>
      <div id="account-info">
        <div>
          <div>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
        <div id="delete-account">
          <button onClick={handleAccountDeletion}>
            Delete Account
          </button>
        </div>
      </div>

      <div>
        <h3>Connect to 5etools DM Screen</h3>
        Insert Token: <input 
                        placeholder="Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        style={{
                          minWidth: "200px"
                        }}
                    />
        <button onClick={handleConnect}>Connect</button>
      </div>

      <div>
        <h3>Add Player</h3>
        <div>
          <h3>Name:</h3>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <h3>Avatar URL</h3>
          <input
            placeholder="Avatar URL"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>
        <button onClick={() => addPlayer(name, avatar)}>
          Add
        </button>
      </div>
        <h2>Your Players</h2>
      <div id="players">
        {players.map(p => (
          <div key={p.id}>
            <img src={p.avatarUrl} width={100} />
            <p>{p.name}</p>
            <button onClick={() => deletePlayer(p.id)}>X</button>
          </div>
        ))}
      </div>
    </div>
  );
}
