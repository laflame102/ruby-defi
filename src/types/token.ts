export interface TokenInfo {
  address: `0x${string}`
  chainId: number
  decimals: number
  symbol: string
  name: string
  logoURI?: string
}

export interface SwapQuote {
  amountIn: string
  amountOut: string
  priceImpact: number
  route: string[]
  gasEstimate?: string
}

export interface SwapState {
  tokenIn: TokenInfo | null
  tokenOut: TokenInfo | null
  amountIn: string
  amountOut: string
  isLoading: boolean
  error: string | null
  quote: SwapQuote | null
}
