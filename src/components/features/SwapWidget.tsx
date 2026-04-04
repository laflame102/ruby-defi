'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { Button } from '@/components/ui/Button'
import { TokenSelector } from './TokenSelector'
import { useSwap, useTokenBalance } from '@/hooks'
import { TokenInfo } from '@/types'
import { SEPOLIA_CHAIN_ID, SEPOLIA_TOKENS } from '@/constants'

export function SwapWidget() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { open } = useAppKit()

  const [tokenIn, setTokenIn] = useState<TokenInfo | null>(SEPOLIA_TOKENS[0])
  const [tokenOut, setTokenOut] = useState<TokenInfo | null>(SEPOLIA_TOKENS[2])
  const [amountIn, setAmountIn] = useState('')
  const [isApproving, setIsApproving] = useState(false)
  const [needsApprovalState, setNeedsApprovalState] = useState(false)

  const { balance: balanceIn, refetch: refetchBalanceIn } = useTokenBalance(tokenIn)
  const { balance: balanceOut, refetch: refetchBalanceOut } = useTokenBalance(tokenOut)

  const {
    quote,
    isLoadingQuote,
    isSwapping,
    error,
    getQuote,
    executeSwap,
    needsApproval,
    approve,
  } = useSwap()

  const isWrongNetwork = chainId !== SEPOLIA_CHAIN_ID

  useEffect(() => {
    const timer = setTimeout(() => {
      if (tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0) {
        getQuote(tokenIn, tokenOut, amountIn)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [tokenIn, tokenOut, amountIn, getQuote])

  useEffect(() => {
    const checkApproval = async () => {
      if (tokenIn && amountIn && parseFloat(amountIn) > 0 && isConnected) {
        const needs = await needsApproval(tokenIn, amountIn)
        setNeedsApprovalState(needs)
      } else {
        setNeedsApprovalState(false)
      }
    }
    checkApproval()
  }, [tokenIn, amountIn, needsApproval, isConnected])

  const handleSwapTokens = () => {
    const tempToken = tokenIn
    const tempAmount = amountIn
    setTokenIn(tokenOut)
    setTokenOut(tempToken)
    setAmountIn(quote?.amountOut || '')
  }

  const handleApprove = async () => {
    if (!tokenIn) return
    setIsApproving(true)
    const hash = await approve(tokenIn)
    if (hash) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setNeedsApprovalState(false)
    }
    setIsApproving(false)
  }

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !quote) return

    const hash = await executeSwap(tokenIn, tokenOut, amountIn, quote.amountOutRaw)
    if (hash) {
      setAmountIn('')
      setTimeout(() => {
        refetchBalanceIn()
        refetchBalanceOut()
      }, 3000)
    }
  }

  const handleMaxClick = () => {
    if (balanceIn) {
      const maxAmount = parseFloat(balanceIn)
      if (tokenIn?.symbol === 'ETH') {
        setAmountIn(Math.max(0, maxAmount - 0.01).toFixed(6))
      } else {
        setAmountIn(maxAmount.toString())
      }
    }
  }

  const getButtonContent = () => {
    if (!isConnected) {
      return { text: 'Connect Wallet', action: () => open(), disabled: false }
    }
    if (isWrongNetwork) {
      return { text: 'Switch to Sepolia', action: () => switchChain({ chainId: SEPOLIA_CHAIN_ID }), disabled: false }
    }
    if (!tokenIn || !tokenOut) {
      return { text: 'Select tokens', action: () => {}, disabled: true }
    }
    if (!amountIn || parseFloat(amountIn) === 0) {
      return { text: 'Enter amount', action: () => {}, disabled: true }
    }
    if (parseFloat(amountIn) > parseFloat(balanceIn)) {
      return { text: 'Insufficient balance', action: () => {}, disabled: true }
    }
    if (isLoadingQuote) {
      return { text: 'Getting quote...', action: () => {}, disabled: true }
    }
    if (!quote) {
      return { text: 'No liquidity', action: () => {}, disabled: true }
    }
    if (needsApprovalState) {
      return {
        text: isApproving ? 'Approving...' : `Approve ${tokenIn.symbol}`,
        action: handleApprove,
        disabled: isApproving,
      }
    }
    return {
      text: isSwapping ? 'Swapping...' : 'Swap',
      action: handleSwap,
      disabled: isSwapping,
    }
  }

  const buttonContent = getButtonContent()

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num === 0) return '0'
    if (num < 0.0001) return '<0.0001'
    return num.toFixed(4)
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        <button className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-green-500/50 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
        <button className="w-12 h-12 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-500 hover:text-white hover:border-green-500/50 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Swap</h2>
          <div className="flex items-center gap-2">
            {isConnected && (
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded-full">
                {isWrongNetwork ? 'Wrong Network' : 'Sepolia'}
              </span>
            )}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-2">
          <TokenSelector
            selectedToken={tokenIn}
            onSelect={setTokenIn}
            excludeToken={tokenOut}
            label="From"
          />
          {isConnected && tokenIn && (
            <div className="flex justify-between items-center mt-3 text-sm">
              <span className="text-gray-500">Balance: {formatBalance(balanceIn)}</span>
              <button
                onClick={handleMaxClick}
                className="text-green-400 hover:text-green-300 font-medium"
              >
                MAX
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-2">
          <TokenSelector
            selectedToken={tokenOut}
            onSelect={setTokenOut}
            excludeToken={tokenIn}
            label="To"
          />
          {isConnected && tokenOut && (
            <div className="mt-3 text-sm">
              <span className="text-gray-500">Balance: {formatBalance(balanceOut)}</span>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
          <div className="text-gray-400 text-sm mb-3">You send</div>
          <div className="flex items-center gap-3">
            {tokenIn?.logoURI ? (
              <img src={tokenIn.logoURI} alt={tokenIn.symbol} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                {tokenIn?.symbol?.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1">
              <input
                type="text"
                placeholder="0"
                value={amountIn}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '')
                  if (value.split('.').length <= 2) {
                    setAmountIn(value)
                  }
                }}
                className="bg-transparent text-white text-2xl font-medium w-full outline-none placeholder-gray-500"
              />
              {quote && (
                <div className="text-gray-500 text-sm">
                  ≈ {parseFloat(quote.amountOut).toFixed(6)} {tokenOut?.symbol}
                </div>
              )}
              {isLoadingQuote && <div className="text-gray-500 text-sm">Loading...</div>}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={buttonContent.action}
            disabled={buttonContent.disabled}
          >
            {buttonContent.text}
          </Button>
        </div>

        {quote && tokenIn && tokenOut && (
          <div className="mt-4 p-3 bg-gray-800/30 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rate</span>
              <span className="text-white">
                1 {tokenIn.symbol} = {(parseFloat(quote.amountOut) / parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Slippage</span>
              <span className="text-white">0.5%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
