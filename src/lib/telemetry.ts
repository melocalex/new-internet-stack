import posthog from "posthog-js";
import { useEffect, useRef } from "react";

let started = false;

/** Initialize PostHog. No-ops (but logs) when no key is configured. */
export function initTelemetry() {
  if (started) return;
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) {
    console.info(
      "[telemetry] VITE_POSTHOG_KEY not set — events will log to console only.",
    );
    return;
  }
  posthog.init(key, {
    api_host:
      (import.meta.env.VITE_POSTHOG_HOST as string) ||
      "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage+cookie",
  });
  started = true;
}

/** Track an event. Falls back to console when PostHog isn't configured. */
export function track(event: string, props?: Record<string, unknown>) {
  if (started) {
    posthog.capture(event, props);
  } else {
    console.debug("[telemetry]", event, props ?? {});
  }
}

/**
 * Fire a `section_view` event the first time a section scrolls into view.
 * Returns a ref to attach to the section element.
 */
export function useSectionView<T extends HTMLElement>(section: string) {
  const ref = useRef<T | null>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true;
            track("section_view", { section });
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [section]);
  return ref;
}

/** Fire scroll-depth milestones once each (25/50/75/100). */
export function useScrollDepth() {
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const hit = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      for (const m of milestones) {
        if (pct >= m && !hit.has(m)) {
          hit.add(m);
          track("scroll_depth", { percent: m });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
