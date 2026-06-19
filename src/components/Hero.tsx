import { useEffect, useState } from "react";
import Button3D from "./Button3D";
import CryptoLarLogo from "./CryptoLarLogo";
import HeroLightning from "./HeroLightning";
import { track } from "../lib/telemetry";

// Full words; all white except Bitcoin (orange).
const ROTATING_WORDS = [
  { text: "Internet", color: "#ffffff", glow: "rgba(255,255,255,0)" },
  { text: "Intelligence", color: "#ffffff", glow: "rgba(255,255,255,0)" },
  { text: "Bitcoin", color: "#f7a23b", glow: "rgba(247,162,59,0.5)" },
  { text: "Stablecoins", color: "#ffffff", glow: "rgba(255,255,255,0)" },
  { text: "Sovereignty", color: "#ffffff", glow: "rgba(255,255,255,0)" },
];

/** Cycles the middle title word every 2s with a fade/blur-in transition. */
const RotatingWord = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setI((p) => (p + 1) % ROTATING_WORDS.length),
      2000,
    );
    return () => window.clearInterval(id);
  }, []);
  const word = ROTATING_WORDS[i];
  return (
    <span
      key={i}
      className="rotating-word"
      style={{
        color: word.color,
        textShadow: `0 0 24px ${word.glow}, 0 2px 10px rgba(5,6,10,0.85)`,
      }}
    >
      {word.text}
    </span>
  );
};

const Hero = () => {
  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
      {/* Lightning — its own canvas, contained to the hero (scrolls away with it) */}
      <HeroLightning className="absolute inset-0 z-0 h-full w-full" />

      {/* Atmospheric overlays for depth + legibility (over the WebGL canvas) */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(5,6,10,0) 45%, rgba(5,6,10,0.4) 78%, rgba(5,6,10,0.92) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48"
        style={{
          background: "linear-gradient(to top, #05060a 10%, rgba(5,6,10,0) 100%)",
        }}
      />
      {/* Focused scrim behind the title so the type always has contrast over the bolt */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(5,6,10,0.8) 0%, rgba(5,6,10,0.45) 45%, rgba(5,6,10,0) 72%)",
        }}
      />

      {/* Nav — gold logo upper-left */}
      <header className="absolute inset-x-0 top-0 z-30">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <a
            href="https://www.cryptolar.com.br/"
            aria-label="CryptoLar"
            className="block transition hover:brightness-110"
          >
            <CryptoLarLogo className="h-7 w-auto sm:h-8" />
          </a>
          <Button3D
            href="#ingressos"
            variant="gold"
            size="sm"
            onClick={() => track("nav_ingressos_click", { from: "hero" })}
          >
            Ingressos
          </Button3D>
        </nav>
      </header>

      {/* Above the fold: only the title */}
      <div className="relative z-20 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <h1
          data-reveal
          style={{
            textShadow:
              "0 2px 30px rgba(5,6,10,0.9), 0 1px 6px rgba(5,6,10,0.85)",
          }}
          className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          The New
          <br />
          <RotatingWord />{" "}
          <span className="electric-word" data-text="Stack">
            Stack
          </span>
        </h1>
      </div>

      {/* Scroll cue */}
      <a
        href="#tese"
        className="absolute inset-x-0 bottom-7 z-20 mx-auto flex w-fit flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/55 transition hover:text-white"
      >
        <span>01 Ago 2026 · Florianópolis</span>
        <svg
          className="scroll-cue h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
};

export default Hero;
