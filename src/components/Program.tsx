import { useSectionView } from "../lib/telemetry";
import { LAYER_COLORS } from "../lib/layers";

interface AgendaItem {
  time: string;
  title: string;
  speaker?: string;
  accent?: string;
  tag?: string;
}

interface Phase {
  label: string;
  after?: boolean;
  items: AgendaItem[];
}

const PHASES: Phase[] = [
  {
    label: "Fase 1 · As Camadas",
    items: [
      { time: "13h30", title: "Check-in, café e boas-vindas" },
      { time: "14h00", title: "Abertura" },
      {
        time: "14h15",
        title: "01 · AI como camada operacional",
        speaker: "Alexandre Melo",
        accent: LAYER_COLORS[0],
        tag: "Talk + Q&A",
      },
      {
        time: "15h00",
        title: "02 · Bitcoin em 2026",
        speaker: "A confirmar",
        accent: LAYER_COLORS[1],
        tag: "Talk + Q&A",
      },
      { time: "15h45", title: "Intervalo" },
      {
        time: "16h00",
        title: "03 · Stablecoins",
        speaker: "A confirmar",
        accent: LAYER_COLORS[2],
        tag: "Talk + Q&A",
      },
      {
        time: "16h45",
        title: "04 · Proteção patrimonial",
        speaker: "A confirmar",
        accent: LAYER_COLORS[3],
        tag: "Talk + Q&A",
      },
      { time: "17h30", title: "Fireside de encerramento" },
    ],
  },
  {
    label: "Fase 2 · The After",
    after: true,
    items: [
      {
        time: "18h00",
        title: "The After — networking, drinks e música",
        tag: "Networking",
      },
      { time: "22h00", title: "Encerramento" },
    ],
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

const VOLT = "#6f7bff";
const VOLT_BRIGHT = "#9aa6ff";

const TimelineRow = ({
  item,
  delay,
}: {
  item: AgendaItem;
  delay: number;
}) => {
  const dotColor = item.accent ?? VOLT;
  const isTalk = Boolean(item.accent);

  return (
    <div
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className="relative grid grid-cols-[2.75rem_1fr] gap-x-4 pb-9 last:pb-0 sm:grid-cols-[5.5rem_2.75rem_1fr] sm:gap-x-0"
    >
      {/* Time — above on mobile (sits in node column), to the left on desktop */}
      <div className="col-start-2 row-start-1 mb-1 flex items-center sm:col-start-1 sm:row-start-1 sm:mb-0 sm:justify-end sm:pr-5 sm:pt-0.5">
        <span
          className="font-mono text-sm font-medium tracking-tight"
          style={{ color: isTalk ? dotColor : VOLT_BRIGHT }}
        >
          {item.time}
        </span>
      </div>

      {/* Node on the spine */}
      <div className="col-start-1 row-start-1 row-span-2 flex justify-center sm:col-start-2 sm:row-span-1 sm:row-start-1 sm:pt-1.5">
        <span
          aria-hidden
          className="relative z-10 mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
          style={{
            backgroundColor: dotColor,
            boxShadow: `0 0 0 4px ${withAlpha(dotColor, 0.14)}, 0 0 14px ${withAlpha(
              dotColor,
              0.6,
            )}`,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "rgba(5,6,10,0.55)" }}
          />
        </span>
      </div>

      {/* Card / content */}
      <div className="col-start-2 row-start-2 sm:col-start-3 sm:row-start-1">
        <div
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-volt/40 hover:bg-volt/[0.06] sm:p-6"
          style={
            isTalk
              ? {
                  borderLeftWidth: "2px",
                  borderLeftColor: withAlpha(dotColor, 0.6),
                }
              : undefined
          }
        >
          <h4 className="font-display text-base font-bold leading-snug text-white sm:text-lg">
            {item.title}
          </h4>

          {(item.speaker || item.tag) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
              {item.speaker && (
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
                  {item.speaker}
                </span>
              )}
              {item.tag && (
                <span
                  className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{
                    color: isTalk ? dotColor : VOLT_BRIGHT,
                    backgroundColor: withAlpha(dotColor, 0.1),
                    border: `1px solid ${withAlpha(dotColor, 0.25)}`,
                  }}
                >
                  {item.tag}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Program = () => {
  const ref = useSectionView<HTMLElement>("programacao");

  // Cumulative item offset so the staggered reveal flows across both phases.
  const phaseOffsets = PHASES.reduce<number[]>((acc, _phase, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + PHASES[i - 1].items.length);
    return acc;
  }, []);

  return (
    <section id="programacao" ref={ref} className="relative z-10 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-4xl">
        <p
          data-reveal
          className="font-mono text-[11px] uppercase tracking-[0.35em] text-volt-bright"
        >
          O Dia
        </p>
        <h2
          data-reveal
          className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl"
        >
          Programação
        </h2>
        <p data-reveal className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          Conteúdo denso primeiro. Conexão real depois.
        </p>

        <div className="mt-14 space-y-10">
          {PHASES.map((phase, phaseIdx) => (
            <div
              key={phase.label}
              className={
                phase.after
                  ? "rounded-3xl border border-volt/20 bg-gradient-to-b from-volt/[0.08] to-transparent p-6 backdrop-blur-[2px] sm:p-8"
                  : ""
              }
            >
              {/* Phase header chip */}
              <div data-reveal className="mb-8 flex items-center gap-3">
                <span
                  className="inline-flex items-center rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em]"
                  style={
                    phase.after
                      ? {
                          color: VOLT_BRIGHT,
                          borderColor: withAlpha(VOLT, 0.4),
                          backgroundColor: withAlpha(VOLT, 0.12),
                        }
                      : {
                          color: VOLT_BRIGHT,
                          borderColor: "rgba(255,255,255,0.12)",
                          backgroundColor: "rgba(255,255,255,0.03)",
                        }
                  }
                >
                  {phase.label}
                </span>
                <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
              </div>

              {/* Timeline with glowing spine */}
              <div className="relative">
                {/* The spine — sits under the nodes */}
                <span
                  aria-hidden
                  className="absolute top-1 bottom-1 w-px sm:left-[6.94rem]"
                  style={{
                    left: "1.31rem",
                    background: `linear-gradient(180deg, ${withAlpha(
                      VOLT,
                      0,
                    )} 0%, ${withAlpha(VOLT, 0.7)} 12%, ${withAlpha(
                      VOLT_BRIGHT,
                      0.7,
                    )} 88%, ${withAlpha(VOLT, 0)} 100%)`,
                    boxShadow: `0 0 12px ${withAlpha(VOLT, 0.5)}`,
                  }}
                />

                {phase.items.map((item, itemIdx) => (
                  <TimelineRow
                    key={`${item.time}-${item.title}`}
                    item={item}
                    delay={(phaseOffsets[phaseIdx] + itemIdx) * 70}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Program;
