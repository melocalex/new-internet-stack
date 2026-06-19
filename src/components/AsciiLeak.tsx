import { useEffect, useRef } from "react";

interface Props {
  className?: string;
  /** Same image as the portrait, so the leak follows its body. */
  src?: string;
  /** Same horizontal crop focus as the portrait above. */
  focusX?: number;
  /** How far down the binary leak persists (0..1 of canvas height). */
  reach?: number;
}

const CHARS = "0101010 1#=:.";
const WORD_POOL = [
  "freedom",
  "sovereignty",
  "privacy",
  "property",
  "money",
  "wealth",
  "bitcoin",
  "liberty",
  "control",
  "power",
  "ownership",
  "exit",
  "truth",
  "choice",
  "safety",
  "security",
  "autonomy",
  "independence",
  "custody",
  "jurisdiction",
  "capital",
  "value",
  "rights",
  "family",
  "legacy",
  "future",
];
const WORD_RGB = "255,59,64";
const INSTANCE_COUNT = 10;

/** Pick a word not currently used by other instances (no duplicates on screen). */
const pickWord = (exclude: Set<string>) => {
  const avail = WORD_POOL.filter((w) => !exclude.has(w));
  const arr = avail.length ? avail : WORD_POOL;
  return arr[(Math.random() * arr.length) | 0];
};

type WordInst = {
  text: string;
  px: number;
  py: number;
  width: number;
  born: number;
  dur: number;
  gap: number;
};

/**
 * ASCII leaking down from the portrait above (intensity from its body), with a
 * few red words that fade in/out and relocate. Words never duplicate and never
 * overlap each other. Subtle, sits behind the text; throttled, in-view only.
 */
const AsciiLeak = ({
  className,
  src = "/sovereign.webp",
  focusX = 0.7,
  reach = 0.9,
}: Props) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let cols = 0;
    let rows = 0;
    let cell = 9;
    let profile: Float32Array | null = null;
    let img: HTMLImageElement | null = null;
    const instances: WordInst[] = [];

    const wordSizeFor = () => Math.max(13, Math.round(cell * 2.0));
    const wordFontFor = (s: number) =>
      `600 ${s}px ui-monospace, "SFMono-Regular", Menlo, monospace`;

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      cell = Math.max(5, Math.round(w / (coarse ? 64 : 104)));
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
    };

    const buildProfile = () => {
      if (!img || cols === 0) return;
      const portraitAspect = canvas.clientWidth / window.innerHeight;
      const sw = Math.min(img.width, img.height * portraitAspect);
      const sx = Math.max(0, Math.min(img.width - sw, (img.width - sw) * focusX));
      const sampleH = img.height * 0.22;
      const sy = img.height - sampleH;
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = 1;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.drawImage(img, sx, sy, sw, sampleH, 0, 0, cols, 1);
      const data = octx.getImageData(0, 0, cols, 1).data;
      profile = new Float32Array(cols);
      for (let x = 0; x < cols; x++) {
        const L =
          (0.299 * data[x * 4] + 0.587 * data[x * 4 + 1] + 0.114 * data[x * 4 + 2]) /
          255;
        profile[x] = Math.min(1, Math.max(0, L * 1.5));
      }
    };

    const wordSize = () => wordSizeFor();
    const overlaps = (px: number, py: number, w: number, self: WordInst) => {
      const s = wordSize();
      const pad = cell * 1.4;
      return instances.some(
        (o) =>
          o !== self &&
          px < o.px + o.width + pad &&
          px + w + pad > o.px &&
          py < o.py + s + pad &&
          py + s + pad > o.py,
      );
    };

    // (Re)assign a word + a non-overlapping position + new timing.
    const place = (inst: WordInst, now: number, init: boolean) => {
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const s = wordSize();
      ctx.font = wordFontFor(s);
      if (!init) {
        const others = new Set(
          instances.filter((o) => o !== inst).map((o) => o.text),
        );
        inst.text = pickWord(others);
      }
      const width = ctx.measureText(inst.text).width;
      const maxX = Math.max(4, W - width - 4);
      const maxY = Math.max(4, H - s - 4);
      let px = 4;
      let py = 4;
      for (let a = 0; a < 40; a++) {
        px = 4 + Math.random() * (maxX - 4);
        py = 4 + Math.random() * (maxY - 4);
        if (!overlaps(px, py, width, inst)) break;
      }
      inst.px = px;
      inst.py = py;
      inst.width = width;
      inst.born = init ? now - Math.random() * 3500 : now;
      inst.dur = 1900 + Math.random() * 2400;
      inst.gap = 800 + Math.random() * 2200;
    };

    const render = (now: number) => {
      if (!profile) return;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const s = wordSize();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.textBaseline = "top";

      // advance cycles + collect visible words
      const placed: { text: string; px: number; py: number; width: number; op: number }[] =
        [];
      for (const inst of instances) {
        if (now >= inst.born + inst.dur + inst.gap) place(inst, now, false);
        const t = (now - inst.born) / inst.dur;
        const op =
          t >= 0 && t <= 1 ? Math.max(0, Math.min(1, t / 0.18, (1 - t) / 0.18)) : 0;
        if (op <= 0.04) continue;
        placed.push({
          text: inst.text,
          px: inst.px,
          py: inst.py,
          width: inst.width,
          op: op * 0.55,
        });
      }

      const pad = cell;
      const inWord = (cx: number, cy: number) =>
        placed.some(
          (p) =>
            cx >= p.px - pad &&
            cx <= p.px + p.width + pad &&
            cy >= p.py - pad &&
            cy <= p.py + s + pad,
        );

      // binary field
      ctx.font = `${cell}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
      for (let y = 0; y < rows; y++) {
        const fade = Math.max(0, 1 - y / rows / reach);
        if (fade <= 0) continue;
        const cy = y * cell;
        for (let x = 0; x < cols; x++) {
          const d = profile[x] * fade;
          if (d <= 0.02 || Math.random() > d * 0.55) continue;
          const cx = x * cell;
          if (inWord(cx, cy)) continue;
          const ch = CHARS[(Math.random() * CHARS.length) | 0];
          if (ch === " ") continue;
          const a = Math.min(0.3, d * 0.38 * (0.5 + Math.random() * 0.5));
          ctx.fillStyle = `rgba(222,217,205,${a.toFixed(3)})`;
          ctx.fillText(ch, cx, cy);
        }
      }

      // red words (fading)
      ctx.font = wordFontFor(s);
      ctx.shadowColor = `rgba(${WORD_RGB},0.45)`;
      ctx.shadowBlur = s * 0.55;
      for (const p of placed) {
        ctx.fillStyle = `rgba(${WORD_RGB},${p.op.toFixed(2)})`;
        ctx.fillText(p.text, p.px, p.py);
      }
      ctx.shadowBlur = 0;
    };

    let inView = false;
    let raf = 0;
    let last = 0;
    const FRAME_MS = 60;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!inView || now - last < FRAME_MS) return;
      last = now;
      render(now);
    };

    let cleanup = () => {};
    const start = () => {
      resize();
      buildProfile();
      const t0 = performance.now();
      const used = new Set<string>();
      for (let i = 0; i < INSTANCE_COUNT; i++) {
        const text = pickWord(used);
        used.add(text);
        const inst: WordInst = {
          text,
          px: 0,
          py: 0,
          width: 0,
          born: 0,
          dur: 0,
          gap: 0,
        };
        place(inst, t0, true);
        instances.push(inst);
      }
      if (reduced) {
        render(t0);
        return;
      }
      const io = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView && !raf) raf = requestAnimationFrame(loop);
        },
        { threshold: 0 },
      );
      io.observe(canvas);
      raf = requestAnimationFrame(loop);
      const onResize = () => {
        resize();
        buildProfile();
        const t = performance.now();
        for (const inst of instances) place(inst, t, true);
      };
      window.addEventListener("resize", onResize);
      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener("resize", onResize);
      };
    };

    const im = new Image();
    im.onload = () => {
      img = im;
      start();
    };
    im.onerror = () => start();
    im.src = src;

    return () => cleanup();
  }, [src, focusX, reach]);

  return <canvas ref={ref} className={className} aria-hidden />;
};

export default AsciiLeak;
