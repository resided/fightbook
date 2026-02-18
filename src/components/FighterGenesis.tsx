const stats = [
  { label: "Wallet Age", stat: "Stamina / Chin", description: "Older wallets produce tougher fighters with iron chins", icon: "🧬" },
  { label: "TX Frequency", stat: "Hand Speed", description: "High-frequency traders throw combinations faster", icon: "⚡" },
  { label: "Volume Moved", stat: "Power", description: "Whale wallets hit harder — knockout potential scales with TVL", icon: "💎" },
  { label: "Protocol Diversity", stat: "Fight IQ", description: "DeFi + NFT + DAO interaction = technical versatility", icon: "🧠" },
  { label: "REKT Events", stat: "Scar Tissue", description: "Liquidations and losses build damage resistance", icon: "🩸" },
  { label: "NFT Holdings", stat: "Corner Team", description: "Your community becomes your ringside crew", icon: "🎭" },
];

const FighterGenesis = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-20">
          <p className="font-mono text-sm tracking-widest text-secondary mb-4 uppercase">Fighter Mint</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            Your Wallet Is Your <span className="text-secondary text-glow-gold">DNA</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg">
            No randomness. No pay-to-win. Your fighter's stats are archaeologically mined from your on-chain history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((item, i) => (
            <div
              key={i}
              className="group relative bg-card-gradient border border-border rounded-lg p-6 hover:border-glow-gold transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{item.icon}</span>
                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {item.label}
                </span>
              </div>
              <h3 className="text-xl font-display text-secondary mb-2">{item.stat}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FighterGenesis;
