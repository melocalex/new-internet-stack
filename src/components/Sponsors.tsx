import Button3D from "./Button3D";
import { track, useSectionView } from "../lib/telemetry";

interface Slot {
  /** Hinted brand name, or empty for a generic "a confirmar" slot. */
  hint?: string;
}

interface Tier {
  label: string;
  note?: string;
  slots: Slot[];
  /** Larger, single-column treatment for the headline tier. */
  featured?: boolean;
  /** Tailwind grid template for the slot row. */
  grid: string;
}

const TIERS: Tier[] = [
  {
    label: "Title Sponsor",
    note: "A marca que assina o dia",
    featured: true,
    grid: "grid-cols-1",
    slots: [{}],
  },
  {
    label: "Money Layer",
    note: "Stablecoins · pagamentos",
    grid: "grid-cols-1 sm:grid-cols-3",
    slots: [{ hint: "Truther" }, { hint: "P2P.me" }, { hint: "KAST" }],
  },
  {
    label: "Sovereignty / Self-Custody",
    note: "Hardware · custódia própria",
    grid: "grid-cols-1 sm:grid-cols-2",
    slots: [{ hint: "Tangem" }, { hint: "Haven" }],
  },
  {
    label: "Ecosystem & Community Partners",
    note: "Comunidades & ecossistema",
    grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    slots: [
      { hint: "Comunidade" },
      { hint: "Comunidade" },
      { hint: "Comunidade" },
      { hint: "Comunidade" },
      { hint: "Comunidade" },
      { hint: "Comunidade" },
    ],
  },
];

/** A single placeholder logo slot — clearly not a real logo yet. */
const LogoSlot = ({ slot, featured }: { slot: Slot; featured?: boolean }) => {
  const label = slot.hint ?? "a confirmar";

  return (
    // TODO: replace with real sponsor logo <img src="..." alt={label} className="max-h-12 w-auto" />
    <div
      className={`group relative flex items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-center transition hover:border-volt/40 hover:bg-volt/[0.06] ${
        featured ? "min-h-[140px] p-8 sm:min-h-[180px]" : "min-h-[88px] p-5"
      }`}
    >
      {/* corner ticks reinforce the "placeholder frame" read */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-2 rounded-xl border border-white/[0.06]"
      />
      <span
        className={`relative font-mono uppercase tracking-[0.25em] text-white/40 transition group-hover:text-volt-bright/80 ${
          featured ? "text-sm tracking-[0.3em]" : "text-[11px]"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

const Sponsors = () => {
  const ref = useSectionView<HTMLElement>("patrocinadores");

  return (
    <section
      id="patrocinadores"
      ref={ref}
      className="relative z-10 px-6 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl">
        {/* Eyebrow + heading + intro */}
        <div data-reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-volt-bright">
            Quem apoia
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Patrocinadores
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/70">
            The New Internet Stack só acontece porque algumas marcas decidem
            apoiar conversa real em vez de pitch de palco.
          </p>
        </div>

        {/* Tiers */}
        <div className="mt-16 space-y-12">
          {TIERS.map((tier) => (
            <div key={tier.label} data-reveal>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-volt-bright">
                  {tier.label}
                </p>
                {tier.note && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {tier.note}
                  </span>
                )}
              </div>

              <div className={`mt-5 grid gap-4 sm:gap-5 ${tier.grid}`}>
                {tier.slots.map((slot, i) => (
                  <LogoSlot
                    key={`${tier.label}-${i}`}
                    slot={slot}
                    featured={tier.featured}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Become-a-sponsor CTA */}
        <div
          data-reveal
          className="mt-20 rounded-3xl border border-volt/20 bg-gradient-to-b from-volt/[0.1] to-transparent p-8 backdrop-blur-[2px] sm:p-10"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Quer levar sua marca para dentro dessa sala?
              </h3>
              <p className="mt-3 max-w-xl text-white/60">
                Público pequeno, denso e qualificado — founders, builders e
                investidores que movem antes do consenso. Sem palco genérico.
              </p>
            </div>
            <div className="shrink-0">
              <Button3D
                href="#contato"
                variant="volt"
                size="lg"
                onClick={() => track("sponsor_cta_click")}
              >
                Falar com a gente
              </Button3D>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
