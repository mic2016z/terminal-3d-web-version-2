# Reverse-Engineering Notes (terminal-industries.com)

Observed from live HTML/bundles:
- Framework: Nuxt 3 / Vue 3 (SSR hydration markers and `__NUXT__` payload).
- Styling: Tailwind CSS (`tailwindcss v3.4.19` in inlined styles).
- Motion: GSAP timelines and `ScrollTrigger`.
- Scrolling: Lenis smooth scroll integration.
- CMS/content layer: Storyblok API payloads (`cdn/stories/*` in hydrated data).
- Analytics/third-party: GTM, Cloudflare insights, Contentsquare, Apollo tracker.

3D implementation pattern:
- Predominantly pre-rendered MP4/WebM assets from Storyblok CDN.
- No strong evidence of Three.js/WebGL scene graph on landing page runtime.
- Uses animated SVG/canvas overlays + motion choreography for depth perception.

Replica strategy in this folder:
- Preserved the same interaction model (motion-first, media-driven pseudo-3D).
- Rebuilt a single-page landing using GSAP + Lenis + layered cards + videos.
