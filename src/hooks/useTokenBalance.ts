'use client'

import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { TokenInfo } from '@/types'
import { NATIVE_ETH_ADDRESS, ERC20_ABI } from '@/constants'

interface UseTokenBalanceReturn {
  balance: string
  balanceRaw: bigint
  isLoading: boolean
  refetch: () => void
}

export function useTokenBalance(token: TokenInfo | null): UseTokenBalanceReturn {
  const { address } = useAccount()

  const isNativeETH = token?.address.toLowerCase() === NATIVE_ETH_ADDRESS.toLowerCase()

  // Native ETH balance
  const { data: ethBalance, isLoading: isLoadingEth, refetch: refetchEth } = useBalance({
    address,
    query: {
      enabled: !!address && isNativeETH,
    },
  })

  // ERC20 token balance
  const { data: tokenBalance, isLoading: isLoadingToken, refetch: refetchToken } = useReadContract({
    address: token?.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!token && !isNativeETH,
    },
  })

  if (!token || !address) {
    return {
      balance: '0',
      balanceRaw: BigInt(0),
      isLoading: false,
      refetch: () => {},
    }
  }

  if (isNativeETH) {
    return {
      balance: ethBalance ? formatUnits(ethBalance.value, 18) : '0',
      balanceRaw: ethBalance?.value ?? BigInt(0),
      isLoading: isLoadingEth,
      refetch: refetchEth,
    }
  }

  return {
    balance: tokenBalance ? formatUnits(tokenBalance as bigint, token.decimals) : '0',
    balanceRaw: (tokenBalance as bigint) ?? BigInt(0),
    isLoading: isLoadingToken,
    refetch: refetchToken,
  }
}
