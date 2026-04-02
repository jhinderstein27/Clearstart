'use client'

import Link from 'next/link'

export default function Header({ variant = 'internal' }) {
  return (
    <header className="border-b border-[#1a1a1a]/10 bg-white/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
            Clearstart
          </span>
          {variant === 'report' && (
            <span className="text-xs text-[#1a1a1a]/50 border-l border-[#1a1a1a]/20 pl-3">
              Marketing that drives healthcare innovation.
            </span>
          )}
        </Link>
        {variant === 'internal' && (
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors"
            >
              Firms
            </Link>
            <Link
              href="/internal/pipeline"
              className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors"
            >
              Pipeline
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
