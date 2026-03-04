<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

useHead({
  title: "Terminal Yard Operating System | Replica",
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap",
    },
  ],
});

let lenis: Lenis | null = null;
let rafId = 0;
const truckWebglCanvas = ref<HTMLCanvasElement | null>(null);
let truckDestroy: (() => void) | null = null;

const tiltHandlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
function setupTruckSequence() {
  const canvas = truckWebglCanvas.value;
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 2.2, 6.2);
  camera.lookAt(0, 1.05, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const ambient = new THREE.AmbientLight(0xdff7f1, 0.62);
  const key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(3.2, 5.8, 4.6);
  const fill = new THREE.DirectionalLight(0x6bd4be, 0.5);
  fill.position.set(-4.3, 2.4, -2.4);
  scene.add(ambient, key, fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.8, 64),
    new THREE.MeshStandardMaterial({ color: 0x0e2825, metalness: 0.1, roughness: 0.95 }),
  );
  floor.rotation.x = -Math.PI * 0.5;
  floor.position.y = 0;
  scene.add(floor);

  const truckPivot = new THREE.Group();
  const truck = new THREE.Group();
  truckPivot.add(truck);
  scene.add(truckPivot);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3a6c63, metalness: 0.34, roughness: 0.52 });
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x6be0c2, metalness: 0.24, roughness: 0.42 });
  const detailMat = new THREE.MeshStandardMaterial({ color: 0x16302c, metalness: 0.22, roughness: 0.7 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0d0d, metalness: 0.1, roughness: 0.94 });

  const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.05, 1.45), bodyMat);
  trailer.position.set(-0.82, 1.26, 0);
  truck.add(trailer);

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.46, 1.52), detailMat);
  chassis.position.set(0, 0.7, 0);
  truck.add(chassis);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.0, 1.4), cabinMat);
  cabin.position.set(1.26, 1.28, 0);
  truck.add(cabin);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.56, 1.3), bodyMat);
  hood.position.set(2.2, 0.94, 0);
  truck.add(hood);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.34, 1.2), detailMat);
  bumper.position.set(2.74, 0.58, 0);
  truck.add(bumper);

  const axleXs = [-1.62, -0.42, 1.28, 2.14];
  const axleZs = [-0.76, 0.76];
  axleXs.forEach((x) => {
    axleZs.forEach((z) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.26, 28), wheelMat);
      wheel.rotation.z = Math.PI * 0.5;
      wheel.position.set(x, 0.38, z);
      truck.add(wheel);
    });
  });

  const bounds = new THREE.Box3().setFromObject(truck);
  const center = new THREE.Vector3();
  bounds.getCenter(center);
  truck.position.sub(center);

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  const sequence = gsap.to(truckPivot.rotation, {
    y: Math.PI * 2.15,
    ease: "none",
    scrollTrigger: {
      trigger: ".truck-sequence",
      start: "top top",
      end: "+=2100",
      scrub: true,
      pin: ".truck-stage",
      invalidateOnRefresh: true,
    },
    onUpdate: () => renderer.render(scene, camera),
  });

  const subtleTilt = gsap.to(truckPivot.rotation, {
    x: -0.08,
    repeat: -1,
    yoyo: true,
    duration: 2.6,
    ease: "sine.inOut",
    onUpdate: () => renderer.render(scene, camera),
  });

  window.addEventListener("resize", resize);
  ScrollTrigger.addEventListener("refreshInit", resize);
  resize();

  truckDestroy = () => {
    sequence.kill();
    subtleTilt.kill();
    window.removeEventListener("resize", resize);
    ScrollTrigger.removeEventListener("refreshInit", resize);
    renderer.dispose();
    floor.geometry.dispose();
    (floor.material as THREE.Material).dispose();
  };
}

onMounted(() => {
  lenis = new Lenis({ lerp: 0.08, smoothWheel: true });

  const raf = (time: number) => {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  gsap.registerPlugin(ScrollTrigger);

  gsap.set(".reveal", { opacity: 0, y: 24 });
  gsap.to(".hero-copy", { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" });
  gsap.to(".hero-visual", { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out", delay: 0.15 });

  gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 82%",
      },
    });
  });

  gsap.utils.toArray<HTMLElement>(".media-card").forEach((el) => {
    gsap.to(el, {
      yPercent: -8,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        scrub: true,
        start: "top bottom",
        end: "bottom top",
      },
    });
  });

  document.querySelectorAll<HTMLElement>(".tilt").forEach((card) => {
    const move = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
    };
    const leave = () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    };
    card.addEventListener("mousemove", move);
    card.addEventListener("mouseleave", leave);
    tiltHandlers.push({ el: card, move, leave });
  });

  setupTruckSequence();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  lenis?.destroy();
  truckDestroy?.();
  truckDestroy = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
  tiltHandlers.forEach(({ el, move, leave }) => {
    el.removeEventListener("mousemove", move);
    el.removeEventListener("mouseleave", leave);
  });
});
</script>

<template>
  <div class="page">
    <div class="grid-bg"></div>
    <div class="line-noise"></div>

    <header class="site-header">
      <a class="logo" href="#">
        <span class="mark"></span>
        <span>Terminal</span>
      </a>
      <nav class="nav">
        <a href="#platform">Platform</a>
        <a href="#results">Results</a>
        <a href="#contact">Contact</a>
      </nav>
      <a class="btn btn-small" href="#contact">Book Demo</a>
    </header>

    <main>
      <section class="hero section">
        <div class="hero-copy reveal">
          <p class="eyebrow">TERMINAL YARD OPERATING SYSTEM</p>
          <h1>The New Industry Standard in Yard Operations</h1>
          <p class="lead">
            Replicated with the same implementation pattern: Nuxt + GSAP + Lenis and
            pre-rendered 3D-looking media blocks, rather than runtime WebGL scenes.
          </p>
          <div class="actions">
            <a class="btn" href="#contact">Book A Demo</a>
            <a class="btn ghost" href="#platform">Explore Product</a>
          </div>
        </div>

        <div class="hero-visual media-card tilt reveal">
          <video
            autoplay
            muted
            loop
            playsinline
            src="https://a.storyblok.com/f/337048/x/0f153ebd58/vid_4-3_wide_v02_1.mp4"
          ></video>
          <div class="scan"></div>
        </div>
      </section>

      <section class="truck-sequence section reveal">
        <div class="truck-copy">
          <p class="eyebrow">WHEEL-LINKED 3D ROTATION</p>
          <h3>Scroll to orbit around the truck in true 3D</h3>
          <p>
            The truck stays locked in-frame while scroll controls a continuous 3D
            rotational orbit.
          </p>
        </div>
        <div class="truck-stage media-card">
          <canvas ref="truckWebglCanvas" class="truck-canvas"></canvas>
        </div>
      </section>

      <section class="logo-band section reveal">
        <span>Trusted by modern yards</span>
        <div class="logos">
          <span>FREIGHT ONE</span>
          <span>MIDWEST CARTAGE</span>
          <span>NORTH DOCK</span>
          <span>RAILGATE</span>
          <span>YARDLINK</span>
        </div>
      </section>

      <section id="results" class="stats section reveal">
        <article><h2>35%</h2><p>faster turnaround</p></article>
        <article><h2>22%</h2><p>less idle time</p></article>
        <article><h2>99.9%</h2><p>event visibility</p></article>
      </section>

      <section id="platform" class="platform section">
        <div class="notch reveal"></div>
        <div class="platform-head reveal">
          <p class="eyebrow">LIVE OPERATION VIEW</p>
          <h3>One command layer for docks, yards, and carriers</h3>
        </div>

        <div class="media-grid">
          <article class="media-card tall tilt reveal">
            <video
              autoplay
              muted
              loop
              playsinline
              src="https://a.storyblok.com/f/337048/x/6aa67249be/vid_4-3_vert_v02_1.mp4"
            ></video>
          </article>
          <article class="media-card tilt reveal">
            <video
              autoplay
              muted
              loop
              playsinline
              src="https://a.storyblok.com/f/337048/x/85fd9d83d7/vid_4-1_wide_prerender_1.mp4"
            ></video>
          </article>
          <article class="media-card tilt reveal">
            <video
              autoplay
              muted
              loop
              playsinline
              src="https://a.storyblok.com/f/337048/x/5d1992bef6/vid_3-2_prerender_1.mp4"
            ></video>
          </article>
          <article class="media-card tilt reveal">
            <video
              autoplay
              muted
              loop
              playsinline
              src="https://a.storyblok.com/f/337048/x/b29a0119a7/vid_4-2_wide_prerender_1.mp4"
            ></video>
          </article>
        </div>
      </section>

      <section class="quote section reveal">
        <blockquote>
          "The interface feels like an operating room for yard flow. Everything is
          visible, measurable, and coordinated."
        </blockquote>
        <p>Head of Operations, Midwest Freight Group</p>
      </section>

      <section id="contact" class="cta section reveal">
        <h3>See terminal orchestration on your data</h3>
        <p>Get a custom walkthrough using your yard profile and workflows.</p>
        <form class="form" @submit.prevent>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Work Email" />
          <button class="btn" type="submit">Request Demo</button>
        </form>
      </section>
    </main>
  </div>
</template>

<style>
:root {
  --bg: #041111;
  --bg2: #08201e;
  --text: #e5f0eb;
  --muted: #9db4ac;
  --line: #183934;
  --accent: #56e1bf;
}

* {
  box-sizing: border-box;
}

html,
body,
#__nuxt {
  margin: 0;
  min-height: 100%;
}

body {
  color: var(--text);
  font-family: "Space Grotesk", sans-serif;
  background: radial-gradient(circle at 20% 8%, #0f2d2a 0%, var(--bg) 42%, #020706 100%);
}

.page {
  position: relative;
  overflow-x: clip;
}

.grid-bg,
.line-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.grid-bg {
  background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 52px 52px;
  opacity: 0.26;
}

.line-noise {
  background: linear-gradient(180deg, transparent 0%, rgba(13, 53, 47, 0.15) 38%, transparent 100%);
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 72px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5vw;
  backdrop-filter: blur(10px);
  background: rgba(4, 15, 14, 0.78);
  border-bottom: 1px solid #1b3c37;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.mark {
  width: 16px;
  height: 16px;
  border: 2px solid var(--accent);
  border-right-color: transparent;
  transform: rotate(45deg);
}

.nav {
  display: flex;
  gap: 1.3rem;
}

.nav a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.94rem;
}

.section {
  width: min(1180px, 92vw);
  margin: 0 auto;
}

.hero {
  min-height: calc(100vh - 72px);
  display: grid;
  grid-template-columns: 1.02fr 0.98fr;
  align-items: center;
  gap: 3rem;
  padding: 4.5rem 0 3.2rem;
}

.eyebrow {
  margin: 0 0 0.9rem;
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
}

h1 {
  margin: 0;
  font-size: clamp(2.7rem, 6.2vw, 5.4rem);
  line-height: 0.93;
  max-width: 12ch;
}

.lead {
  margin-top: 1.2rem;
  max-width: 58ch;
  color: var(--muted);
}

.actions {
  margin-top: 1.7rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.78rem;
}

.btn {
  border-radius: 999px;
  border: 1px solid #3d6c65;
  padding: 0.74rem 1.12rem;
  text-decoration: none;
  font-weight: 600;
  background: var(--accent);
  color: #03100f;
}

.btn.ghost {
  background: transparent;
  color: var(--text);
}

.btn-small {
  font-size: 0.86rem;
  padding: 0.5rem 0.95rem;
}

.media-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid #2a4f49;
  background: #0a201d;
  box-shadow: 0 28px 80px rgba(0, 17, 15, 0.6);
  transition: transform 0.18s ease;
}

.hero-visual {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}

.media-card video {
  width: 100%;
  display: block;
  object-fit: cover;
  aspect-ratio: 16 / 10;
}

.media-card.tall video {
  aspect-ratio: 4 / 5;
}

.truck-sequence {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 1rem;
  padding: 1rem 0 2rem;
}

.truck-copy {
  align-self: center;
}

.truck-copy h3 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.7rem);
  max-width: 16ch;
}

.truck-copy p {
  color: var(--muted);
  max-width: 48ch;
}

.truck-stage {
  min-height: clamp(360px, 52vw, 640px);
  border-radius: 24px;
}

.truck-canvas {
  width: 100%;
  height: 100%;
  display: block;
  background: radial-gradient(circle at 50% 40%, #153330 0%, #071514 70%);
}

.scan {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(124, 254, 218, 0.18) 50%, transparent 100%);
  mix-blend-mode: screen;
  animation: scan 4s linear infinite;
}

@keyframes scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.logo-band {
  border-top: 1px solid #1b3b37;
  border-bottom: 1px solid #1b3b37;
  padding: 1.2rem 0;
}

.logo-band > span {
  font-size: 0.8rem;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.logos {
  margin-top: 0.8rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.logos span {
  font-size: 0.88rem;
  color: #c4d6d0;
  border: 1px solid #2a4b46;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
}

.stats {
  padding: 2.1rem 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid #1b3b37;
}

.stats article {
  text-align: center;
}

.stats h2 {
  margin: 0;
  font-size: clamp(2rem, 4.2vw, 3.5rem);
}

.stats p {
  margin: 0.35rem 0 0;
  color: var(--muted);
}

.platform {
  padding: 4.5rem 0 1rem;
}

.notch {
  width: 100%;
  height: 44px;
  border: 1px solid #244741;
  border-bottom: none;
  border-radius: 18px 18px 0 0;
  clip-path: polygon(0 100%, 35% 100%, 45% 0, 55% 0, 65% 100%, 100% 100%, 100% 0, 0 0);
  opacity: 0.65;
}

.platform-head {
  margin-top: 1.5rem;
}

.platform-head h3 {
  margin: 0;
  font-size: clamp(1.7rem, 3.2vw, 3rem);
  max-width: 18ch;
}

.media-grid {
  margin-top: 1.8rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: 1.1fr 0.9fr;
}

.media-grid .media-card:nth-child(1) {
  grid-row: span 2;
}

.quote {
  margin-top: 3.8rem;
  border: 1px solid #2a4c47;
  border-radius: 18px;
  background: linear-gradient(135deg, #102927 0%, #081513 100%);
  padding: 2rem;
}

.quote blockquote {
  margin: 0;
  font-size: clamp(1.2rem, 2.2vw, 1.85rem);
  line-height: 1.4;
}

.quote p {
  margin: 1rem 0 0;
  color: var(--muted);
}

.cta {
  padding: 4.4rem 0 5.2rem;
}

.cta h3 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 3rem);
}

.cta p {
  margin: 0.7rem 0 0;
  color: var(--muted);
}

.form {
  margin-top: 1.2rem;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.7rem;
}

.form input {
  height: 44px;
  border-radius: 999px;
  border: 1px solid #2b534d;
  background: #0f2522;
  color: var(--text);
  padding: 0 0.95rem;
}

.reveal {
  opacity: 0;
  transform: translateY(24px);
}

@media (max-width: 980px) {
  .nav {
    display: none;
  }

  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 3.2rem;
  }

  .truck-sequence {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .media-grid {
    grid-template-columns: 1fr;
  }

  .media-grid .media-card:nth-child(1) {
    grid-row: auto;
  }

  .form {
    grid-template-columns: 1fr;
  }
}
</style>
