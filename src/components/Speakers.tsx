import { useEffect, useState, type CSSProperties } from "react";
import Button3D from "./Button3D";
import { track, useSectionView } from "../lib/telemetry";
import { LAYER_COLORS } from "../lib/layers";

interface Speaker {
  number: string;
  time: string;
  accent: string;
  name: string;
  role: string;
  confirmed: boolean;
  talk: string;
  desc: string;
}

const SPEAKERS: Speaker[] = [
  {
    number: "01",
    time: "14h15",
    accent: LAYER_COLORS[0],
    name: "Alexandre Melo",
    role: "Founder · CryptoLar",
    confirmed: true,
    talk: "AI como camada operacional da internet",
    desc: "Onde o valor se acumula quando inteligência fica barata — e a ponte que liga AI ao resto: agentes + wallets + stablecoins = agentes econômicos autônomos.",
  },
  {
    number: "02",
    time: "15h00",
    accent: LAYER_COLORS[1],
    name: "A confirmar",
    role: "Speaker convidado",
    confirmed: false,
    talk: "Bitcoin em 2026: reserva, settlement e disputa regulatória",
    desc: "O estado real do protocolo, a regulação e a disputa institucional — e como instituições e indivíduos seguram o ativo.",
  },
  {
    number: "03",
    time: "16h00",
    accent: LAYER_COLORS[2],
    name: "A confirmar",
    role: "Speaker convidado",
    confirmed: false,
    talk: "Stablecoins: o novo trilho financeiro global",
    desc: "Dólar on-chain, remessas, PIX e liquidação internacional — e quem perde poder na transição.",
  },
  {
    number: "04",
    time: "16h45",
    accent: LAYER_COLORS[3],
    name: "A confirmar",
    role: "Speaker convidado",
    confirmed: false,
    talk: "Proteção patrimonial em tempos instáveis",
    desc: "Self-custody, jurisdição, risco Brasil e segurança operacional. A parte mais prática do dia.",
  },
];

/** Convert a hex accent (#rrggbb) into an rgba() string at a given alpha. */
function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const SpeakerCard = ({
  speaker,
  reduced,
}: {
  speaker: Speaker;
  reduced: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const { accent, confirmed } = speaker;

  const onActivate = () => track("speaker_card_click", { talk: speaker.talk });

  // Initials for the confirmed speaker's avatar placeholder.
  const initials = speaker.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const cardStyle: CSSProperties = {
    borderColor: hovered ? withAlpha(accent, 0.5) : undefined,
    boxShadow: hovered ? `0 18px 50px -20px ${withAlpha(accent, 0.55)}` : undefined,
    transform: hovered && !reduced ? "translateY(-4px)" : undefined,
  };

  const featuredClasses = confirmed
    ? "ring-1 ring-volt/30 bg-white/[0.05]"
    : "bg-white/[0.03]";

  return (
    <article
      data-reveal
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onActivate}
      style={cardStyle}
      className={`group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-8 ${reduced ? "" : "transition duration-300"} ${featuredClasses}`}
    >
      {/* thin top accent bar */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${accent}, transparent)`,
          opacity: confirmed ? 1 : 0.55,
        }}
      />

      <div className="flex items-center gap-4">
        {/* Avatar placeholder */}
        {confirmed ? (
          // TODO: replace placeholder gradient avatar with real photo
          // <img src="..." alt={speaker.name} className="h-16 w-16 rounded-full object-cover" />
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-ink"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${withAlpha(
                accent,
                0.55,
              )})`,
              boxShadow: `0 0 0 2px ${withAlpha(accent, 0.4)}`,
            }}
          >
            {initials}
          </div>
        ) : (
          // TODO: replace placeholder avatar with real speaker photo once confirmed
          // <img src="..." alt={speaker.name} className="h-16 w-16 rounded-full object-cover" />
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-white/20 bg-white/[0.04]"
            style={{ color: withAlpha(accent, 0.85) }}
            aria-label="A confirmar"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              <circle cx="12" cy="15.5" r="1" />
            </svg>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* number + time chip */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em]"
            style={{
              color: accent,
              backgroundColor: withAlpha(accent, 0.1),
              border: `1px solid ${withAlpha(accent, 0.25)}`,
            }}
          >
            <span>{speaker.number}</span>
            <span aria-hidden className="opacity-40">·</span>
            <span>{speaker.time}</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <h3 className="truncate font-display text-lg font-bold text-white">
              {speaker.name}
            </h3>
            {!confirmed && (
              <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/50">
                A confirmar
              </span>
            )}
          </div>
          <p className="text-sm text-white/50">{speaker.role}</p>
        </div>
      </div>

      <div>
        <h4 className="font-display text-base font-bold leading-snug text-white sm:text-lg">
          {speaker.talk}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          {speaker.desc}
        </p>
      </div>
    </article>
  );
};

const Speakers = () => {
  const ref = useSectionView<HTMLElement>("speakers");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section id="speakers" ref={ref} className="relative z-10 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <p
          data-reveal
          className="font-mono text-[11px] uppercase tracking-[0.35em] text-volt-bright"
        >
          A Sala
        </p>
        <h2
          data-reveal
          className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl"
        >
          Speakers
        </h2>
        <p
          data-reveal
          className="mt-4 max-w-2xl text-base leading-relaxed text-white/70"
        >
          Quatro camadas, quatro vozes — e um fireside de encerramento.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {SPEAKERS.map((speaker) => (
            <SpeakerCard
              key={speaker.number}
              speaker={speaker}
              reduced={reduced}
            />
          ))}
        </div>

        {/* Closing fireside line */}
        <div
          data-reveal
          className="mt-10 rounded-2xl border border-white/10 bg-ink/30 p-6 backdrop-blur-[2px] sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-base leading-snug text-white sm:text-lg">
              <span className="font-mono text-sm text-volt-bright">17h30</span>
              <span className="mx-2 text-white/30">·</span>
              Fireside de encerramento
              <span className="block text-white/70 sm:inline sm:before:content-['_—_']">
                {" "}
                dois palestrantes, uma conversa, sem roteiro.
              </span>
            </p>
            <div className="shrink-0">
              <Button3D
                href="#camadas"
                variant="dark"
                size="sm"
                onClick={() => track("speaker_card_click", { talk: "Fireside de encerramento" })}
              >
                Ver as camadas
              </Button3D>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Speakers;
