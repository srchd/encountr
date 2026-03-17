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
    <div id="dashboard">
      <div>
        <h1>Encountr</h1>
      </div>

      <div>
        <h3>E-mail</h3>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <h3>Password</h3> 
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

      {/* TODO: Better Authentication error display */}
      </div>
      {isRegistering && (
        <div>
          <h3>Confirm Password</h3>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      )}

      {error && (
          <div style={{
            backgroundColor: "#ffe5e5",
            color: "#b00020",
            padding: "8px",
            marginTop: "8px",
            borderRadius: "4px"
          }}>
            {error}
          </div>
      )}

      <div>
        <button onClick={handleSumbit}>
          {isRegistering ? "Register" : "Login"}
        </button>

        <button onClick={() => {
          setIsRegistering(!isRegistering);
          setError(null);
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        }}>
          {isRegistering ? "Switch to Login" : "Switch to Register"}
        </button>
      </div>

      <div>
        <a href="privacy.html" target="_blank">Privacy Policy</a>
      </div>
    </div>
  );
}
