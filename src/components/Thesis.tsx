import { useSectionView } from "../lib/telemetry";
import CryptoLarLogo from "./CryptoLarLogo";
import AsciiLeak from "./AsciiLeak";

const Thesis = () => {
  const ref = useSectionView<HTMLElement>("tese");

  return (
    <section
      id="tese"
      ref={ref}
      className="relative z-10 overflow-hidden px-6 py-28 sm:py-40"
    >
      {/* Subtle ASCII leak from the portrait — sits behind the text (right column) */}
      <AsciiLeak className="pointer-events-none absolute right-0 top-0 h-full w-[68%] sm:w-[56%] lg:w-[50%]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p
          data-reveal
          className="mb-8 font-mono text-[11px] uppercase tracking-[0.35em] text-volt-bright"
        >
          A Tese
        </p>

        <p
          data-reveal
          className="mx-auto max-w-3xl font-display text-3xl leading-[1.15] tracking-tight text-white sm:text-5xl"
        >
          AI, Bitcoin, stablecoins e proteção patrimonial — a infraestrutura do{" "}
          <span className="text-white/50">dinheiro</span> e da{" "}
          <span className="text-white/50">inteligência</span> em 2026.
        </p>

        <blockquote
          data-reveal
          className="mx-auto mt-12 max-w-2xl border-l-2 border-volt/50 pl-6 text-left font-display text-lg italic text-white/70 sm:text-xl"
        >
          “A próxima internet não vai pedir licença. Vai ser construída — com ou
          sem você na sala.”
          <cite className="mt-4 flex items-center gap-2 font-sans text-sm not-italic text-white/40">
            <span aria-hidden>—</span>
            <CryptoLarLogo className="h-4 w-auto opacity-80" />
          </cite>
        </blockquote>
      </div>
    </section>
  );
};

export default Thesis;
