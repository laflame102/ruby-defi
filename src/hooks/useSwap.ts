'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseUnits, formatUnits, encodeFunctionData } from 'viem'
import { TokenInfo } from '@/types'
import {
  UNISWAP_CONTRACTS,
  WETH_ADDRESS,
  NATIVE_ETH_ADDRESS,
  QUOTER_V2_ABI,
  SWAP_ROUTER_ABI,
  ERC20_ABI,
  DEFAULT_FEE_TIER,
  DEFAULT_SLIPPAGE,
  DEFAULT_DEADLINE,
} from '@/constants'

interface SwapQuote {
  amountOut: string
  amountOutRaw: bigint
  priceImpact: number
  gasEstimate: bigint
}

interface UseSwapReturn {
  quote: SwapQuote | null
  isLoadingQuote: boolean
  isSwapping: boolean
  error: string | null
  getQuote: (tokenIn: TokenInfo, tokenOut: TokenInfo, amountIn: string) => Promise<void>
  executeSwap: (
    tokenIn: TokenInfo,
    tokenOut: TokenInfo,
    amountIn: string,
    minAmountOut: bigint
  ) => Promise<`0x${string}` | null>
  needsApproval: (token: TokenInfo, amount: string) => Promise<boolean>
  approve: (token: TokenInfo) => Promise<`0x${string}` | null>
}

export function useSwap(): UseSwapReturn {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert ETH address to WETH for Uniswap operations
  const getSwapAddress = (token: TokenInfo): `0x${string}` => {
    if (token.address.toLowerCase() === NATIVE_ETH_ADDRESS.toLowerCase()) {
      return WETH_ADDRESS
    }
    return token.address
  }

  // Check if token is native ETH
  const isNativeETH = (token: TokenInfo): boolean => {
    return token.address.toLowerCase() === NATIVE_ETH_ADDRESS.toLowerCase()
  }

  // Get quote from Uniswap QuoterV2
  const getQuote = useCallback(
    async (tokenIn: TokenInfo, tokenOut: TokenInfo, amountIn: string) => {
      if (!publicClient || !amountIn || parseFloat(amountIn) === 0) {
        setQuote(null)
        return
      }

      setIsLoadingQuote(true)
      setError(null)

      try {
        const amountInRaw = parseUnits(amountIn, tokenIn.decimals)
        const tokenInAddress = getSwapAddress(tokenIn)
        const tokenOutAddress = getSwapAddress(tokenOut)

        const result = await publicClient.simulateContract({
          address: UNISWAP_CONTRACTS.sepolia.quoterV2,
          abi: QUOTER_V2_ABI,
          functionName: 'quoteExactInputSingle',
          args: [
            {
              tokenIn: tokenInAddress,
              tokenOut: tokenOutAddress,
              amountIn: amountInRaw,
              fee: DEFAULT_FEE_TIER,
              sqrtPriceLimitX96: BigInt(0),
            },
          ],
        })

        const [amountOut, , , gasEstimate] = result.result as [bigint, bigint, number, bigint]

        setQuote({
          amountOut: formatUnits(amountOut, tokenOut.decimals),
          amountOutRaw: amountOut,
          priceImpact: 0, // TODO: Calculate actual price impact
          gasEstimate,
        })
      } catch (err) {
        console.error('Quote error:', err)
        setError('Failed to get quote. Pool may not exist or has insufficient liquidity.')
        setQuote(null)
      } finally {
        setIsLoadingQuote(false)
      }
    },
    [publicClient]
  )

  // Check if approval is needed
  const needsApproval = useCallback(
    async (token: TokenInfo, amount: string): Promise<boolean> => {
      if (!publicClient || !address || isNativeETH(token)) {
        return false
      }

      try {
        const amountRaw = parseUnits(amount, token.decimals)
        const allowance = await publicClient.readContract({
          address: token.address,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, UNISWAP_CONTRACTS.sepolia.swapRouter],
        })

        return (allowance as bigint) < amountRaw
      } catch {
        return true
      }
    },
    [publicClient, address]
  )

  // Approve token spending
  const approve = useCallback(
    async (token: TokenInfo): Promise<`0x${string}` | null> => {
      if (!walletClient || !address) {
        setError('Wallet not connected')
        return null
      }

      try {
        const hash = await walletClient.writeContract({
          address: token.address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [UNISWAP_CONTRACTS.sepolia.swapRouter, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
        })

        return hash
      } catch (err) {
        console.error('Approval error:', err)
        setError('Failed to approve token')
        return null
      }
    },
    [walletClient, address]
  )

  // Execute swap
  const executeSwap = useCallback(
    async (
      tokenIn: TokenInfo,
      tokenOut: TokenInfo,
      amountIn: string,
      minAmountOut: bigint
    ): Promise<`0x${string}` | null> => {
      if (!walletClient || !address || !publicClient) {
        setError('Wallet not connected')
        return null
      }

      setIsSwapping(true)
      setError(null)

      try {
        const amountInRaw = parseUnits(amountIn, tokenIn.decimals)
        const tokenInAddress = getSwapAddress(tokenIn)
        const tokenOutAddress = getSwapAddress(tokenOut)
        const deadline = BigInt(Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE)

        // Calculate minimum amount out with slippage
        const slippageMultiplier = BigInt(10000 - DEFAULT_SLIPPAGE)
        const amountOutMin = (minAmountOut * slippageMultiplier) / BigInt(10000)

        const isETHIn = isNativeETH(tokenIn)
        const isETHOut = isNativeETH(tokenOut)

        // Encode the swap call
        const swapData = encodeFunctionData({
          abi: SWAP_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [
            {
              tokenIn: tokenInAddress,
              tokenOut: tokenOutAddress,
              fee: DEFAULT_FEE_TIER,
              recipient: isETHOut ? UNISWAP_CONTRACTS.sepolia.swapRouter : address,
              amountIn: amountInRaw,
              amountOutMinimum: amountOutMin,
              sqrtPriceLimitX96: BigInt(0),
            },
          ],
        })

        // Execute the swap using multicall with deadline
        const hash = await walletClient.writeContract({
          address: UNISWAP_CONTRACTS.sepolia.swapRouter,
          abi: SWAP_ROUTER_ABI,
          functionName: 'multicall',
          args: [deadline, [swapData]],
          value: isETHIn ? amountInRaw : BigInt(0),
        })

        return hash
      } catch (err) {
        console.error('Swap error:', err)
        setError('Swap failed. Please try again.')
        return null
      } finally {
        setIsSwapping(false)
      }
    },
    [walletClient, address, publicClient]
  )

  return {
    quote,
    isLoadingQuote,
    isSwapping,
    error,
    getQuote,
    executeSwap,
    needsApproval,
    approve,
  }
}
