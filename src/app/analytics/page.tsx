import type { Metadata } from 'next'
import { AnalyticsPage } from '@/components/features'

export const metadata: Metadata = {
  title: 'Analytics — Ruby DeFi',
  description: 'DeFi protocol analytics: TVL, DEX volumes, fees, and chain breakdown powered by DeFi Llama.',
}

export default function Page() {
  return <AnalyticsPage />
}
