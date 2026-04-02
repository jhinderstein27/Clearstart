'use client'

import { useState } from 'react'

export default function FirmSearch({ onFirmAdded }) {
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), website: website.trim() || null }),
      })
      if (res.ok) {
        const firm = await res.json()
        setName('')
        setWebsite('')
        onFirmAdded?.(firm)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">
          PE/VC Firm Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Frazier Healthcare Partners"
          className="w-full px-3 py-2 rounded-lg border border-[#1a1a1a]/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">
          Website (optional)
        </label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 rounded-lg border border-[#1a1a1a]/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="px-5 py-2 bg-[#1a1a1a] text-white text-sm font-medium rounded-lg hover:bg-[#333] disabled:opacity-40 transition-colors"
      >
        {loading ? 'Adding...' : 'Add Firm'}
      </button>
    </form>
  )
}
