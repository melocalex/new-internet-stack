import { useEffect } from "react";

/**
 * Reveals every [data-reveal] element as it scrolls into view (adds .is-revealed).
 * One observer for the whole page; re-scans shortly after mount for late sections.
 * Respects prefers-reduced-motion (reveals everything immediately).
 */
export function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document
        .querySelectorAll("[data-reveal]")
        .forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    const scan = () =>
      document
        .querySelectorAll("[data-reveal]:not(.is-revealed)")
        .forEach((el) => io.observe(el));

    scan();
    const t = window.setTimeout(scan, 400);

    // Re-scan when the DOM changes (late-mounted sections, HMR swaps) so newly
    // added [data-reveal] elements always get observed and never stay hidden.
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, []);
}
