'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@/components/ui'

export function Header() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/swap', label: 'Swap' },
    { href: '/screener', label: 'Screener' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/earn', label: 'Earn' },
    { href: '/portfolio', label: 'Portfolio' },
  ]

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800/50">
      {/* Logo */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <svg
            className="w-6 h-6 text-green-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13 3L4 14h7v7l9-11h-7V3z" />
          </svg>
          <span className="text-white font-bold text-lg">RUBY</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <ConnectButton />
        <button className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>
    </header>
  )
}
