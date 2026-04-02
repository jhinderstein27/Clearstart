'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import ScoreCard from '@/components/ScoreCard'

const URGENCY_LABELS = {
  PRE_RAISE: { emoji: '\u{1F6A8}', label: 'Pre-raise', desc: 'Approaching a funding round' },
  RECENT_RAISE: { emoji: '\u{1F4B0}', label: 'Recent raise', desc: 'Just raised capital — has budget' },
  PRE_EXIT: { emoji: '\u{1F3C1}', label: 'Pre-exit', desc: 'Approaching exit — needs brand cleanup' },
  NEW_PLATFORM: { emoji: '\u{1F195}', label: 'New platform', desc: 'Recently formed — building from scratch' },
}

export default function InternalPipeline() {
  const [firms, setFirms] = useState([])
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('score_asc')

  useEffect(() => {
    async function fetchFirms() {
      const res = await fetch('/api/firms')
      const data = await res.json()
      setFirms(data)
      setLoading(false)
    }
    fetchFirms()
  }, [])

  // Flatten all companies across firms with their audit data
  const allCompanies = firms.flatMap((firm) =>
    (firm.companies || []).map((company) => ({
      ...company,
      firmName: firm.name,
      firmId: firm.id,
      audit: company.audits?.[0] || null,
    }))
  )

  const auditedCompanies = allCompanies.filter((c) => c.audit)

  // Apply filters
  let filtered = auditedCompanies
  if (tierFilter !== 'ALL') {
    filtered = filtered.filter((c) => c.audit.tier === tierFilter)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy === 'score_asc') return (a.audit.overallScore || 0) - (b.audit.overallScore || 0)
    if (sortBy === 'score_desc') return (b.audit.overallScore || 0) - (a.audit.overallScore || 0)
    if (sortBy === 'firm') return a.firmName.localeCompare(b.firmName)
    return 0
  })

  // Summary stats
  const firmStats = firms.map((firm) => {
    const cos = (firm.companies || []).filter((c) => c.audits?.length > 0)
    const avg =
      cos.length > 0
        ? cos.reduce((sum, c) => sum + (c.audits[0]?.overallScore || 0), 0) / cos.length
        : null
    return {
      name: firm.name,
      id: firm.id,
      totalCompanies: firm.companies?.length || 0,
      auditedCompanies: cos.length,
      avgScore: avg,
    }
  })

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center py-20 text-[#1a1a1a]/40">Loading pipeline...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Prospect Pipeline</h1>
          <p className="text-[#1a1a1a]/50 text-sm">
            Internal view — prioritized outreach across all PE firms and portfolio companies
          </p>
        </div>

        {/* Firm Summary Table */}
        <div className="bg-white rounded-xl border border-[#1a1a1a]/10 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">PE Firm Overview</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]/10 text-left">
                <th className="py-2 font-medium text-[#1a1a1a]/60">Firm</th>
                <th className="py-2 font-medium text-[#1a1a1a]/60 text-center">Portfolio</th>
                <th className="py-2 font-medium text-[#1a1a1a]/60 text-center">Audited</th>
                <th className="py-2 font-medium text-[#1a1a1a]/60 text-center">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {firmStats.map((firm) => (
                <tr key={firm.id} className="border-b border-[#1a1a1a]/5 hover:bg-[#1a1a1a]/3">
                  <td className="py-2">
                    <Link href={`/firm/${firm.id}`} className="font-medium hover:text-[#4a7c59]">
                      {firm.name}
                    </Link>
                  </td>
                  <td className="py-2 text-center">{firm.totalCompanies}</td>
                  <td className="py-2 text-center">{firm.auditedCompanies}</td>
                  <td className="py-2 text-center">
                    {firm.avgScore ? (
                      <ScoreCard score={firm.avgScore} tier={getTier(firm.avgScore)} size="sm" />
                    ) : (
                      <span className="text-[#1a1a1a]/30">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#1a1a1a]/50">Tier:</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="text-sm border border-[#1a1a1a]/15 rounded-lg px-2 py-1 bg-white"
            >
              <option value="ALL">All</option>
              <option value="RED">Red — Foundation Needed</option>
              <option value="YELLOW">Yellow — Building</option>
              <option value="GREEN">Green — Scaling</option>
              <option value="BLUE">Blue — High Performer</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#1a1a1a]/50">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-[#1a1a1a]/15 rounded-lg px-2 py-1 bg-white"
            >
              <option value="score_asc">Score (Low → High)</option>
              <option value="score_desc">Score (High → Low)</option>
              <option value="firm">Firm Name</option>
            </select>
          </div>
          <span className="text-xs text-[#1a1a1a]/40">
            {filtered.length} companies
          </span>
        </div>

        {/* Company Pipeline Table */}
        <div className="bg-white rounded-xl border border-[#1a1a1a]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]/10 text-left bg-[#1a1a1a]/3">
                <th className="py-3 px-4 font-medium text-[#1a1a1a]/60">Company</th>
                <th className="py-3 px-4 font-medium text-[#1a1a1a]/60">PE Firm</th>
                <th className="py-3 px-4 font-medium text-[#1a1a1a]/60 text-center">Score</th>
                <th className="py-3 px-4 font-medium text-[#1a1a1a]/60">Top Gap</th>
                <th className="py-3 px-4 font-medium text-[#1a1a1a]/60">Service Entry</th>
                <th className="py-3 px-4 font-medium text-[#1a1a1a]/60">Signals</th>
                <th className="py-3 px-4 font-medium text-[#1a1a1a]/60">Approach</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => {
                const audit = company.audit
                const topGap = getTopGap(audit)
                return (
                  <tr key={company.id} className="border-b border-[#1a1a1a]/5 hover:bg-[#1a1a1a]/3">
                    <td className="py-3 px-4">
                      <Link href={`/company/${company.id}`} className="font-medium hover:text-[#4a7c59]">
                        {company.name}
                      </Link>
                      {company.subsector && (
                        <div className="text-xs text-[#1a1a1a]/40">{company.subsector}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#1a1a1a]/60">
                      <Link href={`/firm/${company.firmId}`} className="hover:text-[#4a7c59]">
                        {company.firmName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <ScoreCard score={audit.overallScore} tier={audit.tier} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {topGap && (
                        <span>
                          {topGap.label} <span className="text-red-500">({topGap.score})</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#4a7c59] font-medium">
                      {audit.suggestedServiceEntry || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {(audit.urgencySignals || []).map((signal) => {
                          const config = URGENCY_LABELS[signal]
                          if (!config) return null
                          return (
                            <span
                              key={signal}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-50 border border-amber-200 text-amber-700"
                              title={config.desc}
                            >
                              {config.emoji} {config.label}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#1a1a1a]/50">
                      {audit.suggestedOutreach === 'FIRM_FIRST'
                        ? 'Go through PE firm'
                        : 'Go direct'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-[#1a1a1a]/40 text-sm">
              {auditedCompanies.length === 0
                ? 'No audited companies yet. Run audits from the firm dashboards.'
                : 'No companies match this filter.'}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function getTier(score) {
  if (score >= 4.5) return 'BLUE'
  if (score >= 3.5) return 'GREEN'
  if (score >= 2.5) return 'YELLOW'
  return 'RED'
}

function getTopGap(audit) {
  const categories = [
    { key: 'teamSignals', label: 'Team', score: audit.teamSignals },
    { key: 'brandPositioning', label: 'Brand', score: audit.brandPositioning },
    { key: 'websiteDigital', label: 'Website', score: audit.websiteDigital },
    { key: 'contentSocial', label: 'Content', score: audit.contentSocial },
    { key: 'thoughtLeadership', label: 'PR', score: audit.thoughtLeadership },
    { key: 'icpClarity', label: 'ICP', score: audit.icpClarity },
    { key: 'demandGen', label: 'Demand Gen', score: audit.demandGen },
    { key: 'salesEnablement', label: 'Sales', score: audit.salesEnablement },
    { key: 'competitiveDiff', label: 'Diff', score: audit.competitiveDiff },
  ]
  return categories.filter((c) => c.score != null).sort((a, b) => a.score - b.score)[0] || null
}
