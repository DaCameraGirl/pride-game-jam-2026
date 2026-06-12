const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const domGame = document.getElementById("domGame");
const scoreValue = document.getElementById("scoreValue");
const timeValue = document.getElementById("timeValue");
const bonusValue = document.getElementById("bonusValue");
const statusText = document.getElementById("statusText");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const modeTitle = document.getElementById("modeTitle");
const modeKicker = document.getElementById("modeKicker");
const goalTitle = document.getElementById("goalTitle");
const goalText = document.getElementById("goalText");
const touchControls = document.getElementById("touchControls");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const RAINBOW = [
  { id: "red", name: "Red", value: "#e40303" },
  { id: "orange", name: "Orange", value: "#ff8c00" },
  { id: "yellow", name: "Yellow", value: "#ffed00" },
  { id: "green", name: "Green", value: "#008026" },
  { id: "blue", name: "Blue", value: "#2447ff" },
  { id: "violet", name: "Violet", value: "#732982" }
];

const COLOR_LOOKUP = {
  red: { name: "Red", value: "#e40303" },
  orange: { name: "Orange", value: "#ff8c00" },
  yellow: { name: "Yellow", value: "#ffed00" },
  green: { name: "Green", value: "#008026" },
  blue: { name: "Blue", value: "#2447ff" },
  violet: { name: "Violet", value: "#732982" },
  sky: { name: "Sky Blue", value: "#5bcffa" },
  pink: { name: "Pink", value: "#f5a9b8" },
  white: { name: "White", value: "#ffffff" },
  black: { name: "Black", value: "#111111" },
  brown: { name: "Brown", value: "#784f17" },
  purple: { name: "Purple", value: "#9b4f96" },
  gray: { name: "Gray", value: "#a3a3a3" },
  magenta: { name: "Magenta", value: "#d60270" }
};

const MODE_COPY = {
  parade: {
    kicker: "Mini-game 01",
    title: "Parade Catch",
    goal: "Catch the bright pieces.",
    text: "Move the parade cart, collect prism pieces, and use a pulse to clear gray blocks.",
    status: "Catch color pieces. Avoid gray blocks. Space uses a pulse."
  },
  builder: {
    kicker: "Mini-game 02",
    title: "Flag Builder",
    goal: "Build the flag pattern.",
    text: "Pick color tiles in order and complete as many Pride flag patterns as you can.",
    status: "Choose the next stripe from top to bottom."
  },
  match: {
    kicker: "Mini-game 03",
    title: "Kindness Match",
    goal: "Match every pair.",
    text: "Flip cards, remember where the matching values are, and clear the board.",
    status: "Find matching values with the fewest turns."
  }
};

const FLAG_PATTERNS = [
  { name: "Rainbow Pride", stripes: ["red", "orange", "yellow", "green", "blue", "violet"] },
  { name: "Trans Pride", stripes: ["sky", "pink", "white", "pink", "sky"] },
  { name: "Nonbinary Pride", stripes: ["yellow", "white", "purple", "black"] },
  { name: "Bisexual Pride", stripes: ["magenta", "purple", "blue"] },
  { name: "Pan Pride", stripes: ["pink", "yellow", "sky"] },
  { name: "Asexual Pride", stripes: ["black", "gray", "white", "purple"] },
  { name: "Progress Colors", stripes: ["black", "brown", "sky", "pink", "white", "red", "orange", "yellow", "green", "blue", "violet"] }
];

const MATCH_PAIRS = [
  { label: "Joy", color: "#ffed00", mark: "J" },
  { label: "Care", color: "#5bcffa", mark: "C" },
  { label: "Brave", color: "#ff8c00", mark: "B" },
  { label: "Pride", color: "#e40303", mark: "P" },
  { label: "Respect", color: "#9b4f96", mark: "R" },
  { label: "Belong", color: "#008026", mark: "B" }
];

let currentMode = "parade";
let running = false;
let rafId = 0;
let lastTime = 0;
let globalTime = 0;

const keys = {
  left: false,
  right: false,
  pulse: false
};

let parade;
let builder;
let match;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setStatus(text) {
  statusText.textContent = text;
}

function updateHud(score, time, bonus) {
  scoreValue.textContent = String(score);
  timeValue.textContent = String(time);
  bonusValue.textContent = String(bonus);
}

function resetParade() {
  parade = {
    score: 0,
    streak: 0,
    time: 45,
    energy: 100,
    spawnTimer: 0.2,
    endReason: "",
    player: {
      x: WIDTH / 2 - 52,
      y: HEIGHT - 92,
      w: 104,
      h: 52,
      vx: 0,
      pulseCooldown: 0,
      pulseWave: 0
    },
    drops: [],
    particles: []
  };
}

function resetBuilder() {
  builder = {
    score: 0,
    round: 0,
    time: 75,
    streak: 0,
    pattern: null,
    choices: [],
    placed: [],
    message: "Press Start Game to begin."
  };
}

function resetMatch() {
  match = {
    score: 0,
    moves: 0,
    time: 0,
    deck: [],
    first: null,
    lock: false,
    matched: 0,
    message: "Press Start Game to begin."
  };
}

function resetCurrentMode() {
  running = false;
  cancelAnimationFrame(rafId);
  rafId = 0;
  lastTime = 0;

  if (currentMode === "parade") {
    resetParade();
    showCanvasGame();
    drawParade();
    updateHud(0, 45, 0);
  } else if (currentMode === "builder") {
    resetBuilder();
    showDomGame();
    renderBuilder();
    updateHud(0, 75, 0);
  } else {
    resetMatch();
    showDomGame();
    renderMatch();
    updateHud(0, 0, 0);
  }

  startButton.textContent = "Start Game";
  setStatus(MODE_COPY[currentMode].status);
}

function showCanvasGame() {
  canvas.classList.remove("is-hidden");
  domGame.classList.add("is-hidden");
  touchControls.classList.remove("is-hidden");
}

function showDomGame() {
  canvas.classList.add("is-hidden");
  domGame.classList.remove("is-hidden");
  touchControls.classList.add("is-hidden");
}

function setMode(mode) {
  currentMode = mode;
  const copy = MODE_COPY[mode];
  modeKicker.textContent = copy.kicker;
  modeTitle.textContent = copy.title;
  goalTitle.textContent = copy.goal;
  goalText.textContent = copy.text;

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });

  resetCurrentMode();
}

function startCurrentMode() {
  if (currentMode === "parade") {
    resetParade();
    running = true;
    startButton.textContent = "Restart";
    setStatus("Round running. Keep the color meter bright.");
    startLoop();
    return;
  }

  if (currentMode === "builder") {
    resetBuilder();
    running = true;
    startButton.textContent = "Restart";
    nextBuilderRound();
    setStatus("Build each flag from top stripe to bottom stripe.");
    startLoop();
    return;
  }

  resetMatch();
  running = true;
  startButton.textContent = "Restart";
  makeMatchDeck();
  renderMatch();
  setStatus("Flip two cards at a time and match the values.");
  startLoop();
}

function startLoop() {
  cancelAnimationFrame(rafId);
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
}

function loop(timestamp) {
  const dt = Math.min(0.04, (timestamp - lastTime) / 1000);
  lastTime = timestamp;
  globalTime += dt;

  if (currentMode === "parade") {
    updateParade(dt);
    drawParade();
  } else if (currentMode === "builder") {
    updateBuilder(dt);
  } else {
    updateMatch(dt);
  }

  if (running || currentMode === "parade") {
    rafId = requestAnimationFrame(loop);
  }
}

function makeDrop() {
  const isCloud = Math.random() < 0.25;
  const color = RAINBOW[Math.floor(Math.random() * RAINBOW.length)];
  return {
    kind: isCloud ? "cloud" : "prism",
    x: randomBetween(42, WIDTH - 42),
    y: -40,
    radius: isCloud ? randomBetween(18, 28) : randomBetween(13, 21),
    vy: isCloud ? randomBetween(130, 205) : randomBetween(150, 250),
    vx: randomBetween(-24, 24),
    spin: randomBetween(-2.5, 2.5),
    angle: randomBetween(0, Math.PI * 2),
    color: isCloud ? "#aab0bb" : color.value,
    name: color.name
  };
}

function spawnParticles(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    parade.particles.push({
      x,
      y,
      vx: randomBetween(-120, 120),
      vy: randomBetween(-140, 60),
      life: randomBetween(0.35, 0.8),
      maxLife: randomBetween(0.35, 0.8),
      color
    });
  }
}

function updateParade(dt) {
  if (!parade) return;

  if (running) {
    parade.time = Math.max(0, parade.time - dt);
    parade.player.pulseCooldown = Math.max(0, parade.player.pulseCooldown - dt);

    const accel = 1650;
    const drag = 0.82;
    if (keys.left) parade.player.vx -= accel * dt;
    if (keys.right) parade.player.vx += accel * dt;
    if (!keys.left && !keys.right) parade.player.vx *= drag;
    parade.player.vx = clamp(parade.player.vx, -520, 520);
    parade.player.x += parade.player.vx * dt;
    parade.player.x = clamp(parade.player.x, 22, WIDTH - parade.player.w - 22);

    if (keys.pulse && parade.player.pulseCooldown <= 0 && parade.energy >= 20) {
      parade.energy -= 20;
      parade.player.pulseCooldown = 4.5;
      parade.player.pulseWave = 1;
      let cleared = 0;
      parade.drops = parade.drops.filter((drop) => {
        const dx = drop.x - (parade.player.x + parade.player.w / 2);
        const dy = drop.y - (parade.player.y + parade.player.h / 2);
        const close = Math.hypot(dx, dy) < 170;
        if (drop.kind === "cloud" && close) {
          cleared += 1;
          spawnParticles(drop.x, drop.y, "#ffffff", 8);
          return false;
        }
        return true;
      });
      if (cleared > 0) {
        parade.score += cleared * 8;
        setStatus(`Pulse cleared ${cleared} gray block${cleared === 1 ? "" : "s"}.`);
      }
    }

    parade.player.pulseWave = Math.max(0, parade.player.pulseWave - dt * 1.4);
    parade.spawnTimer -= dt;
    if (parade.spawnTimer <= 0) {
      parade.drops.push(makeDrop());
      parade.spawnTimer = Math.max(0.24, randomBetween(0.42, 0.72) - parade.streak * 0.012);
    }

    for (let i = parade.drops.length - 1; i >= 0; i -= 1) {
      const drop = parade.drops[i];
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;
      drop.angle += drop.spin * dt;

      const hit = circleRectCollision(
        drop.x,
        drop.y,
        drop.radius,
        parade.player.x,
        parade.player.y,
        parade.player.w,
        parade.player.h
      );

      if (hit) {
        parade.drops.splice(i, 1);
        if (drop.kind === "cloud") {
          parade.streak = 0;
          parade.energy = Math.max(0, parade.energy - 17);
          spawnParticles(drop.x, drop.y, "#aab0bb", 12);
          setStatus("Gray block hit the cart. Rebuild the color meter.");
        } else {
          parade.streak += 1;
          parade.score += 12 + Math.min(18, parade.streak);
          parade.energy = Math.min(100, parade.energy + 5);
          spawnParticles(drop.x, drop.y, drop.color, 14);
          setStatus(`${drop.name} prism caught. Streak ${parade.streak}.`);
        }
      } else if (drop.y - drop.radius > HEIGHT) {
        parade.drops.splice(i, 1);
        if (drop.kind === "prism") {
          parade.streak = 0;
          parade.energy = Math.max(0, parade.energy - 4);
        }
      }
    }

    if (parade.time <= 0 || parade.energy <= 0) {
      running = false;
      parade.endReason = parade.energy <= 0 ? "The color meter ran out." : "Time is up.";
      startButton.textContent = "Play Again";
      setStatus(`${parade.endReason} Final score: ${parade.score}.`);
    }
  }

  for (let i = parade.particles.length - 1; i >= 0; i -= 1) {
    const particle = parade.particles[i];
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 180 * dt;
    if (particle.life <= 0) parade.particles.splice(i, 1);
  }

  updateHud(parade.score, Math.ceil(parade.time), parade.streak);
}

function circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  return Math.hypot(cx - closestX, cy - closestY) < radius;
}

function drawParade() {
  const time = globalTime;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#16233d");
  sky.addColorStop(0.48, "#334f77");
  sky.addColorStop(1, "#fff3c5");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawBlockSkyline(time);
  drawRoad(time);
  drawDrops();
  drawParticles();
  drawCart(time);
  drawEnergyBar();

  if (!running) {
    drawCanvasOverlay(parade && parade.endReason ? "Round Complete" : "Prism Parade", parade && parade.endReason ? `Score ${parade.score}` : "Press Start Game");
  }
}

function drawBlockSkyline(time) {
  const colors = ["#e40303", "#ff8c00", "#ffed00", "#008026", "#2447ff", "#732982"];
  for (let i = 0; i < 14; i += 1) {
    const x = i * 80 - 20;
    const h = 80 + ((i * 37) % 90);
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.1)";
    ctx.fillRect(x, HEIGHT - 174 - h, 60, h);
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x, HEIGHT - 180 - h, 60, 8);
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < 60; i += 1) {
    const x = (i * 97 + Math.sin(time * 0.2 + i) * 5) % WIDTH;
    const y = 30 + (i * 31) % 160;
    ctx.fillStyle = "rgba(255,255,255,0.34)";
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawRoad(time) {
  ctx.fillStyle = "#1f1d2d";
  ctx.fillRect(0, HEIGHT - 132, WIDTH, 132);
  const stripeH = 10;
  RAINBOW.forEach((color, index) => {
    ctx.fillStyle = color.value;
    ctx.fillRect(0, HEIGHT - 118 + index * stripeH, WIDTH, stripeH);
  });

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let x = -80; x < WIDTH + 80; x += 120) {
    ctx.fillRect(x + (time * 80) % 120, HEIGHT - 42, 56, 6);
  }
}

function drawDrops() {
  parade.drops.forEach((drop) => {
    ctx.save();
    ctx.translate(drop.x, drop.y);
    ctx.rotate(drop.angle);
    if (drop.kind === "cloud") {
      ctx.fillStyle = "#aab0bb";
      ctx.strokeStyle = "rgba(20,19,29,0.35)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-drop.radius, -drop.radius * 0.6, drop.radius * 2, drop.radius * 1.2, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(-drop.radius * 0.55, -drop.radius * 0.2, drop.radius * 0.35, drop.radius * 0.18);
    } else {
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -drop.radius);
      ctx.lineTo(drop.radius, 0);
      ctx.lineTo(0, drop.radius);
      ctx.lineTo(-drop.radius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawParticles() {
  parade.particles.forEach((particle) => {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, 5, 5);
  });
  ctx.globalAlpha = 1;
}

function drawCart(time) {
  const p = parade.player;
  const cx = p.x + p.w / 2;

  if (p.pulseWave > 0) {
    const radius = (1 - p.pulseWave) * 190;
    ctx.strokeStyle = `rgba(255,255,255,${p.pulseWave * 0.75})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, p.y + p.h / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(p.x + 8, p.y + p.h + 14, p.w - 16, 8);

  RAINBOW.forEach((color, index) => {
    ctx.fillStyle = color.value;
    ctx.fillRect(p.x + index * (p.w / 6), p.y + 10, p.w / 6 + 1, p.h - 12);
  });
  ctx.strokeStyle = "#14131d";
  ctx.lineWidth = 4;
  ctx.strokeRect(p.x, p.y + 10, p.w, p.h - 12);

  ctx.fillStyle = "#fffaf2";
  ctx.fillRect(p.x + 24, p.y - 2 + Math.sin(time * 8) * 2, p.w - 48, 18);
  ctx.strokeRect(p.x + 24, p.y - 2 + Math.sin(time * 8) * 2, p.w - 48, 18);

  ctx.fillStyle = "#14131d";
  ctx.beginPath();
  ctx.arc(p.x + 24, p.y + p.h + 8, 13, 0, Math.PI * 2);
  ctx.arc(p.x + p.w - 24, p.y + p.h + 8, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fffaf2";
  ctx.beginPath();
  ctx.arc(p.x + 24, p.y + p.h + 8, 5, 0, Math.PI * 2);
  ctx.arc(p.x + p.w - 24, p.y + p.h + 8, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnergyBar() {
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillRect(28, 24, 250, 24);
  ctx.strokeStyle = "#14131d";
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 24, 250, 24);

  const meterWidth = 244 * (parade.energy / 100);
  const meter = ctx.createLinearGradient(31, 0, 275, 0);
  meter.addColorStop(0, "#e40303");
  meter.addColorStop(0.2, "#ff8c00");
  meter.addColorStop(0.4, "#ffed00");
  meter.addColorStop(0.62, "#008026");
  meter.addColorStop(0.8, "#2447ff");
  meter.addColorStop(1, "#732982");
  ctx.fillStyle = meter;
  ctx.fillRect(31, 27, meterWidth, 18);

  ctx.fillStyle = "#14131d";
  ctx.font = "900 14px Trebuchet MS, sans-serif";
  ctx.fillText("Color Meter", 34, 70);
}

function drawCanvasOverlay(title, subtitle) {
  ctx.fillStyle = "rgba(20,19,29,0.62)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#fffaf2";
  ctx.textAlign = "center";
  ctx.font = "900 56px Trebuchet MS, sans-serif";
  ctx.fillText(title, WIDTH / 2, HEIGHT / 2 - 24);
  ctx.font = "900 24px Trebuchet MS, sans-serif";
  ctx.fillText(subtitle, WIDTH / 2, HEIGHT / 2 + 24);
  ctx.textAlign = "left";
}

function updateBuilder(dt) {
  if (!running || !builder) return;
  builder.time = Math.max(0, builder.time - dt);
  updateHud(builder.score, Math.ceil(builder.time), builder.streak);

  if (builder.time <= 0) {
    running = false;
    builder.message = `Time is up. Final score: ${builder.score}.`;
    startButton.textContent = "Play Again";
    setStatus(builder.message);
    renderBuilder();
  }
}

function nextBuilderRound() {
  builder.round += 1;
  builder.pattern = FLAG_PATTERNS[(builder.round - 1) % FLAG_PATTERNS.length];
  builder.placed = [];
  builder.choices = shuffle(builder.pattern.stripes.map((stripe, index) => ({
    key: `${stripe}-${index}-${builder.round}`,
    stripe,
    used: false
  })));
  builder.message = `Round ${builder.round}: build ${builder.pattern.name}.`;
  renderBuilder();
  updateHud(builder.score, Math.ceil(builder.time), builder.streak);
}

function chooseStripe(choiceKey) {
  if (!running || !builder || !builder.pattern) return;
  const choice = builder.choices.find((item) => item.key === choiceKey);
  if (!choice || choice.used) return;

  const expected = builder.pattern.stripes[builder.placed.length];
  if (choice.stripe === expected) {
    choice.used = true;
    builder.placed.push(choice.stripe);
    builder.streak += 1;
    builder.score += 10 + Math.min(15, builder.streak);
    builder.message = `${COLOR_LOOKUP[choice.stripe].name} placed.`;

    if (builder.placed.length === builder.pattern.stripes.length) {
      builder.score += 45 + builder.pattern.stripes.length * 3;
      builder.message = `${builder.pattern.name} complete. Next pattern ready.`;
      setStatus(builder.message);
      renderBuilder();
      window.setTimeout(() => {
        if (currentMode === "builder" && running) nextBuilderRound();
      }, 700);
      return;
    }
  } else {
    builder.streak = 0;
    builder.time = Math.max(0, builder.time - 3);
    builder.message = `Try another color. The next stripe is ${COLOR_LOOKUP[expected].name}.`;
  }
  setStatus(builder.message);
  renderBuilder();
  updateHud(builder.score, Math.ceil(builder.time), builder.streak);
}

function renderBuilder() {
  const pattern = builder.pattern || FLAG_PATTERNS[0];
  const slotHtml = pattern.stripes.map((stripe, index) => {
    const placed = builder.placed[index];
    const color = placed ? COLOR_LOOKUP[placed] : COLOR_LOOKUP[stripe];
    const label = placed ? color.name : `Stripe ${index + 1}`;
    return `
      <div class="flag-slot ${placed ? "" : "slot-empty"}" style="--slot-color: ${placed ? color.value : "#f2efe7"}">
        <span>${label}</span>
        <small>${placed ? "Placed" : "Open"}</small>
      </div>
    `;
  }).join("");

  const fallbackChoices = pattern.stripes.map((stripe, index) => ({
    key: `preview-${stripe}-${index}`,
    stripe,
    used: false
  }));
  const choiceHtml = (builder.choices.length ? builder.choices : shuffle(fallbackChoices)).map((choice) => {
    const color = COLOR_LOOKUP[choice.stripe];
    return `
      <button
        class="choice-button"
        type="button"
        data-choice="${choice.key}"
        style="--choice-color: ${color.value}"
        ${choice.used || !running ? "disabled" : ""}
      >
        ${color.name}
      </button>
    `;
  }).join("");

  domGame.innerHTML = `
    <div class="builder-board">
      <div class="builder-title">
        <div>
          <p class="eyebrow">Pattern Puzzle</p>
          <h3>${pattern.name}</h3>
        </div>
        <span class="round-pill">Round ${builder.round || 1}</span>
      </div>
      <div class="flag-slots">${slotHtml}</div>
      <div class="choices">${choiceHtml}</div>
      <p class="builder-message">${builder.message}</p>
    </div>
  `;

  domGame.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => chooseStripe(button.dataset.choice));
  });
}

function makeMatchDeck() {
  match.deck = shuffle(MATCH_PAIRS.flatMap((pair, index) => ([
    { ...pair, id: `${index}-a`, pairId: index, open: false, matched: false },
    { ...pair, id: `${index}-b`, pairId: index, open: false, matched: false }
  ])));
  match.first = null;
  match.lock = false;
  match.matched = 0;
  match.message = "Find two cards with the same value.";
}

function updateMatch(dt) {
  if (!running || !match) return;
  match.time += dt;
  updateHud(match.score, Math.floor(match.time), match.moves);
}

function chooseMemoryCard(cardId) {
  if (!running || match.lock) return;
  const card = match.deck.find((item) => item.id === cardId);
  if (!card || card.open || card.matched) return;

  card.open = true;
  if (!match.first) {
    match.first = card;
    match.message = "Pick one more card.";
    renderMatch();
    return;
  }

  match.moves += 1;
  if (match.first.pairId === card.pairId) {
    card.matched = true;
    match.first.matched = true;
    match.matched += 2;
    match.score += 35;
    match.message = `${card.label} matched.`;
    match.first = null;
    if (match.matched === match.deck.length) {
      running = false;
      match.score += Math.max(0, 120 - Math.floor(match.time));
      match.message = `Board clear. Final score: ${match.score}.`;
      startButton.textContent = "Play Again";
      setStatus(match.message);
    }
    renderMatch();
    updateHud(match.score, Math.floor(match.time), match.moves);
    return;
  }

  match.lock = true;
  match.message = "Not a match. Try those spots again later.";
  renderMatch();
  window.setTimeout(() => {
    if (currentMode !== "match") return;
    card.open = false;
    if (match.first) match.first.open = false;
    match.first = null;
    match.lock = false;
    renderMatch();
  }, 720);
  updateHud(match.score, Math.floor(match.time), match.moves);
}

function renderMatch() {
  const previewDeck = MATCH_PAIRS.flatMap((pair, index) => ([
    { ...pair, id: `preview-${index}-a`, pairId: index, open: false, matched: false },
    { ...pair, id: `preview-${index}-b`, pairId: index, open: false, matched: false }
  ]));
  const deck = match.deck.length ? match.deck : previewDeck;

  domGame.innerHTML = `
    <div class="match-board">
      <div class="match-title">
        <div>
          <p class="eyebrow">Memory Game</p>
          <h3>Kindness Match</h3>
        </div>
        <span class="round-pill">${match.matched || 0}/${MATCH_PAIRS.length * 2} cards</span>
      </div>
      <div class="memory-grid">
        ${deck.map((card) => {
          const visible = card.open || card.matched;
          return `
            <button
              class="memory-card ${card.open ? "is-open" : ""} ${card.matched ? "is-matched" : ""}"
              type="button"
              data-card="${card.id}"
              style="--card-color: ${card.color}"
              ${!running || card.matched ? "disabled" : ""}
            >
              <span>${visible ? card.mark : "?"}</span>
              <small>${visible ? card.label : "Hidden"}</small>
            </button>
          `;
        }).join("")}
      </div>
      <p class="match-message">${match.message}</p>
    </div>
  `;

  domGame.querySelectorAll("[data-card]").forEach((button) => {
    button.addEventListener("click", () => chooseMemoryCard(button.dataset.card));
  });
}

function handleKey(event, isDown) {
  const code = event.code;
  if (code === "ArrowLeft" || code === "KeyA") keys.left = isDown;
  if (code === "ArrowRight" || code === "KeyD") keys.right = isDown;
  if (code === "Space") keys.pulse = isDown;
  if (["ArrowLeft", "ArrowRight", "Space"].includes(code)) event.preventDefault();
  if (isDown && code === "Enter" && !running) startCurrentMode();
}

document.addEventListener("keydown", (event) => handleKey(event, true));
document.addEventListener("keyup", (event) => handleKey(event, false));

canvas.addEventListener("pointermove", (event) => {
  if (currentMode !== "parade" || !parade || !running) return;
  const rect = canvas.getBoundingClientRect();
  const scale = WIDTH / rect.width;
  const pointerX = (event.clientX - rect.left) * scale;
  parade.player.x = clamp(pointerX - parade.player.w / 2, 22, WIDTH - parade.player.w - 22);
  parade.player.vx = 0;
});

canvas.addEventListener("pointerdown", () => {
  if (currentMode === "parade" && !running) startCurrentMode();
});

touchControls.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  const setPressed = (pressed) => {
    if (control === "left") keys.left = pressed;
    if (control === "right") keys.right = pressed;
    if (control === "pulse") keys.pulse = pressed;
  };
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    setPressed(true);
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener("pointerup", () => setPressed(false));
  button.addEventListener("pointercancel", () => setPressed(false));
  button.addEventListener("pointerleave", () => setPressed(false));
});

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

startButton.addEventListener("click", startCurrentMode);
resetButton.addEventListener("click", resetCurrentMode);

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + width, y, x + width, y + height, r);
    this.arcTo(x + width, y + height, x, y + height, r);
    this.arcTo(x, y + height, x, y, r);
    this.arcTo(x, y, x + width, y, r);
    this.closePath();
    return this;
  };
}

resetParade();
resetBuilder();
resetMatch();
setMode("parade");
