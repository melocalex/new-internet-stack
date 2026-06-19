import { useEffect, useRef, useState } from "react";
import Button3D from "./Button3D";
import CryptoLarLogo from "./CryptoLarLogo";
import { track, useSectionView } from "../lib/telemetry";
import { LAYER_COLORS } from "../lib/layers";

// TODO: confirmar números reais
const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 30, suffix: "+", label: "Eventos realizados" },
  { value: 5000, suffix: "+", label: "Participantes" },
  { value: 12, suffix: "", label: "Cidades" },
  { value: 40, suffix: "+", label: "Comunidades parceiras" },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Self-contained count-up: tweens 0 → target once the block scrolls into view. */
const useCountUp = (target: number) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: render the final value immediately, no tween.
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      const duration = 1200; // ~1.2s
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setValue(Math.round(easeOut(t) * target));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            run();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return { ref, value };
};

const formatPtBR = (n: number) => n.toLocaleString("pt-BR");

interface StatProps {
  value: number;
  suffix: string;
  label: string;
}

const Stat = ({ value, suffix, label }: StatProps) => {
  const { ref, value: current } = useCountUp(value);
  return (
    <div
      ref={ref}
      data-reveal
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition hover:border-volt/40 hover:bg-volt/[0.06]"
    >
      <div className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {formatPtBR(current)}
        {suffix}
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-wide text-white/50">
        {label}
      </div>
    </div>
  );
};

interface Tile {
  caption: string;
  accent: string;
  aftermovie?: boolean;
}

// TODO: confirmar legendas / cidades reais
const GALLERY: Tile[] = [
  { caption: "Hackathon · São Paulo 2025", accent: LAYER_COLORS[0] },
  { caption: "Aftermovie · CryptoLar 2025", accent: "#6f7bff", aftermovie: true },
  { caption: "Meetup · Florianópolis", accent: LAYER_COLORS[1] },
  { caption: "Workshop · on-chain", accent: LAYER_COLORS[2] },
  { caption: "Summit · Rio de Janeiro", accent: LAYER_COLORS[3] },
  { caption: "Builders Day · Curitiba", accent: "#6f7bff" },
  { caption: "Painel · Stablecoins & PIX", accent: LAYER_COLORS[0] },
  { caption: "Self-custody · Workshop", accent: LAYER_COLORS[3] },
];

const GalleryTile = ({ tile }: { tile: Tile }) => {
  return (
    <figure
      data-reveal
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-volt/40"
    >
      {/* TODO: replace placeholder image — drop a real <img src=... /> here */}
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
        style={{
          backgroundImage: `radial-gradient(120% 120% at 20% 10%, ${tile.accent}33 0%, transparent 55%), linear-gradient(135deg, rgba(111,123,255,0.12) 0%, rgba(5,6,10,0.4) 100%)`,
        }}
        aria-hidden
      />
      {/* subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      {tile.aftermovie && (
        <a
          href="#"
          // TODO: real aftermovie URL
          onClick={(e) => {
            e.preventDefault();
            track("external_link_click", { to: "aftermovie" });
          }}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Assistir aftermovie"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-ink/40 backdrop-blur-[2px] transition group-hover:scale-110 group-hover:border-volt/60">
            <svg
              viewBox="0 0 24 24"
              className="ml-1 h-6 w-6 fill-white"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </a>
      )}

      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
          {tile.caption}
        </span>
      </figcaption>
    </figure>
  );
};

const PastEvents = () => {
  const ref = useSectionView<HTMLElement>("cryptolar");

  return (
    <section id="cryptolar" ref={ref} className="relative z-10 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        {/* Eyebrow + heading + about copy */}
        <p
          data-reveal
          className="font-mono text-[11px] uppercase tracking-[0.35em] text-volt-bright"
        >
          O Host
        </p>
        <h2 data-reveal className="mt-5">
          <CryptoLarLogo className="h-11 w-auto sm:h-14" />
        </h2>
        <p
          data-reveal
          className="mt-6 max-w-3xl text-lg leading-relaxed text-white/70"
        >
          Uma das maiores iniciativas de educação e eventos Web3 do Brasil —
          conectando builders, founders, pesquisadores e investidores por meio de
          encontros técnicos, hackathons e experiências presenciais de alto sinal.
        </p>

        {/* Stat counters */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>

        {/* Recap gallery */}
        <div className="mt-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">
            Recap
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {GALLERY.map((tile) => (
              <GalleryTile key={tile.caption} tile={tile} />
            ))}
          </div>
        </div>

        {/* Links row */}
        <div className="mt-16 flex flex-wrap items-center gap-4">
          <Button3D
            variant="volt"
            size="md"
            href="https://www.cryptolar.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("external_link_click", { to: "site" })}
          >
            cryptolar.com.br
          </Button3D>
          <Button3D
            variant="dark"
            size="sm"
            href="https://x.com/CryptoLarBrasil"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("external_link_click", { to: "x" })}
          >
            @CryptoLarBrasil
          </Button3D>
        </div>
      </div>
    </section>
  );
};

export default PastEvents;
