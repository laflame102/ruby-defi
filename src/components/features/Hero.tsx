import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="flex-1 flex items-center justify-center px-4 py-30">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium">
            The Future of DeFi
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
          Decentralized Finance
          <br />
          <span className="text-white">Reimagined</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Trade, stake, and earn with next-generation protocols. Secure,
          transparent, and built for the future of finance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button variant="primary" size="lg">
            Launch App
          </Button>
          <Button variant="secondary" size="lg">
            Learn More
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div>
            <div className="text-3xl font-bold text-green-400">$2.4B</div>
            <div className="text-gray-500 text-sm">Total Value Locked</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">150K+</div>
            <div className="text-gray-500 text-sm">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">0.01%</div>
            <div className="text-gray-500 text-sm">Trading Fees</div>
          </div>
        </div>
      </div>
    </section>
  );
}
