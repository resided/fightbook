import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";

const moments = [
  { time: "Pre-Fight", title: "Tale of the Tape", description: "Wallet stats compared side-by-side. On-chain history laid bare.", accent: "primary" as const },
  { time: "Entrance", title: "Walk-In", description: "Music NFTs play. Community banners fly. Your collection is your crew.", accent: "secondary" as const },
  { time: "Live", title: "AI Commentary", description: "GPT-powered play-by-play with ElevenLabs voice synthesis. Real-time analysis.", accent: "primary" as const },
  { time: "Post-Fight", title: "Highlight NFT", description: "KO moment clipped, minted, stored on Arweave. Own the moment forever.", accent: "secondary" as const },
];

const FightExperience = () => {
  return (
    <section id="fight-experience" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary/3 blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <AnimatedSection className="text-center mb-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-primary/70 mb-5 uppercase">The Experience</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            <span className="text-primary text-glow-cyan">Watch</span> Party
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Not just a fight. A spectacle. Every match is a broadcast event.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moments.map((m, i) => (
            <StaggerItem key={i}>
              <div
                className={`border rounded-lg p-8 bg-card-gradient transition-all duration-500 hover:-translate-y-1 ${
                  m.accent === "primary"
                    ? "border-border hover:border-primary/25 hover:shadow-[0_0_30px_hsl(185_80%_50%/0.06)]"
                    : "border-border hover:border-secondary/25 hover:shadow-[0_0_30px_hsl(42_90%_55%/0.06)]"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    m.accent === "primary" ? "bg-primary/60" : "bg-secondary/60"
                  }`} />
                  <span className={`font-mono text-[10px] tracking-[0.25em] uppercase ${
                    m.accent === "primary" ? "text-primary/60" : "text-secondary/60"
                  }`}>
                    {m.time}
                  </span>
                </div>
                <h3 className="text-3xl font-display text-foreground mb-3">{m.title}</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">{m.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default FightExperience;
