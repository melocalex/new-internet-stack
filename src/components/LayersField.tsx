import { useEffect, useRef } from "react";
import { scrollState } from "../lib/scroll";
import { LAYER_COLORS } from "../lib/layers";

interface Props {
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

/**
 * Lightweight WebGL "stack" visual: four flowing energy layers, each in its
 * layer color, with the active one igniting as you scroll. Single fragment
 * shader (no 3D meshes, no bloom) — far lighter than the old slabs. Pauses
 * when off-screen.
 */
const LayersField = ({ className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

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
      uniform float uActive;
      uniform float uFocus;
      uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1.,0.)), f.x),
                   mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), f.x), f.y);
      }
      vec3 layerColor(int idx){
        if(idx==0) return uC0; if(idx==1) return uC1; if(idx==2) return uC2; return uC3;
      }
      void main(){
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        float side = smoothstep(0.16, 0.5, uv.x); // keep the left clear for text
        vec3 col = vec3(0.0);
        for(int i=0;i<4;i++){
          float fi = float(i);
          float yc = 0.22 + fi * 0.185;
          float flow = (noise(vec2(uv.x*2.6 + iTime*0.22 + fi*8.0, fi*2.0)) - 0.5) * 0.06
                     + sin(uv.x*7.0 + iTime*0.5 + fi*1.7) * 0.012;
          float d = abs(uv.y - yc + flow);
          float activeness = 1.0 - clamp(abs(uActive - fi), 0.0, 1.0);
          float intensity = mix(0.16, 1.3, activeness);
          float band = smoothstep(0.10, 0.0, d) * 0.32;
          float core = 0.006 / (d + 0.004);
          col += layerColor(i) * (band + core) * intensity;
        }
        float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
        gl_FragColor = vec4(col, a * side * uFocus);
      }
    `;

    const compile = (src: string, type: number) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("LayersField shader:", gl.getShaderInfoLog(sh));
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
    const uActive = gl.getUniformLocation(program, "uActive");
    const uFocus = gl.getUniformLocation(program, "uFocus");
    const c = LAYER_COLORS.map(hexToRgb);
    gl.uniform3fv(gl.getUniformLocation(program, "uC0"), c[0]);
    gl.uniform3fv(gl.getUniformLocation(program, "uC1"), c[1]);
    gl.uniform3fv(gl.getUniformLocation(program, "uC2"), c[2]);
    gl.uniform3fv(gl.getUniformLocation(program, "uC3"), c[3]);

    let inView = false;
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView && !raf) raf = requestAnimationFrame(render);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    let raf = 0;
    let focus = 0;
    const start = performance.now();
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!inView) return;
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uActive, scrollState.stack * 3.0);
      // ease the section fade so it doesn't pop
      focus += (scrollState.stackFocus - focus) * 0.1;
      gl.uniform1f(uFocus, focus);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
};

export default LayersField;
