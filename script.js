/* =============================
   CURSOR TRACK
============================= */
let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  document.body.style.setProperty('--cx', `${mx}px`);
  document.body.style.setProperty('--cy', `${my}px`);
});

/* =============================
   BACKGROUND CANVAS
============================= */
(function setupBg() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const orbs = [
    { cx: 0.16, cy: 0.18, r: 0.42, color: '#001f47', dx: 0.00022, dy: 0.00018 },
    { cx: 0.82, cy: 0.72, r: 0.36, color: '#00264f', dx: -0.00018, dy: 0.00024 },
    { cx: 0.50, cy: 0.54, r: 0.55, color: '#00295d', dx: 0.00012, dy: -0.00016 },
    { cx: 0.90, cy: 0.14, r: 0.25, color: '#003d6d', dx: -0.00024, dy: 0.0001 },
    { cx: 0.22, cy: 0.86, r: 0.25, color: '#00213f', dx: 0.00015, dy: -0.00014 },
    { cx: 0.68, cy: 0.22, r: 0.22, color: '#00427e', dx: 0.00012, dy: 0.0001 },
    { cx: 0.08, cy: 0.62, r: 0.18, color: '#00305f', dx: 0.00011, dy: -0.00012 }
  ];

  let t = 0;

  function draw() {
    t += 1;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#03101d');
    bg.addColorStop(0.45, '#072240');
    bg.addColorStop(1, '#02101d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    orbs.forEach((o) => {
      o.cx += o.dx * Math.sin(t * 0.01);
      o.cy += o.dy * Math.cos(t * 0.013);

      const x = o.cx * W;
      const y = o.cy * H;
      const r = o.r * Math.min(W, H);

      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `${o.color}dd`);
      g.addColorStop(0.55, `${o.color}48`);
      g.addColorStop(1, 'transparent');

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    const mouseGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 360);
    mouseGlow.addColorStop(0, 'rgba(130,220,255,0.32)');
    mouseGlow.addColorStop(0.22, 'rgba(60,170,255,0.18)');
    mouseGlow.addColorStop(0.6, 'rgba(10,132,255,0.06)');
    mouseGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = mouseGlow;
    ctx.beginPath();
    ctx.arc(mx, my, 360, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.012)';
    for (let y = 0; y < H; y += 4) {
      ctx.fillRect(0, y, W, 1);
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

/* =============================
   GEO SHAPES
============================= */
(function setupGeo() {
  const layer = document.getElementById('geoLayer');
  if (!layer) return;

  const count = 34;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'geo';

    const size = 24 + Math.random() * 92;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${100 + Math.random() * 45}%`;
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : `${8 + Math.random() * 18}px`;
    el.style.animationDuration = `${14 + Math.random() * 24}s`;
    el.style.animationDelay = `-${Math.random() * 20}s`;

    layer.appendChild(el);
  }

  function spawnBurst(x, y, n = 8) {
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'geo';
      const size = 8 + Math.random() * 16;
      const angle = (i / n) * Math.PI * 2;
      const dist = 60 + Math.random() * 90;

      el.style.cssText = `
        width:${size}px;
        height:${size}px;
        position:fixed;
        left:${x}px;
        top:${y}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '6px'};
        opacity:0.45;
        z-index:5;
        transition:transform .75s ease-out, opacity .75s ease-out;
        transform:translate(-50%,-50%) scale(1);
        pointer-events:none;
      `;

      layer.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0.2)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 800);
    }
  }

  document.addEventListener('click', (e) => {
    spawnBurst(e.clientX, e.clientY, 7);
  });
})();

/* =============================
   STRONG 3D TILT
============================= */
(function setupTilt() {
  const card = document.getElementById('card');
  const frame = document.querySelector('.card-frame');
  if (!card || !frame) return;

  let targetRX = 0;
  let targetRY = 0;
  let currentRX = 0;
  let currentRY = 0;

  function updateTarget(x, y) {
    const rect = frame.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    targetRY = ((x - cx) / (rect.width / 2)) * 18;
    targetRX = (-(y - cy) / (rect.height / 2)) * 14;
  }

  document.addEventListener('mousemove', (e) => {
    updateTarget(e.clientX, e.clientY);
  });

  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    updateTarget(touch.clientX, touch.clientY);
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    targetRX = 0;
    targetRY = 0;
  });

  document.addEventListener('touchend', () => {
    targetRX = 0;
    targetRY = 0;
  });

  function animate() {
    currentRX += (targetRX - currentRX) * 0.09;
    currentRY += (targetRY - currentRY) * 0.09;

    frame.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;
    card.style.transform = `translateZ(0px)`;

    requestAnimationFrame(animate);
  }

  animate();
})();

/* =============================
   FIREWORKS FAST
============================= */
(function setupFireworks() {
  const fwCanvas = document.getElementById('fw-canvas');
  const fundBtn = document.getElementById('fundBtn');
  if (!fwCanvas || !fundBtn) return;

  const fwCtx = fwCanvas.getContext('2d');
  let fwParticles = [];

  function fwResize() {
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
  }
  fwResize();
  window.addEventListener('resize', fwResize);

  class FWParticle {
    constructor(x, y, color) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 3;

      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.017 + 0.012;
      this.radius = Math.random() * 2.8 + 1.4;
      this.gravity = 0.11;
      this.color = color;
      this.trail = [];
    }

    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 6) this.trail.shift();

      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.985;
      this.alpha -= this.decay;
    }

    draw() {
      this.trail.forEach((t, i) => {
        const a = (i / this.trail.length) * this.alpha * 0.45;
        fwCtx.beginPath();
        fwCtx.arc(t.x, t.y, this.radius * (i / this.trail.length), 0, Math.PI * 2);
        fwCtx.fillStyle = this.color.replace(',1)', `,${a})`);
        fwCtx.fill();
      });

      fwCtx.beginPath();
      fwCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      fwCtx.fillStyle = this.color.replace(',1)', `,${this.alpha})`);
      fwCtx.fill();
    }

    dead() {
      return this.alpha <= 0;
    }
  }

  const FW_COLORS = [
    'rgba(111,211,255,1)',
    'rgba(10,132,255,1)',
    'rgba(255,255,255,1)',
    'rgba(0,180,255,1)',
    'rgba(160,235,255,1)'
  ];

  function fwExplode(x, y) {
    const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
    for (let i = 0; i < 92; i++) fwParticles.push(new FWParticle(x, y, color));
    for (let i = 0; i < 18; i++) fwParticles.push(new FWParticle(x, y, 'rgba(255,255,255,1)'));
  }

  function fwLoop() {
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    fwParticles = fwParticles.filter((p) => !p.dead());
    fwParticles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(fwLoop);
  }
  fwLoop();

  fundBtn.addEventListener('click', () => {
    const x = window.innerWidth * (0.42 + Math.random() * 0.16);
    const y = window.innerHeight * (0.28 + Math.random() * 0.08);

    fwExplode(x, y);
    setTimeout(() => fwExplode(x - 120, y + 30), 90);
    setTimeout(() => fwExplode(x + 120, y + 20), 180);
  });
})();

/* =============================
   GLOBAL RIPPLE
============================= */
document.addEventListener('click', (e) => {
  const ripple = document.createElement('span');

  ripple.style.cssText = `
    position:fixed;
    width:8px;
    height:8px;
    border-radius:50%;
    background:rgba(255,255,255,0.62);
    left:${e.clientX}px;
    top:${e.clientY}px;
    transform:translate(-50%,-50%) scale(0);
    pointer-events:none;
    z-index:9999;
    transition:transform .62s ease, opacity .62s ease;
    box-shadow:0 0 18px rgba(111,211,255,0.8), 0 0 34px rgba(10,132,255,0.4);
  `;

  document.body.appendChild(ripple);

  requestAnimationFrame(() => {
    ripple.style.transform = 'translate(-50%,-50%) scale(16)';
    ripple.style.opacity = '0';
  });

  setTimeout(() => ripple.remove(), 650);
});

/* =============================
   CONFESS FORM + AUTO RESIZE
============================= */
document.addEventListener('DOMContentLoaded', function () {
  const textarea = document.getElementById('confessMessage');
  if (textarea) {
    function autoResize() {
      textarea.style.height = '48px';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    textarea.addEventListener('input', autoResize);
  }

  const form = document.getElementById('confessForm');
  const status = document.getElementById('confessStatus');
  const submitBtn = document.getElementById('confessSubmit');

  if (!form || !status || !submitBtn) return;

  const ENDPOINT_URL = 'https://telegram.justlonghung.workers.dev';

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('confessName')?.value.trim() || '';
    const message = document.getElementById('confessMessage')?.value.trim() || '';

    if (!name || !message) {
      status.textContent = 'Điền đủ họ tên và lời nhắn đi đã.';
      status.className = 'confess-status error';
      return;
    }

    submitBtn.disabled = true;
    status.textContent = 'Đang gửi...';
    status.className = 'confess-status';

    try {
      const res = await fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          message,
          page: window.location.href,
          sentAt: new Date().toISOString()
        })
      });

      if (!res.ok) {
        throw new Error('Send failed');
      }

      form.reset();
      if (textarea) textarea.style.height = '48px';
      status.textContent = 'Đã gửi';
      status.className = 'confess-status success';
    } catch (err) {
      status.textContent = 'Chưa thể gửi, mã lỗi LH36';
      status.className = 'confess-status error';
    } finally {
      submitBtn.disabled = false;
    }
  });
});

/* =============================
   MINI GAME: MONEY + BOMB + FAKE
============================= */
document.addEventListener('DOMContentLoaded', function () {
  const gameBtn = document.getElementById('gameBtn');
  const gameModal = document.getElementById('gameModal');
  const gameClose = document.getElementById('gameClose');
  const gameStage = document.getElementById('gameStage');
  const gamePlayer = document.getElementById('gamePlayer');
  const gameScore = document.getElementById('gameScore');
  const gameTimer = document.getElementById('gameTimer');
  const gameResult = document.getElementById('gameResult');
  const gameFinalScore = document.getElementById('gameFinalScore');
  const gameRestart = document.getElementById('gameRestart');

  if (
    !gameBtn || !gameModal || !gameClose || !gameStage || !gamePlayer ||
    !gameScore || !gameTimer || !gameResult || !gameFinalScore || !gameRestart
  ) {
    console.log('Mini game missing elements');
    return;
  }

  const NORMAL_SRC = gamePlayer.dataset.normal || 'phule.png';
  const HURT_SRC = gamePlayer.dataset.hurt || 'phuledau.png';
  const GAME_DURATION = 15;
  const EASY_PHASE_END = 12;
  const WARNING_PHASE_START = 3;

  let isOpen = false;
  let isPlaying = false;
  let score = 0;
  let playerX = 0;
  let targetX = 0;
  let stageRect = null;
  let fallingItems = [];
  let moneyInterval = null;
  let bombInterval = null;
  let loopId = null;
  let timeLeft = GAME_DURATION;
  let countdownInterval = null;
  let hurtTimeout = null;

  function updateRect() {
    stageRect = gameStage.getBoundingClientRect();
  }

  function renderPlayer() {
    gamePlayer.style.left = `${playerX}px`;
  }

  function clearItems() {
    fallingItems.forEach(item => item.el.remove());
    fallingItems = [];
  }

  function resetPlayerSkin() {
    if (hurtTimeout) {
      clearTimeout(hurtTimeout);
      hurtTimeout = null;
    }
    gamePlayer.src = NORMAL_SRC;
    gamePlayer.classList.remove('hurt');
  }

  function triggerHurtSkin() {
    if (hurtTimeout) clearTimeout(hurtTimeout);

    gamePlayer.src = HURT_SRC;
    gamePlayer.classList.add('hurt');
    gameStage.classList.remove('shake');
    void gameStage.offsetWidth;
    gameStage.classList.add('shake');

    hurtTimeout = setTimeout(() => {
      gamePlayer.src = NORMAL_SRC;
      gamePlayer.classList.remove('hurt');
    }, 700);
  }

  function updateScoreUI() {
    gameScore.textContent = String(score);
  }

  function updateTimerUI() {
    gameTimer.textContent = String(timeLeft);

    if (timeLeft <= WARNING_PHASE_START) {
      gameStage.classList.add('warning');
    } else {
      gameStage.classList.remove('warning');
    }
  }

  function openGame() {
    isOpen = true;
    gameModal.classList.add('show');
    gameModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    startGame();
  }

  function closeGame() {
    isOpen = false;
    isPlaying = false;
    gameModal.classList.remove('show');
    gameModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    stopTimers();
    stopLoop();
    clearItems();
    resetPlayerSkin();
    gameResult.classList.remove('show');
    gameStage.classList.remove('warning');
  }

  function startGame() {
    isPlaying = true;
    score = 0;
    timeLeft = GAME_DURATION;
    updateScoreUI();
    updateTimerUI();
    gameResult.classList.remove('show');

    updateRect();

    playerX = stageRect.width / 2;
    targetX = playerX;
    renderPlayer();

    clearItems();
    resetPlayerSkin();

    startSpawns();
    startCountdown();
    startLoop();
  }

  function endGame() {
    isPlaying = false;
    stopTimers();
    stopLoop();
    clearItems();
    resetPlayerSkin();

    gameFinalScore.textContent = String(score);
    gameResult.classList.add('show');
  }

  function stopTimers() {
    if (moneyInterval) {
      clearInterval(moneyInterval);
      moneyInterval = null;
    }
    if (bombInterval) {
      clearInterval(bombInterval);
      bombInterval = null;
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  function stopLoop() {
    if (loopId) {
      cancelAnimationFrame(loopId);
      loopId = null;
    }
  }

  function spawnItem(type) {
    if (!isPlaying || !stageRect) return;

    const el = document.createElement('div');
    const isBomb = type === 'bomb';
    const isFakeMoney = type === 'fakeMoney';

    el.className = isBomb ? 'game-bomb' : 'game-money';
    el.textContent = isBomb ? '💣' : '💸';

    const size = isBomb ? 30 + Math.random() * 14 : 34 + Math.random() * 12;
    const x = Math.random() * Math.max(40, stageRect.width - size - 20);

    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.fontSize = `${size - 2}px`;

    gameStage.appendChild(el);

    fallingItems.push({
      el,
      type,
      x,
      y: -size,
      size,
      flipped: false,
      flipAtY: stageRect.height - 150 - Math.random() * 60,
      speed: isBomb
        ? (timeLeft > EASY_PHASE_END
            ? 3.0 + Math.random() * 1.2
            : timeLeft > WARNING_PHASE_START
              ? 5.4 + Math.random() * 2.2
              : 7.2 + Math.random() * 3.2)
        : isFakeMoney
          ? 3.2 + Math.random() * 1.6
          : 2.2 + Math.random() * 1.8
    });
  }

  function startSpawns() {
    spawnItem('money');

    moneyInterval = setInterval(() => {
      if (!isPlaying) return;

      spawnItem('money');

      if (Math.random() > 0.72) {
        setTimeout(() => {
          if (isPlaying) spawnItem('money');
        }, 150);
      }

      if (timeLeft <= EASY_PHASE_END && Math.random() > 0.6) {
        spawnItem('fakeMoney');
      }
    }, 430);

    bombInterval = setInterval(() => {
      if (!isPlaying) return;

      if (timeLeft > EASY_PHASE_END) {
        if (Math.random() > 0.82) {
          spawnItem('bomb');
        }
      } else if (timeLeft > WARNING_PHASE_START) {
        spawnItem('bomb');

        if (Math.random() > 0.55) {
          setTimeout(() => {
            if (isPlaying) spawnItem('bomb');
          }, 170);
        }
      } else {
        spawnItem('bomb');
        spawnItem('bomb');

        if (Math.random() > 0.35) {
          setTimeout(() => {
            if (isPlaying) spawnItem('bomb');
          }, 110);
        }

        if (Math.random() > 0.75) {
          setTimeout(() => {
            if (isPlaying) spawnItem('fakeMoney');
          }, 90);
        }
      }
    }, 240);
  }

  function startCountdown() {
    countdownInterval = setInterval(() => {
      timeLeft -= 1;
      updateTimerUI();

      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function startLoop() {
    function loop() {
      if (!isPlaying || !stageRect) return;

      playerX += (targetX - playerX) * 0.2;
      renderPlayer();

      const playerWidth = gamePlayer.offsetWidth;
      const playerHeight = gamePlayer.offsetHeight || playerWidth;
      const playerLeft = playerX - playerWidth / 2;
      const playerRight = playerX + playerWidth / 2;
      const playerTop = stageRect.height - playerHeight - 18;
      const playerBottom = stageRect.height;

      fallingItems = fallingItems.filter(item => {
        item.y += item.speed;

        if (item.type === 'fakeMoney' && !item.flipped && item.y >= item.flipAtY) {
          item.flipped = true;
          item.type = 'bomb';
          item.el.textContent = '💣';
          item.el.className = 'game-bomb';
          item.speed += 2.4;
        }

        item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;

        const itemLeft = item.x;
        const itemRight = item.x + item.size;
        const itemTop = item.y;
        const itemBottom = item.y + item.size;

        const hit =
          itemRight > playerLeft &&
          itemLeft < playerRight &&
          itemBottom > playerTop &&
          itemTop < playerBottom;

        if (hit) {
          if (item.type === 'money') {
            score += 1;
            updateScoreUI();
          } else {
            score = Math.max(0, score - 2);
            updateScoreUI();
            triggerHurtSkin();
          }

          item.el.remove();
          return false;
        }

        if (item.y > stageRect.height + 80) {
          item.el.remove();
          return false;
        }

        return true;
      });

      loopId = requestAnimationFrame(loop);
    }

    loopId = requestAnimationFrame(loop);
  }

  gameBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!isOpen) openGame();
  });

  gameClose.addEventListener('click', closeGame);

  gameModal.addEventListener('click', function (e) {
    if (e.target === gameModal) closeGame();
  });

  gameRestart.addEventListener('click', startGame);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeGame();
  });

  gameStage.addEventListener('mousemove', function (e) {
    if (!stageRect) updateRect();
    const half = gamePlayer.offsetWidth / 2;
    let x = e.clientX - stageRect.left;
    x = Math.max(half, Math.min(stageRect.width - half, x));
    targetX = x;
  });

  gameStage.addEventListener('touchstart', function (e) {
    if (!stageRect) updateRect();
    const touch = e.touches[0];
    const half = gamePlayer.offsetWidth / 2;
    let x = touch.clientX - stageRect.left;
    x = Math.max(half, Math.min(stageRect.width - half, x));
    targetX = x;
  }, { passive: true });

  gameStage.addEventListener('touchmove', function (e) {
    if (!stageRect) updateRect();
    const touch = e.touches[0];
    const half = gamePlayer.offsetWidth / 2;
    let x = touch.clientX - stageRect.left;
    x = Math.max(half, Math.min(stageRect.width - half, x));
    targetX = x;
  }, { passive: true });

  window.addEventListener('resize', function () {
    if (!isOpen) return;
    updateRect();
  });
});
