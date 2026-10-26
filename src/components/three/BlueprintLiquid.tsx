"use client";
/* ---------------------------------------------------------------------------
   BlueprintLiquid — the one WebGL scene behind the homepage.

   One PlaneGeometry, two skins:
     · a wireframe "blueprint" (ShaderMaterial + Points) whose vertices ripple
       and pull toward the cursor, and
     · a clearcoat "liquid gloss" surface (MeshPhysicalMaterial with the wave
       displacement injected via onBeforeCompile) that slowly cycles through
       rich paint colors.
   `uMorph` (0 → 1, driven by scroll) crossfades the displacement functions,
   the two skins' opacity, the plane tilt and the camera height, so the grid
   melts into paint as the reader scrolls from the hero into the services.

   Everything scroll- and pointer-driven is smoothed with exponential lerps
   inside useFrame, so it never stutters on a coarse scroll wheel.
   ------------------------------------------------------------------------- */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";

/* Shared GLSL: both skins displace with the same function so the crossfade is seamless. */
const GLSL_COMMON = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform vec2  uMouse;   // NDC, smoothed
uniform float uPointer; // 0 when the pointer is off-window

float wireDisp(vec2 p, float t) {
  return 0.07 * sin(p.x * 1.3 + t * 0.55) * cos(p.y * 1.1 - t * 0.4)
       + 0.04 * sin((p.x - p.y) * 2.2 + t * 0.8);
}
float liquidDisp(vec2 p, float t) {
  float d = 0.0;
  d += 0.42 * sin(p.x * 0.55 + t * 0.32);
  d += 0.32 * sin(p.y * 0.72 - t * 0.26 + p.x * 0.25);
  d += 0.18 * sin((p.x + p.y) * 0.95 + t * 0.48);
  d += 0.10 * sin(p.x * 1.9 - t * 0.7) * cos(p.y * 1.6 + t * 0.35);
  return d;
}
float disp(vec2 p, float t, float m) {
  return mix(wireDisp(p, t), liquidDisp(p, t), smoothstep(0.0, 1.0, m));
}
`;

const WIRE_VERT = /* glsl */ `
${GLSL_COMMON}
uniform float uAspect;
varying float vPull;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  float h = disp(pos.xy, uTime, uMorph);
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(pos.xy, pos.z + h, 1.0);
  vec2 ndc = clip.xy / clip.w;
  vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
  float pull = exp(-dot(d, d) * 7.0) * uPointer * (1.0 - uMorph);
  vPull = pull;
  pos.z += h + pull * 0.9;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const WIRE_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying float vPull;
varying vec2 vUv;
void main() {
  float edge = smoothstep(0.0, 0.14, vUv.x) * smoothstep(0.0, 0.14, 1.0 - vUv.x)
             * smoothstep(0.0, 0.14, vUv.y) * smoothstep(0.0, 0.14, 1.0 - vUv.y);
  vec3 col = mix(uColorA, uColorB, clamp(vPull * 1.8, 0.0, 1.0));
  float a = uOpacity * (0.34 + 0.66 * edge) * (0.55 + vPull * 1.3);
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}
`;

const POINT_VERT = /* glsl */ `
${GLSL_COMMON}
uniform float uAspect;
uniform float uDpr;
varying float vPull;
void main() {
  vec3 pos = position;
  float h = disp(pos.xy, uTime, uMorph);
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(pos.xy, pos.z + h, 1.0);
  vec2 ndc = clip.xy / clip.w;
  vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
  float pull = exp(-dot(d, d) * 7.0) * uPointer * (1.0 - uMorph);
  vPull = pull;
  pos.z += h + pull * 0.9;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (2.2 + pull * 7.0) * uDpr * (6.0 / -mv.z);
}
`;

const POINT_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying float vPull;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = dot(c, c);
  if (r > 0.25) discard;
  float soft = 1.0 - smoothstep(0.16, 0.25, r);
  vec3 col = mix(uColorA, uColorB, clamp(vPull * 1.8, 0.0, 1.0));
  gl_FragColor = vec4(col, soft * uOpacity * (0.6 + vPull));
}
`;

/* Rich paint palette the gloss surface drifts through. */
const PALETTE = ["#e3931e", "#8b2f3b", "#1f6f78", "#2b4a8a", "#5b2a6b", "#b8720f"].map((c) => new THREE.Color(c));

type Shared = {
  uTime: { value: number };
  uMorph: { value: number };
  uMouse: { value: THREE.Vector2 };
  uPointer: { value: number };
  uAspect: { value: number };
  uDpr: { value: number };
};

const smoothstep = (x: number, a: number, b: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function Scene({ segments, reduced }: { segments: number; reduced: boolean }) {
  const { gl, scene, camera, size, viewport } = useThree();
  const group = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const glossRef = useRef<THREE.Mesh>(null);

  /* Studio lighting for the clearcoat without fetching an HDR: three's
     RoomEnvironment rendered once through PMREM. */
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);

  const shared = useMemo<Shared>(() => ({
    uTime: { value: 0 }, uMorph: { value: 0 }, uMouse: { value: new THREE.Vector2(0, 0) },
    uPointer: { value: 0 }, uAspect: { value: 1 }, uDpr: { value: 1 },
  }), []);

  const geometry = useMemo(() => new THREE.PlaneGeometry(18, 11, segments, Math.round(segments * 0.62)), [segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const wireMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { ...shared, uColorA: { value: new THREE.Color("#5aa9ff") }, uColorB: { value: new THREE.Color("#f3b04a") }, uOpacity: { value: 1 } },
    vertexShader: WIRE_VERT, fragmentShader: WIRE_FRAG, wireframe: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), [shared]);
  const pointMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { ...shared, uColorA: { value: new THREE.Color("#9cc8ff") }, uColorB: { value: new THREE.Color("#ffd27a") }, uOpacity: { value: 1 } },
    vertexShader: POINT_VERT, fragmentShader: POINT_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), [shared]);

  const glossMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: PALETTE[0].clone(), metalness: 0.55, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.1,
      iridescence: 0.3, iridescenceIOR: 1.35, envMapIntensity: 1.05, transparent: true, opacity: 0, side: THREE.DoubleSide,
    });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, { uTime: shared.uTime, uMorph: shared.uMorph, uMouse: shared.uMouse, uPointer: shared.uPointer });
      shader.vertexShader = GLSL_COMMON + shader.vertexShader
        .replace("#include <beginnormal_vertex>", /* glsl */ `
          float e = 0.08;
          float h0 = disp(position.xy, uTime, uMorph);
          float hx = disp(position.xy + vec2(e, 0.0), uTime, uMorph);
          float hy = disp(position.xy + vec2(0.0, e), uTime, uMorph);
          vec3 objectNormal = normalize(vec3(-(hx - h0) / e, -(hy - h0) / e, 1.0));
          #ifdef USE_TANGENT
          vec3 objectTangent = vec3(tangent.xyz);
          #endif
        `)
        .replace("#include <begin_vertex>", /* glsl */ `vec3 transformed = vec3(position.xy, position.z + h0);`);
    };
    m.customProgramCacheKey = () => "z-liquid-gloss";
    return m;
  }, [shared]);

  useEffect(() => () => { wireMat.dispose(); pointMat.dispose(); glossMat.dispose(); }, [wireMat, pointMat, glossMat]);

  /* Pointer tracked on window because the canvas itself is pointer-events:none. */
  const target = useRef({ mouse: new THREE.Vector2(0, 0), pointer: 0 });
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      target.current.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
      target.current.pointer = 1;
    };
    const onLeave = () => { target.current.pointer = 0; };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("pointermove", onMove); document.documentElement.removeEventListener("mouseleave", onLeave); };
  }, [reduced]);

  const state = useRef({ time: 0, morph: 0, colorA: new THREE.Color(), tmp: new THREE.Color() });

  useFrame((_, dt) => {
    const s = state.current;
    const step = Math.min(dt, 1 / 30);
    if (!reduced) s.time += step;
    const k = 1 - Math.exp(-step * 4.5);

    /* Scroll → morph. 0 at the top of the hero, 1 once the services section is in view. */
    const vh = window.innerHeight || 1;
    const targetMorph = smoothstep(window.scrollY, vh * 0.12, vh * 1.1);
    s.morph += (targetMorph - s.morph) * (reduced ? 1 : k);

    shared.uTime.value = s.time;
    shared.uMorph.value = s.morph;
    shared.uMouse.value.lerp(target.current.mouse, k);
    shared.uPointer.value += (target.current.pointer - shared.uPointer.value) * k;
    shared.uAspect.value = size.width / size.height;
    shared.uDpr.value = viewport.dpr;

    /* Crossfade skins. */
    const wireA = 1 - smoothstep(s.morph, 0.3, 0.85);
    const glossA = smoothstep(s.morph, 0.2, 0.75);
    wireMat.uniforms.uOpacity.value = wireA;
    pointMat.uniforms.uOpacity.value = wireA;
    glossMat.opacity = glossA;
    if (wireRef.current) wireRef.current.visible = wireA > 0.01;
    if (pointsRef.current) pointsRef.current.visible = wireA > 0.01;
    if (glossRef.current) glossRef.current.visible = glossA > 0.01;

    /* Paint color drifts through the palette. */
    const ph = (s.time * 0.07) % PALETTE.length;
    const i = Math.floor(ph);
    const f = smoothstep(ph - i, 0, 1);
    s.colorA.lerpColors(PALETTE[i], PALETTE[(i + 1) % PALETTE.length], f);
    glossMat.color.copy(s.colorA);
    glossMat.roughness = 0.14 + 0.08 * (0.5 + 0.5 * Math.sin(s.time * 0.21));

    /* Camera pans down and the plane relaxes toward the viewer as the grid becomes paint. */
    const m = s.morph;
    camera.position.set(0, THREE.MathUtils.lerp(0.7, -1.5, m), THREE.MathUtils.lerp(6.6, 5.4, m));
    camera.lookAt(0, THREE.MathUtils.lerp(-0.1, -1.1, m), 0);
    if (group.current) {
      group.current.rotation.x = THREE.MathUtils.lerp(-0.62, -0.38, m);
      group.current.position.y = THREE.MathUtils.lerp(-0.6, -1.6, m);
    }
  });

  return (
    <group ref={group} rotation={[-0.62, 0, 0]} position={[0, -0.6, 0]}>
      <mesh ref={wireRef} geometry={geometry} material={wireMat} />
      <points ref={pointsRef} geometry={geometry} material={pointMat} />
      <mesh ref={glossRef} geometry={geometry} material={glossMat} />
    </group>
  );
}

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function BlueprintLiquid({ active, reduced, mobile }: { active: boolean; reduced: boolean; mobile: boolean }) {
  return (
    <GLBoundary>
      <Canvas
        dpr={[1, 1.75]}
        frameloop={active ? "always" : "never"}
        camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0.7, 6.6] }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
        style={{ position: "absolute", inset: 0 }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 120 } }}
      >
        <fog attach="fog" args={["#0a1120", 6.5, 15]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 5]} intensity={1.1} color="#ffe6c4" />
        <directionalLight position={[-6, -2, 3]} intensity={0.5} color="#5aa9ff" />
        <Scene segments={mobile ? 70 : 120} reduced={reduced} />
      </Canvas>
    </GLBoundary>
  );
}
