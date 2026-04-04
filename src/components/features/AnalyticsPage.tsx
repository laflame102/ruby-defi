'use client'

import { useState } from 'react'
import { useAnalytics } from '@/hooks'
import type { GlobalTvlPoint, ChainTvl, ProtocolEntry, VolumeProtocol, FeeProtocol } from '@/types'

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

function fmtChange(n: number | null): { text: string; pos: boolean | null } {
  if (n === null || n === undefined || isNaN(n)) return { text: '—', pos: null }
  return { text: `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`, pos: n >= 0 }
}

function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CHAIN_COLORS: Record<string, string> = {
  ethereum:  '#627eea',
  bsc:       '#f0b90b',
  tron:      '#ef0027',
  solana:    '#9945ff',
  arbitrum:  '#28a0f0',
  polygon:   '#8247e5',
  base:      '#0052ff',
  avalanche: '#e84142',
  optimism:  '#ff0420',
  sui:       '#4ea3df',
  fantom:    '#1969ff',
  near:      '#00c08b',
  bitcoin:   '#f7931a',
  aptos:     '#00c2b3',
}

const BAR_COLORS = [
  '#4ade80', '#60a5fa', '#f59e0b', '#a78bfa',
  '#f87171', '#34d399', '#fb923c', '#818cf8',
  '#e879f9', '#2dd4bf',
]

function chainColor(name: string): string {
  return CHAIN_COLORS[name.toLowerCase()] ?? '#4ade80'
}

function SparklineChart({ data }: { data: GlobalTvlPoint[] }) {
  const points = data.slice(-90)
  if (points.length < 2) {
    return <div className="w-full h-36 flex items-center justify-center text-gray-700 text-sm">No data</div>
  }

  const W = 800
  const H = 144
  const pL = 4, pR = 4, pT = 8, pB = 8
  const iW = W - pL - pR
  const iH = H - pT - pB

  const tvls = points.map(p => p.tvl)
  const min = Math.min(...tvls)
  const max = Math.max(...tvls)
  const range = max - min || 1

  const x = (i: number) => pL + (i / (points.length - 1)) * iW
  const y = (v: number) => pT + (1 - (v - min) / range) * iH

  const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.tvl).toFixed(1)}`).join(' ')
  const lx = x(points.length - 1)
  const ly = y(points[points.length - 1].tvl)

  const area = [
    `M${pL},${pT + iH}`,
    ...points.map((p, i) => `L${x(i).toFixed(1)},${y(p.tvl).toFixed(1)}`),
    `L${lx},${pT + iH}`,
    'Z',
  ].join(' ')

  const isUp = points[points.length - 1].tvl >= points[0].tvl

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" preserveAspectRatio="none">
        <defs>
          <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isUp ? '#4ade80' : '#f87171'} stopOpacity="0.22" />
            <stop offset="100%" stopColor={isUp ? '#4ade80' : '#f87171'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#tvlGrad)" />
        <polyline
          points={line}
          fill="none"
          stroke={isUp ? '#4ade80' : '#f87171'}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={lx} cy={ly} r="3" fill={isUp ? '#4ade80' : '#f87171'} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-gray-600 text-[10px] font-mono mt-1 px-1">
        <span>{fmtDate(points[0].date)}</span>
        <span className="text-gray-700">90 days</span>
        <span>{fmtDate(points[points.length - 1].date)}</span>
      </div>
    </div>
  )
}

function ProtocolLogo({ src, name, size = 24 }: { src?: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const palette = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-yellow-600', 'bg-rose-600', 'bg-cyan-600']
  const bg = palette[name.charCodeAt(0) % palette.length]
  const dim = size === 24 ? 'w-6 h-6' : 'w-8 h-8'
  const fs = size === 24 ? '9px' : '11px'

  if (!src || failed) {
    return (
      <div className={`${dim} rounded-full ${bg} flex items-center justify-center text-white font-bold shrink-0`} style={{ fontSize: fs }}>
        {name.charAt(0).toUpperCase()}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={name}
      className={`${dim} rounded-full object-cover shrink-0 bg-gray-800`}
      onError={() => setFailed(true)}
    />
  )
}

function StatCard({
  label,
  value,
  sub,
  subColor,
  loading,
  accent,
}: {
  label: string
  value: string
  sub?: string
  subColor?: string
  loading: boolean
  accent?: boolean
}) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">{label}</div>
      {loading ? (
        <>
          <div className="w-32 h-7 bg-gray-800 rounded animate-pulse mb-2" />
          <div className="w-20 h-3 bg-gray-800/70 rounded animate-pulse" />
        </>
      ) : (
        <>
          <div className={`font-mono font-bold text-2xl ${accent ? 'text-green-400' : 'text-white'}`}>{value}</div>
          {sub && <div className={`mt-1.5 text-xs font-mono font-medium ${subColor ?? 'text-gray-600'}`}>{sub}</div>}
        </>
      )}
    </div>
  )
}

function ChainBreakdown({ chains, loading }: { chains: ChainTvl[]; loading: boolean }) {
  const top = chains.slice(0, 12)
  const topTotal = top.reduce((s, c) => s + c.tvl, 0)

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-800 shrink-0">
        <h2 className="text-white font-semibold text-sm">TVL by Chain</h2>
        <p className="text-gray-600 text-xs mt-0.5">Top {loading ? '—' : top.length} chains ranked by TVL</p>
      </div>

      {!loading && top.length > 0 && (
        <div className="px-5 pt-4 pb-2 shrink-0">
          <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
            {top.map(c => (
              <div
                key={c.name}
                title={`${c.name}: ${fmtUsd(c.tvl)}`}
                style={{ width: `${(c.tvl / topTotal) * 100}%`, backgroundColor: chainColor(c.name) }}
                className="transition-all duration-700 first:rounded-l-full last:rounded-r-full"
              />
            ))}
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-800/50 overflow-y-auto flex-1">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-4 h-3 bg-gray-800 rounded animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse" />
                <div className="w-28 h-3 bg-gray-800 rounded animate-pulse flex-1" />
                <div className="w-20 h-3 bg-gray-800/70 rounded animate-pulse" />
              </div>
            ))
          : top.map((chain, i) => {
              const pct = topTotal > 0 ? (chain.tvl / topTotal) * 100 : 0
              const color = chainColor(chain.name)
              return (
                <div key={chain.name} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors">
                  <span className="text-gray-600 font-mono text-xs w-4 text-right shrink-0">{i + 1}</span>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-gray-300 text-sm font-medium flex-1 truncate">{chain.name}</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-white font-mono text-xs w-20 text-right">{fmtUsd(chain.tvl)}</span>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}

function ProtocolLeaderboard({ protocols, loading }: { protocols: ProtocolEntry[]; loading: boolean }) {
  const maxTvl = protocols[0]?.tvl ?? 1

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-800 shrink-0">
        <h2 className="text-white font-semibold text-sm">Top Protocols</h2>
        <p className="text-gray-600 text-xs mt-0.5">Ranked by total value locked</p>
      </div>
      <div className="divide-y divide-gray-800/50 overflow-y-auto flex-1 max-h-[480px]">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-6 h-6 rounded-full bg-gray-800 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-28 h-3 bg-gray-800 rounded animate-pulse" />
                  <div className="w-16 h-2 bg-gray-800/70 rounded animate-pulse" />
                </div>
                <div className="w-20 h-3 bg-gray-800/70 rounded animate-pulse" />
              </div>
            ))
          : protocols.slice(0, 25).map((p, i) => {
              const pct = maxTvl > 0 ? (p.tvl / maxTvl) * 100 : 0
              const chg = fmtChange(p.change_1d)
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors">
                  <span className="text-gray-600 font-mono text-xs w-4 text-right shrink-0">{i + 1}</span>
                  <ProtocolLogo src={p.logo} name={p.name} />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-200 text-sm font-medium truncate">{p.name}</div>
                    <div className="text-gray-600 text-[10px] capitalize truncate">{p.category ?? p.chain}</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500/60 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-right w-20">
                      <div className="text-white font-mono text-xs">{fmtUsd(p.tvl)}</div>
                      <div className={`text-[10px] font-mono ${chg.pos ? 'text-green-400' : chg.pos === false ? 'text-red-400' : 'text-gray-600'}`}>
                        {chg.text}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}

type TableRow = VolumeProtocol | FeeProtocol

function VolumeTable({
  rows,
  total,
  loading,
}: {
  rows: TableRow[]
  total: number
  loading: boolean
}) {
  const maxVal = (rows[0]?.total24h ?? 0) || 1

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-gray-800">
          <th className="px-5 py-3 text-left w-8 text-gray-600 text-xs font-medium">#</th>
          <th className="px-3 py-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wider">Protocol</th>
          <th className="px-3 py-3 text-right text-gray-500 text-xs font-medium uppercase tracking-wider">24h</th>
          <th className="px-3 py-3 text-right text-gray-500 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">7d</th>
          <th className="px-5 py-3 text-right text-gray-500 text-xs font-medium uppercase tracking-wider">Share</th>
        </tr>
      </thead>
      <tbody>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-800/40">
                <td className="px-5 py-3"><div className="w-4 h-3 bg-gray-800 rounded animate-pulse" /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gray-800 animate-pulse" />
                    <div className="w-28 h-3 bg-gray-800 rounded animate-pulse" />
                  </div>
                </td>
                <td className="px-3 py-3"><div className="w-20 h-3 bg-gray-800/70 rounded animate-pulse ml-auto" /></td>
                <td className="px-3 py-3 hidden sm:table-cell"><div className="w-20 h-3 bg-gray-800/70 rounded animate-pulse ml-auto" /></td>
                <td className="px-5 py-3"><div className="w-24 h-2 bg-gray-800/70 rounded-full animate-pulse ml-auto" /></td>
              </tr>
            ))
          : rows.map((p, i) => {
              const vol24 = p.total24h ?? 0
              const vol7 = p.total7d ?? 0
              const pct = maxVal > 0 ? (vol24 / maxVal) * 100 : 0
              const share = total > 0 ? (vol24 / total) * 100 : 0
              const color = BAR_COLORS[i % BAR_COLORS.length]
              return (
                <tr key={p.name} className="border-b border-gray-800/40 hover:bg-gray-800/25 transition-colors">
                  <td className="px-5 py-3 text-gray-600 text-xs font-mono">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <ProtocolLogo src={p.logo} name={p.displayName ?? p.name} />
                      <div>
                        <div className="text-gray-200 text-sm font-medium">{p.displayName ?? p.name}</div>
                        {p.chains?.length > 0 && (
                          <div className="text-gray-600 text-[10px]">
                            {p.chains.slice(0, 3).join(', ')}{p.chains.length > 3 ? ` +${p.chains.length - 3}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-white font-mono text-sm">{vol24 ? fmtUsd(vol24) : '—'}</span>
                  </td>
                  <td className="px-3 py-3 text-right hidden sm:table-cell">
                    <span className="text-gray-400 font-mono text-xs">{vol7 ? fmtUsd(vol7) : '—'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-gray-500 font-mono text-[10px] w-10 text-right">{share.toFixed(1)}%</span>
                      <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
      </tbody>
    </table>
  )
}

export function AnalyticsPage() {
  const {
    tvlHistory, chains, protocols, dexs, fees,
    totalTvl, totalDexVolume24h, totalFees24h, tvlChange24h,
    isLoading, error, tab, setTab,
  } = useAnalytics()

  const change = fmtChange(tvlChange24h)
  const activeRows: TableRow[] = tab === 'dexs' ? dexs : fees
  const activeTotal = tab === 'dexs' ? totalDexVolume24h : totalFees24h

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DeFi Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">On-chain protocol data · Powered by DeFi Llama</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800/60 border border-gray-700/50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
          {!isLoading && (
            <span className="text-xs text-gray-600 bg-gray-800/60 border border-gray-700/50 px-3 py-1.5 rounded-full font-mono">
              {protocols.length} protocols · {chains.length} chains
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total DeFi TVL"
          value={fmtUsd(totalTvl)}
          sub={`${change.text} 24h`}
          subColor={change.pos ? 'text-green-400' : change.pos === false ? 'text-red-400' : 'text-gray-600'}
          loading={isLoading}
          accent
        />
        <StatCard
          label="DEX Volume 24h"
          value={fmtUsd(totalDexVolume24h)}
          sub="across all DEXs"
          loading={isLoading}
        />
        <StatCard
          label="Protocol Fees 24h"
          value={fmtUsd(totalFees24h)}
          sub="all protocols"
          loading={isLoading}
        />
        <StatCard
          label="Coverage"
          value={isLoading ? '—' : `${chains.length} chains`}
          sub={isLoading ? undefined : `${protocols.length} protocols tracked`}
          loading={isLoading}
        />
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold text-sm">Total Value Locked</h2>
            <p className="text-gray-600 text-xs mt-0.5">90-day history · all chains</p>
          </div>
          {!isLoading && totalTvl > 0 && (
            <div className="text-right">
              <div className="text-white font-mono font-bold text-lg">{fmtUsd(totalTvl)}</div>
              <div className={`text-xs font-mono mt-0.5 ${change.pos ? 'text-green-400' : change.pos === false ? 'text-red-400' : 'text-gray-500'}`}>
                {change.text} 24h
              </div>
            </div>
          )}
        </div>
        {isLoading
          ? <div className="w-full h-36 bg-gray-800/50 rounded-xl animate-pulse" />
          : <SparklineChart data={tvlHistory} />
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChainBreakdown chains={chains} loading={isLoading} />
        <ProtocolLeaderboard protocols={protocols} loading={isLoading} />
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center border-b border-gray-800">
          {(['dexs', 'fees'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                tab === t
                  ? 'text-white border-green-400'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {t === 'dexs' ? 'DEX Volumes' : 'Protocol Fees'}
            </button>
          ))}
          <div className="ml-auto px-5">
            <span className="text-xs text-gray-600 font-mono">
              Total 24h: {isLoading ? '—' : fmtUsd(activeTotal)}
            </span>
          </div>
        </div>
        <VolumeTable rows={activeRows} total={activeTotal} loading={isLoading} />
      </div>

    </div>
  )
}
