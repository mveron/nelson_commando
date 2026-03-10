const defaultPlayerTuning = {
  maxHealth: 110,
  accel: 0.58,
  maxSpeed: 3.25,
  airControl: 0.5,
  friction: 0.76,
  jumpVelocity: 11.6,
  coyoteTime: 0.11,
  jumpBuffer: 0.14,
  shotCooldown: 0.17,
  bulletDamage: 16,
  invuln: 0.56,
  recoil: 0.18,
};

const defaultSourceTuning = {
  maxHealth: 92,
  interviewDuration: 9.4,
  contactDamageScale: 0.4,
};

const defaultEnemyTuning = {
  rifle: {
    health: 24,
    speed: 1.45,
    range: 164,
    shotCooldown: 1.2,
    bulletSpeed: 4.8,
    shotDamage: 10,
    touchDamage: 9,
  },
  heavy: {
    health: 44,
    speed: 1.12,
    range: 198,
    shotCooldown: 1.6,
    bulletSpeed: 4.1,
    shotDamage: 14,
    touchDamage: 14,
  },
  drone: {
    health: 22,
    speed: 1.34,
    range: 218,
    shotCooldown: 1.45,
    bulletSpeed: 4.9,
    shotDamage: 9,
    touchDamage: 6,
  },
};

const defaultEncounterPacing = {
  ambientShots: 0.12,
  shellingInterval: [7.5, 12.5],
  pickupChance: 0.14,
  extractionPressure: 1,
};

function mergeDeep(base, extra) {
  const output = { ...base };
  Object.keys(extra ?? {}).forEach((key) => {
    const baseValue = output[key];
    const extraValue = extra[key];
    if (
      baseValue &&
      extraValue &&
      typeof baseValue === "object" &&
      typeof extraValue === "object" &&
      !Array.isArray(baseValue) &&
      !Array.isArray(extraValue)
    ) {
      output[key] = mergeDeep(baseValue, extraValue);
    } else {
      output[key] = extraValue;
    }
  });
  return output;
}

function buildMission(definition) {
  return {
    ...definition,
    mobileTitle: definition.mobileTitle ?? definition.title,
    playerTuning: mergeDeep(defaultPlayerTuning, definition.playerTuning ?? {}),
    sourceTuning: mergeDeep(defaultSourceTuning, definition.sourceTuning ?? {}),
    enemyTuning: mergeDeep(defaultEnemyTuning, definition.enemyTuning ?? {}),
    encounterPacing: mergeDeep(defaultEncounterPacing, definition.encounterPacing ?? {}),
  };
}

const missions = [
  buildMission({
    act: "Acto I",
    difficulty: "Contacto inicial",
    title: "Pista en ruinas",
    mobileTitle: "Pista",
    location: "Aeropuerto de Teheran, borde occidental",
    goal: "Cruzar la pista, llegar a un bombero y sostener la primera entrevista.",
    brief:
      "Una pista civil convertida en corredor militar. La primera version oficial se cae con un solo testigo vivo.",
    portrait: "assets/personaje/castro_1.jpg",
    portraitTitle: "Nelson entra con camara y casco",
    portraitBody: "La referencia visual define la silueta: casco azul, microfono y chaleco PRESS.",
    background: {
      image: "assets/backgrounds/mission_01.png",
      credit: "Base fotografica de Nihar Reddy Jangam, convertida a pixel-art local.",
      link: "https://unsplash.com/photos/airplanes-parked-on-a-wet-tarmac-at-night-soEvHwmj5zQ",
    },
    source: {
      name: "Farhad Nouri",
      role: "Bombero aeroportuario",
      quote: "Primero evacuaron a la prensa. Despues trajeron cajas sin sellos.",
      paletteKey: "medic",
    },
    evidence:
      "Farhad confirma que los hangares civiles fueron usados para mover cargamentos militares antes del ataque.",
    extractLabel: "Van satelital",
    startLog: [
      "Productora: Nelson, aire hostil. Queremos voces, no solo humo.",
      "Nelson: Dame treinta segundos de silencio y te consigo portada.",
    ],
    winLog: [
      "Farhad: Si esto sale al aire, ya no podran fingir sorpresa.",
      "Nelson: Guardalo. La cinta ahora vale mas que el combustible.",
    ],
    palette: {
      sky: "#75604f",
      haze: "#b49577",
      far: "#4d3e34",
      mid: "#625044",
      front: "#8f725b",
      ground: "#241b16",
      surface: "#7b5f49",
      signal: "#e9c66b",
      shadow: "#120d0b",
      dust: "#dfba8d",
    },
    tileSet: {
      ground: 4,
      platform: 0,
      edge: 6,
    },
    parallaxLayers: [
      { speed: 0.14, color: "#5d4b3f", blocks: [44, 68, 52, 72, 46, 58] },
      { speed: 0.28, color: "#7a6152", blocks: [64, 90, 72, 76, 58, 88] },
    ],
    props: [
      { kind: "sign", x: 132, y: 166, layer: "back" },
      { kind: "crate", x: 276, y: 160, layer: "mid" },
      { kind: "sandbag", x: 332, y: 163, layer: "mid" },
      { kind: "wreck", x: 582, y: 156, layer: "back" },
      { kind: "barrel", x: 716, y: 162, layer: "mid" },
      { kind: "antenna", x: 902, y: 136, layer: "back" },
      { kind: "van", x: 1088, y: 156, layer: "front" },
      { kind: "crate", x: 1284, y: 160, layer: "mid" },
      { kind: "rubble", x: 1492, y: 166, layer: "front" },
      { kind: "truck", x: 1812, y: 154, layer: "back" },
      { kind: "satruck", x: 2160, y: 154, layer: "front" },
    ],
    levelWidth: 2540,
    groundY: 204,
    sourceX: 1050,
    exitX: 2350,
    platforms: [
      { x: 236, y: 168, w: 72, h: 16, style: "metal" },
      { x: 488, y: 156, w: 96, h: 16, style: "metal" },
      { x: 744, y: 172, w: 84, h: 16, style: "concrete" },
      { x: 1178, y: 150, w: 88, h: 16, style: "metal" },
      { x: 1516, y: 144, w: 112, h: 16, style: "metal" },
      { x: 1888, y: 170, w: 84, h: 16, style: "concrete" },
    ],
    initialEnemies: [
      { type: "rifle", x: 368 },
      { type: "rifle", x: 544 },
      { type: "drone", x: 830, y: 108 },
      { type: "rifle", x: 1284 },
      { type: "heavy", x: 1620 },
      { type: "rifle", x: 1940 },
    ],
    interviewWaves: [
      { delay: 0.8, spawns: [{ type: "rifle", edge: "right" }, { type: "rifle", edge: "right" }] },
      { delay: 2.9, spawns: [{ type: "drone", edge: "left" }, { type: "rifle", edge: "right" }] },
      { delay: 5.6, spawns: [{ type: "heavy", edge: "right" }] },
    ],
    extractionWave: [{ type: "rifle", edge: "right" }, { type: "drone", edge: "left" }],
    playerTuning: {
      maxHealth: 118,
      maxSpeed: 3.4,
      shotCooldown: 0.16,
    },
    sourceTuning: {
      maxHealth: 96,
      interviewDuration: 9.8,
    },
    encounterPacing: {
      shellingInterval: [9, 14],
      pickupChance: 0.18,
    },
  }),
  buildMission({
    act: "Acto I",
    difficulty: "Zona medica",
    title: "Hospital de campana",
    mobileTitle: "Hospital",
    location: "Barrio sur, hospital improvisado",
    goal: "Proteger a una medica que trabaja entre cortes de energia y morteros.",
    brief:
      "El hospital funciona con generadores viejos y camillas prestadas. Cada explosivo tapa una historia distinta.",
    portrait: "assets/personaje/castro_2.jpg",
    portraitTitle: "Casco TN en la cabina",
    portraitBody: "La segunda referencia aporta expresion contenida y perfil frontal para el retrato operativo.",
    background: {
      image: "assets/backgrounds/mission_02.png",
      credit: "Base fotografica de Adhitya Sibikumar, convertida a pixel-art local.",
      link: "https://unsplash.com/photos/dark-hospital-hallway-with-warm-light-xTi__UtunmA",
    },
    source: {
      name: "Dra. Darya Farhadi",
      role: "Medica de guardia",
      quote: "No nos faltan camas. Nos faltan minutos antes del proximo impacto.",
      paletteKey: "doctor",
    },
    evidence:
      "Darya documenta que los civiles fueron desviados de corredores seguros minutos antes del bombardeo.",
    extractLabel: "Ambulancia blindada",
    startLog: [
      "Productora: Necesito pruebas de que el hospital seguia abierto.",
      "Nelson: Si sigue en pie, sale al aire. Si no, sale igual.",
    ],
    winLog: [
      "Darya: Mostra esto completo. Ningun recorte lo vuelve menos cierto.",
      "Nelson: El problema no es filmar. El problema es que no lo tapen.",
    ],
    palette: {
      sky: "#595147",
      haze: "#8b7a62",
      far: "#40372f",
      mid: "#5b4a3d",
      front: "#876d58",
      ground: "#1d1713",
      surface: "#746150",
      signal: "#dcc167",
      shadow: "#120d0a",
      dust: "#cdb195",
    },
    tileSet: {
      ground: 5,
      platform: 2,
      edge: 0,
    },
    parallaxLayers: [
      { speed: 0.13, color: "#50433a", blocks: [38, 50, 68, 72, 48, 66, 44] },
      { speed: 0.25, color: "#6a594b", blocks: [58, 70, 92, 64, 74, 56] },
    ],
    props: [
      { kind: "lamp", x: 198, y: 146, layer: "back" },
      { kind: "case", x: 356, y: 164, layer: "mid" },
      { kind: "sandbag", x: 472, y: 166, layer: "mid" },
      { kind: "generator", x: 728, y: 160, layer: "back" },
      { kind: "crate", x: 962, y: 160, layer: "mid" },
      { kind: "lamp", x: 1140, y: 146, layer: "back" },
      { kind: "monitor", x: 1326, y: 158, layer: "back" },
      { kind: "van", x: 1598, y: 156, layer: "front" },
      { kind: "rubble", x: 1876, y: 168, layer: "front" },
      { kind: "spotlight", x: 2150, y: 142, layer: "back" },
    ],
    levelWidth: 2660,
    groundY: 202,
    sourceX: 1178,
    exitX: 2458,
    platforms: [
      { x: 248, y: 168, w: 88, h: 16, style: "ward" },
      { x: 592, y: 150, w: 108, h: 16, style: "ward" },
      { x: 944, y: 166, w: 84, h: 14, style: "metal" },
      { x: 1324, y: 152, w: 98, h: 16, style: "ward" },
      { x: 1708, y: 156, w: 94, h: 16, style: "metal" },
      { x: 2056, y: 172, w: 76, h: 12, style: "metal" },
    ],
    initialEnemies: [
      { type: "rifle", x: 330 },
      { type: "drone", x: 670, y: 108 },
      { type: "rifle", x: 916 },
      { type: "heavy", x: 1454 },
      { type: "rifle", x: 1780 },
      { type: "drone", x: 2148, y: 102 },
    ],
    interviewWaves: [
      { delay: 1.0, spawns: [{ type: "rifle", edge: "left" }, { type: "rifle", edge: "right" }] },
      { delay: 3.1, spawns: [{ type: "drone", edge: "right" }] },
      { delay: 5.4, spawns: [{ type: "heavy", edge: "left" }, { type: "rifle", edge: "right" }] },
      { delay: 7.2, spawns: [{ type: "drone", edge: "left" }] },
    ],
    extractionWave: [{ type: "heavy", edge: "right" }, { type: "rifle", edge: "left" }],
    sourceTuning: {
      maxHealth: 104,
      interviewDuration: 10.3,
    },
    enemyTuning: {
      rifle: { shotCooldown: 1.12 },
      drone: { health: 24, shotCooldown: 1.32 },
    },
    encounterPacing: {
      shellingInterval: [7, 11],
      pickupChance: 0.17,
    },
  }),
  buildMission({
    act: "Acto II",
    difficulty: "Ruta caliente",
    title: "Caravana nocturna",
    mobileTitle: "Caravana",
    location: "Ruta de evacuacion al norte",
    goal: "Entrevistar a un chofer de desplazados y salir con la grabacion antes del amanecer.",
    brief:
      "Los civiles se mueven sin luces y con los vidrios cubiertos. El chofer sabe quien desvio a la caravana.",
    portrait: "assets/personaje/castro_3.jpg",
    portraitTitle: "Transmision en campo abierto",
    portraitBody: "La tercera imagen fija el gesto del corresponsal en exterior: mano alta, microfono y terreno expuesto.",
    background: {
      image: "assets/backgrounds/mission_03.png",
      credit: "Base fotografica de Ed Wingate, convertida a pixel-art local.",
      link: "https://unsplash.com/photos/a-car-is-driving-down-a-mountain-road-fNJ4F9d4KF4",
    },
    source: {
      name: "Reza Moin",
      role: "Chofer de evacuacion",
      quote: "Nos mandaron por la ruta vieja. Ahi ya sabian que iba a caer fuego.",
      paletteKey: "driver",
    },
    evidence:
      "Reza identifica un desvio deliberado de convoyes civiles hacia una carretera marcada como segura.",
    extractLabel: "Pickup de enlace",
    startLog: [
      "Productora: La senal viene y va. No pierdas al chofer.",
      "Nelson: Si se mueve la verdad, yo corro atras.",
    ],
    winLog: [
      "Reza: Anota las patentes. Siempre vuelven los mismos camiones.",
      "Nelson: Si vuelven, los vamos a esperar con la camara prendida.",
    ],
    palette: {
      sky: "#313332",
      haze: "#686250",
      far: "#242321",
      mid: "#403932",
      front: "#5f5447",
      ground: "#161311",
      surface: "#655548",
      signal: "#d9bd67",
      shadow: "#0e0c0b",
      dust: "#baa07a",
    },
    tileSet: {
      ground: 6,
      platform: 4,
      edge: 1,
    },
    parallaxLayers: [
      { speed: 0.1, color: "#2d2b28", blocks: [22, 30, 26, 36, 28, 34] },
      { speed: 0.24, color: "#4f473d", blocks: [54, 68, 78, 66, 58, 70] },
    ],
    props: [
      { kind: "sign", x: 164, y: 166, layer: "back" },
      { kind: "truck", x: 420, y: 156, layer: "back" },
      { kind: "barrel", x: 688, y: 164, layer: "mid" },
      { kind: "sandbag", x: 888, y: 166, layer: "mid" },
      { kind: "van", x: 1136, y: 156, layer: "front" },
      { kind: "spotlight", x: 1402, y: 144, layer: "back" },
      { kind: "crate", x: 1618, y: 160, layer: "mid" },
      { kind: "truck", x: 1838, y: 154, layer: "back" },
      { kind: "antenna", x: 2064, y: 140, layer: "back" },
      { kind: "rubble", x: 2300, y: 168, layer: "front" },
    ],
    levelWidth: 2780,
    groundY: 206,
    sourceX: 1298,
    exitX: 2570,
    platforms: [
      { x: 252, y: 172, w: 86, h: 12, style: "road" },
      { x: 588, y: 160, w: 104, h: 12, style: "road" },
      { x: 958, y: 150, w: 96, h: 14, style: "road" },
      { x: 1392, y: 166, w: 106, h: 12, style: "road" },
      { x: 1770, y: 154, w: 90, h: 14, style: "road" },
      { x: 2190, y: 170, w: 84, h: 12, style: "road" },
    ],
    initialEnemies: [
      { type: "rifle", x: 338 },
      { type: "heavy", x: 760 },
      { type: "drone", x: 1018, y: 112 },
      { type: "rifle", x: 1496 },
      { type: "rifle", x: 1816 },
      { type: "drone", x: 2148, y: 96 },
      { type: "heavy", x: 2390 },
    ],
    interviewWaves: [
      { delay: 1.0, spawns: [{ type: "rifle", edge: "right" }, { type: "drone", edge: "left" }] },
      { delay: 2.7, spawns: [{ type: "heavy", edge: "right" }] },
      { delay: 4.9, spawns: [{ type: "rifle", edge: "left" }, { type: "rifle", edge: "right" }] },
      { delay: 6.8, spawns: [{ type: "drone", edge: "right" }] },
    ],
    extractionWave: [{ type: "drone", edge: "right" }, { type: "heavy", edge: "left" }],
    playerTuning: {
      maxHealth: 112,
      maxSpeed: 3.32,
    },
    sourceTuning: {
      maxHealth: 88,
      interviewDuration: 8.9,
    },
    enemyTuning: {
      rifle: { speed: 1.58, shotCooldown: 1.05 },
      heavy: { health: 48, shotCooldown: 1.45 },
      drone: { bulletSpeed: 5.2 },
    },
    encounterPacing: {
      shellingInterval: [6.4, 9.4],
      pickupChance: 0.13,
      extractionPressure: 1.2,
    },
  }),
  buildMission({
    act: "Acto III",
    difficulty: "Borrado estatal",
    title: "Archivo estatal",
    mobileTitle: "Archivo",
    location: "Edificio de television publica",
    goal: "Asegurar una entrevista con una archivista y salir con los brutos sin editar.",
    brief:
      "Las cintas buenas estan en un sotano sellado. Una editora conoce la secuencia exacta de recortes y censura.",
    portrait: "assets/personaje/castro_1.jpg",
    portraitTitle: "Retrato de terreno bajo humo",
    portraitBody: "La referencia vuelve como ficha de prensa: Nelson cubre una operacion de borrado.",
    background: {
      image: "assets/backgrounds/mission_04.png",
      credit: "Base fotografica de Gabriel Weyand, convertida a pixel-art local.",
      link: "https://unsplash.com/photos/a-video-production-studio-with-a-monitor-displaying-multiple-screens-X8uonmU2Ssw",
    },
    source: {
      name: "Leila Nasseri",
      role: "Archivista de television",
      quote: "No mintieron con una frase. Mintieron con cada segundo que sacaron.",
      paletteKey: "archivist",
    },
    evidence:
      "Leila entrega el orden real de edicion y prueba que la cadena estatal borro impactos y convoyes.",
    extractLabel: "Ascensor de servicio",
    startLog: [
      "Productora: Si salis con esas cintas, cambia toda la pieza.",
      "Nelson: Entonces no salgo sin ellas.",
    ],
    winLog: [
      "Leila: Si cortan la antena, subilo igual. Que alguien vea la secuencia completa.",
      "Nelson: Esta vez no van a editar el final.",
    ],
    palette: {
      sky: "#4f4843",
      haze: "#786d61",
      far: "#322d29",
      mid: "#564c43",
      front: "#80705f",
      ground: "#191513",
      surface: "#68584a",
      signal: "#ddc76e",
      shadow: "#110d0c",
      dust: "#cab49c",
    },
    tileSet: {
      ground: 7,
      platform: 3,
      edge: 2,
    },
    parallaxLayers: [
      { speed: 0.14, color: "#3a342f", blocks: [58, 84, 104, 80, 94, 70] },
      { speed: 0.28, color: "#5e554c", blocks: [84, 110, 94, 118, 88, 100] },
    ],
    props: [
      { kind: "monitor", x: 178, y: 152, layer: "back" },
      { kind: "generator", x: 420, y: 160, layer: "mid" },
      { kind: "case", x: 658, y: 164, layer: "mid" },
      { kind: "lamp", x: 894, y: 144, layer: "back" },
      { kind: "monitor", x: 1160, y: 152, layer: "back" },
      { kind: "wreck", x: 1422, y: 158, layer: "front" },
      { kind: "dish", x: 1674, y: 138, layer: "back" },
      { kind: "crate", x: 1918, y: 160, layer: "mid" },
      { kind: "monitor", x: 2198, y: 152, layer: "back" },
      { kind: "generator", x: 2430, y: 160, layer: "front" },
    ],
    levelWidth: 2740,
    groundY: 198,
    sourceX: 1244,
    exitX: 2504,
    platforms: [
      { x: 258, y: 158, w: 98, h: 16, style: "studio" },
      { x: 674, y: 142, w: 78, h: 16, style: "studio" },
      { x: 984, y: 150, w: 108, h: 16, style: "studio" },
      { x: 1384, y: 136, w: 96, h: 16, style: "studio" },
      { x: 1778, y: 148, w: 110, h: 16, style: "studio" },
      { x: 2188, y: 164, w: 86, h: 14, style: "studio" },
    ],
    initialEnemies: [
      { type: "rifle", x: 344 },
      { type: "drone", x: 624, y: 92 },
      { type: "heavy", x: 934 },
      { type: "rifle", x: 1522 },
      { type: "drone", x: 1886, y: 98 },
      { type: "heavy", x: 2204 },
      { type: "rifle", x: 2390 },
    ],
    interviewWaves: [
      { delay: 0.9, spawns: [{ type: "rifle", edge: "left" }, { type: "rifle", edge: "right" }] },
      { delay: 2.8, spawns: [{ type: "heavy", edge: "right" }, { type: "drone", edge: "right" }] },
      { delay: 4.7, spawns: [{ type: "rifle", edge: "left" }, { type: "drone", edge: "left" }] },
      { delay: 6.5, spawns: [{ type: "heavy", edge: "right" }] },
    ],
    extractionWave: [{ type: "heavy", edge: "right" }, { type: "drone", edge: "left" }],
    playerTuning: {
      maxHealth: 106,
      shotCooldown: 0.15,
      bulletDamage: 17,
    },
    sourceTuning: {
      maxHealth: 84,
      interviewDuration: 8.6,
    },
    enemyTuning: {
      rifle: { health: 28, shotDamage: 11, speed: 1.62 },
      heavy: { health: 54, shotDamage: 16, touchDamage: 16 },
      drone: { health: 24, shotCooldown: 1.16, bulletSpeed: 5.4 },
    },
    encounterPacing: {
      shellingInterval: [5.8, 8.4],
      pickupChance: 0.12,
      extractionPressure: 1.25,
    },
  }),
  buildMission({
    act: "Acto IV",
    difficulty: "Salida al aire",
    title: "Azotea de transmision",
    mobileTitle: "Azotea",
    location: "Distrito central, torre de enlace",
    goal: "Entrevistar al exasesor, sostener la senal y emitir la pieza final bajo asedio.",
    brief:
      "Todos los testimonios apuntan a la misma operacion. El ultimo hombre conoce la orden que conecto propaganda y fuego real.",
    portrait: "assets/personaje/castro_2.jpg",
    portraitTitle: "Mirada fija antes del vivo",
    portraitBody: "La referencia frontal funciona como retrato de cierre: senal al limite, presion total, voz firme.",
    background: {
      image: "assets/backgrounds/mission_05.png",
      credit: "Base fotografica de Nourieh Ferdosian, convertida a pixel-art local.",
      link: "https://unsplash.com/photos/hazy-cityscape-with-tall-buildings-and-a-distant-tower-vN2TM-qNOo0",
    },
    source: {
      name: "Behrouz Qasemi",
      role: "Exasesor de comunicacion militar",
      quote: "La consigna era simple: si no podian ocultar el ataque, habia que editar a los testigos.",
      paletteKey: "advisor",
    },
    evidence:
      "Behrouz vincula ordenes de propaganda, bloqueo de corredores y destruccion de imagenes en una misma cadena de mando.",
    extractLabel: "Uplink en vivo",
    startLog: [
      "Productora: Ultima ventana de satelite. Despues de esto, quedas solo.",
      "Nelson: Con una antena, una fuente y medio minuto me alcanza.",
    ],
    winLog: [
      "Behrouz: Ahora ya no depende de ellos. Depende de quien quiera mirar.",
      "Nelson: Perfecto. Que miren.",
    ],
    palette: {
      sky: "#463f3b",
      haze: "#72665d",
      far: "#2d2825",
      mid: "#4f4740",
      front: "#73675d",
      ground: "#171310",
      surface: "#62574d",
      signal: "#f0ca68",
      shadow: "#100d0b",
      dust: "#d3bb9c",
    },
    tileSet: {
      ground: 1,
      platform: 7,
      edge: 3,
    },
    parallaxLayers: [
      { speed: 0.16, color: "#37322e", blocks: [96, 118, 126, 102, 120, 136] },
      { speed: 0.32, color: "#595148", blocks: [120, 148, 136, 162, 128, 154] },
    ],
    props: [
      { kind: "dish", x: 196, y: 136, layer: "back" },
      { kind: "mast", x: 412, y: 128, layer: "back" },
      { kind: "generator", x: 678, y: 160, layer: "mid" },
      { kind: "monitor", x: 960, y: 152, layer: "back" },
      { kind: "spotlight", x: 1218, y: 142, layer: "back" },
      { kind: "rubble", x: 1468, y: 168, layer: "front" },
      { kind: "dish", x: 1728, y: 134, layer: "back" },
      { kind: "generator", x: 1960, y: 160, layer: "mid" },
      { kind: "mast", x: 2206, y: 126, layer: "back" },
      { kind: "satruck", x: 2440, y: 154, layer: "front" },
    ],
    levelWidth: 2860,
    groundY: 196,
    sourceX: 1456,
    exitX: 2650,
    platforms: [
      { x: 314, y: 154, w: 84, h: 16, style: "roof" },
      { x: 752, y: 136, w: 110, h: 16, style: "roof" },
      { x: 1138, y: 146, w: 94, h: 16, style: "roof" },
      { x: 1532, y: 126, w: 124, h: 16, style: "roof" },
      { x: 1910, y: 142, w: 100, h: 16, style: "roof" },
      { x: 2286, y: 156, w: 82, h: 14, style: "roof" },
    ],
    initialEnemies: [
      { type: "heavy", x: 396 },
      { type: "rifle", x: 792 },
      { type: "drone", x: 1058, y: 92 },
      { type: "heavy", x: 1672 },
      { type: "drone", x: 2014, y: 86 },
      { type: "rifle", x: 2264 },
      { type: "heavy", x: 2476 },
    ],
    interviewWaves: [
      { delay: 1.0, spawns: [{ type: "heavy", edge: "left" }, { type: "rifle", edge: "right" }] },
      { delay: 2.5, spawns: [{ type: "drone", edge: "left" }, { type: "drone", edge: "right" }] },
      { delay: 4.3, spawns: [{ type: "heavy", edge: "right" }, { type: "rifle", edge: "left" }] },
      { delay: 6.1, spawns: [{ type: "heavy", edge: "right" }] },
      { delay: 7.6, spawns: [{ type: "drone", edge: "right" }] },
    ],
    extractionWave: [
      { type: "drone", edge: "right" },
      { type: "heavy", edge: "left" },
      { type: "rifle", edge: "right" },
    ],
    playerTuning: {
      maxHealth: 104,
      maxSpeed: 3.38,
      shotCooldown: 0.145,
      bulletDamage: 18,
    },
    sourceTuning: {
      maxHealth: 82,
      interviewDuration: 8.1,
      contactDamageScale: 0.55,
    },
    enemyTuning: {
      rifle: { health: 30, speed: 1.7, shotCooldown: 0.98, shotDamage: 12 },
      heavy: { health: 58, speed: 1.2, shotCooldown: 1.28, shotDamage: 17, touchDamage: 18 },
      drone: { health: 28, speed: 1.52, shotCooldown: 1.02, bulletSpeed: 5.8, shotDamage: 11 },
    },
    encounterPacing: {
      shellingInterval: [4.8, 7.4],
      pickupChance: 0.1,
      extractionPressure: 1.4,
    },
  }),
];
