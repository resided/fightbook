const Footer = () => (
  <footer className="border-t border-border py-12 px-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <span className="font-display text-2xl text-foreground">Showcase</span>
        <span className="font-mono text-xs text-muted-foreground">v0.1</span>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Built on Base · Powered by AI Agents · Settled On-Chain
      </p>
    </div>
  </footer>
);

export default Footer;
