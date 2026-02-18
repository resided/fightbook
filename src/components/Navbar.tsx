import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Loop", href: "#core-loop" },
  { label: "DNA", href: "#fighter-genesis" },
  { label: "Experience", href: "#fight-experience" },
  { label: "Stack", href: "#tech-stack" },
  { label: "Roadmap", href: "#roadmap" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/60 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <a href="#" className="font-display text-2xl text-foreground tracking-wider">
          SHOWCASE
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground px-4 py-2 rounded-md hover:bg-muted/40 transition-all duration-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="#waitlist"
          className="font-mono text-[11px] tracking-widest uppercase px-5 py-2.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-300"
        >
          Join Waitlist
        </a>
      </div>
    </motion.nav>
  );
};

export default Navbar;
