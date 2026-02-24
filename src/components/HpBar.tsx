interface Props {
  current: number
  max: number
}

export function HpBar({ current, max }: Props) {
  const percent = max > 0 ? current / max : 0

  const getColor = () => {
    if (percent <= 0) return "#555"
    if (percent < 0.15) return "#b91c1c"
    if (percent < 0.4) return "#ea580c"
    if (percent < 0.75) return "#eab308"
    return "#16a34a"
  }

  return (
    <div style={{
      width: "100%",
      height: "12px",
      background: "#222",
      borderRadius: "6px",
      overflow: "hidden"
    }}>
      <div
        style={{
          width: `${percent * 100}%`,
          height: "100%",
          background: getColor(),
          transition: "width 0.4s ease"
        }}
      />
    </div>
  )
}
