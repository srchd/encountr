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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#1a1a1a",
    color: "rgba(255, 255, 255, 0.87)",
    border: "1px solid #444",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
    transition: "border-color 0.25s"
  };

  const primaryButtonStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#646cff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.25s",
    width: "100%"
  };

  const outlineButtonStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    color: "#646cff",
    border: "1px solid #646cff",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.25s"
  };

  const sectionStyle: React.CSSProperties = {
    width: "100%",
    marginBottom: "2rem",
    padding: "1.5rem",
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #333"
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = "#646cff";
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = "#444";

  return (
    <div id="dashboard" style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", paddingTop: "2rem", paddingBottom: "2rem" }}>
      <div style={{ maxWidth: "500px", width: "100%", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 1rem 0", textAlign: "center" }}>Dashboard</h1>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={logout}
              style={{ ...outlineButtonStyle, padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#646cff";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#646cff";
              }}
            >
              Logout
            </button>
            <button
              onClick={handleAccountDeletion}
              style={{
                ...outlineButtonStyle,
                padding: "0.4rem 0.8rem",
                fontSize: "0.85rem",
                color: "#ff4444",
                borderColor: "#ff4444"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#ff4444";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#ff4444";
              }}
            >
              Delete Account
            </button>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 1rem 0" }}>Connect to 5etools DM Screen</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", textAlign: "left", fontWeight: "500" }}>
              Token
            </label>
            <input
              placeholder="Enter your token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <button
            onClick={handleConnect}
            style={primaryButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#535bf2"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#646cff"}
          >
            Connect
          </button>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 1rem 0" }}>Add Player</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", textAlign: "left", fontWeight: "500" }}>
              Name
            </label>
            <input
              placeholder="Enter player name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", textAlign: "left", fontWeight: "500" }}>
              Avatar URL
            </label>
            <input
              placeholder="Enter avatar URL"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <button
            onClick={() => addPlayer(name, avatar)}
            style={primaryButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#535bf2"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#646cff"}
          >
            Add Player
          </button>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 1rem 0" }}>Your Players</h3>
          {players.length === 0 && (
            <p style={{ color: "#888", margin: "0" }}>No players added yet.</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            {players.map(p => (
              <div key={p.id} style={{
                padding: "1rem",
                backgroundColor: "#242424",
                borderRadius: "8px",
                border: "1px solid #333",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                minWidth: "120px"
              }}>
                <img src={p.avatarUrl} width={80} style={{ borderRadius: "50%", objectFit: "cover", height: "80px" }} />
                <p style={{ margin: "0", fontWeight: "500" }}>{p.name}</p>
                <button
                  onClick={() => deletePlayer(p.id)}
                  style={{
                    ...outlineButtonStyle,
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.85rem",
                    color: "#ff4444",
                    borderColor: "#ff4444"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ff4444";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#ff4444";
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
