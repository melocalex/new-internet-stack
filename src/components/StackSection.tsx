import { useEffect, useRef, useState } from "react";
import { registry, scrollState, updateScroll } from "../lib/scroll";
import { LAYER_COLORS } from "../lib/layers";
import { track } from "../lib/telemetry";
import LayersField from "./LayersField";

const LAYERS = [
  {
    n: "01",
    title: "AI",
    tag: "Camada de inteligência & interface",
    desc: "Onde o valor se acumula quando inteligência fica barata — e a ponte que liga AI ao resto: agentes + wallets + stablecoins = agentes econômicos autônomos.",
  },
  {
    n: "02",
    title: "Bitcoin",
    tag: "Camada de reserva & settlement",
    desc: "O estado real do protocolo, a regulação e a disputa institucional. O que avançou, o que está em jogo, e como instituições e indivíduos seguram o ativo.",
  },
  {
    n: "03",
    title: "Stablecoins",
    tag: "Camada de trilhos & pagamentos",
    desc: "Dólar on-chain, remessas, PIX e liquidação internacional. A infraestrutura financeira que os bancos não controlam — e quem perde poder na transição.",
  },
  {
    n: "04",
    title: "Proteção Patrimonial",
    tag: "Camada de propriedade & soberania",
    desc: "Self-custody, jurisdição, risco Brasil e segurança operacional. A parte mais prática do dia: o “e agora, o que eu faço com isso”.",
  },
];

const StackSection = () => {
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    registry.stackEl = ref.current;
    let raf = 0;
    const loop = () => {
      updateScroll();
      const i = Math.min(
        LAYERS.length - 1,
        Math.max(0, Math.floor(scrollState.stack * LAYERS.length)),
      );
      setActive((prev) => (prev !== i ? i : prev));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (registry.stackEl === ref.current) registry.stackEl = null;
    };
  }, []);

  useEffect(() => {
    track("stack_layer_view", { index: active, layer: LAYERS[active].title });
  }, [active]);

  const layer = LAYERS[active];
  const accent = LAYER_COLORS[active];

  return (
    <section
      id="camadas"
      ref={ref}
      className="relative z-10"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <LayersField className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-2">
          {/* Synced text panel */}
          <div className="max-w-lg rounded-3xl bg-ink/30 p-8 backdrop-blur-[2px] sm:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-volt-bright">
              As Camadas
            </p>

            <div key={active} className="layer-in mt-6 min-h-[260px]">
              <span
                className="font-mono text-sm font-medium"
                style={{ color: accent }}
              >
                {layer.n}
              </span>
              <h2 className="mt-2 font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
                {layer.title}
              </h2>
              <p
                className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                {layer.tag}
              </p>
              <p className="mt-5 text-base leading-relaxed text-white/70">
                {layer.desc}
              </p>
            </div>

            {/* progress indicators */}
            <div className="mt-8 flex gap-3">
              {LAYERS.map((l, i) => (
                <div key={l.n} className="flex-1">
                  <div
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        i <= active ? LAYER_COLORS[i] : "rgba(255,255,255,0.12)",
                      opacity: i === active ? 1 : i < active ? 0.6 : 1,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right half left open — the 3D slabs render here from the canvas */}
          <div aria-hidden className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
};

export default StackSection;
