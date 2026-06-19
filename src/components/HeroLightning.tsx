import { useEffect, useRef } from "react";

interface Props {
  className?: string;
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
}

/**
 * Self-contained WebGL lightning for the hero ONLY.
 * Lives in its own canvas (absolute inside the hero) so it scrolls away with the
 * hero and can never bleed onto later sections. Raw WebGL — no shared render loop.
 * Adapted from the ReactBits lightning: gold tint, a soft vignette to keep it
 * compact, and a brightness floor so the flicker never blinks to full black.
 */
const HeroLightning = ({
  className,
  hue = 45,
  xOffset = 0,
  speed = 0.9,
  intensity = 0.9,
  size = 1.6,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    const vert = `
      attribute vec2 aPosition;
      void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
    `;

    const frag = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      #define OCTAVE_COUNT 7

      vec3 hsv2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z * mix(vec3(1.0), rgb, c.y);
      }
      float hash11(float p) {
        p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p);
      }
      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      mat2 rotate2d(float t) { float c = cos(t), s = sin(t); return mat2(c, -s, s, c); }
      float noise(vec2 p) {
        vec2 ip = floor(p); vec2 fp = fract(p);
        float a = hash12(ip);
        float b = hash12(ip + vec2(1.0, 0.0));
        float c = hash12(ip + vec2(0.0, 1.0));
        float d = hash12(ip + vec2(1.0, 1.0));
        vec2 t = smoothstep(0.0, 1.0, fp);
        return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }
      float fbm(vec2 p) {
        float v = 0.0; float amp = 0.5;
        for (int i = 0; i < OCTAVE_COUNT; ++i) {
          v += amp * noise(p); p *= rotate2d(0.45); p *= 2.0; amp *= 0.5;
        }
        return v;
      }
      // periodic lightning strike — flares bright from time to time, smooth (no strobe)
      float strike(float t) {
        float period = 4.0;
        float c = fract(t / period);
        float f = exp(-c * 10.0);                // sharp flash, exponential decay
        f += 0.5 * exp(-abs(c - 0.07) * 45.0);   // quick secondary flash
        return clamp(f, 0.0, 1.0);
      }
      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 suv = fragCoord / iResolution.xy;
        vec2 uv = 2.0 * suv - 1.0;
        uv.x *= iResolution.x / iResolution.y;
        uv.x += uXOffset;
        uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;

        float dist = abs(uv.x);
        vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
        // faint baseline + periodic strike flare; never fully black, no per-frame strobe
        float env = 0.15 + 1.2 * strike(iTime);
        vec3 col = baseColor * (0.06 * env / dist) * uIntensity;
        float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);

        // tighter vignette → a more contained bolt
        vec2 mm = suv - vec2(0.5, 0.5);
        mm.x *= 1.3;
        float mask = 1.0 - smoothstep(0.34, 0.74, length(mm));

        gl_FragColor = vec4(col, a * mask);
      }
    `;

    const compile = (src: string, type: number) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Lightning shader error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(vert, gl.VERTEX_SHADER);
    const fs = compile(frag, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Lightning link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uHue = gl.getUniformLocation(program, "uHue");
    const uXOff = gl.getUniformLocation(program, "uXOffset");
    const uSpeed = gl.getUniformLocation(program, "uSpeed");
    const uInt = gl.getUniformLocation(program, "uIntensity");
    const uSz = gl.getUniformLocation(program, "uSize");

    // Pause rendering when the hero is off-screen (perf).
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) raf = requestAnimationFrame(render);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const start = performance.now();
    let raf = 0;
    const render = () => {
      if (!visible) return;
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uHue, hue);
      gl.uniform1f(uXOff, xOffset);
      gl.uniform1f(uSpeed, speed);
      gl.uniform1f(uInt, intensity);
      gl.uniform1f(uSz, size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return <canvas ref={canvasRef} className={className} />;
};

export default HeroLightning;
