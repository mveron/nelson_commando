const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const VIEW = { width: 480, height: 270 };
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const DOM = {
  stageFrame: document.getElementById("stageFrame"),
  campaignStatus: document.getElementById("campaignStatus"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  mobileFullscreenButton: document.getElementById("mobileFullscreenButton"),
  mobileStartButton: document.getElementById("mobileStartButton"),
  soundButton: document.getElementById("soundButton"),
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

const STORAGE_KEYS = {
  settings: "nelson-commando-settings",
  progress: "nelson-commando-progress",
};

const GRAVITY = 0.68;
const TILE_SIZE = 32;

const keys = Object.create(null);
const pressed = new Set();
const imageCache = new Map();

const hudPortrait = loadImage("assets/personaje/castro_hud.png");
const tileSheet = loadImage("assets/sprites/tiles_sheet.png");
const propsSheet = loadImage("assets/sprites/props_sheet.png");

const SHEETS = {
  nelson: {
    image: loadImage("assets/sprites/nelson_sheet.png"),
    frameW: 40,
    frameH: 40,
    columns: 6,
    animations: {
      idle: { frames: [0, 1, 2, 3], fps: 6 },
      run: { frames: [4, 5, 6, 7, 8, 9], fps: 10 },
      jump: { frames: [10, 11], fps: 6 },
      shoot: { frames: [12, 13, 14], fps: 16, loop: false },
      interview: { frames: [15, 16, 17, 18], fps: 8 },
      hurt: { frames: [19, 20], fps: 12 },
    },
  },
  source: {
    image: loadImage("assets/sprites/source_sheet.png"),
    frameW: 40,
    frameH: 40,
    columns: 4,
    animations: {
      idle: { frames: [0, 1, 2, 3], fps: 6 },
      talk: { frames: [4, 5, 6, 7], fps: 8 },
      brace: { frames: [8, 9], fps: 6 },
      signal: { frames: [10, 11], fps: 5 },
    },
  },
  rifle: {
    image: loadImage("assets/sprites/enemy_rifle_sheet.png"),
    frameW: 40,
    frameH: 40,
    columns: 4,
    animations: {
      idle: { frames: [0, 1], fps: 4 },
      run: { frames: [2, 3, 4, 5], fps: 9 },
      shoot: { frames: [6, 7], fps: 11, loop: false },
    },
  },
  heavy: {
    image: loadImage("assets/sprites/enemy_heavy_sheet.png"),
    frameW: 40,
    frameH: 40,
    columns: 4,
    animations: {
      idle: { frames: [0, 1], fps: 4 },
      run: { frames: [2, 3, 4, 5], fps: 7 },
      shoot: { frames: [6, 7], fps: 9, loop: false },
    },
  },
  drone: {
    image: loadImage("assets/sprites/drone_sheet.png"),
    frameW: 40,
    frameH: 40,
    columns: 3,
    animations: {
      fly: { frames: [0, 1, 2, 3], fps: 9 },
      shoot: { frames: [4, 5], fps: 12, loop: false },
    },
  },
  effects: {
    image: loadImage("assets/sprites/effects_sheet.png"),
    frameW: 40,
    frameH: 40,
    columns: 5,
    animations: {
      spark: { frames: [0, 1, 2, 3], fps: 18, loop: false },
      blast: { frames: [4, 5, 6, 7, 8], fps: 14, loop: false },
    },
  },
};

const STYLE_TILE_FALLBACK = {
  metal: 0,
  concrete: 1,
  ward: 2,
  studio: 3,
  road: 4,
  roof: 7,
};

const PROP_DEFS = {
  crate: { sx: 0, sy: 0, w: 32, h: 32, anchor: 26, scale: 1 },
  sandbag: { sx: 32, sy: 0, w: 32, h: 32, anchor: 28, scale: 1 },
  barrel: { sx: 64, sy: 0, w: 32, h: 32, anchor: 28, scale: 1 },
  dish: { sx: 96, sy: 0, w: 32, h: 32, anchor: 28, scale: 1 },
  antenna: { sx: 128, sy: 0, w: 32, h: 32, anchor: 28, scale: 1 },
  lamp: { sx: 160, sy: 0, w: 32, h: 32, anchor: 28, scale: 1 },
  wreck: { sx: 192, sy: 0, w: 32, h: 32, anchor: 28, scale: 1 },
  case: { sx: 224, sy: 0, w: 32, h: 32, anchor: 28, scale: 1 },
  sign: { sx: 0, sy: 32, w: 32, h: 32, anchor: 28, scale: 1 },
  van: { sx: 32, sy: 32, w: 32, h: 32, anchor: 28, scale: 1.25 },
  generator: { sx: 64, sy: 32, w: 32, h: 32, anchor: 28, scale: 1.1 },
  spotlight: { sx: 96, sy: 32, w: 32, h: 32, anchor: 28, scale: 1 },
  monitor: { sx: 128, sy: 32, w: 32, h: 32, anchor: 28, scale: 1 },
  mast: { sx: 160, sy: 32, w: 32, h: 32, anchor: 28, scale: 1 },
  rubble: { sx: 192, sy: 32, w: 32, h: 32, anchor: 28, scale: 1.1 },
  satruck: { sx: 224, sy: 32, w: 32, h: 32, anchor: 28, scale: 1.25 },
  truck: { sx: 224, sy: 32, w: 32, h: 32, anchor: 28, scale: 1.25 },
};

const state = {
  screen: "title",
  missionIndex: 0,
  world: null,
  cameraX: 0,
  lastTime: performance.now(),
  evidence: [],
  radio: [],
  shake: 0,
  flash: 0,
  uiDirty: true,
  uiTimer: 0,
  progress: loadProgress(),
  settings: loadSettings(),
  audio: createAudioSystem(),
};

function loadImage(src) {
  if (!imageCache.has(src)) {
    const image = new Image();
    image.src = src;
    imageCache.set(src, image);
  }
  return imageCache.get(src);
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "{}");
    return { audioEnabled: parsed.audioEnabled !== false };
  } catch {
    return { audioEnabled: true };
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || "{}");
    return { bestMission: Number.isFinite(parsed.bestMission) ? parsed.bestMission : 0 };
  } catch {
    return { bestMission: 0 };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
}

function createAudioSystem() {
  return {
    enabled: true,
    ctx: null,
    master: null,
    musicGain: null,
    sfxGain: null,
    noiseBuffer: null,
    profileKey: "",
    nextBeat: 0,
    step: 0,
  };
}

function ensureAudio() {
  const audio = state.audio;
  audio.enabled = state.settings.audioEnabled;
  if (!audio.enabled) {
    return;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  if (!audio.ctx) {
    audio.ctx = new AudioContextCtor();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.32;
    audio.master.connect(audio.ctx.destination);

    audio.musicGain = audio.ctx.createGain();
    audio.musicGain.gain.value = 0.18;
    audio.musicGain.connect(audio.master);

    audio.sfxGain = audio.ctx.createGain();
    audio.sfxGain.gain.value = 0.5;
    audio.sfxGain.connect(audio.master);

    audio.noiseBuffer = createNoiseBuffer(audio.ctx);
  }

  if (audio.ctx.state === "suspended") {
    audio.ctx.resume().catch(() => {});
  }
}

function createNoiseBuffer(audioCtx) {
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.6, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function updateSoundButtons() {
  DOM.soundButton.textContent = state.settings.audioEnabled ? "Audio activo" : "Audio apagado";
}

function updateFullscreenButtons() {
  const isFullscreen = Boolean(document.fullscreenElement);
  DOM.fullscreenButton.textContent = isFullscreen ? "Salir de pantalla" : "Pantalla completa";
  if (DOM.mobileFullscreenButton) {
    DOM.mobileFullscreenButton.textContent = isFullscreen ? "Salir" : "Full";
  }
}

function toggleAudio() {
  state.settings.audioEnabled = !state.settings.audioEnabled;
  saveSettings();
  updateSoundButtons();
  state.audio.enabled = state.settings.audioEnabled;
  if (state.settings.audioEnabled) {
    ensureAudio();
    if (state.audio.musicGain && state.audio.sfxGain) {
      state.audio.musicGain.gain.setTargetAtTime(0.18, state.audio.ctx.currentTime, 0.06);
      state.audio.sfxGain.gain.setTargetAtTime(0.5, state.audio.ctx.currentTime, 0.06);
    }
  } else if (state.audio.musicGain && state.audio.sfxGain) {
    state.audio.musicGain.gain.setTargetAtTime(0.0001, state.audio.ctx.currentTime, 0.03);
    state.audio.sfxGain.gain.setTargetAtTime(0.0001, state.audio.ctx.currentTime, 0.03);
  }
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    return;
  }
}

function getMusicProfile(index) {
  const profiles = [
    { key: "runway", stepLength: 0.24, bass: [46, null, 46, null, 53, null, 58, null], lead: [70, 72, 74, 70, 77, 74, 72, 69], accent: [0.5, 0, 0.35, 0, 0.45, 0, 0.38, 0] },
    { key: "hospital", stepLength: 0.23, bass: [43, null, 43, null, 50, null, 55, null], lead: [67, 69, 70, 69, 74, 72, 70, 67], accent: [0.42, 0, 0.3, 0, 0.42, 0, 0.34, 0] },
    { key: "convoy", stepLength: 0.21, bass: [41, null, 41, 48, 53, null, 57, 53], lead: [65, 67, 70, 72, 74, 72, 70, 67], accent: [0.55, 0, 0.33, 0.2, 0.48, 0, 0.36, 0.18] },
    { key: "archive", stepLength: 0.2, bass: [45, null, 45, 52, 57, null, 60, 57], lead: [69, 72, 74, 76, 77, 76, 74, 72], accent: [0.58, 0, 0.36, 0.24, 0.52, 0, 0.38, 0.22] },
    { key: "uplink", stepLength: 0.19, bass: [43, null, 48, 55, 60, 55, 62, 60], lead: [72, 74, 77, 79, 81, 79, 77, 74], accent: [0.62, 0, 0.4, 0.28, 0.58, 0.22, 0.42, 0.3] },
  ];
  return profiles[index] ?? profiles[0];
}

function midiToFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

function scheduleTone(when, frequency, duration, volume, type, destination) {
  const audio = state.audio;
  if (!audio.ctx || !audio.enabled || !destination) {
    return;
  }

  const oscillator = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(volume, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(when);
  oscillator.stop(when + duration + 0.02);
}

function scheduleNoise(when, duration, volume, lowpass = 1200) {
  const audio = state.audio;
  if (!audio.ctx || !audio.enabled || !audio.noiseBuffer || !audio.sfxGain) {
    return;
  }

  const source = audio.ctx.createBufferSource();
  const filter = audio.ctx.createBiquadFilter();
  const gain = audio.ctx.createGain();
  source.buffer = audio.noiseBuffer;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(lowpass, when);
  gain.gain.setValueAtTime(volume, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audio.sfxGain);
  source.start(when);
  source.stop(when + duration);
}

function playSfx(name) {
  ensureAudio();
  const audio = state.audio;
  if (!audio.ctx || !audio.enabled || !audio.sfxGain) {
    return;
  }

  const now = audio.ctx.currentTime;
  if (name === "shot") {
    scheduleTone(now, 840, 0.08, 0.08, "square", audio.sfxGain);
    scheduleNoise(now, 0.06, 0.045, 2400);
  } else if (name === "jump") {
    scheduleTone(now, 320, 0.12, 0.06, "triangle", audio.sfxGain);
    scheduleTone(now + 0.05, 420, 0.08, 0.05, "triangle", audio.sfxGain);
  } else if (name === "enemy-shot") {
    scheduleTone(now, 240, 0.1, 0.06, "sawtooth", audio.sfxGain);
    scheduleNoise(now, 0.04, 0.028, 1600);
  } else if (name === "impact") {
    scheduleNoise(now, 0.12, 0.06, 1400);
    scheduleTone(now, 170, 0.12, 0.03, "square", audio.sfxGain);
  } else if (name === "pickup") {
    scheduleTone(now, 880, 0.08, 0.05, "triangle", audio.sfxGain);
    scheduleTone(now + 0.06, 1040, 0.09, 0.05, "triangle", audio.sfxGain);
  } else if (name === "success") {
    scheduleTone(now, 660, 0.1, 0.05, "triangle", audio.sfxGain);
    scheduleTone(now + 0.07, 880, 0.12, 0.06, "triangle", audio.sfxGain);
    scheduleTone(now + 0.14, 1040, 0.14, 0.06, "triangle", audio.sfxGain);
  } else if (name === "warning") {
    scheduleTone(now, 220, 0.16, 0.06, "square", audio.sfxGain);
    scheduleTone(now + 0.16, 190, 0.14, 0.05, "square", audio.sfxGain);
  } else if (name === "explosion") {
    scheduleNoise(now, 0.22, 0.075, 900);
    scheduleTone(now, 110, 0.2, 0.04, "sawtooth", audio.sfxGain);
  }
}

function updateMusic() {
  const audio = state.audio;
  if (!audio.ctx || !audio.enabled || !audio.musicGain || state.screen !== "playing") {
    return;
  }

  const profile = getMusicProfile(state.missionIndex);
  if (audio.profileKey !== profile.key) {
    audio.profileKey = profile.key;
    audio.nextBeat = audio.ctx.currentTime + 0.04;
    audio.step = 0;
    audio.musicGain.gain.setTargetAtTime(0.18, audio.ctx.currentTime, 0.06);
  }

  while (audio.nextBeat < audio.ctx.currentTime + 0.18) {
    const step = audio.step % profile.bass.length;
    if (profile.bass[step]) {
      scheduleTone(audio.nextBeat, midiToFrequency(profile.bass[step]), profile.stepLength * 0.82, 0.05, "square", audio.musicGain);
    }
    if (profile.lead[step]) {
      scheduleTone(audio.nextBeat + 0.02, midiToFrequency(profile.lead[step]), profile.stepLength * 0.48, 0.028 + profile.accent[step] * 0.01, "triangle", audio.musicGain);
    }
    if (profile.accent[step] > 0) {
      scheduleNoise(audio.nextBeat, 0.04, profile.accent[step] * 0.01, 2000);
    }
    audio.nextBeat += profile.stepLength;
    audio.step += 1;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function moveToward(current, target, amount) {
  if (current < target) {
    return Math.min(current + amount, target);
  }
  return Math.max(current - amount, target);
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function getHitbox(entity) {
  if (entity.type === "player") {
    return { x: entity.x + 7, y: entity.y + 7, w: 14, h: 30 };
  }
  if (entity.type === "source") {
    return { x: entity.x + 7, y: entity.y + 8, w: 14, h: 28 };
  }
  if (entity.type === "drone") {
    return { x: entity.x + 6, y: entity.y + 8, w: 20, h: 12 };
  }
  if (entity.type === "heavy") {
    return { x: entity.x + 6, y: entity.y + 8, w: 18, h: 30 };
  }
  return { x: entity.x + 7, y: entity.y + 7, w: 14, h: 30 };
}

function edgePressed(code) {
  return pressed.has(code);
}

function markUiDirty() {
  state.uiDirty = true;
}

function resizeCanvasDisplay() {
  const frame = DOM.stageFrame;
  if (!frame) {
    return;
  }

  const availableWidth = Math.max(0, frame.clientWidth - 24);
  const availableHeight = Math.max(0, frame.clientHeight - 24);
  if (!availableWidth || !availableHeight) {
    return;
  }

  const scale = Math.min(availableWidth / VIEW.width, availableHeight / VIEW.height);
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function createPlayer(mission) {
  const tuning = mission.playerTuning;
  return {
    type: "player",
    x: 72,
    y: mission.groundY - 40,
    w: 28,
    h: 40,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    coyote: 0,
    jumpBuffer: 0,
    health: tuning.maxHealth,
    maxHealth: tuning.maxHealth,
    invuln: 0,
    fireCooldown: 0,
    recoil: 0,
    animState: "idle",
    animTime: 0,
    poseTimer: 0,
  };
}

function createSource(mission) {
  return {
    type: "source",
    x: mission.sourceX,
    y: mission.groundY - 40,
    w: 28,
    h: 40,
    health: mission.sourceTuning.maxHealth,
    maxHealth: mission.sourceTuning.maxHealth,
    active: false,
    completed: false,
    timer: mission.sourceTuning.interviewDuration,
    maxTimer: mission.sourceTuning.interviewDuration,
    animState: "idle",
    animTime: 0,
  };
}

function createEnemy(type, x, groundY, yOverride, mission) {
  const tuning = mission.enemyTuning[type];
  if (type === "drone") {
    return {
      type,
      x,
      y: yOverride ?? groundY - 116,
      w: 32,
      h: 24,
      vx: 0,
      vy: 0,
      health: tuning.health,
      range: tuning.range,
      shotCooldownBase: tuning.shotCooldown,
      cooldown: tuning.shotCooldown * (0.8 + Math.random() * 0.6),
      shotDamage: tuning.shotDamage,
      bulletSpeed: tuning.bulletSpeed,
      touchDamage: tuning.touchDamage,
      speed: tuning.speed,
      pulse: Math.random() * Math.PI * 2,
      facing: -1,
      shootPose: 0,
      animState: "fly",
      animTime: 0,
      hitFlash: 0,
    };
  }

  const heavy = type === "heavy";
  return {
    type,
    x,
    y: groundY - (heavy ? 42 : 40),
    w: heavy ? 30 : 28,
    h: heavy ? 42 : 40,
    vx: 0,
    vy: 0,
    onGround: false,
    health: tuning.health,
    range: tuning.range,
    shotCooldownBase: tuning.shotCooldown,
    cooldown: tuning.shotCooldown * (0.8 + Math.random() * 0.5),
    shotDamage: tuning.shotDamage,
    bulletSpeed: tuning.bulletSpeed,
    touchDamage: tuning.touchDamage,
    speed: tuning.speed,
    facing: -1,
    shootPose: 0,
    animState: "idle",
    animTime: 0,
    hitFlash: 0,
  };
}

function buildPlatforms(mission) {
  const floor = {
    x: 0,
    y: mission.groundY,
    w: mission.levelWidth,
    h: VIEW.height - mission.groundY + 48,
    tile: mission.tileSet.ground,
    edgeTile: mission.tileSet.edge,
  };

  return [floor, ...mission.platforms.map((platform) => ({
    ...platform,
    tile: STYLE_TILE_FALLBACK[platform.style] ?? mission.tileSet.platform,
  }))];
}

function createWorld(missionIndex) {
  const mission = missions[missionIndex];
  return {
    mission,
    backgroundImage: loadImage(mission.background.image),
    player: createPlayer(mission),
    source: createSource(mission),
    enemies: mission.initialEnemies.map((enemy) => createEnemy(enemy.type, enemy.x, mission.groundY, enemy.y, mission)),
    playerBullets: [],
    enemyBullets: [],
    particles: [],
    effects: [],
    pickups: [],
    platforms: buildPlatforms(mission),
    props: mission.props.slice().sort((a, b) => a.x - b.x),
    objective: mission.goal,
    hint: "Enter o boton para desplegar.",
    extractionUnlocked: false,
    extractionWaveDone: false,
    interviewQueue: mission.interviewWaves.map((wave) => ({ ...wave, fired: false })),
    missionTime: 0,
    previewTime: 0,
    shellTimer: randomRange(mission.encounterPacing.shellingInterval[0], mission.encounterPacing.shellingInterval[1]),
    scorePulse: 0,
  };
}

function initMission(index, options = {}) {
  const keepEvidence = options.keepEvidence !== false;
  const toScreen = options.toScreen ?? "briefing";
  const addLog = options.addLog !== false;

  state.missionIndex = index;
  state.world = createWorld(index);
  state.screen = toScreen;
  state.cameraX = 0;
  state.radio = [];

  if (!keepEvidence) {
    state.evidence = [];
  }

  if (addLog) {
    missions[index].startLog.forEach((line) => pushRadio(line));
  }

  syncMissionPanel();
  if (toScreen === "title") {
    showTitleScreen();
  } else if (toScreen === "briefing") {
    showMissionBriefing();
  } else if (toScreen === "playing") {
    hideOverlay();
  }

  markUiDirty();
  updateSidebar(true);
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

function updateSidebar(force = false) {
  if (!force && !state.uiDirty) {
    return;
  }

  DOM.objectiveText.textContent = state.world?.objective ?? "Sin objetivo.";
  DOM.hintText.textContent = state.world?.hint ?? "";
  DOM.intelList.innerHTML = "";
  if (state.evidence.length === 0) {
    const empty = document.createElement("div");
    empty.className = "intel-item";
    empty.textContent = "Todavia no hay piezas cerradas. Cada entrevista recupera una parte del relato.";
    DOM.intelList.appendChild(empty);
  } else {
    state.evidence.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "intel-item";
      const title = document.createElement("strong");
      title.textContent = entry.title;
      const body = document.createElement("div");
      body.textContent = entry.body;
      item.appendChild(title);
      item.appendChild(body);
      DOM.intelList.appendChild(item);
    });
  }

  DOM.radioLog.innerHTML = "";
  state.radio.slice(-6).forEach((line) => {
    const item = document.createElement("div");
    item.className = "radio-item";
    item.textContent = line;
    DOM.radioLog.appendChild(item);
  });

  state.uiDirty = false;
}

function pushRadio(line) {
  state.radio.push(line);
  if (state.radio.length > 12) {
    state.radio = state.radio.slice(-12);
  }
  markUiDirty();
}

function showOverlay(config) {
  DOM.overlayTag.textContent = config.tag;
  DOM.overlayTitle.textContent = config.title;
  DOM.overlayBody.textContent = config.body;
  DOM.overlayMeta.textContent = config.meta;
  DOM.overlayPrimary.textContent = config.primaryText;
  DOM.overlaySecondary.hidden = Boolean(config.secondaryHidden);
  if (!DOM.overlaySecondary.hidden) {
    DOM.overlaySecondary.textContent = config.secondaryText ?? "Reiniciar campana";
  }
  DOM.overlay.classList.remove("hidden");
}

function hideOverlay() {
  DOM.overlay.classList.add("hidden");
}

function showTitleScreen() {
  const mission = missions[0];
  state.world.objective = "Preparar cobertura.";
  state.world.hint = "Inicia la campana para entrar en la primera zona.";
  showOverlay({
    tag: "Nelson Commando",
    title: "La verdad no espera",
    body: "Nelson Castro cruza cinco frentes, entrevista testigos y sostiene la senal lo suficiente para poner pruebas al aire.",
    meta: `Primera mision: ${mission.mobileTitle}. Audio, tactiles y pantalla completa disponibles.`,
    primaryText: "Entrar al briefing",
    secondaryHidden: true,
  });
}

function showMissionBriefing() {
  const mission = missions[state.missionIndex];
  state.world.objective = mission.goal;
  state.world.hint = "Revisa la mision y despliega cuando estes listo.";
  showOverlay({
    tag: `${mission.act} - ${mission.difficulty}`,
    title: mission.title,
    body: `${mission.brief} Fuente: ${mission.source.name}, ${mission.source.role}.`,
    meta: "Mover, disparar, entrevistar y extraer. El audio arranca al iniciar juego.",
    primaryText: "Desplegar",
    secondaryText: "Reiniciar campana",
  });
}

function startCampaign() {
  initMission(0, { keepEvidence: false, toScreen: "briefing", addLog: true });
}

function startMission() {
  if (!state.world || state.screen === "finished") {
    return;
  }

  ensureAudio();
  if (state.audio.musicGain && state.settings.audioEnabled) {
    state.audio.musicGain.gain.setTargetAtTime(0.18, state.audio.ctx.currentTime, 0.06);
    state.audio.sfxGain.gain.setTargetAtTime(0.5, state.audio.ctx.currentTime, 0.06);
  }

  state.screen = "playing";
  state.world.objective = `Alcanzar a ${state.world.mission.source.name}.`;
  state.world.hint = "Abre paso, protege la fuente y usa E para iniciar la entrevista.";
  hideOverlay();
  markUiDirty();
}

function restartCampaign() {
  initMission(0, { keepEvidence: false, toScreen: "briefing", addLog: true });
}

function restartMission() {
  initMission(state.missionIndex, { keepEvidence: true, toScreen: "briefing", addLog: true });
}

function nextMission() {
  if (state.missionIndex >= missions.length - 1) {
    completeCampaign();
    return;
  }

  initMission(state.missionIndex + 1, { keepEvidence: true, toScreen: "briefing", addLog: true });
}

function completeCampaign() {
  state.screen = "finished";
  state.progress.bestMission = missions.length;
  saveProgress();
  state.world.objective = "Transmision completa.";
  state.world.hint = "La investigacion sale al aire. Reinicia para volver al frente.";
  pushRadio("Productora: Esta saliendo. Ya no pueden borrar todo.");
  pushRadio("Nelson: Perfecto. Ahora que miren.");
  showOverlay({
    tag: "Transmision final",
    title: "La pieza salio al aire",
    body: `Nelson cierra la campana con ${state.evidence.length} testimonios validados y toda la cadena de mando expuesta.`,
    meta: "Puedes reiniciar la campana o volver a jugar cualquier tramo.",
    primaryText: "Campana completa",
    secondaryText: "Reiniciar campana",
  });
  markUiDirty();
}

function beginInterview() {
  const world = state.world;
  if (world.source.active || world.source.completed) {
    return;
  }

  world.source.active = true;
  world.source.timer = world.source.maxTimer;
  world.objective = `Protege la entrevista con ${world.mission.source.name}.`;
  world.hint = `Mantene a raya la presion. Fuente ${Math.round(world.source.health)}/${world.source.maxHealth}.`;
  pushRadio(`${world.mission.source.name}: ${world.mission.source.quote}`);
  playSfx("warning");
  markUiDirty();
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
  world.hint = "La evidencia ya esta cerrada. Llega al uplink y extrae la pieza.";
  state.evidence.push({
    title: world.mission.title,
    body: world.mission.evidence,
  });
  world.mission.winLog.forEach((line) => pushRadio(line));
  playSfx("success");
  state.progress.bestMission = Math.max(state.progress.bestMission, state.missionIndex + 1);
  saveProgress();
  markUiDirty();
}

function finishMission() {
  state.screen = "mission-complete";
  state.world.objective = "Pieza cerrada.";
  state.world.hint = "Enter o boton para continuar al siguiente frente.";
  showOverlay({
    tag: state.world.mission.act,
    title: "Pieza cerrada",
    body: state.world.mission.evidence,
    meta: "La fuente sale de la zona caliente y la senal queda arriba.",
    primaryText: state.missionIndex === missions.length - 1 ? "Ver cierre" : "Siguiente mision",
    secondaryText: "Reiniciar campana",
  });
  markUiDirty();
}

function failMission(reason) {
  state.screen = "gameover";
  state.world.objective = "Mision fallida.";
  state.world.hint = "Enter o boton para reintentar.";
  showOverlay({
    tag: "Corte de senal",
    title: "Mision fallida",
    body: reason,
    meta: "Reintenta esta mision o reinicia la campana completa.",
    primaryText: "Reintentar",
    secondaryText: "Reiniciar campana",
  });
  playSfx("warning");
  markUiDirty();
}

function pauseGame() {
  if (state.screen !== "playing") {
    return;
  }
  state.screen = "paused";
  showOverlay({
    tag: "Pausa",
    title: "Transmision en espera",
    body: "La senal queda congelada. El frente sigue abierto en cuanto vuelvas.",
    meta: "Enter, boton o P para retomar.",
    primaryText: "Continuar",
    secondaryText: "Reiniciar campana",
  });
}

function resumeGame() {
  if (state.screen !== "paused") {
    return;
  }
  state.screen = "playing";
  hideOverlay();
  markUiDirty();
}

function spawnEnemyFromEdge(type, edge) {
  const mission = state.world.mission;
  const x = edge === "left"
    ? clamp(state.cameraX - 36, 16, mission.levelWidth - 56)
    : clamp(state.cameraX + VIEW.width + 36, 56, mission.levelWidth - 56);
  const y = type === "drone" ? mission.groundY - 118 - Math.random() * 28 : undefined;
  state.world.enemies.push(createEnemy(type, x, mission.groundY, y, mission));
}

function spawnInterviewWaves() {
  const world = state.world;
  world.interviewQueue.forEach((wave) => {
    if (!wave.fired && world.source.maxTimer - world.source.timer >= wave.delay) {
      wave.fired = true;
      wave.spawns.forEach((spawn) => spawnEnemyFromEdge(spawn.type, spawn.edge));
      world.scorePulse = 0.32;
      state.shake = Math.max(state.shake, 0.18);
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
  pushRadio("Productora: Estan cortando la salida. Mantene la cinta viva.");
  playSfx("warning");
}

function createEffect(type, x, y, scale = 1) {
  return { type, x, y, scale, age: 0 };
}

function makeParticle(x, y, tint, velocityX, velocityY, life, size, gravity = 0.02) {
  return { x, y, vx: velocityX, vy: velocityY, tint, life, size, gravity };
}

function spawnDust(world, x, y, tint = "#c59f74") {
  for (let i = 0; i < 3; i += 1) {
    world.particles.push(
      makeParticle(
        x,
        y,
        tint,
        (Math.random() - 0.5) * 0.6,
        -0.2 - Math.random() * 0.25,
        0.48 + Math.random() * 0.2,
        4 + Math.floor(Math.random() * 2),
        0.012
      )
    );
  }
}

function spawnSparks(world, x, y, tint = "#f2c56a") {
  for (let i = 0; i < 6; i += 1) {
    world.particles.push(
      makeParticle(
        x,
        y,
        tint,
        (Math.random() - 0.5) * 2.1,
        (Math.random() - 0.6) * 1.8,
        0.28 + Math.random() * 0.16,
        2 + Math.floor(Math.random() * 2),
        0.06
      )
    );
  }
}

function spawnPickup(world, x, y) {
  const type = Math.random() < 0.55 ? "health" : "signal";
  world.pickups.push({
    type,
    x,
    y,
    w: 12,
    h: 12,
    vy: -1.4,
    life: 10,
    bob: Math.random() * Math.PI * 2,
  });
}

function bulletHitsPlatform(bullet, platforms) {
  return platforms.some((platform) => rectsOverlap(bullet, platform));
}

function update(dt) {
  if (!state.world) {
    return;
  }

  state.shake = Math.max(0, state.shake - dt * 1.6);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  state.uiTimer -= dt;

  if (state.screen === "title") {
    updatePreview(state.world, dt);
    pressed.clear();
    if (state.uiTimer <= 0 && state.uiDirty) {
      updateSidebar(true);
      state.uiTimer = 0.1;
    }
    return;
  }

  if (state.screen !== "playing") {
    updatePreview(state.world, dt * 0.45);
    pressed.clear();
    if (state.uiTimer <= 0 && state.uiDirty) {
      updateSidebar(true);
      state.uiTimer = 0.1;
    }
    return;
  }

  updateMusic();

  const world = state.world;
  const mission = world.mission;
  const player = world.player;
  const playerTuning = mission.playerTuning;

  world.missionTime += dt;
  world.scorePulse = Math.max(0, world.scorePulse - dt);

  const inputX =
    (keys.ArrowRight || keys.KeyD ? 1 : 0) -
    (keys.ArrowLeft || keys.KeyA ? 1 : 0);
  const wantsJump = edgePressed("ArrowUp") || edgePressed("KeyW") || edgePressed("Space");
  const wantsShoot = keys.KeyJ || keys.KeyF;

  player.animTime += dt;
  player.invuln = Math.max(0, player.invuln - dt);
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  player.poseTimer = Math.max(0, player.poseTimer - dt);
  player.recoil = Math.max(0, player.recoil - dt * 2.6);
  player.jumpBuffer = wantsJump ? playerTuning.jumpBuffer : Math.max(0, player.jumpBuffer - dt);
  player.coyote = player.onGround
    ? playerTuning.coyoteTime
    : Math.max(0, player.coyote - dt);

  const targetSpeed = inputX * playerTuning.maxSpeed;
  const accel = playerTuning.accel * (player.onGround ? 1 : playerTuning.airControl) * dt * 60;
  player.vx = moveToward(player.vx, targetSpeed, accel);

  if (!inputX && player.onGround) {
    player.vx *= playerTuning.friction ** (dt * 60);
    if (Math.abs(player.vx) < 0.04) {
      player.vx = 0;
    }
  }

  if (inputX !== 0) {
    player.facing = inputX;
  }

  if (player.jumpBuffer > 0 && player.coyote > 0) {
    player.jumpBuffer = 0;
    player.coyote = 0;
    player.vy = -playerTuning.jumpVelocity;
    player.onGround = false;
    spawnDust(world, player.x + player.w / 2, player.y + player.h, mission.palette.dust);
    playSfx("jump");
  }

  if (wantsShoot && player.fireCooldown <= 0) {
    player.fireCooldown = playerTuning.shotCooldown;
    player.poseTimer = 0.14;
    player.recoil = playerTuning.recoil;
    const bulletY = player.y + 18;
    world.playerBullets.push({
      x: player.facing > 0 ? player.x + player.w - 2 : player.x - 12,
      y: bulletY,
      w: 10,
      h: 4,
      vx: player.facing * 8.8,
      vy: 0,
      life: 0.95,
      damage: playerTuning.bulletDamage,
    });
    world.effects.push(createEffect("spark", player.x + (player.facing > 0 ? 26 : 2), bulletY + 2, 0.8));
    playSfx("shot");
  }

  player.vy = Math.min(player.vy + GRAVITY, 14.5);
  moveEntity(player, world.platforms, dt);

  if (Math.abs(player.vx) > 1.4 && player.onGround && Math.random() < 0.13) {
    spawnDust(world, player.x + player.w / 2, player.y + player.h, mission.palette.dust);
  }

  updatePlayerAnimation(world);
  updateBullets(world, dt);
  updateEnemies(world, dt);
  updateSource(world, dt);
  updatePickups(world, dt);
  updateAmbientHazards(world, dt);
  updateParticles(world, dt);
  updateEffects(world, dt);
  resolveCombat(world);

  if (!world.source.active && !world.source.completed) {
    world.objective = `Alcanzar a ${world.mission.source.name}.`;
    world.hint =
      Math.abs(player.x - world.source.x) < 36 && Math.abs(player.y - world.source.y) < 28
        ? "Pulsa E para iniciar la entrevista."
        : "Avanza usando plataformas y cobertura baja.";

    if (
      edgePressed("KeyE") &&
      Math.abs(player.x - world.source.x) < 44 &&
      Math.abs(player.y - world.source.y) < 34
    ) {
      beginInterview();
    }
  }

  if (world.source.completed && !world.extractionWaveDone && player.x > world.mission.sourceX + 420) {
    spawnExtractionWave();
  }

  if (world.extractionUnlocked) {
    const extractRect = {
      x: world.mission.exitX - 38,
      y: world.mission.groundY - 54,
      w: 58,
      h: 56,
    };
    world.objective = `Llega a ${world.mission.extractLabel}.`;
    world.hint = rectsOverlap(getHitbox(player), extractRect)
      ? "Pulsa E para transmitir y extraer."
      : "La ruta ya esta abierta. No regales tiempo.";

    if (rectsOverlap(getHitbox(player), extractRect) && edgePressed("KeyE")) {
      finishMission();
    }
  }

  if (world.player.health <= 0) {
    failMission("Nelson cae antes de cerrar la pieza. La cinta queda en la zona caliente.");
  }

  const targetCamera = clamp(
    player.x - VIEW.width * 0.38 + player.recoil * -player.facing * 10,
    0,
    world.mission.levelWidth - VIEW.width
  );
  state.cameraX = lerp(state.cameraX, targetCamera, 0.16);

  if (state.uiTimer <= 0 && state.uiDirty) {
    updateSidebar(true);
    state.uiTimer = 0.08;
  }

  pressed.clear();
}

function updatePreview(world, dt) {
  const player = world.player;
  world.previewTime += dt;
  const travel = Math.max(1, world.mission.levelWidth - VIEW.width);
  state.cameraX = (Math.sin(world.previewTime * 0.18) * 0.5 + 0.5) * travel;
  player.x = state.cameraX + VIEW.width * 0.22 + Math.sin(world.previewTime * 1.8) * 10;
  player.y = world.mission.groundY - 40;
  player.onGround = true;
  player.animState = "run";
  player.animTime += dt;
  player.facing = 1;
  world.source.animState = "idle";
  world.source.animTime += dt;
  world.enemies.forEach((enemy, index) => {
    enemy.animTime += dt;
    enemy.shootPose = 0;
    if (enemy.type === "drone") {
      enemy.pulse += dt * 2.5;
      enemy.y += Math.sin(enemy.pulse + index) * 0.28;
      enemy.animState = "fly";
    } else {
      enemy.animState = index % 2 === 0 ? "run" : "idle";
    }
  });
}

function updatePlayerAnimation(world) {
  const player = world.player;
  let next = "idle";
  if (player.invuln > 0 && player.poseTimer <= 0 && player.health < player.maxHealth * 0.32) {
    next = "hurt";
  } else if (world.source.active && Math.abs(player.x - world.source.x) < 48 && Math.abs(player.vx) < 0.3) {
    next = "interview";
  } else if (!player.onGround) {
    next = "jump";
  } else if (player.poseTimer > 0) {
    next = "shoot";
  } else if (Math.abs(player.vx) > 0.45) {
    next = "run";
  }
  setAnimation(player, next);
}

function setAnimation(entity, nextState) {
  if (entity.animState !== nextState) {
    entity.animState = nextState;
    entity.animTime = 0;
  }
}

function updateBullets(world, dt) {
  world.playerBullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt * 60;
    bullet.y += bullet.vy * dt * 60;
    bullet.life -= dt;
  });

  world.enemyBullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt * 60;
    bullet.y += bullet.vy * dt * 60;
    bullet.life -= dt;
  });

  world.playerBullets = world.playerBullets.filter((bullet) => {
    if (bullet.life <= 0 || bullet.x < -40 || bullet.x > world.mission.levelWidth + 40 || bulletHitsPlatform(bullet, world.platforms)) {
      if (bullet.life > 0) {
        world.effects.push(createEffect("spark", bullet.x, bullet.y, 0.7));
      }
      return false;
    }
    return true;
  });

  world.enemyBullets = world.enemyBullets.filter((bullet) => {
    if (bullet.life <= 0 || bullet.x < -40 || bullet.x > world.mission.levelWidth + 40 || bulletHitsPlatform(bullet, world.platforms)) {
      if (bullet.life > 0) {
        world.effects.push(createEffect("spark", bullet.x, bullet.y, 0.6));
      }
      return false;
    }
    return true;
  });
}

function chooseEnemyTarget(world, enemy) {
  if (!world.source.active) {
    return world.player;
  }
  const playerDistance = Math.abs(world.player.x - enemy.x);
  const sourceDistance = Math.abs(world.source.x - enemy.x);
  return sourceDistance < playerDistance * 0.9 ? world.source : world.player;
}

function updateEnemies(world, dt) {
  world.enemies.forEach((enemy) => {
    enemy.cooldown -= dt;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.animTime += dt;
    enemy.shootPose = Math.max(0, enemy.shootPose - dt);

    const target = chooseEnemyTarget(world, enemy);
    const targetHitbox = getHitbox(target);

    if (enemy.type === "drone") {
      enemy.pulse += dt * 3.2;
      enemy.y += Math.sin(enemy.pulse) * 0.36;
      const centerX = enemy.x + enemy.w / 2;
      const deltaX = targetHitbox.x + targetHitbox.w / 2 - centerX;
      enemy.x += Math.sign(deltaX || 1) * enemy.speed;
      enemy.x = clamp(enemy.x, 24, world.mission.levelWidth - 40);
      enemy.facing = deltaX >= 0 ? 1 : -1;

      if (Math.abs(deltaX) < enemy.range && enemy.cooldown <= 0) {
        enemy.cooldown = enemy.shotCooldownBase * (0.85 + Math.random() * 0.35);
        enemy.shootPose = 0.18;
        enemy.animState = "shoot";
        const dirX = targetHitbox.x + targetHitbox.w / 2 - (enemy.x + enemy.w / 2);
        const dirY = targetHitbox.y + targetHitbox.h / 2 - (enemy.y + enemy.h / 2);
        const length = Math.max(1, Math.hypot(dirX, dirY));
        world.enemyBullets.push({
          x: enemy.x + enemy.w / 2 - 3,
          y: enemy.y + enemy.h / 2 - 3,
          w: 6,
          h: 6,
          vx: (dirX / length) * enemy.bulletSpeed,
          vy: (dirY / length) * enemy.bulletSpeed,
          life: 1.9,
          damage: enemy.shotDamage,
        });
        playSfx("enemy-shot");
      } else if (enemy.shootPose <= 0) {
        enemy.animState = "fly";
      }

      return;
    }

    const distanceX = targetHitbox.x + targetHitbox.w / 2 - (enemy.x + enemy.w / 2);
    enemy.facing = distanceX >= 0 ? 1 : -1;
    const desiredSpeed = Math.abs(distanceX) > enemy.range ? Math.sign(distanceX) * enemy.speed : 0;
    enemy.vx = moveToward(enemy.vx, desiredSpeed, 0.18);
    enemy.vy = Math.min(enemy.vy + GRAVITY, 14.8);
    moveEntity(enemy, world.platforms, dt);

    if (Math.abs(enemy.vx) > 0.2 && enemy.onGround && Math.random() < 0.06) {
      spawnDust(world, enemy.x + enemy.w / 2, enemy.y + enemy.h, "#936f57");
    }

    if (
      Math.abs(distanceX) < enemy.range + 18 &&
      Math.abs(targetHitbox.y - enemy.y) < 86 &&
      enemy.cooldown <= 0
    ) {
      enemy.cooldown = enemy.shotCooldownBase * (0.9 + Math.random() * 0.28);
      enemy.shootPose = enemy.type === "heavy" ? 0.22 : 0.18;
      const dirX = targetHitbox.x + targetHitbox.w / 2 - (enemy.x + enemy.w / 2);
      const dirY = targetHitbox.y + targetHitbox.h / 2 - (enemy.y + enemy.h / 2);
      const length = Math.max(1, Math.hypot(dirX, dirY));
      world.enemyBullets.push({
        x: enemy.x + (enemy.facing > 0 ? enemy.w - 2 : -8),
        y: enemy.y + 18,
        w: 8,
        h: 4,
        vx: (dirX / length) * enemy.bulletSpeed,
        vy: (dirY / length) * enemy.bulletSpeed,
        life: 1.8,
        damage: enemy.shotDamage,
      });
      playSfx("enemy-shot");
    }

    if (enemy.shootPose > 0) {
      setAnimation(enemy, "shoot");
    } else if (Math.abs(enemy.vx) > 0.18) {
      setAnimation(enemy, "run");
    } else {
      setAnimation(enemy, "idle");
    }
  });

  world.enemies = world.enemies.filter((enemy) => enemy.health > 0);
}

function updateSource(world, dt) {
  const source = world.source;
  source.animTime += dt;

  if (!source.active) {
    setAnimation(source, source.completed ? "signal" : "idle");
    return;
  }

  source.timer = Math.max(0, source.timer - dt);
  world.objective = `Protege la entrevista. Tiempo restante: ${source.timer.toFixed(1)}s`;
  world.hint = `Fuente ${Math.max(0, Math.round(source.health))}/${source.maxHealth}.`;

  if (Math.abs(world.player.x - source.x) > 58) {
    setAnimation(source, "brace");
  } else {
    setAnimation(source, "talk");
  }

  spawnInterviewWaves();

  if (source.health <= 0) {
    failMission("La fuente cae antes de terminar la entrevista. No hay historia que emitir.");
  } else if (source.timer <= 0) {
    finishInterview();
  }
}

function updatePickups(world, dt) {
  world.pickups.forEach((pickup) => {
    pickup.life -= dt;
    pickup.bob += dt * 5;
    pickup.vy = Math.min(pickup.vy + 0.1, 1.4);
    pickup.y += pickup.vy;
    if (pickup.y + pickup.h > world.mission.groundY) {
      pickup.y = world.mission.groundY - pickup.h;
      pickup.vy = 0;
    }
  });

  const playerHitbox = getHitbox(world.player);
  world.pickups = world.pickups.filter((pickup) => {
    if (pickup.life <= 0) {
      return false;
    }

    if (rectsOverlap(playerHitbox, pickup)) {
      if (pickup.type === "health") {
        world.player.health = Math.min(world.player.maxHealth, world.player.health + 24);
      } else if (world.source.active && !world.source.completed) {
        world.source.health = Math.min(world.source.maxHealth, world.source.health + 14);
        world.source.timer = Math.min(world.source.maxTimer, world.source.timer + 1.15);
      } else {
        world.player.health = Math.min(world.player.maxHealth, world.player.health + 12);
      }
      playSfx("pickup");
      spawnSparks(world, pickup.x + pickup.w / 2, pickup.y + pickup.h / 2);
      return false;
    }

    return true;
  });
}

function updateAmbientHazards(world, dt) {
  world.shellTimer -= dt;
  if (world.shellTimer > 0) {
    return;
  }

  world.shellTimer = randomRange(world.mission.encounterPacing.shellingInterval[0], world.mission.encounterPacing.shellingInterval[1]);

  const impactX = clamp(state.cameraX + randomRange(72, VIEW.width - 72), 32, world.mission.levelWidth - 32);
  const impactY = world.mission.groundY - 14;
  world.effects.push(createEffect("blast", impactX, impactY, 1.2));
  spawnSparks(world, impactX, impactY, "#f0cc78");
  spawnDust(world, impactX, impactY + 8, world.mission.palette.dust);
  playSfx("explosion");
  state.shake = Math.max(state.shake, 0.34);
  state.flash = Math.max(state.flash, 0.18);

  const playerCenter = getHitbox(world.player);
  const sourceCenter = getHitbox(world.source);

  if (Math.abs(playerCenter.x + playerCenter.w / 2 - impactX) < 36 && world.player.invuln <= 0) {
    world.player.health -= 16;
    world.player.invuln = world.mission.playerTuning.invuln;
    spawnSparks(world, world.player.x + world.player.w / 2, world.player.y + 16, "#f3bb8d");
    playSfx("impact");
  }

  if (world.source.active && !world.source.completed && Math.abs(sourceCenter.x + sourceCenter.w / 2 - impactX) < 34) {
    world.source.health -= 14;
  }
}

function updateParticles(world, dt) {
  world.particles.forEach((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt * 60;
    particle.y += particle.vy * dt * 60;
    particle.vy += particle.gravity;
  });
  world.particles = world.particles.filter((particle) => particle.life > 0);
}

function updateEffects(world, dt) {
  world.effects.forEach((effect) => {
    effect.age += dt;
  });
  world.effects = world.effects.filter((effect) => {
    const animation = SHEETS.effects.animations[effect.type];
    return effect.age < animation.frames.length / animation.fps;
  });
}

function applyPlayerHit(world, damage) {
  if (world.player.invuln > 0) {
    return;
  }

  world.player.health -= damage;
  world.player.invuln = world.mission.playerTuning.invuln;
  world.player.poseTimer = 0.12;
  spawnSparks(world, world.player.x + world.player.w / 2, world.player.y + 18, "#f3bb8d");
  state.shake = Math.max(state.shake, 0.2);
  state.flash = Math.max(state.flash, 0.08);
  playSfx("impact");
}

function resolveCombat(world) {
  world.playerBullets.forEach((bullet) => {
    world.enemies.forEach((enemy) => {
      if (bullet.life <= 0 || enemy.health <= 0) {
        return;
      }

      if (rectsOverlap(bullet, getHitbox(enemy))) {
        bullet.life = 0;
        enemy.health -= bullet.damage;
        enemy.hitFlash = 0.12;
        enemy.shootPose = 0;
        spawnSparks(world, enemy.x + enemy.w / 2, enemy.y + 16);

        if (enemy.health <= 0) {
          world.effects.push(createEffect("blast", enemy.x + enemy.w / 2, enemy.y + 20, enemy.type === "heavy" ? 1.15 : 1));
          spawnDust(world, enemy.x + enemy.w / 2, enemy.y + enemy.h, "#8f6a52");
          state.shake = Math.max(state.shake, enemy.type === "heavy" ? 0.28 : 0.18);
          if (Math.random() < world.mission.encounterPacing.pickupChance) {
            spawnPickup(world, enemy.x + enemy.w / 2 - 6, enemy.y + enemy.h - 12);
          }
        }
      }
    });
  });

  world.enemyBullets.forEach((bullet) => {
    if (bullet.life <= 0) {
      return;
    }

    if (world.source.active && rectsOverlap(bullet, getHitbox(world.source))) {
      bullet.life = 0;
      world.source.health -= bullet.damage;
      spawnSparks(world, world.source.x + world.source.w / 2, world.source.y + 18, "#d8916a");
      return;
    }

    if (rectsOverlap(bullet, getHitbox(world.player))) {
      bullet.life = 0;
      applyPlayerHit(world, bullet.damage);
    }
  });

  world.enemies.forEach((enemy) => {
    if (enemy.health <= 0) {
      return;
    }

    if (rectsOverlap(getHitbox(enemy), getHitbox(world.player))) {
      applyPlayerHit(world, enemy.touchDamage);
    }

    if (world.source.active && rectsOverlap(getHitbox(enemy), getHitbox(world.source))) {
      world.source.health -= world.mission.sourceTuning.contactDamageScale * enemy.touchDamage * 0.1;
    }
  });
}

function moveEntity(entity, platforms, dt) {
  entity.x += entity.vx * dt * 60;
  for (const platform of platforms) {
    if (!rectsOverlap(entity, platform)) {
      continue;
    }
    if (entity.vx > 0) {
      entity.x = platform.x - entity.w;
    } else if (entity.vx < 0) {
      entity.x = platform.x + platform.w;
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

function drawImageFrame(sheet, frameIndex, x, y, facing = 1, scale = 1) {
  const sx = (frameIndex % sheet.columns) * sheet.frameW;
  const sy = Math.floor(frameIndex / sheet.columns) * sheet.frameH;
  const width = sheet.frameW * scale;
  const height = sheet.frameH * scale;

  ctx.save();
  if (facing < 0) {
    ctx.translate(Math.round(x + width), Math.round(y));
    ctx.scale(-1, 1);
    ctx.drawImage(sheet.image, sx, sy, sheet.frameW, sheet.frameH, 0, 0, width, height);
  } else {
    ctx.drawImage(sheet.image, sx, sy, sheet.frameW, sheet.frameH, Math.round(x), Math.round(y), width, height);
  }
  ctx.restore();
}

function drawEntitySprite(sheet, entity, cameraX) {
  const animation = sheet.animations[entity.animState] ?? sheet.animations.idle ?? sheet.animations.fly;
  const frames = animation.frames;
  const frame = frames[
    animation.loop === false
      ? Math.min(frames.length - 1, Math.floor(entity.animTime * animation.fps))
      : Math.floor(entity.animTime * animation.fps) % frames.length
  ];
  const scale = entity.type === "player" ? 1.15 : entity.type === "heavy" ? 1.12 : 1.05;
  drawImageFrame(
    sheet,
    frame,
    entity.x - cameraX - 6 - (sheet.frameW * (scale - 1)) / 2,
    entity.y - 2 - sheet.frameH * (scale - 1),
    entity.facing ?? 1,
    scale
  );
}

function render() {
  if (!state.world) {
    return;
  }

  const world = state.world;
  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 10 : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 6 : 0;

  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawBackground(world, state.cameraX);
  drawPropLayer(world, "back");
  drawPlatforms(world.platforms, state.cameraX, world.mission);
  drawPropLayer(world, "mid");
  drawExtraction(world, state.cameraX);
  drawBullets(world.playerBullets, state.cameraX, world.mission.palette.signal);
  drawBullets(world.enemyBullets, state.cameraX, "#e77d59");
  drawPickups(world, state.cameraX);
  drawEntitySprite(SHEETS.source, world.source, state.cameraX);
  world.enemies.forEach((enemy) => {
    const sheet = SHEETS[enemy.type];
    if (enemy.hitFlash > 0 && Math.floor(enemy.hitFlash * 24) % 2 === 0) {
      ctx.globalAlpha = 0.7;
      drawEntitySprite(sheet, enemy, state.cameraX);
      ctx.globalAlpha = 1;
    } else {
      drawEntitySprite(sheet, enemy, state.cameraX);
    }
  });
  if (!(world.player.invuln > 0 && Math.floor(world.player.invuln * 18) % 2 === 0)) {
    drawEntitySprite(SHEETS.nelson, world.player, state.cameraX);
  }
  drawEffectLayer(world.effects, state.cameraX);
  drawParticleLayer(world.particles, state.cameraX);
  drawPropLayer(world, "front");
  ctx.restore();
  drawHud(world);
  drawScreenFlash();
}

function drawBackground(world, cameraX) {
  const mission = world.mission;
  const image = world.backgroundImage;
  ctx.fillStyle = mission.palette.sky;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  if (image.complete && image.naturalWidth) {
    const scale = Math.max(VIEW.width / image.naturalWidth, VIEW.height / image.naturalHeight);
    const drawWidth = Math.round(image.naturalWidth * scale);
    const drawHeight = Math.round(image.naturalHeight * scale);
    const maxOffset = Math.max(0, drawWidth - VIEW.width);
    const travel = Math.max(1, mission.levelWidth - VIEW.width);
    const offsetX = Math.round((cameraX / travel) * maxOffset);
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.drawImage(image, -offsetX, Math.round((VIEW.height - drawHeight) / 2), drawWidth, drawHeight);
    ctx.restore();
  }

  mission.parallaxLayers.forEach((layer, layerIndex) => {
    const offset = -(cameraX * layer.speed) % 220;
    ctx.fillStyle = layer.color;
    layer.blocks.forEach((height, index) => {
      const x = Math.floor(offset + index * 84);
      ctx.fillRect(x, VIEW.height - 124 - height + layerIndex * 6, 58 + (index % 3) * 10, height + 100);
    });
  });

  ctx.fillStyle = `${mission.palette.haze}55`;
  ctx.fillRect(0, 118, VIEW.width, 66);
  ctx.fillStyle = `${mission.palette.front}40`;
  ctx.fillRect(0, 86, VIEW.width, 34);
  ctx.fillStyle = "rgba(13, 10, 8, 0.16)";
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = "rgba(255, 222, 167, 0.12)";
  ctx.fillRect(32, 28, 152, 16);
  ctx.fillStyle = "rgba(19, 14, 10, 0.46)";
  ctx.fillRect(0, VIEW.height - 94, VIEW.width, 94);
}

function drawPlatforms(platforms, cameraX, mission) {
  platforms.forEach((platform, index) => {
    const visibleLeft = Math.max(platform.x, cameraX - TILE_SIZE);
    const visibleRight = Math.min(platform.x + platform.w, cameraX + VIEW.width + TILE_SIZE);
    const tile = platform.tile ?? mission.tileSet.platform;
    const edgeTile = index === 0 ? mission.tileSet.edge : tile;

    for (let x = Math.floor(visibleLeft / TILE_SIZE) * TILE_SIZE; x < visibleRight; x += TILE_SIZE) {
      const drawX = Math.round(x - cameraX);
      drawTile(tile, drawX, platform.y, TILE_SIZE, Math.min(TILE_SIZE, platform.h));
      if (platform.h > TILE_SIZE) {
        for (let y = platform.y + TILE_SIZE; y < platform.y + platform.h; y += TILE_SIZE) {
          drawTile(edgeTile, drawX, y, TILE_SIZE, Math.min(TILE_SIZE, platform.y + platform.h - y));
        }
      }
    }

    ctx.fillStyle = "rgba(255, 244, 225, 0.08)";
    ctx.fillRect(Math.round(platform.x - cameraX), platform.y, platform.w, 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.fillRect(Math.round(platform.x - cameraX), platform.y + 6, platform.w, Math.max(0, platform.h - 6));
  });
}

function drawTile(index, dx, dy, dw, dh) {
  const sx = (index % 8) * TILE_SIZE;
  const sy = Math.floor(index / 8) * TILE_SIZE;
  ctx.drawImage(tileSheet, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy, dw, dh);
}

function drawPropLayer(world, layer) {
  world.props.forEach((prop) => {
    if ((prop.layer ?? "mid") !== layer) {
      return;
    }
    const def = PROP_DEFS[prop.kind];
    if (!def) {
      return;
    }

    const scale = prop.scale ?? def.scale ?? 1;
    const drawWidth = Math.round(def.w * scale);
    const drawHeight = Math.round(def.h * scale);
    const drawX = Math.round(prop.x - state.cameraX);
    const drawY = Math.round(prop.y - def.anchor * scale);
    if (drawX + drawWidth < -40 || drawX > VIEW.width + 40) {
      return;
    }

    ctx.save();
    if (layer === "back") {
      ctx.globalAlpha = 0.82;
    } else if (layer === "front") {
      ctx.globalAlpha = 0.94;
    }
    if (prop.flip) {
      ctx.translate(drawX + drawWidth, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(propsSheet, def.sx, def.sy, def.w, def.h, 0, 0, drawWidth, drawHeight);
    } else {
      ctx.drawImage(propsSheet, def.sx, def.sy, def.w, def.h, drawX, drawY, drawWidth, drawHeight);
    }
    ctx.restore();
  });
}

function drawBullets(bullets, cameraX, color) {
  bullets.forEach((bullet) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(bullet.x - cameraX), Math.round(bullet.y), bullet.w, bullet.h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(Math.round(bullet.x - cameraX), Math.round(bullet.y), bullet.w, 1);
  });
}

function drawPickups(world, cameraX) {
  world.pickups.forEach((pickup) => {
    const x = Math.round(pickup.x - cameraX);
    const y = Math.round(pickup.y + Math.sin(pickup.bob) * 2);
    ctx.fillStyle = pickup.type === "health" ? "#92b99a" : "#e2c86e";
    ctx.fillRect(x, y, pickup.w, pickup.h);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(x + 2, y + 2, pickup.w - 4, 2);
    ctx.fillStyle = "#120d0a";
    ctx.fillRect(x + 5, y + 4, 2, 4);
    ctx.fillRect(x + 3, y + 6, 6, 2);
  });
}

function drawExtraction(world, cameraX) {
  if (!world.extractionUnlocked) {
    return;
  }
  const pulse = Math.sin(world.missionTime * 7) * 0.5 + 0.5;
  const baseX = Math.round(world.mission.exitX - cameraX);
  const baseY = world.mission.groundY - 34;
  ctx.drawImage(propsSheet, 160, 32, 32, 32, baseX - 8, baseY - 18, 40, 40);
  ctx.drawImage(propsSheet, 224, 32, 32, 32, baseX + 16, baseY - 4, 40, 40);
  ctx.fillStyle = `rgba(240, 202, 104, ${0.25 + pulse * 0.25})`;
  ctx.fillRect(baseX - 6, baseY - 24, 22, 5);
}

function drawEffectLayer(effects, cameraX) {
  effects.forEach((effect) => {
    const animation = SHEETS.effects.animations[effect.type];
    const frame = animation.frames[Math.min(animation.frames.length - 1, Math.floor(effect.age * animation.fps))];
    drawImageFrame(SHEETS.effects, frame, effect.x - cameraX - 20 * effect.scale, effect.y - 20 * effect.scale, 1, effect.scale);
  });
}

function drawParticleLayer(particles, cameraX) {
  particles.forEach((particle) => {
    ctx.globalAlpha = clamp(particle.life * 1.8, 0, 1);
    ctx.fillStyle = particle.tint;
    ctx.fillRect(Math.round(particle.x - cameraX), Math.round(particle.y), particle.size, particle.size);
    ctx.globalAlpha = 1;
  });
}

function drawHud(world) {
  ctx.fillStyle = "rgba(15, 11, 8, 0.84)";
  ctx.fillRect(12, 12, 246, 58);
  ctx.fillRect(VIEW.width - 182, 12, 170, 42);
  if (hudPortrait.complete && hudPortrait.naturalWidth) {
    ctx.drawImage(hudPortrait, 18, 18, 34, 34);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(58, 18, 1, 44);
  }

  ctx.fillStyle = "#f2eadf";
  ctx.font = "12px monospace";
  ctx.fillText("VIDA", 66, 28);
  ctx.fillText("SENAL", 66, 44);
  ctx.fillText(`${state.missionIndex + 1}/${missions.length}`, VIEW.width - 46, 28);
  ctx.fillText(world.mission.act, VIEW.width - 162, 44);
  ctx.fillStyle = "#3e3228";
  ctx.fillRect(116, 20, 126, 7);
  ctx.fillRect(116, 36, 126, 7);
  ctx.fillStyle = "#cf7352";
  ctx.fillRect(116, 20, Math.round((world.player.health / world.player.maxHealth) * 126), 7);
  const signalValue = world.source.completed
    ? 1
    : world.source.active
      ? 1 - world.source.timer / world.source.maxTimer
      : 0;
  ctx.fillStyle = world.mission.palette.signal;
  ctx.fillRect(116, 36, Math.round(signalValue * 126), 7);
  if (world.source.active && !world.source.completed) {
    ctx.fillStyle = "rgba(15, 11, 8, 0.84)";
    ctx.fillRect(170, 60, 140, 20);
    ctx.fillStyle = "#f2eadf";
    ctx.fillText(`${Math.ceil(world.source.timer * 10) / 10}s`, 178, 74);
  }
}

function drawScreenFlash() {
  if (state.flash <= 0) {
    return;
  }
  ctx.fillStyle = `rgba(245, 202, 132, ${state.flash * 0.4})`;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function frame(now) {
  const dt = Math.min(0.033, (now - state.lastTime) / 1000);
  state.lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

function handlePrimaryAction() {
  if (state.screen === "title") {
    startCampaign();
  } else if (state.screen === "briefing") {
    startMission();
  } else if (state.screen === "mission-complete") {
    nextMission();
  } else if (state.screen === "gameover") {
    restartMission();
  } else if (state.screen === "paused") {
    resumeGame();
  }
}

function handleSecondaryAction() {
  restartCampaign();
}

function setKeyState(code, active) {
  if (active && !keys[code]) {
    pressed.add(code);
  }
  keys[code] = active;
}

function bindTouchButton(button) {
  if (!button) {
    return;
  }
  const code = button.dataset.key;
  const release = (event) => {
    event.preventDefault();
    setKeyState(code, false);
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    setKeyState(code, true);
    ensureAudio();
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("lostpointercapture", () => {
    setKeyState(code, false);
  });
}

window.addEventListener("keydown", (event) => {
  const tracked = ["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyA", "KeyD", "KeyW", "KeyF", "KeyJ", "KeyE", "KeyP", "Enter"];
  if (tracked.includes(event.code)) {
    event.preventDefault();
  }
  if (!keys[event.code]) {
    pressed.add(event.code);
  }
  keys[event.code] = true;

  if (event.code === "Enter") {
    handlePrimaryAction();
  } else if (event.code === "KeyP") {
    if (state.screen === "playing") {
      pauseGame();
    } else if (state.screen === "paused") {
      resumeGame();
    }
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

window.addEventListener("blur", () => {
  Object.keys(keys).forEach((code) => {
    keys[code] = false;
  });
  if (state.screen === "playing") {
    pauseGame();
  }
});

DOM.startButton.addEventListener("click", () => {
  ensureAudio();
  handlePrimaryAction();
});
DOM.mobileStartButton?.addEventListener("click", () => {
  ensureAudio();
  if (state.screen === "playing") {
    pauseGame();
  } else {
    handlePrimaryAction();
  }
});
DOM.restartButton.addEventListener("click", handleSecondaryAction);
DOM.overlayPrimary.addEventListener("click", () => {
  ensureAudio();
  handlePrimaryAction();
});
DOM.overlaySecondary.addEventListener("click", handleSecondaryAction);
DOM.fullscreenButton.addEventListener("click", toggleFullscreen);
DOM.mobileFullscreenButton?.addEventListener("click", toggleFullscreen);
DOM.soundButton.addEventListener("click", toggleAudio);
document.querySelectorAll("[data-key]").forEach(bindTouchButton);
window.addEventListener("resize", resizeCanvasDisplay);
window.addEventListener("fullscreenchange", () => {
  updateFullscreenButtons();
  resizeCanvasDisplay();
});

if (typeof ResizeObserver !== "undefined") {
  const observer = new ResizeObserver(resizeCanvasDisplay);
  observer.observe(DOM.stageFrame);
}

state.audio.enabled = state.settings.audioEnabled;
updateSoundButtons();
updateFullscreenButtons();
initMission(0, { keepEvidence: false, toScreen: "title", addLog: false });
resizeCanvasDisplay();
requestAnimationFrame(frame);
