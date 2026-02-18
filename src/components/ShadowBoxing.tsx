const ShadowBoxing = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="border border-glow-gold rounded-lg p-12 md:p-16 bg-card-gradient box-glow-gold relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
          
          <p className="font-mono text-sm tracking-widest text-secondary mb-6 uppercase">Killer Feature</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground mb-6">
            Shadow <span className="text-secondary text-glow-gold">Boxing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Your wallet-derived fighter trains while you sleep, challenging other wallets automatically. 
            Wake up to see your "Ethereum OG" defended the title against a "Solana Degen" at 3 AM — 
            earning you USDC from the prediction pool.
          </p>
          <button className="px-8 py-4 bg-secondary text-secondary-foreground font-display text-xl tracking-wider rounded-md hover:opacity-90 transition-opacity box-glow-gold">
            Join the Waitlist
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShadowBoxing;
