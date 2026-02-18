import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

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
    <section id="tech-stack" className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <p className="font-mono text-[11px] tracking-[0.3em] text-primary/70 mb-5 uppercase">Under The Hood</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            Tech <span className="text-primary text-glow-cyan">Stack</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="border border-border rounded-lg overflow-hidden bg-card/30">
            {/* Header */}
            <div className="grid grid-cols-[80px_1fr_1fr] md:grid-cols-[100px_1fr_1fr] bg-muted/30 border-b border-border px-6 py-3">
              <span className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-wider">Layer</span>
              <span className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-wider">Technology</span>
              <span className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-wider hidden md:block">Purpose</span>
            </div>
            {techStack.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-[80px_1fr_1fr] md:grid-cols-[100px_1fr_1fr] px-6 py-4 border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors duration-300 group"
              >
                <span className="font-mono text-[11px] text-primary/60 tracking-wider">{row.layer}</span>
                <span className="font-display text-lg text-foreground group-hover:text-primary/90 transition-colors duration-300">{row.tech}</span>
                <span className="text-sm text-muted-foreground/60 hidden md:block">{row.detail}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TechStack;
