import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const ShadowBoxing = () => {
  return (
    <section id="waitlist" className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-3xl mx-auto text-center">
        <AnimatedSection>
          <div className="relative border border-secondary/15 rounded-lg p-12 md:p-20 bg-card-gradient overflow-hidden">
            {/* Subtle edge lines */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
            
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-secondary/4 blur-[120px] pointer-events-none" />

            <div className="relative">
              <p className="font-mono text-[10px] tracking-[0.35em] text-secondary/60 mb-6 uppercase">Killer Feature</p>
              <h2 className="text-5xl md:text-7xl font-display text-foreground mb-6">
                Shadow <span className="text-secondary text-glow-gold">Boxing</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground/70 max-w-lg mx-auto mb-12 leading-relaxed">
                Your wallet-derived fighter trains while you sleep, challenging other wallets automatically. 
                Wake up to see your "Ethereum OG" defended the title against a "Solana Degen" at 3 AM — 
                earning you USDC from the prediction pool.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-secondary text-secondary-foreground font-display text-xl tracking-wider rounded-md transition-shadow duration-500 hover:shadow-[0_0_40px_hsl(42_90%_55%/0.2)]"
              >
                Join the Waitlist
              </motion.button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ShadowBoxing;
