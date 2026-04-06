(function () {
  const canvas = document.getElementById("intro-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const asciiArtText = [
    "    █████╗ ███████╗ ██████╗██╗██╗     █████╗ ██████╗ ████████╗",
    "   ██╔══██╗██╔════╝██╔════╝██║██║    ██╔══██╗██╔══██╗╚══██╔══╝",
    "   ███████║███████╗██║     ██║██║    ███████║██████╔╝   ██║   ",
    "   ██╔══██║╚════██║██║     ██║██║    ██╔══██║██╔══██╗   ██║   ",
    "   ██║  ██║███████║╚██████╗██║███    ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ",
  ];

  const Colors = {
    bg: "#050a12",
    con: "#1c2535",
    conD: "#141c2a",
    conE: "#253040",
    glOn: "rgba(0, 255, 224, 0.85)",
    gloff: "rgba(10, 30, 60, 0.6)",
    crack: "#00ffe0",
    moon: "#c8d8e8",
    steelL: "#3a5070",
  };

  let W = 0;
  let H = 0;

  let BW = 118;
  let BX = 0;
  let BY = 0;
  const FLOORS = 24;
  const FH = 12;
  const FG = 1;
  let TH = 0;

  let Windows = [];
  let Stars = [];
  let debris = [];
  let particles = [];
  let cracks = [];
  let explosionTriggered = false;
  let frame = 0;
  let animationId = null;
  let asciiRevealProgress = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    W = canvas.width;
    H = canvas.height;

    updateBuildingDimensions();
    initStars();
    initWindows();
    initDebris();
    initCracks();
  }

  function updateBuildingDimensions() {
    BW = Math.min(180, W * 0.28);
    BX = (W - BW) / 2;
    BY = H - 50;
    TH = FLOORS * (FH + FG);
  }

  function initWindows() {
    Windows = Array.from({ length: FLOORS }, () =>
      Array.from({ length: 6 }, () => ({ lit: Math.random() > 0.45 })),
    );
  }

  function initStars() {
    Stars = Array.from({ length: 65 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (H * 0.45),
      r: 0.4 + Math.random() * 1.5,
      p: Math.random() * Math.PI * 2,
    }));
  }

  function initDebris() {
    debris = [];
    for (let i = 0; i < FLOORS; i++) {
      const fy = BY - i * (FH + FG);
      const piecesPerFloor = 5;

      for (let j = 0; j < piecesPerFloor; j++) {
        const segW = BW / piecesPerFloor;
        const xPos = BX + j * segW;
        const hasWindow = j === 1 || j === 2 || j === 3;
        let winIdx = j;
        if (winIdx > 4) winIdx = 4;

        debris.push({
          x: xPos,
          y: fy,
          ox: xPos,
          oy: fy,
          w: segW - 2,
          h: FH,
          vx: 0,
          vy: 0,
          rot: 0,
          rv: 0,
          alpha: 1,
          floor: i,
          col: i % 2 === 0 ? Colors.con : Colors.conD,
          hasWindow,
          lit: (Windows[i] && Windows[i][winIdx]?.lit) || false,
          active: false,
        });
      }
    }
  }

  function initCracks() {
    cracks = [];
    for (let i = 0; i < 32; i++) {
      cracks.push({
        x: BX + 10 + Math.random() * (BW - 20),
        y: BY - 10 - Math.random() * (TH - 25),
        len: 12 + Math.random() * 45,
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.3,
        branch: Math.random() > 0.65,
        intensity: 0,
      });
    }
  }

  function ratio(f, start, end) {
    return Math.max(0, Math.min(1, (f - start) / (end - start)));
  }

  function easeOut(t) {
    return 1 - (1 - t) * (1 - t);
  }

  function spawnExplosionParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 1.5 + Math.random() * 4.5,
        life: 1,
        decay: 0.008 + Math.random() * 0.02,
        isDust: false,
        color: `rgba(0, ${160 + Math.random() * 95}, 210,`,
      });
    }
  }

  function spawnDustCloud(x, y) {
    for (let i = 0; i < 15; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -1.5 - Math.random() * 2.8,
        size: 10 + Math.random() * 25,
        life: 1,
        decay: 0.005 + Math.random() * 0.012,
        isDust: true,
        color: `rgba(100, 130, 160,`,
      });
    }
  }

  function triggerExplosion() {
    if (explosionTriggered) return;
    explosionTriggered = true;

    debris.forEach((d) => {
      const offsetX = d.ox - W / 2;
      const direction = offsetX > 0 ? 1 : -1;
      const angleBase = direction > 0 ? -Math.PI * 0.3 : -Math.PI * 0.7;
      const floorFactor = d.floor / FLOORS;
      const speed = 2.8 + Math.random() * 8 + floorFactor * 5;

      d.vx =
        Math.cos(angleBase + (Math.random() - 0.5) * 0.9) * speed * direction;
      d.vy = Math.sin(angleBase) * speed - floorFactor * 4.5;
      d.rv = (Math.random() - 0.5) * 0.22;
      d.active = true;
    });

    spawnExplosionParticles(W / 2, BY - TH / 2, 160);

    for (let i = 0; i < 45; i++) {
      spawnDustCloud(BX + Math.random() * BW, BY - Math.random() * TH);
    }
  }

  function drawSky() {
    ctx.fillStyle = Colors.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = Colors.moon;
    ctx.beginPath();
    ctx.arc(W * 0.85, 38, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = Colors.bg;
    ctx.beginPath();
    ctx.arc(W * 0.85 + 7, 34, 15, 0, Math.PI * 2);
    ctx.fill();

    Stars.forEach((s) => {
      const twinkle = Math.sin(s.p + frame * 0.015) * 0.45 + 0.55;
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillStyle = "#eef5ff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    ctx.fillStyle = "#0a0f18";
    ctx.fillRect(0, H - 46, W, 46);

    ctx.fillStyle = "#10161f";
    ctx.fillRect(0, H - 26, W, 16);

    ctx.fillStyle = "rgba(0, 255, 224, 0.12)";
    for (let i = 0; i < W; i += 50) {
      ctx.fillRect(i, H - 18, 28, 2);
    }
  }

  function drawBuilding(progress, shakeX = 0, shakeY = 0, flicker = 1) {
    const visibleFloors = Math.ceil(progress * FLOORS);

    ctx.save();
    ctx.translate(shakeX, shakeY);

    for (let i = 0; i < visibleFloors && i < FLOORS; i++) {
      const fy = BY - i * (FH + FG) - FH;
      const isPartial = i === visibleFloors - 1 && progress < 1;
      const floorHeight = isPartial ? (progress * FLOORS - i) * FH : FH;

      if (floorHeight <= 0) continue;

      ctx.fillStyle = i % 2 === 0 ? Colors.con : Colors.conD;
      ctx.fillRect(BX, fy + (FH - floorHeight), BW, floorHeight);

      ctx.fillStyle = Colors.conE;
      ctx.fillRect(BX, fy + (FH - floorHeight), BW, 1);
      ctx.fillRect(BX, fy + (FH - floorHeight), 2.5, floorHeight);
      ctx.fillRect(BX + BW - 2.5, fy + (FH - floorHeight), 2.5, floorHeight);

      if (!isPartial && Windows[i]) {
        const ww = 9;
        const wh = 6;
        const startX = 8;
        const gaps = (BW - startX * 2 - 6 * ww) / 5;

        for (let wIdx = 0; wIdx < 6 && wIdx < Windows[i].length; wIdx++) {
          const wx = BX + startX + wIdx * (ww + gaps);
          const win = Windows[i][wIdx];

          ctx.fillStyle = win.lit ? Colors.glOn : Colors.gloff;
          ctx.globalAlpha = win.lit ? flicker * 0.85 : 0.5;
          ctx.fillRect(wx, fy + 3, ww, wh);
        }
      }
    }

    ctx.globalAlpha = 1;

    if (progress > 0.85) {
      const topY = BY - TH;

      ctx.fillStyle = Colors.steelL;
      ctx.fillRect(BX + 16, topY - 20, BW - 32, 20);

      ctx.strokeStyle = Colors.steelL;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, topY - 20);
      ctx.lineTo(W / 2, topY - 54);
      ctx.stroke();

      if (Math.sin(frame * 0.2) > 0.3) {
        ctx.fillStyle = "rgba(255, 70, 100, 0.9)";
        ctx.beginPath();
        ctx.arc(W / 2, topY - 54, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawCracks(crackProgress) {
    const activeCount = Math.floor(crackProgress * cracks.length);

    for (let i = 0; i < activeCount && i < cracks.length; i++) {
      const cr = cracks[i];
      cr.intensity = Math.min(1, cr.intensity + 0.05);

      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = Colors.crack;
      ctx.strokeStyle = Colors.crack;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = cr.intensity * 0.9;

      ctx.beginPath();
      ctx.moveTo(cr.x, cr.y);
      ctx.lineTo(
        cr.x + Math.cos(cr.angle) * cr.len,
        cr.y + Math.sin(cr.angle) * cr.len,
      );
      ctx.stroke();

      if (cr.branch) {
        ctx.lineWidth = 1;
        const midX = cr.x + Math.cos(cr.angle) * cr.len * 0.45;
        const midY = cr.y + Math.sin(cr.angle) * cr.len * 0.45;

        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(
          midX + Math.cos(cr.angle + 0.7) * cr.len * 0.4,
          midY + Math.sin(cr.angle + 0.7) * cr.len * 0.4,
        );
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function drawGlowingAsciiSign(revealAmount) {
    if (revealAmount <= 0) return;

    const centerX = W / 2;
    const pulse = 0.6 + Math.sin(Date.now() * 0.004) * 0.4;
    const opacity = Math.min(1, revealAmount * 1.2);

    ctx.save();
    ctx.globalAlpha = opacity;

    const frameW = Math.min(430, W - 28);
    const frameH = 140;
    const frameX = centerX - frameW / 2;
    const frameY = H / 2 - frameH / 2 + 10;

    const scaleReveal = Math.min(1, revealAmount * 1.5);

    ctx.shadowBlur = 20 * scaleReveal;
    ctx.shadowColor = "#00ffe0";

    ctx.strokeStyle = `rgba(0, 255, 224, ${0.6 + pulse * 0.3})`;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(frameX, frameY, frameW, frameH);

    ctx.strokeStyle = `rgba(200, 240, 255, ${0.4 + pulse * 0.3})`;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(frameX + 4, frameY + 4, frameW - 8, frameH - 8);

    ctx.fillStyle = `rgba(5, 8, 18, ${0.85 * opacity})`;
    ctx.fillRect(frameX + 2, frameY + 2, frameW - 4, frameH - 4);

    for (let i = 0; i < 12; i++) {
      const flick = 0.4 + Math.sin(Date.now() * 0.006 + i) * 0.6;
      ctx.fillStyle = `rgba(0, 255, 224, ${0.5 + flick * 0.5})`;
      ctx.shadowBlur = 10;

      const xPos = frameX + 18 + i * 35;
      if (xPos < frameX + frameW - 12) {
        ctx.beginPath();
        ctx.arc(xPos, frameY - 6, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(xPos, frameY + frameH + 6, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.shadowBlur = 15;

    const asciiBlockHeight = (asciiArtText.length - 1) * 13;
    const asciiTopY = frameY + 50;

    asciiArtText.forEach((line, idx) => {
      const yPos = asciiTopY + idx * 13;
      if (yPos > frameY + frameH - 36) return;

      const charsToShow = Math.floor(
        line.length * Math.min(1, revealAmount * 1.8),
      );
      const visibleText = line.slice(0, charsToShow);

      ctx.shadowColor = "#00ffe0";
      ctx.fillStyle = `rgba(0, 255, 224, ${0.9 + pulse * 0.1})`;
      ctx.fillText(visibleText, centerX, yPos);

      ctx.shadowColor = "#c8f6ff";
      ctx.fillStyle = "rgba(0, 220, 255, 0.4)";
      ctx.fillText(visibleText, centerX - 1, yPos - 1);
    });

    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#00ffe0";

    const titleY = asciiTopY + asciiBlockHeight + 20;

    ctx.fillStyle = `rgba(200, 240, 255, ${
      0.7 + Math.sin(Date.now() * 0.006) * 0.3
    })`;
    ctx.fillText("⚡ ASCII ART ⚡", centerX, titleY);

    ctx.fillStyle = `rgba(0, 255, 224, ${0.5 + pulse * 0.4})`;
    ctx.fillRect(frameX + 26, frameY + frameH - 18, frameW - 52, 2.5);

    ctx.fillStyle = "rgba(200, 240, 255, 0.6)";
    ctx.fillRect(frameX + 36, frameY + frameH - 14, frameW - 72, 1.5);

    ctx.restore();
  }

  function updateDebrisAndParticles() {
    debris.forEach((d) => {
      if (!d.active) return;

      d.vy += 0.26;
      d.x += d.vx;
      d.y += d.vy;
      d.rot += d.rv;
      d.alpha = Math.max(0, d.alpha - 0.009);

      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.col;
      ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);

      if (d.hasWindow) {
        ctx.globalAlpha = d.alpha * (d.lit ? 0.55 : 0.2);
        ctx.fillStyle = d.lit ? Colors.glOn : Colors.gloff;
        ctx.fillRect(-d.w / 2 + 3, -d.h / 2 + 3, d.w - 6, d.h - 6);
      }

      ctx.restore();
    });

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= p.decay;

      if (p.life <= 0) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.isDust) {
        ctx.fillStyle = p.color + p.life * 0.2 + ")";
      } else {
        ctx.fillStyle = p.color + p.life + ")";
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    particles = particles.filter((p) => p.life > 0);
  }

  const Timeline = {
    build: { s: 0, e: 115 },
    crack: { s: 175, e: 270 },
    boom: { s: 270, e: 420 },
    signReveal: { s: 420, e: 560 },
    restartAt: 680,
  };

  function animate() {
    drawSky();

    if (frame <= Timeline.build.e) {
      const buildP = ratio(frame, Timeline.build.s, Timeline.build.e);
      drawBuilding(easeOut(buildP));
    }

    if (frame > Timeline.build.e && frame <= Timeline.crack.s) {
      const flick = 0.7 + Math.sin(frame * 0.28) * 0.3;
      drawBuilding(1, 0, 0, flick);
    }

    if (frame > Timeline.crack.s && frame <= Timeline.boom.s) {
      const crackP = ratio(frame, Timeline.crack.s, Timeline.crack.e);
      const shakeX = crackP > 0.3 ? (Math.random() - 0.5) * crackP * 6 : 0;
      const shakeY = crackP > 0.3 ? (Math.random() - 0.5) * crackP * 4 : 0;

      drawBuilding(1, shakeX, shakeY, 0.85 + Math.random() * 0.4);
      drawCracks(crackP);

      if (crackP > 0.8 && frame % 5 === 0) {
        ctx.fillStyle = "rgba(0, 255, 224, 0.05)";
        ctx.fillRect(0, 0, W, H);
      }
    }

    if (frame >= Timeline.boom.s && !explosionTriggered) {
      triggerExplosion();
    }

    if (frame >= Timeline.boom.s) {
      updateDebrisAndParticles();
    }

    if (frame >= Timeline.signReveal.s) {
      asciiRevealProgress = ratio(
        frame,
        Timeline.signReveal.s,
        Timeline.signReveal.e,
      );
      drawGlowingAsciiSign(asciiRevealProgress);
    }

    frame++;

    if (frame >= Timeline.restartAt) {
      frame = 0;
      explosionTriggered = false;
      asciiRevealProgress = 0;
      initWindows();
      initDebris();
      initCracks();
      particles = [];
    }

    animationId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animationId) cancelAnimationFrame(animationId);
    frame = 0;
    explosionTriggered = false;
    asciiRevealProgress = 0;
    particles = [];
    resizeCanvas();
    animate();
  }

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  startAnimation();
})();
