'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import ScoreCard from '@/components/ScoreCard'
import HeatmapChart from '@/components/HeatmapChart'

const CATEGORIES = [
  { key: 'teamSignals', notesKey: 'teamSignalsNotes', label: 'Team Signals', description: 'Marketing team structure, seniority, and hiring activity' },
  { key: 'brandPositioning', notesKey: 'brandPositioningNotes', label: 'Brand & Positioning', description: 'Website quality, messaging clarity, ICP specificity, brand consistency' },
  { key: 'websiteDigital', notesKey: 'websiteDigitalNotes', label: 'Website & Digital Presence', description: 'Site performance, CTAs, blog, SEO, conversion infrastructure' },
  { key: 'contentSocial', notesKey: 'contentSocialNotes', label: 'Content & Social Media', description: 'LinkedIn activity, blog cadence, content mix, executive voices' },
  { key: 'thoughtLeadership', notesKey: 'thoughtLeadershipNotes', label: 'Thought Leadership & PR', description: 'Press coverage, podcast appearances, trade presence, owned POV' },
  { key: 'icpClarity', notesKey: 'icpClarityNotes', label: 'ICP Clarity & GTM Focus', description: 'Target buyer definition, message tailoring, PMF evidence, ROI narrative' },
  { key: 'demandGen', notesKey: 'demandGenNotes', label: 'Demand Generation', description: 'Paid advertising, email nurture, lead magnets, events, outbound' },
  { key: 'salesEnablement', notesKey: 'salesEnablementNotes', label: 'Sales Enablement', description: 'Case studies, demo flow, sales collateral, CRM, conference strategy' },
  { key: 'competitiveDiff', notesKey: 'competitiveDiffNotes', label: 'Competitive Differentiation', description: 'Unique positioning, category ownership, specific proof points' },
]

const SCORE_DESCRIPTIONS = {
  1: 'Critical gap',
  2: 'Significant weakness',
  3: 'Developing',
  4: 'Strong',
  5: 'Exceptional',
}

export default function CompanyReport({ params }) {
  const { companyId } = use(params)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompany() {
      const res = await fetch(`/api/companies/${companyId}`)
      const data = await res.json()
      setCompany(data)
      setLoading(false)
    }
    fetchCompany()
  }, [companyId])

  if (loading) {
    return (
      <>
        <Header variant="report" />
        <div className="text-center py-20 text-[#1a1a1a]/40">Loading...</div>
      </>
    )
  }

  if (!company) {
    return (
      <>
        <Header variant="report" />
        <div className="text-center py-20 text-[#1a1a1a]/40">Company not found</div>
      </>
    )
  }

  const audit = company.audits?.[0]

  if (!audit) {
    return (
      <>
        <Header variant="report" />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Link href={`/firm/${company.firmId}`} className="text-sm text-[#4a7c59] hover:underline mb-4 inline-block">
            &larr; Back to {company.firm?.name}
          </Link>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-[#1a1a1a]/40 mt-4">No audit data yet. Run an audit from the firm dashboard.</p>
        </main>
      </>
    )
  }

  // Get top 3 priorities (weakest categories)
  const priorities = CATEGORIES
    .map((cat) => ({ ...cat, score: audit[cat.key] }))
    .filter((c) => c.score != null)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  const auditDate = new Date(audit.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const isStale = (Date.now() - new Date(audit.createdAt).getTime()) > 90 * 24 * 60 * 60 * 1000

  return (
    <>
      <Header variant="report" />
      <main className="max-w-4xl mx-auto px-6 py-8" id="report-content">
        {/* Navigation */}
        <div className="no-print mb-4">
          <Link href={`/firm/${company.firmId}`} className="text-sm text-[#4a7c59] hover:underline">
            &larr; Back to {company.firm?.name}
          </Link>
        </div>

        {/* Report Header */}
        <div className="bg-white rounded-xl border border-[#1a1a1a]/10 p-8 mb-6">
          <div className="text-xs uppercase tracking-wider text-[#4a7c59] font-medium mb-4">
            Marketing Readiness Diagnostic
          </div>
          <h1 className="text-3xl font-bold mb-1">{company.name}</h1>
          <div className="text-sm text-[#1a1a1a]/50 mb-4">
            {company.firm?.name} Portfolio
            {company.subsector && <> &middot; {company.subsector}</>}
            {company.stage && <> &middot; {company.stage}</>}
          </div>
          <div className="flex items-start gap-8">
            <ScoreCard score={audit.overallScore} tier={audit.tier} />
            <div className="flex-1">
              <HeatmapChart audit={audit} tier={audit.tier} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1a1a1a]/5">
            <span className="text-xs text-[#1a1a1a]/40">
              Audit Date: {auditDate}
              {isStale && (
                <span className="ml-2 text-amber-600 font-medium">
                  (Stale — over 90 days old)
                </span>
              )}
            </span>
            <button
              onClick={() => window.print()}
              className="no-print px-3 py-1 text-xs border border-[#1a1a1a]/15 rounded-lg hover:bg-[#1a1a1a]/5"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Top 3 Priorities */}
        <div className="bg-white rounded-xl border border-red-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-red-700 mb-4">Top 3 Immediate Priorities</h2>
          <div className="space-y-4">
            {priorities.map((priority, i) => (
              <div key={priority.key} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-700 text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <div className="font-medium">
                    {priority.label}
                    <span className="text-red-600 text-sm ml-2">Score: {priority.score}/5</span>
                  </div>
                  <p className="text-sm text-[#1a1a1a]/60 mt-0.5">
                    {audit[priority.notesKey] || 'No details available'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Category Breakdown */}
        <div className="bg-white rounded-xl border border-[#1a1a1a]/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Full Assessment</h2>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const score = audit[cat.key]
              const notes = audit[cat.notesKey]
              return (
                <div key={cat.key} className="border-b border-[#1a1a1a]/5 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-medium">{cat.label}</span>
                      <span className="text-xs text-[#1a1a1a]/40 ml-2">{cat.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className="w-5 h-5 rounded-sm text-[10px] font-bold flex items-center justify-center"
                            style={{
                              backgroundColor: n <= (score || 0) ? getScoreColor(score) : '#f3f4f6',
                              color: n <= (score || 0) ? (score <= 2 ? 'white' : '#1a1a1a') : '#ccc',
                            }}
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-[#1a1a1a]/40 w-24 text-right">
                        {SCORE_DESCRIPTIONS[score] || 'Not scored'}
                      </span>
                    </div>
                  </div>
                  {notes && (
                    <p className="text-sm text-[#1a1a1a]/60 mt-1">{notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Recommended Engagement */}
        {audit.suggestedServiceEntry && (
          <div className="bg-[#e8f0eb] rounded-xl border border-[#4a7c59]/20 p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#4a7c59] mb-3">Recommended Engagement</h2>
            <p className="text-sm text-[#1a1a1a]/70 mb-4">
              Based on this assessment, {company.name} would benefit most from:
            </p>
            <div className="bg-white rounded-lg p-4 border border-[#4a7c59]/10">
              <div className="font-medium text-[#4a7c59]">{audit.suggestedServiceEntry}</div>
              {audit.outreachAngle && (
                <p className="text-sm text-[#1a1a1a]/60 mt-2">{audit.outreachAngle}</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[#4a7c59]/10">
              <a
                href="https://www.theclearstart.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2.5 bg-[#4a7c59] text-white text-sm font-medium rounded-lg hover:bg-[#3d6a4a] transition-colors"
              >
                Schedule a 30-Minute Strategy Call
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 text-xs text-[#1a1a1a]/30">
          <p>hello@theclearstart.com | 423-883-2002 | theclearstart.com</p>
          <p className="mt-1">Marketing that drives healthcare innovation.</p>
        </div>
      </main>
    </>
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
