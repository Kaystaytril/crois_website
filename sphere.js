/* CROIS — ambient sphere, scroll reveals, nav condense, sphere parallax */

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("sphere-canvas");

  /* ---- Rotating Fibonacci point-sphere ---- */
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const SIZE = 660;
    canvas.width = SIZE * DPR; canvas.height = SIZE * DPR;
    canvas.style.width = SIZE + "px"; canvas.style.height = SIZE + "px";
    ctx.scale(DPR, DPR);

    const N = 360, points = [], golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = golden * i;
      points.push({ x: Math.cos(t) * r, y: y, z: Math.sin(t) * r });
    }

    const R = SIZE * 0.36, CX = SIZE / 2, CY = SIZE / 2;
    let angle = 0;

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const sinA = Math.sin(angle), cosA = Math.cos(angle);
      const tilt = 0.35, sinT = Math.sin(tilt), cosT = Math.cos(tilt);
      for (const p of points) {
        let x = p.x * cosA + p.z * sinA, z = -p.x * sinA + p.z * cosA;
        let y = p.y * cosT - z * sinT; z = p.y * sinT + z * cosT;
        const depth = (z + 1) / 2;
        const px = CX + x * R, py = CY + y * R;
        ctx.beginPath();
        ctx.arc(px, py, 1 + depth * 2.1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(231, 183, 159," + (0.08 + depth * 0.52).toFixed(3) + ")";
        ctx.fill();
      }
      ctx.save();
      ctx.translate(CX, CY); ctx.rotate(0.12);
      ctx.beginPath(); ctx.ellipse(0, 0, R, R * 0.32, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(206, 139, 114, 0.30)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }

    if (reduceMotion) { angle = 0.8; draw(); }
    else { (function loop() { angle += 0.0026; draw(); requestAnimationFrame(loop); })(); }

    /* Parallax: drift the sphere gently as the page scrolls */
    if (!reduceMotion) {
      let ticking = false;
      window.addEventListener("scroll", function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            const y = window.scrollY * 0.06;
            canvas.style.transform = "translateY(calc(-50% + " + y + "px))";
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  /* ---- Scroll reveals + dividers ---- */
  const items = document.querySelectorAll(".reveal, .divider");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  /* ---- Nav condense on scroll ---- */
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
