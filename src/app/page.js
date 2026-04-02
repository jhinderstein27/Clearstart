'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import FirmSearch from '@/components/FirmSearch'
import ScoreCard from '@/components/ScoreCard'

export default function Home() {
  const [firms, setFirms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFirms()
  }, [])

  async function fetchFirms() {
    const res = await fetch('/api/firms')
    const data = await res.json()
    setFirms(data)
    setLoading(false)
  }

  function getPortfolioStats(firm) {
    const companies = firm.companies || []
    const audited = companies.filter((c) => c.audits?.length > 0)
    const avgScore =
      audited.length > 0
        ? audited.reduce((sum, c) => sum + (c.audits[0]?.overallScore || 0), 0) / audited.length
        : null
    return { total: companies.length, audited: audited.length, avgScore }
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Portfolio Marketing Intelligence</h1>
          <p className="text-[#1a1a1a]/50 text-sm">
            Audit marketing maturity across healthcare PE portfolio companies
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#1a1a1a]/10 p-6 mb-8">
          <h2 className="text-sm font-medium text-[#1a1a1a]/60 mb-3">Add a PE/VC Firm</h2>
          <FirmSearch onFirmAdded={() => fetchFirms()} />
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#1a1a1a]/40">Loading firms...</div>
        ) : firms.length === 0 ? (
          <div className="text-center py-16 text-[#1a1a1a]/40">
            No firms yet. Add one above or run the seed script.
          </div>
        ) : (
          <div className="grid gap-4">
            {firms.map((firm) => {
              const stats = getPortfolioStats(firm)
              return (
                <Link
                  key={firm.id}
                  href={`/firm/${firm.id}`}
                  className="block bg-white rounded-xl border border-[#1a1a1a]/10 p-6 hover:border-[#4a7c59]/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{firm.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-[#1a1a1a]/50">
                        {firm.hq && <span>{firm.hq}</span>}
                        {firm.estimatedAum && <span>{firm.estimatedAum} AUM</span>}
                        {firm.investmentStage && <span>{firm.investmentStage}</span>}
                      </div>
                      {firm.healthcareSubsectors && (
                        <p className="text-xs text-[#1a1a1a]/40 mt-2">{firm.healthcareSubsectors}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <div className="text-xs text-[#1a1a1a]/50">portfolio cos</div>
                      {stats.avgScore && (
                        <div className="mt-2">
                          <ScoreCard
                            score={stats.avgScore}
                            tier={getTier(stats.avgScore)}
                            size="sm"
                          />
                        </div>
                      )}
                      {stats.audited > 0 && (
                        <div className="text-xs text-[#1a1a1a]/40 mt-1">
                          {stats.audited}/{stats.total} audited
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
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
