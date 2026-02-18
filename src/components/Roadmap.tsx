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
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <p className="font-mono text-sm tracking-widest text-secondary mb-4 uppercase">Development</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            Road to <span className="text-secondary text-glow-gold">Fight Night</span>
          </h2>
        </div>

        <div className="space-y-8">
          {phases.map((phase, i) => (
            <div
              key={i}
              className={`relative border rounded-lg p-8 md:p-10 bg-card-gradient transition-all duration-300 ${
                phase.status === "Active"
                  ? "border-glow-cyan box-glow-cyan"
                  : "border-border hover:border-glow-gold"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="shrink-0">
                  <span className="font-display text-5xl text-muted-foreground/30">
                    {phase.phase}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-3xl font-display text-foreground">{phase.title}</h3>
                    <span
                      className={`font-mono text-xs px-2 py-1 rounded ${
                        phase.status === "Active"
                          ? "bg-primary/20 text-primary"
                          : phase.status === "Next"
                          ? "bg-secondary/20 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {phase.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4">{phase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {phase.features.map((f, j) => (
                      <span
                        key={j}
                        className="font-mono text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-md"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
