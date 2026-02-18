import heroArena from "@/assets/hero-arena.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroArena}
          alt="Futuristic boxing arena"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-hero-gradient opacity-80" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-secondary/10 blur-[80px] animate-float pointer-events-none" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="animate-slide-up">
          <p className="font-mono text-sm tracking-[0.3em] text-primary mb-6 uppercase">
            Wallet-Derived AI Combat
          </p>
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-display text-foreground leading-[0.9] mb-8">
            Your Chain.
            <br />
            <span className="text-primary text-glow-cyan">Your Fighter.</span>
            <br />
            <span className="text-secondary text-glow-gold">Your Ring.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            On-chain identity meets AI-powered combat. Connect your wallet, mint a soulbound fighter, 
            and watch autonomous agents battle in cinematic 3D — with real stakes on the line.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-primary text-primary-foreground font-display text-xl tracking-wider rounded-md hover:opacity-90 transition-opacity box-glow-cyan">
              Connect Wallet
            </button>
            <button className="px-8 py-4 border border-glow-cyan text-primary font-display text-xl tracking-wider rounded-md hover:bg-primary/10 transition-colors">
              Watch a Fight
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-pulse-glow">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
