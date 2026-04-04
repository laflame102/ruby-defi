'use client'

import { useState } from 'react'
import { TokenInfo } from '@/types'
import { SEPOLIA_TOKENS } from '@/constants'

interface TokenSelectorProps {
  selectedToken: TokenInfo | null
  onSelect: (token: TokenInfo) => void
  excludeToken?: TokenInfo | null
  label: string
}

export function TokenSelector({ selectedToken, onSelect, excludeToken, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const availableTokens = SEPOLIA_TOKENS.filter(
    token => token.address.toLowerCase() !== excludeToken?.address.toLowerCase()
  )

  return (
    <div className="relative">
      <div className="text-gray-400 text-sm mb-3">{label}</div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
      >
        {selectedToken ? (
          <>
            {selectedToken.logoURI ? (
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                {selectedToken.symbol.charAt(0)}
              </div>
            )}
            <div>
              <span className="text-white font-medium">{selectedToken.symbol}</span>
              <span className="text-gray-500 text-sm ml-2">{selectedToken.name}</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-700" />
            <span className="text-gray-400">Select token</span>
          </>
        )}
        <svg
          className={`w-5 h-5 ml-auto text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
          <div className="max-h-64 overflow-y-auto">
            {availableTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => {
                  onSelect(token)
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 transition-colors text-left"
              >
                {token.logoURI ? (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                    {token.symbol.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-white font-medium">{token.symbol}</div>
                  <div className="text-gray-500 text-xs">{token.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
