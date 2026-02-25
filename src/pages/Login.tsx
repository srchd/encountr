import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSumbit = async () => {
    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }


  return (
    <div>
      <h1>Encountr</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

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

      <button onClick={handleSumbit}>
        {isRegistering ? "Register" : "Login"}
      </button>

      <button onClick={() => {
        setIsRegistering(!isRegistering);
        setError(null);
        }}>
        {isRegistering ? "Switch to Login" : "Switch to Register"}
      </button>

      {/* <button onClick={() => login(email, password)}>Login</button>
      <button onClick={() => register(email, password)}>Register</button> */}
    </div>
  );
}
