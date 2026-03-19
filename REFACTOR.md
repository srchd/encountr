# Refactoring Summary

This document describes the structural changes made to the `encountr` codebase. No functional behaviour was altered.

## Changes

### 1. `src/firebase.ts` → `src/lib/firebase.ts`

The Firebase initialisation module was moved into a new `src/lib/` directory.  
`lib/` is the conventional home for third-party service wrappers and singleton initialisations that are shared across the application.

**Affected imports** (updated automatically):
- `src/context/AuthContext.tsx`
- `src/hooks/usePlayers.ts`

---

### 2. `src/hooks/deleteAccount.ts` deleted — logic merged into `src/context/AuthContext.tsx`

`deleteAccount.ts` was a one-function file containing `deleteEncountrUser`, which is a Firebase Auth operation. Because all other Firebase Auth operations (`login`, `register`, `logout`) already live inside `AuthContext`, the `deleteAccount` function was added there as well and is now exposed through the `useAuth()` hook.

**Before:**
```ts
// src/hooks/deleteAccount.ts
export async function deleteEncountrUser() {
  auth.currentUser ? await deleteUser(auth.currentUser) : null;
}

// src/pages/Dashboard.tsx
import { deleteEncountrUser } from "../hooks/deleteAccount";
await deleteEncountrUser();
```

**After:**
```ts
// src/context/AuthContext.tsx  (added inside AuthProvider)
const deleteAccount = async () => {
  if (auth.currentUser) await deleteUser(auth.currentUser);
};
// exposed via: <AuthContext.Provider value={{ ..., deleteAccount }}>

// src/pages/Dashboard.tsx
const { logout, user, deleteAccount } = useAuth();
await deleteAccount();
```

---

### 3. `src/utils/playerService.ts` deleted (dead code)

`loadPlayersJson()` fetched player data from a static `public/assets/players.json` file. This approach was superseded by the Firestore-backed `usePlayers` hook (`src/hooks/usePlayers.ts`), leaving `playerService.ts` unreferenced anywhere in the codebase.

---

### 4. `src/types/player.ts` deleted (dead code)

The `Player` interface defined in this file was only imported by `playerService.ts`. Once `playerService.ts` was removed, this type became entirely unused and was deleted along with it.

---

### 5. Removed unused `analytics` initialisation from `src/lib/firebase.ts`

The original `firebase.ts` imported `getAnalytics` and stored the result in a local `analytics` variable, but the variable was never used or exported. The import and assignment were removed to eliminate dead code (the `measurementId` config key is retained so analytics can be wired up easily in the future).

---

## New Directory Structure
src/
├── assets/
│   └── react.svg
├── components/
│   ├── CombatantCard.tsx
│   ├── HpBar.tsx
│   └── InitiativeBoard.tsx
├── context/
│   └── AuthContext.tsx          ← also owns deleteAccount logic (was hooks/deleteAccount.ts)
├── domain/
│   └── encounter.ts
├── hooks/
│   └── usePlayers.ts
├── lib/
│   └── firebase.ts              ← moved from src/firebase.ts
├── network/
│   └── fiveToolsClient.ts
├── pages/
│   ├── Board.tsx
│   ├── Dashboard.tsx
│   └── Login.tsx
├── types/
│   └── peerve-client.d.ts
├── App.css
├── App.tsx
├── index.css
└── main.tsx
```

## Deleted Files

| File | Reason |
|---|---|
| `src/firebase.ts` | Moved to `src/lib/firebase.ts` |
| `src/hooks/deleteAccount.ts` | Merged into `src/context/AuthContext.tsx` |
| `src/utils/playerService.ts` | Dead code — superseded by Firestore hook |
| `src/types/player.ts` | Dead code — only used by deleted `playerService.ts` |
