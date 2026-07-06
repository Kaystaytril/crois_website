/* CROIS — ambient geometric sphere + scroll reveals
   A slowly rotating Fibonacci point-sphere in rose gold, glowing against the
   dark background. Kept to the edge so it never competes with text. */

(function () {
  const canvas = document.getElementById("sphere-canvas");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canvas) {
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const SIZE = 660;
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width = SIZE + "px";
    canvas.style.height = SIZE + "px";
    ctx.scale(DPR, DPR);

    const N = 360;
    const points = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      points.push({ x: Math.cos(t) * r, y: y, z: Math.sin(t) * r });
    }

    const R = SIZE * 0.36;
    const CX = SIZE / 2, CY = SIZE / 2;
    let angle = 0;

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const sinA = Math.sin(angle), cosA = Math.cos(angle);
      const tilt = 0.35, sinT = Math.sin(tilt), cosT = Math.cos(tilt);

      for (const p of points) {
        let x = p.x * cosA + p.z * sinA;
        let z = -p.x * sinA + p.z * cosA;
        let y = p.y * cosT - z * sinT;
        z = p.y * sinT + z * cosT;

        const depth = (z + 1) / 2;           // 0 back → 1 front
        const px = CX + x * R;
        const py = CY + y * R;
        const size = 1 + depth * 2.1;
        const alpha = 0.08 + depth * 0.52;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(228, 180, 157," + alpha.toFixed(3) + ")";
        ctx.fill();
      }

      // thin equator ring for structure
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(0.12);
      ctx.beginPath();
      ctx.ellipse(0, 0, R, R * 0.32, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(206, 139, 114, 0.30)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    if (reduceMotion) {
      angle = 0.8;
      draw();
    } else {
      (function loop() {
        angle += 0.0026;
        draw();
        requestAnimationFrame(loop);
      })();
    }
  }

  // Scroll reveals
  const revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealed.forEach((el) => io.observe(el));
  } else {
    revealed.forEach((el) => el.classList.add("in"));
  }
})();
