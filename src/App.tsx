import { Routes, Route, Navigate } from "react-router-dom"

import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board"

declare const PeerVeClient: any;

// TODO:
//  - Remove PeerVeClient declaration from here
//  - Add a How To Use link to Dashboard, navigating to README on GitHub
//  - Modify README to correspond for the hosted webapp
//  - Find a way to save apiKey to an env variable before hosting
//  - Host it on GitHub pages

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
