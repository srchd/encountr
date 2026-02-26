import { Routes, Route, Navigate } from "react-router-dom"

import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board"

declare const PeerVeClient: any;

export default function App() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/board" element={<Board />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
