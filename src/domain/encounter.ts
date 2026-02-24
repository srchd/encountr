export type CombatantType = "player" | "monster" | "npc"

export interface Combatant {
  id: string
  name: string
  type: CombatantType
  currentHp: number
  maxHp: number
  initiative: number
  imageUrl?: string
  conditions: string[]
  isVisible: boolean
  isActive: boolean
}

export interface EncounterState {
  round: number
  currentTurnId: string | null
  combatants: Combatant[]
}
