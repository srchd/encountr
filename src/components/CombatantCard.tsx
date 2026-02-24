import type { Combatant } from "../domain/encounter"
import { HpBar } from "./HpBar"

interface Props {
  combatant: Combatant
  isActive: boolean
}

export function CombatantCard({ combatant, isActive }: Props) {
  if (!combatant.isVisible) return null

  const isDead = combatant.currentHp <= 0

  return (
    <div
      className={`
        relative flex flex-col flex-1 overflow-hidden rounded-2xl
        ${isActive ? "bg-slate-800 border-2 border-yellow-400" : "bg-slate-900 border border-slate-700"}
        ${isDead ? "opacity-50" : ""}
      `}
    >
      {/* Top Section */}
    <div className="p-3">
      <div className="text-lg font-bold truncate">
        {combatant.name}
      </div>

      <HpBar
        current={combatant.currentHp}
        max={combatant.maxHp}
      />
    </div>

    {/* Image Section (fills remaining space) */}
    <div className="flex-1 relative overflow-hidden">
      <img
        src={combatant.imageUrl}
        alt={combatant.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-contain object-top rounded-xl"
      />
    </div>
  </div>
  )
}
