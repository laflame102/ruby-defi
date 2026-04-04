'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Button } from './Button'

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  if (isConnected && address) {
    return (
      <Button
        onClick={() => open({ view: 'Account' })}
        variant="secondary"
        size="sm"
        className="rounded-full flex items-center gap-2"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600" />
        {shortenAddress(address)}
      </Button>
    )
  }

  return (
    <Button
      onClick={() => open()}
      className="rounded-full"
    >
      Connect
    </Button>
  )
}
