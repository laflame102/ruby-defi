import { SwapWidget } from '@/components/features'

export default function SwapPage() {
  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Promo Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full">
          <span className="text-green-400">⚡</span>
          <span className="text-gray-300 text-sm">
            Earn up to 10% on stables on{' '}
            <a href="#" className="text-green-400 hover:underline">
              Ruby Earn
            </a>
          </span>
        </div>
      </div>

      {/* Swap Widget */}
      <SwapWidget />
    </div>
  )
}
