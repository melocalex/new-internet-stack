import { useEffect } from "react";
import Hero from "./components/Hero";
import Thesis from "./components/Thesis";
import StackSection from "./components/StackSection";
import SovereignPath from "./components/SovereignPath";
import Speakers from "./components/Speakers";
import Program from "./components/Program";
import PastEvents from "./components/PastEvents";
import Sponsors from "./components/Sponsors";
import CouponCTA from "./components/CouponCTA";
import SiteFooter from "./components/SiteFooter";
import { initTelemetry, useScrollDepth } from "./lib/telemetry";
import { useScrollReveal } from "./lib/reveal";

function App() {
  useScrollDepth();
  useScrollReveal();

  useEffect(() => {
    initTelemetry();

    // Stop placeholder href="#" links from jumping to the top.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href="#"]');
      if (anchor) e.preventDefault();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <div className="relative z-10">
        <Hero />
        <SovereignPath />
        <Thesis />
        <StackSection />
        <Speakers />
        <Program />
        <PastEvents />
        <Sponsors />
        <CouponCTA />
        <SiteFooter />
      </div>
    </>
  );
}

export default App;
