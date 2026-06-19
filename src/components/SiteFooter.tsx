import type { ReactElement } from "react";
import Button3D from "./Button3D";
import CryptoLarLogo from "./CryptoLarLogo";
import { track, useSectionView } from "../lib/telemetry";

/** Small inline location pin icon. */
const PinIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

/** Small inline calendar icon. */
const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </svg>
);

interface Fact {
  icon: (props: { className?: string }) => ReactElement;
  label: string;
  value: string;
}

const FACTS: Fact[] = [
  { icon: PinIcon, label: "Local", value: "FounderHaus · Florianópolis" },
  { icon: CalendarIcon, label: "Data", value: "01 de Agosto de 2026" },
];

const EXTERNAL_LINKS: { to: string; href: string; label: string }[] = [
  { to: "site", href: "https://www.cryptolar.com.br/", label: "cryptolar.com.br" },
  { to: "x", href: "https://x.com/CryptoLarBrasil", label: "@CryptoLarBrasil" },
];

const SiteFooter = () => {
  const ref = useSectionView<HTMLElement>("contato");

  return (
    <section id="contato" ref={ref} className="relative z-10 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl border-t border-white/10 pt-20 sm:pt-28">
        {/* Ultimato — the emotional close */}
        <div className="mx-auto max-w-4xl text-center">
          <p
            data-reveal
            className="mb-8 font-mono text-[11px] uppercase tracking-[0.35em] text-volt-bright"
          >
            O Ultimato
          </p>

          <p
            data-reveal
            className="font-display text-2xl font-bold leading-snug tracking-tight text-white/80 sm:text-3xl"
          >
            Os que entenderem a stack agora vão construir, alocar e se proteger
            primeiro. Os que não, vão entrar depois —{" "}
            <span className="text-white/50">mais tarde, e mais caro.</span>
          </p>

          <h2
            data-reveal
            className="mt-10 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl"
          >
            No CryptoLar nunca teve plateia.{" "}
            <span className="text-volt-bright">Escolha o seu lado da mesa.</span>
          </h2>

          <div data-reveal className="mt-12 flex justify-center">
            <Button3D
              href="#ingressos"
              variant="gold"
              size="lg"
              onClick={() => track("footer_cta_click")}
            >
              Pegar cupom early bird · 30% OFF
            </Button3D>
          </div>
        </div>

        {/* Event facts */}
        <div className="mt-24 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {FACTS.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              data-reveal
              style={{ transitionDelay: `${i * 70}ms` }}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-volt/40 hover:bg-volt/[0.06]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-volt/20 bg-volt/[0.08] text-volt-bright">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                  {label}
                </p>
                <p className="mt-1 font-display text-lg font-bold tracking-tight text-white">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Map placeholder */}
        {/* TODO: replace placeholder with a real map embed/link to FounderHaus */}
        <div
          data-reveal
          className="relative mt-6 h-40 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:h-48"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(120% 120% at 25% 15%, rgba(111,123,255,0.18) 0%, transparent 55%), linear-gradient(135deg, rgba(111,123,255,0.1) 0%, rgba(5,6,10,0.5) 100%)",
            }}
            aria-hidden
          />
          {/* faint street-grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-white/60">
            <PinIcon className="h-5 w-5 text-volt-bright" />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em]">
              FounderHaus · Florianópolis
            </span>
          </div>
        </div>

        {/* Footer bar */}
        <div className="mt-20 border-t border-white/10 pt-10">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
            <CryptoLarLogo className="h-7 w-auto" />

            <div className="flex flex-wrap items-center justify-center gap-4">
              {EXTERNAL_LINKS.map((link) => (
                <Button3D
                  key={link.to}
                  href={link.href}
                  variant="dark"
                  size="sm"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track("external_link_click", { to: link.to })
                  }
                >
                  {link.label}
                </Button3D>
              ))}
            </div>
          </div>

          <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
            © 2026 CryptoLar · The New Internet Stack
          </p>
        </div>
      </div>
    </section>
  );
};

export default SiteFooter;
