import { motion } from "framer-motion";
import heroArena from "@/assets/hero-arena.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <motion.img
          src={heroArena}
          alt="Futuristic boxing arena"
          className="w-full h-full object-cover opacity-30"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-hero-gradient opacity-85" />
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Ambient light */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-secondary/4 blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-primary/50" />
            <p className="font-mono text-[11px] tracking-[0.35em] text-primary/80 uppercase">
              Wallet-Derived AI Combat
            </p>
            <div className="h-px w-8 bg-primary/50" />
          </div>
        </motion.div>

        <motion.h1
          className="text-[clamp(3rem,8vw,9rem)] font-display text-foreground leading-[0.88] mb-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        >
          Your Chain.
          <br />
          <span className="text-primary text-glow-cyan">Your Fighter.</span>
          <br />
          <span className="text-secondary text-glow-gold">Your Ring.</span>
        </motion.h1>

        <motion.p
          className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-14 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
        >
          On-chain identity meets AI-powered combat. Connect your wallet, mint a soulbound fighter, 
          and watch autonomous agents battle in cinematic 3D — with real stakes on the line.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
        >
          <button className="group relative px-8 py-4 bg-primary text-primary-foreground font-display text-xl tracking-wider rounded-md overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_hsl(185_80%_50%/0.25)]">
            <span className="relative z-10">Connect Wallet</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
          <button className="px-8 py-4 border border-border text-muted-foreground font-display text-xl tracking-wider rounded-md hover:text-foreground hover:border-primary/30 transition-all duration-300">
            Watch a Fight
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center p-1.5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              className="w-0.5 h-2 bg-primary/60 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
