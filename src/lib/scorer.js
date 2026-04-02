// Tier classification based on average score
export function getTier(overallScore) {
  if (overallScore >= 4.5) return 'BLUE'
  if (overallScore >= 3.5) return 'GREEN'
  if (overallScore >= 2.5) return 'YELLOW'
  return 'RED'
}

export function getTierLabel(tier) {
  const labels = {
    RED: 'Foundation Needed',
    YELLOW: 'Building / Needs Strategy',
    GREEN: 'Scaling / Needs Acceleration',
    BLUE: 'High Performer',
  }
  return labels[tier] || 'Unknown'
}

export function getTierEmoji(tier) {
  const emojis = { RED: '🔴', YELLOW: '🟡', GREEN: '🟢', BLUE: '⭐' }
  return emojis[tier] || '⚪'
}

export function getTierColor(tier) {
  const colors = {
    RED: '#EF4444',
    YELLOW: '#F59E0B',
    GREEN: '#10B981',
    BLUE: '#3B82F6',
  }
  return colors[tier] || '#6B7280'
}

export function getClearstartOpportunity(tier) {
  const opportunities = {
    RED: 'Highest urgency; needs everything from scratch',
    YELLOW: 'Has some pieces; needs strategic direction and execution capacity',
    GREEN: 'Solid foundation; ready to grow faster with the right partner',
    BLUE: 'Strong marketing; may not need Clearstart (or a narrow specialist engagement)',
  }
  return opportunities[tier] || ''
}

// Calculate overall score from category scores
export function calculateOverallScore(audit) {
  const categories = [
    audit.teamSignals,
    audit.brandPositioning,
    audit.websiteDigital,
    audit.contentSocial,
    audit.thoughtLeadership,
    audit.icpClarity,
    audit.demandGen,
    audit.salesEnablement,
    audit.competitiveDiff,
  ]
  const validScores = categories.filter((s) => s != null && s > 0)
  if (validScores.length === 0) return 0
  return Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1))
}

// Determine suggested service entry point based on weakest categories
export function suggestServiceEntry(audit) {
  const categoryMap = [
    { key: 'teamSignals', score: audit.teamSignals, service: 'Fractional CMO / GTM Strategy' },
    { key: 'brandPositioning', score: audit.brandPositioning, service: 'Brand & Positioning' },
    { key: 'websiteDigital', score: audit.websiteDigital, service: 'Brand & Positioning' },
    { key: 'contentSocial', score: audit.contentSocial, service: 'Content Marketing' },
    { key: 'thoughtLeadership', score: audit.thoughtLeadership, service: 'Content Marketing' },
    { key: 'icpClarity', score: audit.icpClarity, service: 'Fractional CMO / GTM Strategy' },
    { key: 'demandGen', score: audit.demandGen, service: 'Fractional CMO / GTM Strategy' },
    { key: 'salesEnablement', score: audit.salesEnablement, service: 'Sales Enablement' },
    { key: 'competitiveDiff', score: audit.competitiveDiff, service: 'Brand & Positioning' },
  ]

  const sorted = categoryMap
    .filter((c) => c.score != null)
    .sort((a, b) => a.score - b.score)

  if (sorted.length === 0) return 'Fractional CMO / GTM Strategy'

  // Return the service associated with the weakest category
  return sorted[0].service
}

// Get top gaps (weakest categories)
export function getTopGaps(audit, count = 3) {
  const categories = [
    { key: 'teamSignals', label: 'Team Signals', score: audit.teamSignals, notes: audit.teamSignalsNotes },
    { key: 'brandPositioning', label: 'Brand & Positioning', score: audit.brandPositioning, notes: audit.brandPositioningNotes },
    { key: 'websiteDigital', label: 'Website & Digital', score: audit.websiteDigital, notes: audit.websiteDigitalNotes },
    { key: 'contentSocial', label: 'Content & Social', score: audit.contentSocial, notes: audit.contentSocialNotes },
    { key: 'thoughtLeadership', label: 'Thought Leadership & PR', score: audit.thoughtLeadership, notes: audit.thoughtLeadershipNotes },
    { key: 'icpClarity', label: 'ICP Clarity & GTM Focus', score: audit.icpClarity, notes: audit.icpClarityNotes },
    { key: 'demandGen', label: 'Demand Generation', score: audit.demandGen, notes: audit.demandGenNotes },
    { key: 'salesEnablement', label: 'Sales Enablement', score: audit.salesEnablement, notes: audit.salesEnablementNotes },
    { key: 'competitiveDiff', label: 'Competitive Differentiation', score: audit.competitiveDiff, notes: audit.competitiveDiffNotes },
  ]

  return categories
    .filter((c) => c.score != null)
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
}

export const CATEGORY_LABELS = {
  teamSignals: 'Team Signals',
  brandPositioning: 'Brand & Positioning',
  websiteDigital: 'Website & Digital Presence',
  contentSocial: 'Content & Social Media',
  thoughtLeadership: 'Thought Leadership & PR',
  icpClarity: 'ICP Clarity & GTM Focus',
  demandGen: 'Demand Generation',
  salesEnablement: 'Sales Enablement',
  competitiveDiff: 'Competitive Differentiation',
}

export const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS)
