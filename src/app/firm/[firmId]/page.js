'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import ScoreCard, { TierBadge } from '@/components/ScoreCard'
import HeatmapChart, { PortfolioHeatmap } from '@/components/HeatmapChart'

const CATEGORY_LABELS = {
  teamSignals: 'Team',
  brandPositioning: 'Brand',
  websiteDigital: 'Website',
  contentSocial: 'Content',
  thoughtLeadership: 'PR',
  icpClarity: 'ICP',
  demandGen: 'Demand',
  salesEnablement: 'Sales',
  competitiveDiff: 'Diff',
}

export default function FirmDashboard({ params }) {
  const { firmId } = use(params)
  const [firm, setFirm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [auditing, setAuditing] = useState({}) // track per-company audit status
  const [auditingAll, setAuditingAll] = useState(false)

  useEffect(() => {
    fetchFirm()
  }, [firmId])

  async function fetchFirm() {
    const res = await fetch(`/api/firms/${firmId}`)
    const data = await res.json()
    setFirm(data)
    setLoading(false)
  }

  async function runAudit(companyId) {
    setAuditing((prev) => ({ ...prev, [companyId]: true }))
    try {
      await fetch('/api/audits/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      })
      await fetchFirm()
    } catch (err) {
      console.error('Audit failed:', err)
    } finally {
      setAuditing((prev) => ({ ...prev, [companyId]: false }))
    }
  }

  async function runAllAudits() {
    if (!firm?.companies) return
    setAuditingAll(true)
    const unaudited = firm.companies.filter((c) => !c.audits?.length)
    for (const company of unaudited) {
      await runAudit(company.id)
    }
    setAuditingAll(false)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center py-20 text-[#1a1a1a]/40">Loading...</div>
      </>
    )
  }

  if (!firm) {
    return (
      <>
        <Header />
        <div className="text-center py-20 text-[#1a1a1a]/40">Firm not found</div>
      </>
    )
  }

  const auditedCompanies = firm.companies.filter((c) => c.audits?.length > 0)
  const unauditedCompanies = firm.companies.filter((c) => !c.audits?.length)
  const avgScore =
    auditedCompanies.length > 0
      ? auditedCompanies.reduce((sum, c) => sum + (c.audits[0]?.overallScore || 0), 0) /
        auditedCompanies.length
      : null

  // Find top gaps and action items
  const actionNeeded = [...auditedCompanies]
    .sort((a, b) => (a.audits[0]?.overallScore || 0) - (b.audits[0]?.overallScore || 0))
    .slice(0, 3)

  const opportunities = [...auditedCompanies]
    .filter((c) => {
      const score = c.audits[0]?.overallScore || 0
      return score >= 2.0 && score <= 3.5
    })
    .slice(0, 3)

  return (
    <>
      <Header variant="report" />
      <main className="max-w-7xl mx-auto px-6 py-8" id="report-content">
        {/* Firm Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-[#4a7c59] hover:underline mb-2 inline-block no-print">
            &larr; All Firms
          </Link>
          <h1 className="text-3xl font-bold">{firm.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-[#1a1a1a]/50">
            {firm.hq && <span>{firm.hq}</span>}
            {firm.estimatedAum && <span>{firm.estimatedAum} AUM</span>}
            {firm.founded && <span>Est. {firm.founded}</span>}
          </div>
          {firm.healthcareSubsectors && (
            <p className="text-xs text-[#1a1a1a]/40 mt-2">Focus: {firm.healthcareSubsectors}</p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#1a1a1a]/10 p-5">
            <div className="text-sm text-[#1a1a1a]/50 mb-1">Portfolio Companies</div>
            <div className="text-3xl font-bold">{firm.companies.length}</div>
            <div className="text-xs text-[#1a1a1a]/40 mt-1">
              {auditedCompanies.length} audited
            </div>
          </div>
          {avgScore && (
            <div className="bg-white rounded-xl border border-[#1a1a1a]/10 p-5">
              <div className="text-sm text-[#1a1a1a]/50 mb-1">Avg Marketing Maturity</div>
              <ScoreCard score={avgScore} tier={getTier(avgScore)} size="sm" />
            </div>
          )}
          <div className="bg-white rounded-xl border border-[#1a1a1a]/10 p-5 no-print">
            <div className="text-sm text-[#1a1a1a]/50 mb-2">Actions</div>
            {unauditedCompanies.length > 0 && (
              <button
                onClick={runAllAudits}
                disabled={auditingAll}
                className="px-4 py-2 bg-[#4a7c59] text-white text-sm rounded-lg hover:bg-[#3d6a4a] disabled:opacity-40 transition-colors"
              >
                {auditingAll
                  ? `Auditing... (${Object.values(auditing).filter(Boolean).length} running)`
                  : `Audit ${unauditedCompanies.length} companies`}
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 ml-2 border border-[#1a1a1a]/15 text-sm rounded-lg hover:bg-[#1a1a1a]/5 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Portfolio Heatmap */}
        {auditedCompanies.length > 0 && (
          <div className="bg-white rounded-xl border border-[#1a1a1a]/10 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Portfolio Marketing Heatmap</h2>
            <PortfolioHeatmap companies={auditedCompanies} />
          </div>
        )}

        {/* Action Needed */}
        {actionNeeded.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3 text-red-700">Action Needed</h2>
            <p className="text-sm text-[#1a1a1a]/50 mb-4">
              Companies where marketing is a drag on portfolio performance
            </p>
            <div className="space-y-3">
              {actionNeeded.map((company) => {
                const audit = company.audits[0]
                const weakest = getWeakestCategory(audit)
                return (
                  <Link
                    key={company.id}
                    href={`/company/${company.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50/50 border border-transparent hover:border-red-100 transition-all"
                  >
                    <div>
                      <span className="font-medium">{company.name}</span>
                      {company.subsector && (
                        <span className="text-xs text-[#1a1a1a]/40 ml-2">{company.subsector}</span>
                      )}
                      {weakest && (
                        <p className="text-xs text-red-600 mt-0.5">
                          Top gap: {weakest.label} (score: {weakest.score})
                        </p>
                      )}
                    </div>
                    <ScoreCard score={audit.overallScore} tier={audit.tier} size="sm" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Opportunity */}
        {opportunities.length > 0 && (
          <div className="bg-white rounded-xl border border-emerald-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3 text-emerald-700">Opportunity</h2>
            <p className="text-sm text-[#1a1a1a]/50 mb-4">
              Companies where focused marketing investment would have outsized impact
            </p>
            <div className="space-y-3">
              {opportunities.map((company) => {
                const audit = company.audits[0]
                return (
                  <Link
                    key={company.id}
                    href={`/company/${company.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100 transition-all"
                  >
                    <div>
                      <span className="font-medium">{company.name}</span>
                      {audit.suggestedServiceEntry && (
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Entry point: {audit.suggestedServiceEntry}
                        </p>
                      )}
                    </div>
                    <ScoreCard score={audit.overallScore} tier={audit.tier} size="sm" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* All Portfolio Companies */}
        <div className="bg-white rounded-xl border border-[#1a1a1a]/10 p-6">
          <h2 className="text-lg font-semibold mb-4">All Portfolio Companies</h2>
          <div className="space-y-2">
            {firm.companies.map((company) => {
              const audit = company.audits?.[0]
              const isAuditing = auditing[company.id]
              return (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1a1a1a]/3 border border-transparent hover:border-[#1a1a1a]/5"
                >
                  <div className="flex-1">
                    {audit ? (
                      <Link href={`/company/${company.id}`} className="font-medium hover:text-[#4a7c59]">
                        {company.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{company.name}</span>
                    )}
                    {company.subsector && (
                      <span className="text-xs text-[#1a1a1a]/40 ml-2">{company.subsector}</span>
                    )}
                    {company.description && (
                      <p className="text-xs text-[#1a1a1a]/40 mt-0.5">{company.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {audit ? (
                      <ScoreCard score={audit.overallScore} tier={audit.tier} size="sm" />
                    ) : (
                      <button
                        onClick={() => runAudit(company.id)}
                        disabled={isAuditing}
                        className="no-print px-3 py-1 text-xs border border-[#1a1a1a]/15 rounded-lg hover:bg-[#1a1a1a]/5 disabled:opacity-40"
                      >
                        {isAuditing ? 'Auditing...' : 'Run Audit'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Clearstart Introduction */}
        <div className="mt-8 p-6 bg-[#e8f0eb] rounded-xl border border-[#4a7c59]/20">
          <p className="text-sm text-[#1a1a1a]/70">
            <strong>About Clearstart</strong> — Clearstart is a healthcare-focused marketing and GTM
            strategy partner that embeds with portfolio companies to build marketing infrastructure
            from scratch or accelerate existing efforts. We specialize in fractional CMO leadership,
            brand positioning, content marketing, and sales enablement for growth-stage healthcare
            companies.
          </p>
          <p className="text-xs text-[#1a1a1a]/40 mt-2">
            hello@theclearstart.com | 423-883-2002 | theclearstart.com
          </p>
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

function getWeakestCategory(audit) {
  const categories = [
    { key: 'teamSignals', label: 'Team Signals', score: audit.teamSignals },
    { key: 'brandPositioning', label: 'Brand & Positioning', score: audit.brandPositioning },
    { key: 'websiteDigital', label: 'Website & Digital', score: audit.websiteDigital },
    { key: 'contentSocial', label: 'Content & Social', score: audit.contentSocial },
    { key: 'thoughtLeadership', label: 'Thought Leadership', score: audit.thoughtLeadership },
    { key: 'icpClarity', label: 'ICP Clarity', score: audit.icpClarity },
    { key: 'demandGen', label: 'Demand Gen', score: audit.demandGen },
    { key: 'salesEnablement', label: 'Sales Enablement', score: audit.salesEnablement },
    { key: 'competitiveDiff', label: 'Competitive Diff', score: audit.competitiveDiff },
  ]
  return categories.filter((c) => c.score != null).sort((a, b) => a.score - b.score)[0] || null
}
