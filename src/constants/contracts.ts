// Uniswap V3 Contract Addresses on Sepolia
export const UNISWAP_CONTRACTS = {
  sepolia: {
    swapRouter: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E' as `0x${string}`,
    quoterV2: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3' as `0x${string}`,
    factory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c' as `0x${string}`,
    positionManager: '0x1238536071E1c677A632429e3655c799b22cDA52' as `0x${string}`,
  },
} as const

// Default fee tier for swaps (0.3%)
export const DEFAULT_FEE_TIER = 3000

// Slippage tolerance (0.5%)
export const DEFAULT_SLIPPAGE = 50 // basis points (0.5%)

// Deadline for transactions (20 minutes)
export const DEFAULT_DEADLINE = 20 * 60
