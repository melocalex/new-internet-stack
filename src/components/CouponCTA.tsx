import Button3D from "./Button3D";
import { track, useSectionView } from "../lib/telemetry";

const CouponCTA = () => {
  const ref = useSectionView<HTMLElement>("ingressos");

  return (
    <section id="ingressos" ref={ref} className="relative z-10 px-6 py-28 sm:py-36">
      <div
        data-reveal
        className="mx-auto max-w-2xl scroll-mt-20 rounded-3xl border border-volt/20 bg-gradient-to-b from-volt/[0.1] to-transparent p-10 text-center backdrop-blur-[2px]"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-volt-bright">
          Early Bird · vagas limitadas
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Garanta seu cupom de 30% OFF
        </h2>
        <p className="mt-3 text-white/60">
          Quem decide primeiro paga menos. Lote 1 a partir de{" "}
          <span className="text-white/40 line-through">R$150</span>{" "}
          <span className="font-semibold text-white">R$105</span> com o cupom
          early bird.
        </p>
        <div className="mt-8 flex justify-center">
          <Button3D
            href="#"
            variant="gold"
            size="lg"
            onClick={() => track("coupon_cta_click", { tier: "lote_1" })}
          >
            Pegar cupom early bird · 30% OFF
          </Button3D>
        </div>
      </div>
    </section>
  );
};

export default CouponCTA;
