import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSumbit = async () => {
    try {
      if (isRegistering) {
        if (password === confirmPassword) {
          await register(email, password);
        } else {
          setError("Passwords do not match!");
          return;
        }
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }


  return (
    <div id="dashboard" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ maxWidth: "400px", width: "100%", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0" }}>Encountr</h1>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", textAlign: "left", fontWeight: "500" }}>
            E-mail
          </label>
          <input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSumbit()}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#1a1a1a",
              color: "rgba(255, 255, 255, 0.87)",
              border: "1px solid #444",
              borderRadius: "6px",
              fontSize: "1rem",
              boxSizing: "border-box",
              transition: "border-color 0.25s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#646cff"}
            onBlur={(e) => e.target.style.borderColor = "#444"}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", textAlign: "left", fontWeight: "500" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSumbit()}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#1a1a1a",
              color: "rgba(255, 255, 255, 0.87)",
              border: "1px solid #444",
              borderRadius: "6px",
              fontSize: "1rem",
              boxSizing: "border-box",
              transition: "border-color 0.25s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#646cff"}
            onBlur={(e) => e.target.style.borderColor = "#444"}
          />
        </div>

        {isRegistering && (
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", textAlign: "left", fontWeight: "500" }}>
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSumbit()}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#1a1a1a",
                color: "rgba(255, 255, 255, 0.87)",
                border: "1px solid #444",
                borderRadius: "6px",
                fontSize: "1rem",
                boxSizing: "border-box",
                transition: "border-color 0.25s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#646cff"}
              onBlur={(e) => e.target.style.borderColor = "#444"}
            />
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: "#ffe5e5",
            color: "#b00020",
            padding: "0.75rem",
            marginBottom: "1.5rem",
            borderRadius: "6px",
            textAlign: "left",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <button 
            onClick={handleSumbit}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#646cff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.25s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#535bf2"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#646cff"}
          >
            {isRegistering ? "Register" : "Login"}
          </button>

          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              color: "#646cff",
              border: "1px solid #646cff",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.25s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#646cff";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#646cff";
            }}
          >
            {isRegistering ? "Switch to Login" : "Switch to Register"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a href="privacy.html" target="_blank" style={{ fontSize: "0.9rem" }}>
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
