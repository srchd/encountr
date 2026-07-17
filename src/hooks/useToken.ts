import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export function useToken() {
  const { user } = useAuth();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    getDoc(ref).then((snapshot) => {
      const latestToken = snapshot.data()?.latestToken;
      if (latestToken) setToken(latestToken);
    });
  }, [user]);

  const saveToken = async (latestToken: string) => {
    if (!user) return;

    await setDoc(doc(db, "users", user.uid), { latestToken }, { merge: true });
  };

  return { token, setToken, saveToken };
}
