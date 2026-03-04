const lenis = new Lenis({
  smoothWheel: true,
  lerp: 0.08,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.defaults({ markers: false });

  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
      },
    });
  });

  const heroCard = document.querySelector(".hero .media-card");
  if (heroCard) {
    gsap.fromTo(
      heroCard,
      { y: 28, rotateX: 8, rotateY: -8 },
      {
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 1.1,
        ease: "power2.out",
      }
    );
  }
}

document.querySelectorAll(".tilt").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(1000px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  });
});
