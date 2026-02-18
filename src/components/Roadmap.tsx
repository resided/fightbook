import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";

const phases = [
  {
    phase: "01",
    title: "Text Simulation",
    status: "Active",
    description: "CryptoKitties-style text battles with betting markets. Prove the wallet-stat algorithm works.",
    features: ["Wallet DNA extraction", "Text-based combat engine", "Basic prediction markets", "Stat validation"],
  },
  {
    phase: "02",
    title: "2D Sprite Combat",
    status: "Next",
    description: "Street Fighter II-style sprite animations. Test agent strategies with visual feedback.",
    features: ["Sprite-based animations", "AI agent v1 (strategy engine)", "Enhanced betting types", "Fight replays"],
  },
  {
    phase: "03",
    title: "Fight Night Broadcast",
    status: "Future",
    description: "Full 3D cinematic broadcast quality with UE5 cloud rendering and AI commentary.",
    features: ["UE5 cloud rendering", "AI commentary (ElevenLabs)", "Live round betting", "NFT highlight minting"],
  },
];

const Roadmap = () => {
  return (
    <section id="roadmap" className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-secondary/70 mb-5 uppercase">Development</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            Road to <span className="text-secondary text-glow-gold">Fight Night</span>
          </h2>
        </AnimatedSection>

        <StaggerContainer className="space-y-4">
          {phases.map((phase, i) => (
            <StaggerItem key={i}>
              <div
                className={`relative border rounded-lg p-8 md:p-10 bg-card-gradient transition-all duration-500 hover:-translate-y-0.5 ${
                  phase.status === "Active"
                    ? "border-primary/20 shadow-[0_0_30px_hsl(185_80%_50%/0.06)]"
                    : "border-border hover:border-secondary/20"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="shrink-0">
                    <span className="font-display text-5xl text-muted-foreground/15">
                      {phase.phase}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-3xl font-display text-foreground">{phase.title}</h3>
                      <span
                        className={`font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-full ${
                          phase.status === "Active"
                            ? "bg-primary/10 text-primary/80 border border-primary/15"
                            : phase.status === "Next"
                            ? "bg-secondary/10 text-secondary/80 border border-secondary/15"
                            : "bg-muted/50 text-muted-foreground/50 border border-border"
                        }`}
                      >
                        {phase.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground/70 mb-5">{phase.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.features.map((f, j) => (
                        <span
                          key={j}
                          className="font-mono text-[10px] bg-muted/40 text-muted-foreground/60 px-3 py-1.5 rounded-md border border-border/50"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Roadmap;
