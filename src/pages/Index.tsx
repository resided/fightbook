import Hero from "@/components/Hero";
import CoreLoop from "@/components/CoreLoop";
import FighterGenesis from "@/components/FighterGenesis";
import FightExperience from "@/components/FightExperience";
import TechStack from "@/components/TechStack";
import Roadmap from "@/components/Roadmap";
import ShadowBoxing from "@/components/ShadowBoxing";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <CoreLoop />
      <FighterGenesis />
      <FightExperience />
      <TechStack />
      <Roadmap />
      <ShadowBoxing />
      <Footer />
    </div>
  );
};

export default Index;
