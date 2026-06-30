/* ═══════════════════════════════════════════════════════════════════════════
   BHAVISHYA GURU — script.js
   Animations · Canvas Cosmos · Scroll Interactions
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

/* ── Reduced-motion check ───────────────────────────────────────────────────── */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Wait for GSAP to load ──────────────────────────────────────────────────── */
function waitForGSAP(cb) {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    cb();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      const interval = setInterval(() => {
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
          clearInterval(interval);
          cb();
        }
      }, 50);
    });
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   1. COSMOS CANVAS — stars + glowing orbs
   ══════════════════════════════════════════════════════════════════════════════ */
(function initCosmos() {
  const canvas = document.getElementById("cosmos-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, stars = [], orbs = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", () => { resize(); buildScene(); });

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function buildScene() {
    /* Stars */
    stars = [];
    const count = Math.floor((W * H) / 3200);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rand(0, W), y: rand(0, H),
        r: rand(0.2, 1.4),
        a: rand(0.2, 0.9),
        speed: rand(0.0002, 0.001),
        phase: rand(0, Math.PI * 2),
      });
    }

    /* Background orbs */
    orbs = [
      { cx: W * 0.2,  cy: H * 0.3,  r: W * 0.22, cr: "rgba(100,60,180,0.06)",  dx: 0, dy: 0, phase: 0,     speed: 0.00016 },
      { cx: W * 0.78, cy: H * 0.6,  r: W * 0.28, cr: "rgba(212,100,30,0.05)",  dx: 0, dy: 0, phase: 2.1,   speed: 0.00012 },
      { cx: W * 0.5,  cy: H * 0.85, r: W * 0.18, cr: "rgba(212,175,55,0.04)",  dx: 0, dy: 0, phase: 4.5,   speed: 0.00020 },
    ];
  }
  buildScene();

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Gradient sky */
    const grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    grad.addColorStop(0, "#070A13");
    grad.addColorStop(0.5, "#0D0B1E");
    grad.addColorStop(1, "#0B0F1A");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* Orbs */
    orbs.forEach(o => {
      const drift = Math.sin(t * o.speed * 1000 + o.phase);
      const ox = o.cx + drift * W * 0.015;
      const oy = o.cy + Math.cos(t * o.speed * 800 + o.phase) * H * 0.012;
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
      g.addColorStop(0, o.cr);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
      ctx.fill();
    });

    /* Stars */
    stars.forEach(s => {
      const alpha = s.a * (0.5 + 0.5 * Math.sin(t * s.speed * 1000 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,200,180,${alpha})`;
      ctx.fill();
    });

    t += 0.016;
    requestAnimationFrame(draw);
  }

  if (!prefersReducedMotion) {
    requestAnimationFrame(draw);
  } else {
    /* Static sky only */
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#070A13");
    grad.addColorStop(1, "#0B0F1A");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }
})();

/* ══════════════════════════════════════════════════════════════════════════════
   2. NAVBAR — scroll behaviour & mobile toggle
   ══════════════════════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar  = document.getElementById("navbar");
  const toggle  = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  /* Scroll class */
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      navbar.classList.toggle("scrolled", window.scrollY > 60);
      ticking = false;
    });
  }, { passive: true });

  /* Mobile toggle */
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("open", !expanded);
  });

  /* Close on link click */
  navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("open");
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════════════
   3. SCROLL — Zodiac wheel rotation (tied to scroll progress)
   ══════════════════════════════════════════════════════════════════════════════ */
(function initZodiacScroll() {
  if (prefersReducedMotion) return;
  const wheel = document.getElementById("zodiacWheel");
  if (!wheel) return;

  let currentAngle = 0;
  let targetAngle  = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    currentAngle = lerp(currentAngle, targetAngle, 0.04);
    wheel.style.transform = `rotate(${currentAngle}deg)`;
    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    targetAngle = progress * 360;
  }, { passive: true });

  requestAnimationFrame(tick);
})();

/* ══════════════════════════════════════════════════════════════════════════════
   4. INTERSECTION OBSERVER — glass card reveal (sharp-but-slow)
   ══════════════════════════════════════════════════════════════════════════════ */
(function initReveal() {
  const cards = document.querySelectorAll(".glass-card[data-reveal]");
  if (!cards.length) return;

  if (prefersReducedMotion) {
    cards.forEach(c => {
      c.style.opacity = "1";
      c.style.transform = "none";
      c.style.backdropFilter = "blur(16px)";
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      /* Stagger based on index in parent */
      const siblings = [...el.parentElement.children].filter(c => c.hasAttribute("data-reveal"));
      const idx = siblings.indexOf(el);
      const delay = idx * 160; /* ms per card — gentle cascade */

      setTimeout(() => {
        el.classList.add("revealed");
      }, delay);

      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  cards.forEach(c => observer.observe(c));
})();

/* ══════════════════════════════════════════════════════════════════════════════
   5. GSAP — Hero entrance (GSAP enhances the CSS animations)
       Services horizontal scroll-sync progress bar
   ══════════════════════════════════════════════════════════════════════════════ */
waitForGSAP(function () {
  gsap.registerPlugin(ScrollTrigger);

  if (!prefersReducedMotion) {
    /* ── Parallax: background zodiac drifts slower than foreground ── */
    const zodiacWrapper = document.querySelector(".zodiac-scroll-wrapper");
    if (zodiacWrapper) {
      gsap.to(zodiacWrapper, {
        yPercent: -14,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 4,
        }
      });
    }
  }

  /* ── Services track progress bar ── */
  const track   = document.getElementById("servicesTrack");
  const wrapper = document.getElementById("servicesTrackWrapper");
  const bar     = document.getElementById("servicesProgressBar");

  if (track && wrapper && bar) {
    wrapper.addEventListener("scroll", () => {
      const max  = track.scrollWidth - wrapper.clientWidth;
      const pct  = max > 0 ? (wrapper.scrollLeft / max) * 100 : 0;
      bar.style.width = pct + "%";
    }, { passive: true });
  }

  /* ── Section titles: subtle fade+rise ── */
  if (!prefersReducedMotion) {
    document.querySelectorAll(".section-title, .section-eyebrow").forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        }
      });
    });
  }
});

/* ══════════════════════════════════════════════════════════════════════════════
   6. SERVICES TRACK — drag-to-scroll (mouse)
   ══════════════════════════════════════════════════════════════════════════════ */
(function initDragScroll() {
  const wrapper = document.getElementById("servicesTrackWrapper");
  if (!wrapper) return;

  let isDown = false, startX, scrollStart;

  wrapper.addEventListener("mousedown", e => {
    isDown = true;
    startX = e.pageX - wrapper.offsetLeft;
    scrollStart = wrapper.scrollLeft;
    wrapper.style.cursor = "grabbing";
  });
  window.addEventListener("mouseup",   () => { isDown = false; wrapper.style.cursor = "grab"; });
  window.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 1.4;
    wrapper.scrollLeft = scrollStart - walk;
  });
})();

/* ══════════════════════════════════════════════════════════════════════════════
   7. CONTACT FORM — basic validation + submit feedback
   ══════════════════════════════════════════════════════════════════════════════ */
(function initForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const btn  = form.querySelector(".btn-submit");
    const text = btn.querySelector(".btn-text");

    /* Simple field check */
    const required = form.querySelectorAll("[required]");
    let valid = true;
    required.forEach(field => {
      field.style.borderBottomColor = "";
      if (!field.value.trim()) {
        field.style.borderBottomColor = "rgba(255,80,80,0.6)";
        valid = false;
      }
    });
    if (!valid) return;

    /* Visual feedback */
    btn.disabled = true;
    text.textContent = "Sending…";
    btn.style.opacity = "0.7";

    /* Simulate send (replace with fetch/FormData for real backend) */
    setTimeout(() => {
      text.textContent = "Enquiry Sent ✦";
      btn.style.background = "linear-gradient(135deg, #3a7d44, #2d6235)";
      btn.style.opacity = "1";
      form.reset();
      setTimeout(() => {
        text.textContent = "Send Enquiry";
        btn.style.background = "";
        btn.disabled = false;
      }, 4000);
    }, 1200);
  });
})();

/* ══════════════════════════════════════════════════════════════════════════════
   8. IDLE BACKGROUND MANDALA — floating SVG behind sections
   ══════════════════════════════════════════════════════════════════════════════ */
(function injectFloatingMandalas() {
  if (prefersReducedMotion) return;

  const positions = [
    { top: "8%",  right: "-8%",  size: "360px", delay: "0s",   dur: "32s" },
    { top: "45%", left:  "-12%", size: "280px", delay: "-10s", dur: "40s" },
    { top: "78%", right: "5%",   size: "200px", delay: "-20s", dur: "26s" },
  ];

  const style = `
    @keyframes mandalaFloat {
      0%,100% { transform: translate(0,0) rotate(0deg) scale(1); }
      33%      { transform: translate(8px,-10px) rotate(2.5deg) scale(1.01); }
      66%      { transform: translate(-6px,7px) rotate(-2deg) scale(0.99); }
    }
  `;
  const styleEl = document.createElement("style");
  styleEl.textContent = style;
  document.head.appendChild(styleEl);

  positions.forEach(pos => {
    const div = document.createElement("div");
    div.setAttribute("aria-hidden", "true");
    Object.assign(div.style, {
      position: "fixed",
      top:   pos.top  || "auto",
      left:  pos.left || "auto",
      right: pos.right || "auto",
      width:  pos.size,
      height: pos.size,
      zIndex: "2",
      pointerEvents: "none",
      opacity: "0.35",
      animation: `mandalaFloat ${pos.dur} ease-in-out ${pos.delay} infinite`,
    });

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    svg.setAttribute("width",  pos.size);
    svg.setAttribute("height", pos.size);

    /* Kundli-inspired 9-house grid */
    const paths = [
      "M100,10 L190,100 L100,190 L10,100 Z",
      "M100,45 L155,100 L100,155 L45,100 Z",
      "M100,10 L100,190", "M10,100 L190,100",
      "M10,100 L100,10", "M190,100 L100,190",
      "M10,100 L100,190","M190,100 L100,10",
    ];
    paths.forEach(d => {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "rgba(212,175,55,0.3)");
      path.setAttribute("stroke-width", "0.7");
      svg.appendChild(path);
    });

    /* Center dot */
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "100"); circle.setAttribute("cy", "100"); circle.setAttribute("r", "4");
    circle.setAttribute("fill", "rgba(212,175,55,0.2)");
    svg.appendChild(circle);

    div.appendChild(svg);
    document.body.appendChild(div);
  });
})();
