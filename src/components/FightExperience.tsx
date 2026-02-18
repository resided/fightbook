const FightExperience = () => {
  const moments = [
    { time: "Pre-Fight", title: "Tale of the Tape", description: "Wallet stats compared side-by-side. On-chain history laid bare.", glow: "cyan" },
    { time: "Entrance", title: "Walk-In", description: "Music NFTs play. Community banners fly. Your collection is your crew.", glow: "gold" },
    { time: "Live", title: "AI Commentary", description: "GPT-powered play-by-play with ElevenLabs voice synthesis. Real-time analysis.", glow: "cyan" },
    { time: "Post-Fight", title: "Highlight NFT", description: "KO moment clipped, minted, stored on Arweave. Own the moment forever.", glow: "gold" },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-20">
          <p className="font-mono text-sm tracking-widest text-primary mb-4 uppercase">The Experience</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            <span className="text-primary text-glow-cyan">Watch</span> Party
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto text-lg">
            Not just a fight. A spectacle. Every match is a broadcast event.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {moments.map((m, i) => (
            <div
              key={i}
              className={`border rounded-lg p-8 bg-card-gradient transition-all duration-300 hover:scale-[1.02] ${
                m.glow === "cyan" ? "border-glow-cyan hover:box-glow-cyan" : "border-glow-gold hover:box-glow-gold"
              }`}
            >
              <span className={`font-mono text-xs tracking-widest uppercase ${
                m.glow === "cyan" ? "text-primary" : "text-secondary"
              }`}>
                {m.time}
              </span>
              <h3 className="text-3xl font-display text-foreground mt-2 mb-3">{m.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FightExperience;
