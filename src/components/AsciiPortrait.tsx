import { useEffect, useRef } from "react";

interface Props {
  /** Source image to asciify. Falls back to a procedural silhouette if missing. */
  src?: string;
  className?: string;
  /** Glyph color (use a light color on dark backgrounds). */
  color?: string;
  /** Crop focus 0..1 (which part of the image to keep when cover-fitting). */
  focusX?: number;
  focusY?: number;
}

// dark → light. Dense symbols for shadows, 0/1 for mid-tones, sparse for light.
const RAMP = "@%#01=:. ";

/**
 * Renders an image (or a procedural head silhouette) as animated ASCII on a
 * canvas: a "decode" scramble that resolves into the portrait, then a subtle
 * live binary shimmer in the light areas. Dark glyphs on a transparent bg.
 */
const AsciiPortrait = ({
  src = "/sovereign.webp",
  className,
  color = "#15130d",
  focusX = 0.5,
  focusY = 0.5,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cols = 0;
    let rows = 0;
    let cell = 0;
    let lum: Float32Array | null = null; // 0 = dark, 1 = light
    let thresh: Float32Array | null = null; // per-cell reveal threshold

    const buildGrid = (img: HTMLImageElement | null) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      const targetCols = coarse ? 64 : 104;
      cell = Math.max(5, Math.round(w / targetCols));
      cols = Math.floor(w / cell);
      rows = Math.floor(h / cell);

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d");
      if (!octx) return;

      if (img) {
        // cover-fit
        const ir = img.width / img.height;
        const cr = cols / rows;
        let sw: number, sh: number, sx: number, sy: number;
        if (ir > cr) {
          sh = img.height;
          sw = sh * cr;
          sx = (img.width - sw) * focusX;
          sy = (img.height - sh) * focusY;
        } else {
          sw = img.width;
          sh = sw / cr;
          sx = (img.width - sw) * focusX;
          sy = (img.height - sh) * focusY;
        }
        octx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      } else {
        // procedural head + shoulders silhouette (placeholder)
        octx.fillStyle = "#ffffff";
        octx.fillRect(0, 0, cols, rows);
        const cx = cols / 2;
        const grd = octx.createRadialGradient(
          cx,
          rows * 0.36,
          cols * 0.04,
          cx,
          rows * 0.42,
          cols * 0.4,
        );
        grd.addColorStop(0, "#111111");
        grd.addColorStop(0.7, "#333333");
        grd.addColorStop(1, "#dddddd");
        octx.fillStyle = grd;
        octx.beginPath();
        octx.ellipse(cx, rows * 0.36, cols * 0.17, rows * 0.24, 0, 0, Math.PI * 2);
        octx.fill();
        octx.fillStyle = "#2a2a2a";
        octx.beginPath();
        octx.ellipse(cx, rows * 1.12, cols * 0.42, rows * 0.62, 0, 0, Math.PI * 2);
        octx.fill();
      }

      const data = octx.getImageData(0, 0, cols, rows).data;
      lum = new Float32Array(cols * rows);
      thresh = new Float32Array(cols * rows);
      let sum = 0;
      for (let i = 0; i < cols * rows; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        lum[i] = L;
        sum += L;
      }
      // Dark-background photos (lit subject on black) read inverted: flip so the
      // SUBJECT becomes the ink. Then boost contrast so the face pops.
      const invert = sum / (cols * rows) < 0.5;
      const contrast = 1.4;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          let v = invert ? 1 - lum[i] : lum[i];
          v = (v - 0.5) * contrast + 0.5;
          lum[i] = Math.min(1, Math.max(0, v));
          thresh[i] = (y / rows) * 0.65 + Math.random() * 0.35;
        }
      }
    };

    let started = false;
    let startTime = 0;
    let inView = false;
    let raf = 0;
    let last = 0;
    const REVEAL_MS = 1700;
    const FRAME_MS = 55; // ~18fps shimmer/scramble

    const charFor = (L: number) =>
      RAMP[Math.min(RAMP.length - 1, Math.max(0, Math.floor(L * (RAMP.length - 1))))];

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!inView || !lum || !thresh) return;
      if (now - last < FRAME_MS) return;
      last = now;
      if (!started) {
        started = true;
        startTime = now;
      }

      const p = reduced ? 1 : Math.min(1, (now - startTime) / REVEAL_MS);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.font = `${cell}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
      ctx.textBaseline = "top";
      ctx.fillStyle = color;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const L = lum[i];
          let ch: string;
          if (p < thresh[i]) {
            ch = RAMP[(Math.random() * (RAMP.length - 1)) | 0];
          } else {
            ch = charFor(L);
            if (!reduced && L > 0.5 && L < 0.95 && Math.random() < 0.05) {
              ch = Math.random() < 0.5 ? "0" : "1";
            }
          }
          if (ch === " ") continue;
          ctx.fillText(ch, x * cell, y * cell);
        }
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !raf) raf = requestAnimationFrame(draw);
      },
      { threshold: 0.1 },
    );

    const load = () => {
      const img = new Image();
      img.onload = () => {
        buildGrid(img);
      };
      img.onerror = () => {
        buildGrid(null); // procedural fallback
      };
      img.src = src;
    };

    const onResize = () => load();
    load();
    window.addEventListener("resize", onResize);
    io.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [src, color, focusX, focusY]);

  return <canvas ref={canvasRef} className={className} aria-label="Retrato" />;
};

export default AsciiPortrait;
