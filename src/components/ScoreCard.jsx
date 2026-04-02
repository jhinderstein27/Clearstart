'use client'

const tierConfig = {
  RED: { emoji: '\u{1F534}', label: 'Foundation Needed', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  YELLOW: { emoji: '\u{1F7E1}', label: 'Building / Needs Strategy', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  GREEN: { emoji: '\u{1F7E2}', label: 'Scaling / Needs Acceleration', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  BLUE: { emoji: '\u2B50', label: 'High Performer', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
}

export default function ScoreCard({ score, tier, size = 'md' }) {
  const config = tierConfig[tier] || tierConfig.YELLOW

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
        <span>{config.emoji}</span>
        <span>{score?.toFixed(1)}</span>
      </span>
    )
  }

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{config.emoji}</span>
        <div>
          <div className="text-3xl font-bold">{score?.toFixed(1)} <span className="text-lg font-normal text-[#1a1a1a]/40">/ 5.0</span></div>
          <div className={`text-sm font-medium ${config.text}`}>{config.label}</div>
        </div>
      </div>
    </div>
  )
}

export function TierBadge({ tier }) {
  const config = tierConfig[tier] || tierConfig.YELLOW
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
      {config.emoji} {config.label}
    </span>
  )
}
