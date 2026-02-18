const techStack = [
  { layer: "L2", tech: "Base", detail: "Low gas for frequent stat updates" },
  { layer: "NFTs", tech: "ERC-6551", detail: "Token-bound accounts hold fight history" },
  { layer: "Compute", tech: "Phala / Ritual", detail: "TEE-based confidential AI execution" },
  { layer: "Render", tech: "UE5 / Three.js", detail: "Cloud-rendered or browser-native 3D" },
  { layer: "Stream", tech: "Livepeer", detail: "Decentralized video infrastructure" },
  { layer: "Random", tech: "Chainlink VRF", detail: "Verifiable randomness for critical hits" },
  { layer: "Agents", tech: "ElizaOS", detail: "Autonomous fighter AI with memory" },
  { layer: "Markets", tech: "AMM", detail: "Polymarket-style prediction pools" },
];

const TechStack = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-sm tracking-widest text-primary mb-4 uppercase">Under The Hood</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            Tech <span className="text-primary text-glow-cyan">Stack</span>
          </h2>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/50 border-b border-border px-6 py-3">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Layer</span>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Technology</span>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Purpose</span>
          </div>
          {techStack.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 px-6 py-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors ${
                i % 2 === 0 ? "bg-card/50" : ""
              }`}
            >
              <span className="font-mono text-sm text-primary">{row.layer}</span>
              <span className="font-display text-lg text-foreground">{row.tech}</span>
              <span className="text-sm text-muted-foreground">{row.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
