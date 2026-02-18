import { motion } from "framer-motion";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";

const stats = [
  { label: "Wallet Age", stat: "Stamina / Chin", description: "Older wallets produce tougher fighters with iron chins" },
  { label: "TX Frequency", stat: "Hand Speed", description: "High-frequency traders throw combinations faster" },
  { label: "Volume Moved", stat: "Power", description: "Whale wallets hit harder — knockout potential scales with TVL" },
  { label: "Protocol Diversity", stat: "Fight IQ", description: "DeFi + NFT + DAO interaction = technical versatility" },
  { label: "REKT Events", stat: "Scar Tissue", description: "Liquidations and losses build damage resistance" },
  { label: "NFT Holdings", stat: "Corner Team", description: "Your community becomes your ringside crew" },
];

const FighterGenesis = () => {
  return (
    <section id="fighter-genesis" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <AnimatedSection className="text-center mb-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-secondary/70 mb-5 uppercase">Fighter Mint</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            Your Wallet Is Your <span className="text-secondary text-glow-gold">DNA</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            No randomness. No pay-to-win. Your fighter's stats are archaeologically mined from your on-chain history.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((item, i) => (
            <StaggerItem key={i}>
              <div className="group relative bg-card-gradient border border-border rounded-lg p-6 hover:border-secondary/25 hover:-translate-y-0.5 transition-all duration-500 hover:shadow-[0_0_30px_hsl(42_90%_55%/0.06)]">
                <div className="flex items-start justify-between mb-5">
                  {/* Geometric accent instead of emoji */}
                  <div className="w-8 h-8 rounded-sm border border-secondary/15 bg-secondary/5 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-secondary/40" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/50 tracking-wider uppercase">
                    {item.label}
                  </span>
                </div>
                <h3 className="text-xl font-display text-secondary/90 mb-2">{item.stat}</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">{item.description}</p>

                {/* Subtle bar indicator */}
                <motion.div
                  className="mt-5 h-px bg-gradient-to-r from-secondary/20 to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default FighterGenesis;
