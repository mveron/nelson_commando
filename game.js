const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const BASE_VIEW = { width: 320, height: 180 };
const UPSCALE = 2;
canvas.width = BASE_VIEW.width * UPSCALE;
canvas.height = BASE_VIEW.height * UPSCALE;
const VIEW = { width: canvas.width, height: canvas.height };
const backgroundCache = new Map();
const hudPortrait = new Image();
hudPortrait.src = "assets/personaje/castro_hud.png";

const DOM = {
  stageFrame: document.getElementById("stageFrame"),
  campaignStatus: document.getElementById("campaignStatus"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton"),
  portraitImage: document.getElementById("portraitImage"),
  portraitCaptionTitle: document.getElementById("portraitCaptionTitle"),
  portraitCaptionBody: document.getElementById("portraitCaptionBody"),
  backgroundCaption: document.getElementById("backgroundCaption"),
  backgroundLink: document.getElementById("backgroundLink"),
  missionTitle: document.getElementById("missionTitle"),
  missionBrief: document.getElementById("missionBrief"),
  missionAct: document.getElementById("missionAct"),
  missionLocation: document.getElementById("missionLocation"),
  missionGoal: document.getElementById("missionGoal"),
  sourceName: document.getElementById("sourceName"),
  sourceRole: document.getElementById("sourceRole"),
  sourceQuote: document.getElementById("sourceQuote"),
  intelList: document.getElementById("intelList"),
  radioLog: document.getElementById("radioLog"),
  objectiveText: document.getElementById("objectiveText"),
  hintText: document.getElementById("hintText"),
  overlay: document.getElementById("overlay"),
  overlayTag: document.getElementById("overlayTag"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayBody: document.getElementById("overlayBody"),
  overlayMeta: document.getElementById("overlayMeta"),
  overlayPrimary: document.getElementById("overlayPrimary"),
  overlaySecondary: document.getElementById("overlaySecondary"),
};

const keys = Object.create(null);
const pressed = new Set();

const state = {
  screen: "briefing",
  missionIndex: 0,
  world: null,
  cameraX: 0,
  lastTime: performance.now(),
  evidence: [],
  radio: [],
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function edgePressed(code) {
  return pressed.has(code);
}

function resizeCanvasDisplay() {
  const frame = DOM.stageFrame;
  if (!frame) {
    return;
  }

  const availableWidth = Math.max(0, frame.clientWidth);
  const availableHeight = Math.max(0, frame.clientHeight);

  if (!availableWidth || !availableHeight) {
    return;
  }

  const scale = Math.min(availableWidth / VIEW.width, availableHeight / VIEW.height);
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}

function scaleMissionGeometry(mission) {
  return {
    ...mission,
    levelWidth: mission.levelWidth * UPSCALE,
    groundY: mission.groundY * UPSCALE,
    sourceX: mission.sourceX * UPSCALE,
    exitX: mission.exitX * UPSCALE,
    skyline: mission.skyline.map((value) => value * UPSCALE),
    platforms: mission.platforms.map((platform) => ({
      ...platform,
      x: platform.x * UPSCALE,
      y: platform.y * UPSCALE,
      w: platform.w * UPSCALE,
      h: platform.h * UPSCALE,
    })),
    initialEnemies: mission.initialEnemies.map((enemy) => ({
      ...enemy,
      x: enemy.x * UPSCALE,
      y: enemy.y != null ? enemy.y * UPSCALE : undefined,
    })),
  };
}

function getBackgroundImage(src) {
  if (!backgroundCache.has(src)) {
    const image = new Image();
    image.src = src;
    backgroundCache.set(src, image);
  }
  return backgroundCache.get(src);
}

function createPlayer() {
  return {
    x: 88,
    y: 200,
    w: 24,
    h: 32,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    health: 100,
    invuln: 0,
    fireCooldown: 0,
    anim: 0,
  };
}

function createSource(mission) {
  return {
    x: mission.sourceX,
    y: mission.groundY - 32,
    w: 22,
    h: 32,
    health: 70,
    maxHealth: 70,
    active: false,
    completed: false,
    timer: 0,
  };
}

function createEnemy(type, x, groundY, yOverride) {
  if (type === "drone") {
    return {
      type,
      x,
      y: yOverride ?? groundY - 140,
      w: 24,
      h: 16,
      vx: 0,
      vy: 0,
      health: 18,
      cooldown: 1.2,
      pulse: Math.random() * Math.PI * 2,
      tint: "#d69d57",
    };
  }

  if (type === "heavy") {
    return {
      type,
      x,
      y: groundY - 36,
      w: 24,
      h: 36,
      vx: 0,
      vy: 0,
      health: 36,
      cooldown: 1.6,
      tint: "#9c4d3d",
    };
  }

  return {
    type: "rifle",
    x,
    y: groundY - 32,
    w: 20,
    h: 32,
    vx: 0,
    vy: 0,
    health: 20,
    cooldown: 1.1,
    tint: "#b76045",
  };
}

function makeDust(x, y, tint = "#b78f66") {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -0.36 - Math.random() * 0.1,
    gravity: -0.001,
    life: 0.6,
    tint,
    size: 5,
  };
}

function makeSpark(x, y, tint) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 0.9,
    gravity: 0.003,
    life: 0.35,
    tint,
    size: 3,
  };
}

function buildPlatforms(mission) {
  const floor = {
    x: 0,
    y: mission.groundY,
    w: mission.levelWidth,
    h: VIEW.height - mission.groundY,
    tint: mission.palette.ground,
  };

  return [floor, ...mission.platforms];
}

function initMission(index, keepEvidence = true) {
  const displayMission = missions[index];
  const mission = scaleMissionGeometry(displayMission);

  state.missionIndex = index;
  state.screen = "briefing";
  state.cameraX = 0;
  state.radio = [];

  if (!keepEvidence) {
    state.evidence = [];
  }

  state.world = {
    mission,
    displayMission,
    missionTime: 0,
    backgroundImage: getBackgroundImage(displayMission.background.image),
    player: createPlayer(),
    source: createSource(mission),
    enemies: mission.initialEnemies.map((enemy) =>
      createEnemy(enemy.type, enemy.x, mission.groundY, enemy.y)
    ),
    playerBullets: [],
    enemyBullets: [],
    particles: [],
    platforms: buildPlatforms(mission),
    objective: displayMission.goal,
    hint: "Enter o boton para desplegar.",
    extractionUnlocked: false,
    extractionWaveDone: false,
    interviewQueue: mission.interviewWaves.map((wave) => ({ ...wave, fired: false })),
    scorePulse: 0,
  };

  displayMission.startLog.forEach((line) => pushRadio(line));
  syncMissionPanel();
  updateSidebar();
  showMissionBriefing();
}

function syncMissionPanel() {
  const mission = missions[state.missionIndex];
  DOM.campaignStatus.textContent = `Campana ${state.missionIndex + 1}/${missions.length}`;
  DOM.missionTitle.textContent = mission.title;
  DOM.missionBrief.textContent = mission.brief;
  DOM.missionAct.textContent = mission.act;
  DOM.missionLocation.textContent = mission.location;
  DOM.missionGoal.textContent = mission.goal;
  DOM.sourceName.textContent = mission.source.name;
  DOM.sourceRole.textContent = mission.source.role;
  DOM.sourceQuote.textContent = `"${mission.source.quote}"`;
  DOM.portraitImage.src = mission.portrait;
  DOM.portraitCaptionTitle.textContent = mission.portraitTitle;
  DOM.portraitCaptionBody.textContent = mission.portraitBody;
  DOM.backgroundCaption.textContent = mission.background.credit;
  DOM.backgroundLink.href = mission.background.link;
}

function updateSidebar() {
  DOM.intelList.innerHTML = "";

  if (state.evidence.length === 0) {
    const empty = document.createElement("div");
    empty.className = "intel-item";
    empty.textContent =
      "Todavia no hay piezas cerradas. Cada entrevista completa una parte de la historia.";
    DOM.intelList.appendChild(empty);
  } else {
    state.evidence.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "intel-item";
      const strong = document.createElement("strong");
      strong.textContent = entry.title;
      const text = document.createElement("div");
      text.textContent = entry.body;
      item.appendChild(strong);
      item.appendChild(text);
      DOM.intelList.appendChild(item);
    });
  }

  DOM.radioLog.innerHTML = "";
  state.radio.slice(-5).forEach((line) => {
    const item = document.createElement("div");
    item.className = "radio-item";
    item.textContent = line;
    DOM.radioLog.appendChild(item);
  });

  DOM.objectiveText.textContent = state.world?.objective ?? "Sin objetivo.";
  DOM.hintText.textContent = state.world?.hint ?? "";
}

function pushRadio(line) {
  state.radio.push(line);
  if (state.radio.length > 10) {
    state.radio = state.radio.slice(-10);
  }
}

function showOverlay(tag, title, body, meta, primaryText = "Desplegar") {
  DOM.overlayTag.textContent = tag;
  DOM.overlayTitle.textContent = title;
  DOM.overlayBody.textContent = body;
  DOM.overlayMeta.textContent = meta;
  DOM.overlayPrimary.textContent = primaryText;
  DOM.overlay.classList.remove("hidden");
}

function hideOverlay() {
  DOM.overlay.classList.add("hidden");
}

function showMissionBriefing() {
  const mission = missions[state.missionIndex];
  state.world.objective = mission.goal;
  state.world.hint = "Enter o boton para desplegar.";
  showOverlay(
    mission.act,
    mission.title,
    `${mission.brief} Fuente: ${mission.source.name}, ${mission.source.role}.`,
    "Controles activos al iniciar. Llegar, entrevistar, resistir y extraer.",
    "Desplegar"
  );
}

function startMission() {
  if (state.screen === "finished") {
    return;
  }

  state.screen = "playing";
  state.world.objective = `Alcanzar a ${state.world.mission.source.name}.`;
  state.world.hint =
    "Usa plataformas bajas para cubrirte y E cuando estes junto a la fuente.";
  hideOverlay();
  updateSidebar();
}

function restartCampaign() {
  initMission(0, false);
}

function restartMission() {
  initMission(state.missionIndex, true);
}

function nextMission() {
  if (state.missionIndex === missions.length - 1) {
    completeCampaign();
    return;
  }

  initMission(state.missionIndex + 1, true);
}

function completeCampaign() {
  state.screen = "finished";
  const items = state.evidence.map((entry) => entry.title).join(" / ");
  state.world.objective = "Transmision completa.";
  state.world.hint = "Usa Reiniciar para cubrir el frente desde cero.";
  showOverlay(
    "Transmision final",
    "La pieza sale al aire",
    `Nelson emite la investigacion completa con ${state.evidence.length} testimonios cerrados. Fragmentos: ${items}.`,
    "La senal se sostiene, pero el frente sigue abierto.",
    "Campana completa"
  );
  pushRadio("Productora: Esta saliendo. Ya no pueden borrar todo.");
  pushRadio("Nelson: Perfecto. Ahora que miren.");
  updateSidebar();
}

function beginInterview() {
  const world = state.world;
  if (world.source.active || world.source.completed) {
    return;
  }

  world.source.active = true;
  world.source.timer = 8.2;
  world.objective = `Protege la entrevista con ${world.mission.source.name}.`;
  world.hint = "Mantene alejados a los hostiles. Si la fuente cae, reinicias la mision.";
  pushRadio(`${world.mission.source.name}: ${world.mission.source.quote}`);
  updateSidebar();
}

function finishInterview() {
  const world = state.world;
  if (world.source.completed) {
    return;
  }

  world.source.active = false;
  world.source.completed = true;
  world.extractionUnlocked = true;
  world.objective = `Dirigite a ${world.mission.extractLabel}.`;
  world.hint = "La pieza esta cerrada. Avanza al punto de extraccion.";
  state.evidence.push({
    title: world.mission.title,
    body: world.mission.evidence,
  });
  world.mission.winLog.forEach((line) => pushRadio(line));
  updateSidebar();
}

function failMission(reason) {
  state.screen = "gameover";
  state.world.objective = "Mision fallida.";
  state.world.hint = "Enter o boton para reintentar.";
  showOverlay("Corte de senal", "Mision fallida", reason, "Enter o boton para reintentar.", "Reintentar");
  updateSidebar();
}

function finishMission() {
  state.screen = "mission-complete";
  showOverlay(
    state.world.mission.act,
    "Pieza cerrada",
    state.world.mission.evidence,
    "La fuente queda a salvo y la grabacion sale de la zona caliente.",
    state.missionIndex === missions.length - 1 ? "Ver cierre" : "Siguiente mision"
  );
  state.world.objective = "Pieza cerrada.";
  state.world.hint = "Enter o boton para continuar.";
  updateSidebar();
}

function spawnEnemyFromEdge(type, edge) {
  const mission = state.world.mission;
  const x = edge === "left"
    ? clamp(state.cameraX - 32, 8, mission.levelWidth - 48)
    : clamp(state.cameraX + VIEW.width + 32, 48, mission.levelWidth - 24);
  const y = type === "drone" ? mission.groundY - 140 - Math.random() * 40 : undefined;
  state.world.enemies.push(createEnemy(type, x, mission.groundY, y));
}

function spawnInterviewWave() {
  const world = state.world;
  world.interviewQueue.forEach((wave) => {
    if (!wave.fired && world.source.timer <= 8.2 - wave.delay) {
      wave.fired = true;
      wave.spawns.forEach((spawn) => spawnEnemyFromEdge(spawn.type, spawn.edge));
      world.scorePulse = 0.35;
    }
  });
}

function spawnExtractionWave() {
  const world = state.world;
  if (world.extractionWaveDone) {
    return;
  }

  world.extractionWaveDone = true;
  world.mission.extractionWave.forEach((spawn) => spawnEnemyFromEdge(spawn.type, spawn.edge));
  pushRadio("Productora: Estan cortando la salida. Mantene la senal viva.");
  updateSidebar();
}

function bulletHitsPlatform(bullet, platforms) {
  return platforms.some((platform) => rectsOverlap(bullet, platform));
}

function update(dt) {
  if (!state.world) {
    return;
  }

  const world = state.world;
  world.missionTime += dt;
  world.scorePulse = Math.max(0, world.scorePulse - dt);

  if (state.screen !== "playing") {
    state.cameraX = clamp(
      world.player.x - VIEW.width * 0.38,
      0,
      world.mission.levelWidth - VIEW.width
    );
    pressed.clear();
    return;
  }

  const player = world.player;
  const inputX =
    (keys.ArrowRight || keys.KeyD ? 1 : 0) -
    (keys.ArrowLeft || keys.KeyA ? 1 : 0);
  const wantsJump = edgePressed("ArrowUp") || edgePressed("KeyW") || edgePressed("Space");
  const wantsShoot = keys.KeyJ || keys.KeyF;

  player.anim += dt * (Math.abs(player.vx) > 0.15 ? 9 : 2.8);
  player.invuln = Math.max(0, player.invuln - dt);
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);

  player.vx = inputX * 3.5;
  if (inputX !== 0) {
    player.facing = inputX;
  }

  if (wantsJump && player.onGround) {
    player.vy = -12.6;
    player.onGround = false;
    world.particles.push(makeDust(player.x + player.w / 2, player.y + player.h));
  }

  if (wantsShoot && player.fireCooldown <= 0) {
    player.fireCooldown = 0.22;
    world.playerBullets.push({
      x: player.x + (player.facing > 0 ? player.w + 2 : -6),
      y: player.y + 14,
      w: 8,
      h: 4,
      vx: player.facing * 9.6,
      life: 1.1,
    });
    world.particles.push(
      makeSpark(player.x + player.facing * 16, player.y + 14, "#f4d478")
    );
  }

  player.vy = Math.min(player.vy + 0.72, 14.4);
  moveEntity(player, world.platforms, dt);

  world.playerBullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt * 60;
    bullet.life -= dt;
  });
  world.playerBullets = world.playerBullets.filter(
    (bullet) =>
      bullet.life > 0 &&
      !bulletHitsPlatform(bullet, world.platforms) &&
      bullet.x > -20 &&
      bullet.x < world.mission.levelWidth + 20
  );

  world.enemyBullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt * 60;
    bullet.y += bullet.vy * dt * 60;
    bullet.life -= dt;
  });
  world.enemyBullets = world.enemyBullets.filter(
    (bullet) => bullet.life > 0 && !bulletHitsPlatform(bullet, world.platforms)
  );

  updateEnemies(world, dt);
  updateSource(world, dt);
  updateParticles(world, dt);
  resolveCombat(world);

  if (!world.source.active && !world.source.completed) {
    world.objective = `Alcanzar a ${world.mission.source.name}.`;
    world.hint =
      player.x + player.w > world.source.x - 32
        ? "Pulsa E para entrevistar cuando estes pegado a la fuente."
        : "Avanza por cobertura baja y limpia el paso.";

    if (
      edgePressed("KeyE") &&
      Math.abs(player.x - world.source.x) < 36 &&
      Math.abs(player.y - world.source.y) < 36
    ) {
      beginInterview();
    }
  }

  if (
    world.source.completed &&
    !world.extractionWaveDone &&
    player.x > world.mission.sourceX + 420
  ) {
    spawnExtractionWave();
  }

  if (world.extractionUnlocked) {
    const extractRect = {
      x: world.mission.exitX - 32,
      y: world.mission.groundY - 52,
      w: 48,
      h: 56,
    };

    world.objective = `Llega a ${world.mission.extractLabel}.`;
    world.hint = rectsOverlap(player, extractRect)
      ? "Pulsa E para asegurar la salida."
      : "La ruta ya esta abierta. No te quedes peleando.";

    if (rectsOverlap(player, extractRect) && edgePressed("KeyE")) {
      finishMission();
    }
  }

  if (player.health <= 0) {
    failMission(
      "Nelson cae antes de cerrar la pieza. La grabacion no sale de zona caliente."
    );
  }

  state.cameraX = clamp(
    player.x - VIEW.width * 0.38,
    0,
    world.mission.levelWidth - VIEW.width
  );
  updateSidebar();
  pressed.clear();
}

function updateEnemies(world, dt) {
  const player = world.player;

  world.enemies.forEach((enemy) => {
    enemy.cooldown -= dt;

    if (enemy.type === "drone") {
      enemy.pulse += dt * 3.4;
      enemy.y += Math.sin(enemy.pulse) * 0.36;
      const distanceX = player.x - enemy.x;
      enemy.x += Math.sign(distanceX || 1) * 1.1;
      enemy.x = clamp(enemy.x, 24, world.mission.levelWidth - 24);

      if (Math.abs(distanceX) < 240 && enemy.cooldown <= 0) {
        enemy.cooldown = 1.3;
        const dirX = player.x - enemy.x;
        const dirY = player.y - enemy.y;
        const length = Math.max(1, Math.hypot(dirX, dirY));
        world.enemyBullets.push({
          x: enemy.x,
          y: enemy.y + enemy.h / 2,
          w: 6,
          h: 6,
          vx: (dirX / length) * 4.8,
          vy: (dirY / length) * 4.8,
          life: 2.2,
        });
      }

      return;
    }

    const direction = Math.sign(player.x - enemy.x);
    const range = enemy.type === "heavy" ? 200 : 168;
    enemy.vx =
      Math.abs(player.x - enemy.x) > range
        ? direction * (enemy.type === "heavy" ? 1.4 : 1.9)
        : 0;

    if (enemy.vx !== 0 && Math.random() < 0.02) {
      world.particles.push(makeDust(enemy.x + enemy.w / 2, enemy.y + enemy.h, enemy.tint));
    }

    enemy.vy = Math.min(enemy.vy + 0.68, 14.8);
    moveEntity(enemy, world.platforms, dt);

    if (
      Math.abs(player.x - enemy.x) < 260 &&
      Math.abs(player.y - enemy.y) < 84 &&
      enemy.cooldown <= 0
    ) {
      enemy.cooldown = enemy.type === "heavy" ? 1.5 : 1.1;
      const dirX = player.x - enemy.x;
      const dirY = player.y + player.h / 2 - (enemy.y + enemy.h / 2);
      const length = Math.max(1, Math.hypot(dirX, dirY));
      world.enemyBullets.push({
        x: enemy.x + (dirX > 0 ? enemy.w : -2),
        y: enemy.y + enemy.h / 2,
        w: 6,
        h: 4,
        vx: (dirX / length) * (enemy.type === "heavy" ? 4.2 : 5),
        vy: (dirY / length) * (enemy.type === "heavy" ? 4.2 : 4.6),
        life: 2.1,
      });
    }
  });

  world.enemies = world.enemies.filter(
    (enemy) => enemy.health > 0 && enemy.x > -64 && enemy.x < world.mission.levelWidth + 64
  );
}

function updateSource(world, dt) {
  if (!world.source.active) {
    return;
  }

  world.source.timer = Math.max(0, world.source.timer - dt);
  world.objective = `Protege la entrevista. Tiempo restante: ${world.source.timer.toFixed(1)}s`;
  world.hint = `Fuente ${Math.max(0, Math.round(world.source.health))}/${world.source.maxHealth}.`;

  spawnInterviewWave();

  if (world.source.health <= 0) {
    failMission("La fuente cae antes de terminar la entrevista. No hay historia que emitir.");
  } else if (world.source.timer <= 0) {
    finishInterview();
  }
}

function updateParticles(world, dt) {
  world.particles.forEach((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt * 60;
    particle.y += particle.vy * dt * 60;
    particle.vy += particle.gravity * dt * 60;
  });
  world.particles = world.particles.filter((particle) => particle.life > 0);
}

function resolveCombat(world) {
  const player = world.player;

  world.playerBullets.forEach((bullet) => {
    world.enemies.forEach((enemy) => {
      if (bullet.life > 0 && rectsOverlap(bullet, enemy)) {
        bullet.life = 0;
        enemy.health -= enemy.type === "heavy" ? 10 : 12;
        world.particles.push(
          makeSpark(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, world.mission.palette.signal)
        );
      }
    });
  });

  world.enemyBullets.forEach((bullet) => {
    if (bullet.life <= 0) {
      return;
    }

    if (world.source.active && rectsOverlap(bullet, world.source)) {
      bullet.life = 0;
      world.source.health -= 8;
      world.particles.push(
        makeSpark(
          world.source.x + world.source.w / 2,
          world.source.y + world.source.h / 2,
          "#d2845e"
        )
      );
      return;
    }

    if (rectsOverlap(bullet, player) && player.invuln <= 0) {
      bullet.life = 0;
      player.health -= 12;
      player.invuln = 0.6;
      world.particles.push(
        makeSpark(player.x + player.w / 2, player.y + player.h / 2, "#f6c08a")
      );
    }
  });

  world.enemies.forEach((enemy) => {
    if (rectsOverlap(enemy, player) && player.invuln <= 0) {
      player.health -= 10;
      player.invuln = 0.65;
      world.particles.push(
        makeSpark(player.x + player.w / 2, player.y + player.h / 2, "#f6c08a")
      );
    }

    if (world.source.active && rectsOverlap(enemy, world.source)) {
      world.source.health -= enemy.type === "heavy" ? 0.5 : 0.3;
    }
  });
}

function moveEntity(entity, platforms, dt) {
  entity.x += entity.vx * dt * 60;
  for (const platform of platforms) {
    if (rectsOverlap(entity, platform)) {
      if (entity.vx > 0) {
        entity.x = platform.x - entity.w;
      } else if (entity.vx < 0) {
        entity.x = platform.x + platform.w;
      }
    }
  }

  entity.y += entity.vy * dt * 60;
  entity.onGround = false;

  for (const platform of platforms) {
    if (!rectsOverlap(entity, platform)) {
      continue;
    }

    if (entity.vy > 0) {
      entity.y = platform.y - entity.h;
      entity.vy = 0;
      entity.onGround = true;
    } else if (entity.vy < 0) {
      entity.y = platform.y + platform.h;
      entity.vy = 0;
    }
  }

  entity.x = clamp(entity.x, 0, state.world.mission.levelWidth - entity.w);
}

function render() {
  if (!state.world) {
    return;
  }

  const world = state.world;
  const cameraX = state.cameraX;

  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawBackground(world, cameraX);
  drawPlatforms(world.platforms, cameraX, world.mission);

  if (world.extractionUnlocked) {
    drawExtraction(world, cameraX);
  }

  drawSource(world.source, cameraX, world.mission.palette);

  world.playerBullets.forEach((bullet) => {
    ctx.fillStyle = world.mission.palette.signal;
    ctx.fillRect(Math.round(bullet.x - cameraX), Math.round(bullet.y), bullet.w, bullet.h);
  });

  world.enemyBullets.forEach((bullet) => {
    ctx.fillStyle = "#e97a5a";
    ctx.fillRect(Math.round(bullet.x - cameraX), Math.round(bullet.y), bullet.w, bullet.h);
  });

  world.enemies.forEach((enemy) => drawEnemy(enemy, cameraX));
  drawPlayer(world.player, cameraX, world);

  world.particles.forEach((particle) => {
    ctx.globalAlpha = clamp(particle.life * 1.8, 0, 1);
    ctx.fillStyle = particle.tint;
    ctx.fillRect(Math.round(particle.x - cameraX), Math.round(particle.y), particle.size, particle.size);
    ctx.globalAlpha = 1;
  });

  drawHud(world);
}

function drawBackground(world, cameraX) {
  const mission = world.mission;
  const image = world.backgroundImage;

  ctx.fillStyle = mission.palette.sky;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  if (image && image.complete && image.naturalWidth) {
    const maxOffset = Math.max(0, image.naturalWidth - VIEW.width);
    const travel = Math.max(1, mission.levelWidth - VIEW.width);
    const sourceX = Math.round((cameraX / travel) * maxOffset);
    ctx.drawImage(
      image,
      sourceX,
      0,
      Math.min(VIEW.width, image.naturalWidth),
      Math.min(VIEW.height, image.naturalHeight),
      0,
      0,
      VIEW.width,
      VIEW.height
    );
  } else {
    const farOffset = -(cameraX * 0.18) % 128;
    const midOffset = -(cameraX * 0.34) % 168;

    ctx.fillStyle = mission.palette.haze;
    ctx.fillRect(0, 188, VIEW.width, 108);

    ctx.fillStyle = mission.palette.far;
    mission.skyline.forEach((height, index) => {
      const x = farOffset + index * 116;
      ctx.fillRect(x, VIEW.height - 172 - height, 88, height + 80);
      ctx.fillRect(x + 28, VIEW.height - 188 - height, 20, 36);
    });

    ctx.fillStyle = mission.palette.mid;
    for (let i = 0; i < 6; i += 1) {
      const x = midOffset + i * 148;
      const width = 96 + (i % 2) * 24;
      const height = 84 + ((i * 18) % 64);
      ctx.fillRect(x, VIEW.height - 124 - height, width, height);
    }
  }

  ctx.fillStyle = "rgba(11, 8, 6, 0.32)";
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = "rgba(255, 226, 178, 0.12)";
  ctx.fillRect(36, 34, 128, 10);
  ctx.fillStyle = "rgba(30, 19, 14, 0.5)";
  ctx.fillRect(0, VIEW.height - 118, VIEW.width, 118);
}

function drawPlatforms(platforms, cameraX, mission) {
  platforms.forEach((platform, index) => {
    const color = index === 0 ? mission.palette.surface : platform.tint;
    const screenX = Math.round(platform.x - cameraX);
    ctx.fillStyle = color;
    ctx.fillRect(screenX, platform.y, platform.w, platform.h);

    if (index === 0) {
      ctx.fillStyle = "rgba(246, 213, 164, 0.14)";
      ctx.fillRect(screenX, platform.y, platform.w, 6);
      ctx.fillStyle = "rgba(18, 12, 8, 0.28)";
      ctx.fillRect(screenX, platform.y + 18, platform.w, platform.h - 18);

      for (let i = 0; i < 18; i += 1) {
        const chipX = ((i * 86) - Math.floor(cameraX * 0.45)) % (VIEW.width + 48);
        ctx.fillStyle = i % 2 === 0 ? "rgba(68, 49, 34, 0.55)" : "rgba(210, 170, 115, 0.18)";
        ctx.fillRect(chipX - 24, platform.y + 10 + (i % 3) * 8, 18 + (i % 3) * 5, 4);
      }
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(screenX, platform.y, platform.w, 4);
      ctx.fillStyle = "rgba(20, 14, 11, 0.28)";
      ctx.fillRect(screenX, platform.y + 10, platform.w, platform.h - 10);
      ctx.fillStyle = "rgba(238, 208, 168, 0.18)";
      for (let bolt = 0; bolt < platform.w; bolt += 18) {
        ctx.fillRect(screenX + bolt + 4, platform.y + 3, 3, 3);
      }
    }
  });
}

function drawReporterSprite(x, y, facing, stride, options = {}) {
  const spriteWidth = 36;
  const ox = x - 6;
  const oy = y - 10;
  const outline = options.outline ?? "#18130f";
  const helmet = options.helmet ?? "#274a72";
  const helmetHi = options.helmetHi ?? "#5d87a8";
  const helmetShadow = options.helmetShadow ?? "#18345b";
  const skin = options.skin ?? "#d7c3a8";
  const hair = options.hair ?? "#96928c";
  const glasses = options.glasses ?? "#262220";
  const scarf = options.scarf ?? "#7a3834";
  const vest = options.vest ?? "#628aa7";
  const vestDark = options.vestDark ?? "#38556c";
  const vestHi = options.vestHi ?? "#98b4c6";
  const pants = options.pants ?? "#36383d";
  const boots = options.boots ?? "#171210";
  const micLight = options.micLight ?? "#d6503f";
  const micBody = options.micBody ?? "#171210";
  const withMic = options.withMic ?? true;
  const legA = stride > 0 ? -2 : 0;
  const legB = stride < 0 ? -2 : 0;

  const block = (dx, dy, w, h, color) => {
    const px = facing > 0 ? ox + dx : ox + spriteWidth - dx - w;
    ctx.fillStyle = color;
    ctx.fillRect(px, oy + dy, w, h);
  };

  block(8, 0, 18, 2, outline);
  block(9, 1, 16, 6, helmet);
  block(12, 2, 10, 2, helmetHi);
  block(7, 6, 20, 2, outline);
  block(8, 6, 18, 2, helmetShadow);
  block(9, 9, 2, 5, hair);
  block(22, 9, 2, 5, hair);
  block(11, 8, 11, 8, skin);
  block(11, 10, 11, 2, glasses);
  block(16, 12, 2, 2, "#aa8163");
  block(14, 15, 5, 1, "#885945");
  block(10, 16, 13, 3, scarf);

  block(8, 19, 16, 14, vest);
  block(8, 26, 16, 7, vestDark);
  block(12, 21, 8, 3, vestHi);
  block(11, 23, 10, 4, "#f0f2f3");
  block(12, 24, 2, 2, vestDark);
  block(15, 24, 2, 2, vestDark);
  block(18, 24, 2, 2, vestDark);
  block(5, 20, 3, 8, skin);
  block(4, 27, 4, 4, vestDark);
  block(10, 32 + legA, 5, 7 - legA, pants);
  block(18, 32 + legB, 5, 7 - legB, pants);
  block(9, 39, 7, 2, boots);
  block(17, 39, 7, 2, boots);

  if (withMic) {
    block(24, 20, 3, 8, skin);
    block(25, 27, 4, 4, vestDark);
    block(27, 21, 4, 4, micBody);
    block(31, 22, 4, 3, micBody);
    block(32, 22, 2, 3, micLight);
  }
}

function drawPlayer(player, cameraX, world) {
  const x = Math.round(player.x - cameraX);
  const y = Math.round(player.y);
  const stride = player.onGround ? Math.sin(player.anim) : 0;

  if (player.invuln > 0 && Math.floor(player.invuln * 10) % 2 === 0) {
    return;
  }

  drawReporterSprite(x, y, player.facing, stride, { withMic: true });

  if (world.scorePulse > 0) {
    ctx.globalAlpha = world.scorePulse;
    ctx.fillStyle = world.mission.palette.signal;
    ctx.fillRect(x - 6, y - 6, 36, 4);
    ctx.globalAlpha = 1;
  }
}

function drawEnemy(enemy, cameraX) {
  const x = Math.round(enemy.x - cameraX);
  const y = Math.round(enemy.y);

  if (enemy.type === "drone") {
    ctx.fillStyle = "#70523d";
    ctx.fillRect(x + 4, y, 16, 5);
    ctx.fillRect(x, y + 4, 24, 6);
    ctx.fillRect(x + 6, y + 10, 12, 4);
    ctx.fillStyle = "#d3a56a";
    ctx.fillRect(x + 9, y + 5, 6, 2);
    return;
  }

  ctx.fillStyle = "#191411";
  ctx.fillRect(x + 2, y, enemy.type === "heavy" ? 20 : 16, 7);
  ctx.fillStyle = enemy.tint;
  ctx.fillRect(x + 4, y + 1, enemy.type === "heavy" ? 16 : 12, 6);
  ctx.fillStyle = "#3c3d41";
  ctx.fillRect(x, y + 7, enemy.type === "heavy" ? 24 : 20, enemy.type === "heavy" ? 14 : 12);
  ctx.fillStyle = "#d0b598";
  ctx.fillRect(x + 6, y + 6, 8, 6);
  ctx.fillStyle = "#241f1b";
  ctx.fillRect(x + 6, y + 8, 8, 2);
  ctx.fillStyle = "#7d4738";
  ctx.fillRect(x + 3, y + 20, 6, enemy.type === "heavy" ? 14 : 10);
  ctx.fillRect(x + 12, y + 20, 6, enemy.type === "heavy" ? 14 : 10);
  ctx.fillStyle = "#1b1714";
  ctx.fillRect(x + 2, y + 18, enemy.type === "heavy" ? 20 : 16, 2);
}

function drawSource(source, cameraX, palette) {
  const x = Math.round(source.x - cameraX);
  const y = Math.round(source.y);

  drawReporterSprite(x, y, 1, 0, {
    withMic: false,
    helmet: "#47574a",
    helmetHi: "#7c9788",
    helmetShadow: "#2e3b34",
    scarf: "#5f4b3d",
    vest: "#7d9689",
    vestDark: "#5a6d63",
    vestHi: "#a4b8ad",
    pants: "#4a4d50",
  });

  if (source.active && !source.completed) {
    ctx.fillStyle = palette.signal;
    ctx.fillRect(x - 8, y - 12, 36, 4);
    ctx.fillStyle = "#1a140f";
    ctx.fillRect(x - 8, y - 20, 40, 6);
    ctx.fillStyle = "#6a5848";
    ctx.fillRect(x - 6, y - 18, 36, 2);
    ctx.fillStyle = "#d08562";
    ctx.fillRect(x - 6, y - 18, Math.round((source.health / source.maxHealth) * 36), 2);
  }
}

function drawExtraction(world, cameraX) {
  const x = Math.round(world.mission.exitX - cameraX);
  const y = world.mission.groundY - 48;

  ctx.fillStyle = "#28312c";
  ctx.fillRect(x - 16, y + 8, 48, 24);
  ctx.fillStyle = world.mission.palette.signal;
  ctx.fillRect(x, y - 16, 16, 16);
  ctx.fillStyle = "#e8d9ba";
  ctx.fillRect(x + 4, y - 12, 8, 8);

  if (Math.floor(world.missionTime * 4) % 2 === 0) {
    ctx.fillStyle = "rgba(240, 203, 103, 0.45)";
    ctx.fillRect(x - 2, y - 24, 20, 4);
  }
}

function drawHud(world) {
  ctx.fillStyle = "rgba(16, 13, 11, 0.82)";
  ctx.fillRect(12, 12, 232, 52);
  ctx.fillRect(VIEW.width - 172, 12, 160, 34);

  if (hudPortrait.complete && hudPortrait.naturalWidth) {
    ctx.drawImage(hudPortrait, 18, 18, 30, 30);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(52, 18, 1, 40);
  }

  ctx.fillStyle = "#f1e7da";
  ctx.font = "12px monospace";
  ctx.fillText("VIDA", 60, 28);
  ctx.fillText("SENAL", 60, 42);
  ctx.fillText(`${state.missionIndex + 1}/${missions.length}`, VIEW.width - 48, 28);
  ctx.fillText(world.displayMission.act, VIEW.width - 150, 42);

  ctx.fillStyle = "#41352c";
  ctx.fillRect(114, 20, 106, 6);
  ctx.fillRect(114, 34, 106, 6);

  ctx.fillStyle = "#d37a56";
  ctx.fillRect(114, 20, Math.round((world.player.health / 100) * 106), 6);

  const signalValue = world.source.completed
    ? 1
    : world.source.active
      ? 1 - world.source.timer / 8.2
      : 0;

  ctx.fillStyle = world.mission.palette.signal;
  ctx.fillRect(114, 34, Math.round(signalValue * 106), 6);
}

function frame(now) {
  const dt = Math.min(0.033, (now - state.lastTime) / 1000);
  state.lastTime = now;

  update(dt);
  render();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  const tracked = [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "Space",
    "KeyA",
    "KeyD",
    "KeyW",
    "KeyF",
    "KeyJ",
    "KeyE",
    "KeyP",
    "Enter",
  ];

  if (tracked.includes(event.code)) {
    event.preventDefault();
  }

  if (!keys[event.code]) {
    pressed.add(event.code);
  }

  keys[event.code] = true;

  if (event.code === "Enter") {
    if (state.screen === "briefing") {
      startMission();
    } else if (state.screen === "mission-complete") {
      nextMission();
    } else if (state.screen === "gameover") {
      restartMission();
    } else if (state.screen === "paused") {
      state.screen = "playing";
      hideOverlay();
    }
  }

  if (event.code === "KeyP" && state.screen === "playing") {
    state.screen = "paused";
    showOverlay(
      "Pausa",
      "Transmision en espera",
      "La senal queda congelada. Retoma con Enter o P.",
      "El frente sigue abierto.",
      "Continuar"
    );
  } else if (event.code === "KeyP" && state.screen === "paused") {
    state.screen = "playing";
    hideOverlay();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

DOM.startButton.addEventListener("click", () => {
  if (state.screen === "briefing") {
    startMission();
  } else if (state.screen === "mission-complete") {
    nextMission();
  } else if (state.screen === "gameover") {
    restartMission();
  }
});

DOM.restartButton.addEventListener("click", restartCampaign);

DOM.overlayPrimary.addEventListener("click", () => {
  if (state.screen === "briefing") {
    startMission();
  } else if (state.screen === "mission-complete") {
    nextMission();
  } else if (state.screen === "gameover") {
    restartMission();
  } else if (state.screen === "paused") {
    state.screen = "playing";
    hideOverlay();
  }
});

DOM.overlaySecondary.addEventListener("click", restartCampaign);

window.addEventListener("resize", resizeCanvasDisplay);
if (typeof ResizeObserver !== "undefined") {
  const stageFrameObserver = new ResizeObserver(resizeCanvasDisplay);
  stageFrameObserver.observe(DOM.stageFrame);
}

initMission(0, false);
updateSidebar();
resizeCanvasDisplay();
requestAnimationFrame(frame);
