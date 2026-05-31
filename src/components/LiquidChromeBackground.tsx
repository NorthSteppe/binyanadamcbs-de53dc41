import { useEffect, useRef } from "react";

/**
 * Full-screen WebGL liquid chrome backdrop.
 * - Fixed behind all content (z -10, pointer-events-none).
 * - Mouse / touch ripple the chrome surface in real time.
 * - Cheap single-pass fragment shader, runs at devicePixelRatio capped to 1.5.
 */
const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;     // pixels, y-flipped
uniform float u_dark;      // 0 = light, 1 = dark

// hash + value noise
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// iridescent chrome palette — silver / steel / faint holo tint
vec3 chromePalette(float t, float dark){
  // base mercury ramp
  vec3 a = mix(vec3(0.92, 0.94, 0.98), vec3(0.20, 0.22, 0.28), smoothstep(0.0, 1.0, t));
  vec3 b = mix(vec3(0.55, 0.60, 0.70), vec3(0.05, 0.06, 0.10), smoothstep(0.0, 1.0, t));
  vec3 mid = mix(a, b, dark);
  // holographic tint that sweeps across luminance
  vec3 holo = 0.5 + 0.5 * cos(6.2831 * (t + vec3(0.00, 0.18, 0.42)));
  return mix(mid, mid * (0.7 + 0.6 * holo), 0.22);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  vec2 mouse = (u_mouse - 0.5 * u_res) / min(u_res.x, u_res.y);

  // pointer ripple — strong gaussian bulge that warps the domain toward the cursor
  vec2 toM = uv - mouse;
  float d  = length(toM);
  float bulge = exp(-d * 2.2) * 1.35;
  vec2 warp = normalize(toM + 1e-5) * bulge;

  // concentric ripple rings emanating from the cursor
  float rings = sin(d * 28.0 - u_time * 3.2) * exp(-d * 2.0);

  // domain-warped fbm — slow, liquid
  float t = u_time * 0.08;
  vec2 q = uv * 1.6 + warp;
  vec2 r = vec2(
    fbm(q + vec2(0.0, t)),
    fbm(q + vec2(5.2, -t * 1.1))
  );
  float n = fbm(q + 2.4 * r + vec2(-t, t * 0.7));

  // chrome bands — sharp lit ridges along the gradient
  float bands = 0.5 + 0.5 * sin(12.0 * n + 4.0 * length(r) - t * 2.0);
  bands = pow(bands, 2.2);

  // bright rim halo around the cursor
  float halo = exp(-d * 4.0) * 0.9;
  float rim  = smoothstep(0.6, 0.15, d) * smoothstep(0.0, 0.2, d) * 0.8;

  float lum = clamp(0.30 * n + 0.55 * bands + 0.45 * rim + 0.35 * halo + 0.20 * rings, 0.0, 1.0);
  vec3 col = chromePalette(lum, u_dark);

  // electric cyan tint at the cursor core for a visible reactive glow
  vec3 cyan = vec3(0.30, 0.85, 1.0);
  col = mix(col, cyan, halo * 0.55);

  // soft vignette to seat content
  float vig = smoothstep(1.2, 0.2, length(uv));
  col *= mix(0.78, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("shader compile", gl.getShaderInfoLog(sh));
  }
  return sh;
}

export default function LiquidChromeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uDark = gl.getUniformLocation(prog, "u_dark");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const targetMouse = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };

    const resize = () => {
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      targetMouse.x = w * 0.5;
      targetMouse.y = h * 0.5;
      mouse.x = targetMouse.x;
      mouse.y = targetMouse.y;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      targetMouse.x = e.clientX * dpr;
      targetMouse.y = (window.innerHeight - e.clientY) * dpr;
    };
    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      targetMouse.x = e.touches[0].clientX * dpr;
      targetMouse.y = (window.innerHeight - e.touches[0].clientY) * dpr;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    const start = performance.now();
    let raf = 0;
    const tick = () => {
      // ease toward cursor for fluid lag
      mouse.x += (targetMouse.x - mouse.x) * 0.18;
      mouse.y += (targetMouse.y - mouse.y) * 0.18;
      const isDark = document.documentElement.classList.contains("dark") ? 1 : 0;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uDark, isDark);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      const ext = gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
