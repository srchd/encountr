import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export function usePlayers() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "players");

    const unsub = onSnapshot(ref, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return unsub;
  }, [user]);

  const addPlayer = async (name: string, avatarUrl: string) => {
    if (!user) return;

    await addDoc(collection(db, "users", user.uid, "players"), {
      name,
      avatarUrl
    });
  };

  const deletePlayer = async (id: string) => {
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "players", id));
  };

  return { players, addPlayer, deletePlayer };
}
