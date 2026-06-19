import AsciiPortrait from "./AsciiPortrait";
import { useSectionView } from "../lib/telemetry";

const PILLARS = [
  {
    k: "Visão política",
    d: "Ler o jogo antes dele virar manchete — instituições, poder e incentivos.",
  },
  {
    k: "Lei natural",
    d: "Propriedade, contrato e responsabilidade como base, não como detalhe.",
  },
  {
    k: "Proteção patrimonial",
    d: "Self-custody, jurisdição e segurança operacional — antes de precisar.",
  },
];

const SovereignPath = () => {
  const ref = useSectionView<HTMLElement>("soberania");

  return (
    <section
      id="soberania"
      ref={ref}
      className="relative z-10 h-screen min-h-[680px] overflow-hidden bg-ink"
    >
      {/* Portrait — full height, bleeding to the right edge */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[68%] sm:w-[56%] lg:w-[50%]">
        <AsciiPortrait
          color="#ece8dd"
          focusX={0.7}
          focusY={0.4}
          className="h-full w-full"
        />
        {/* fade the portrait's left edge into the black so the text stays clean */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, #05060a 0%, rgba(5,6,10,0.55) 26%, rgba(5,6,10,0) 60%)",
          }}
        />
      </div>

      {/* Text — left, vertically centered over the black */}
      <div className="relative mx-auto flex h-full max-w-6xl items-center px-6">
        <div data-reveal className="max-w-lg">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-volt-bright">
            Lei natural · Brasil até 2030
          </p>
          <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            O caminho para o indivíduo soberano — e a grandeza da sua família.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
            A próxima década no Brasil vai separar quem construiu soberania de
            quem terceirizou. Proteger patrimônio, família e liberdade deixou de
            ser opcional — virou a base de tudo o que vem depois.
          </p>

          <dl className="mt-10 space-y-5">
            {PILLARS.map((p) => (
              <div
                key={p.k}
                className="border-l-2 border-white/15 pl-5 transition hover:border-volt/50"
              >
                <dt className="font-display text-base font-bold text-white">
                  {p.k}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/55">
                  {p.d}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default SovereignPath;
