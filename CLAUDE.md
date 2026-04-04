# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (uses --max-old-space-size=4096)
- `npm run build` — build for production, also used to verify code compiles
- `npm run lint` — run ESLint (eslint-config-next with core-web-vitals + TypeScript)
- No test framework is configured

## Code Style

- Always use TypeScript with full types
- Do not write comments
- Use `@/*` path alias (maps to `./src/*`)
- Tailwind CSS v4 for styling

## Architecture

Next.js 16 App Router DeFi application (React 19). Three pages: swap, earn, portfolio.

**Web3 stack:** Reown AppKit + Wagmi + viem + TanStack Query. Wallet connection via WalletConnect (requires `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in .env.local). Default network is Sepolia testnet.

**Provider hierarchy** (in layout.tsx): `Web3Provider` wraps the entire app, which contains `WagmiProvider` > `QueryClientProvider`. AppKit is initialized as a side effect in `Web3Provider`.

**Swap feature:** Uses Uniswap V3 on Sepolia. `useSwap` hook handles quoting (QuoterV2), ERC20 approval, and swap execution (SwapRouter02) via viem's `simulateContract`/`writeContract`. Native ETH is represented by `0xEeee...eEEeE` sentinel address and automatically mapped to WETH for Uniswap calls.

**Earn feature:** Fetches lending pool data from DefiLlama Yields API (`defiLlama.ts` service), filtered to supported protocols (Aave V3, Compound V3, Spark, Morpho Blue, Fluid, Euler, Venus) on supported chains (Ethereum, Base, Arbitrum, Optimism, Polygon).

**Folder conventions:**
- `src/components/features/` — page-level feature components
- `src/components/layout/` — app shell (Header)
- `src/components/ui/` — reusable primitives (Button, ConnectButton)
- `src/constants/` — contract addresses, ABIs, token lists, fee/slippage defaults
- `src/hooks/` — custom React hooks (useSwap, usePools, useTokenBalance)
- `src/services/` — external API integrations
- `src/types/` — shared TypeScript interfaces
- Each folder uses barrel exports via `index.ts`
