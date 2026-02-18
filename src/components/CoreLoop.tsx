import { Wallet, Zap, TrendingUp, Shield, Swords, Eye } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    subtitle: "Wallet Archaeology",
    description: "Your on-chain history becomes your fighter's DNA. Age, velocity, volume — nothing is random.",
    accent: "primary" as const,
  },
  {
    icon: Zap,
    title: "Fighter Genesis",
    subtitle: "Soulbound Stats",
    description: "Non-transferable attributes minted from real blockchain behavior. Your degen score is showing.",
    accent: "secondary" as const,
  },
  {
    icon: Swords,
    title: "AI Agent Training",
    subtitle: "Agentic Brain",
    description: "LLM-powered fight agents with memory, strategy engines, and personality derived from wallet behavior.",
    accent: "primary" as const,
  },
  {
    icon: Eye,
    title: "Simulated Combat",
    subtitle: "Fight Night",
    description: "Cinematic 3D battles with AI commentary, broadcast-quality camera work, and real-time action.",
    accent: "secondary" as const,
  },
  {
    icon: TrendingUp,
    title: "Prediction Markets",
    subtitle: "On-Chain Settlement",
    description: "AMM-driven odds, moneyline bets, round betting, and live wagering between rounds.",
    accent: "primary" as const,
  },
  {
    icon: Shield,
    title: "On-Chain Settlement",
    subtitle: "Instant Resolution",
    description: "Oracle-attested outcomes settled instantly on Base. Transparent, trustless, permanent.",
    accent: "secondary" as const,
  },
];

const CoreLoop = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="font-mono text-sm tracking-widest text-primary mb-4 uppercase">The Core Loop</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            Wallet DNA → <span className="text-primary text-glow-cyan">Combat</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg">
            Six steps from wallet connection to settlement. Every stat is earned, every fight is unique, every outcome is on-chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`group relative bg-card-gradient border rounded-lg p-8 transition-all duration-500 hover:scale-[1.02] ${
                step.accent === "primary"
                  ? "border-glow-cyan hover:box-glow-cyan"
                  : "border-glow-gold hover:box-glow-gold"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-md flex items-center justify-center ${
                    step.accent === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">
                  Phase {i + 1}
                </span>
              </div>
              <h3 className="text-2xl font-display text-foreground mb-1">{step.title}</h3>
              <p className={`text-sm font-mono mb-3 ${step.accent === "primary" ? "text-primary/70" : "text-secondary/70"}`}>
                {step.subtitle}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreLoop;
