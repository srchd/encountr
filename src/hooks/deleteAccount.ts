import { deleteUser } from "firebase/auth";
import { auth } from "../firebase";

export async function deleteEncountrUser() {
    auth.currentUser ? await deleteUser(auth.currentUser) : null;
    return
}