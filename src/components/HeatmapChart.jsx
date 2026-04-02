'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const CATEGORIES = [
  { key: 'teamSignals', short: 'Team' },
  { key: 'brandPositioning', short: 'Brand' },
  { key: 'websiteDigital', short: 'Website' },
  { key: 'contentSocial', short: 'Content' },
  { key: 'thoughtLeadership', short: 'PR' },
  { key: 'icpClarity', short: 'ICP' },
  { key: 'demandGen', short: 'Demand' },
  { key: 'salesEnablement', short: 'Sales' },
  { key: 'competitiveDiff', short: 'Diff' },
]

const tierColors = {
  RED: '#EF4444',
  YELLOW: '#F59E0B',
  GREEN: '#10B981',
  BLUE: '#3B82F6',
}

export default function HeatmapChart({ audit, tier = 'YELLOW' }) {
  if (!audit) return null

  const data = CATEGORIES.map((cat) => ({
    category: cat.short,
    score: audit[cat.key] || 0,
    fullMark: 5,
  }))

  const color = tierColors[tier] || tierColors.YELLOW

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#e5e5e5" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: '#666' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 5]}
          tick={{ fontSize: 10, fill: '#999' }}
          tickCount={6}
        />
        <Tooltip
          formatter={(value) => [value, 'Score']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Radar
          dataKey="score"
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// Grid-based heatmap for portfolio overview
export function PortfolioHeatmap({ companies }) {
  if (!companies || companies.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1a1a1a]/10">
            <th className="text-left py-3 px-2 font-medium text-[#1a1a1a]/60">Company</th>
            {CATEGORIES.map((cat) => (
              <th key={cat.key} className="text-center py-3 px-1 font-medium text-[#1a1a1a]/60 text-xs">
                {cat.short}
              </th>
            ))}
            <th className="text-center py-3 px-2 font-medium text-[#1a1a1a]/60">Overall</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => {
            const audit = company.audits?.[0]
            if (!audit) return null
            return (
              <tr key={company.id} className="border-b border-[#1a1a1a]/5 hover:bg-white/50">
                <td className="py-2 px-2 font-medium">{company.name}</td>
                {CATEGORIES.map((cat) => {
                  const score = audit[cat.key]
                  return (
                    <td key={cat.key} className="text-center py-2 px-1">
                      <span
                        className="inline-block w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center"
                        style={{
                          backgroundColor: getScoreColor(score),
                          color: score <= 2 ? 'white' : '#1a1a1a',
                        }}
                      >
                        {score || '-'}
                      </span>
                    </td>
                  )
                })}
                <td className="text-center py-2 px-2">
                  <span className="font-bold">{audit.overallScore?.toFixed(1)}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function getScoreColor(score) {
  if (!score) return '#f3f4f6'
  if (score <= 1) return '#ef4444'
  if (score <= 2) return '#f97316'
  if (score <= 3) return '#f59e0b'
  if (score <= 4) return '#84cc16'
  return '#10b981'
}
