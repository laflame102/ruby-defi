import { TokenInfo } from '@/types/token'

// Sepolia Chain ID
export const SEPOLIA_CHAIN_ID = 11155111

// Native ETH placeholder address
export const NATIVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as `0x${string}`

// Sepolia Tokens
export const SEPOLIA_TOKENS: TokenInfo[] = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    chainId: SEPOLIA_CHAIN_ID,
    decimals: 18,
    symbol: 'ETH',
    name: 'Ethereum',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  },
  {
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    chainId: SEPOLIA_CHAIN_ID,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    chainId: SEPOLIA_CHAIN_ID,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
    chainId: SEPOLIA_CHAIN_ID,
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  },
  {
    address: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
    chainId: SEPOLIA_CHAIN_ID,
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EescdeCB5BE3830/logo.png',
  },
  {
    address: '0x29f2D40B0605204364af54EC677bD022dA425d03',
    chainId: SEPOLIA_CHAIN_ID,
    decimals: 18,
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
  },
]

// WETH address on Sepolia
export const WETH_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' as `0x${string}`

// Get token by symbol
export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return SEPOLIA_TOKENS.find(t => t.symbol.toLowerCase() === symbol.toLowerCase())
}

// Get token by address
export function getTokenByAddress(address: string): TokenInfo | undefined {
  return SEPOLIA_TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase())
}
