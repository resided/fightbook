const Footer = () => (
  <footer className="border-t border-border/50 py-12 px-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <span className="font-display text-xl text-foreground/80 tracking-wider">SHOWCASE</span>
        <span className="font-mono text-[10px] text-muted-foreground/40 tracking-wider">v0.1</span>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground/40 tracking-wider">
        Built on Base · Powered by AI Agents · Settled On-Chain
      </p>
    </div>
  </footer>
);

export default Footer;
