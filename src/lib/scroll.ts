// Shared scroll state: written once per frame, read by both the 3D scene
// (in useFrame) and DOM components. One source of truth, no React re-renders.

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export interface ScrollState {
  /** whole-page progress 0..1 */
  progress: number;
  /** 0 at top of page → 1 after one viewport (hero fade) */
  hero: number;
  /** progress through the Stack section, 0..1 */
  stack: number;
  /** focus of the Stack section: 0 off-screen → 1 centered */
  stackFocus: number;
}

export const scrollState: ScrollState = {
  progress: 0,
  hero: 0,
  stack: 0,
  stackFocus: 0,
};

export const registry: { stackEl: HTMLElement | null } = { stackEl: null };

/** Recompute scrollState from the live DOM. Cheap; safe to call every frame. */
export function updateScroll() {
  const vh = window.innerHeight;
  const doc = document.documentElement;
  const max = doc.scrollHeight - vh;
  const y = window.scrollY || window.pageYOffset || 0;

  scrollState.progress = max > 0 ? clamp(y / max) : 0;
  scrollState.hero = clamp(y / vh);

  const el = registry.stackEl;
  if (el) {
    const rect = el.getBoundingClientRect();
    const total = rect.height - vh;
    const scrolled = -rect.top;
    const p = total > 0 ? clamp(scrolled / total) : 0;
    scrollState.stack = p;
    // fade in over the first slice, hold, fade out at the end
    scrollState.stackFocus = smoothstep(0, 0.1, p) * (1 - smoothstep(0.9, 1, p));
  } else {
    scrollState.stack = 0;
    scrollState.stackFocus = 0;
  }
}
