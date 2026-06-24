const themes = {
  "Cocktail Bar": { base: "Web-01.png", humans: ["red-16.png", "red-17.png", "red-18.png"], color: "#884544" },
  "Pojang macha": { base: "Web-02.png", humans: ["Untitled-3-04.png", "Untitled-3-05.png", "Untitled-3-06.png"], color: "#ef7138" },
  Izakaya: { base: "Web-03.png", humans: ["Untitled-3-07.png", "Untitled-3-08.png", "Untitled-3-09.png"], color: "#efbf59" },
  "Sports Pub": { base: "Web-04.png", humans: ["Untitled-3-10.png", "Untitled-3-11.png", "Untitled-3-12.png"], color: "#61afea" },
  "Local Pub": { base: "Web-08.png", humans: ["Untitled-3-13.png", "local-pub-crowd-re-02.png", "local-pub-crowd-re-03.png"], color: "#68aa2e" },
};

const sliderNames = [
  "Master Volume",
  "Crowd Chatter",
  "Indoor Ambience",
  "Rain Sounds",
  "Street Noise",
  "Cooking Sounds",
  "Glass Clinks",
];

const defaults = {
  "Cocktail Bar": [62, 34, 64, 5, 18, 8, 58],
  "Pojang macha": [72, 46, 38, 6, 70, 78, 45],
  Izakaya: [58, 30, 74, 8, 22, 64, 55],
  "Sports Pub": [76, 52, 32, 10, 34, 14, 42],
  "Local Pub": [64, 40, 68, 16, 36, 22, 38],
};

const avatarScenes = {
  "Cocktail Bar": ["all-01.png", "all-02.png", "all-03.png", "all-04.png", "all-05.png", "all-06.png", "all-07.png", "all-08.png"],
  "Pojang macha": ["all-09.png", "all-10.png", "all-11.png", "all-12.png", "all-13.png", "all-14.png", "all-15.png", "all-16.png"],
  Izakaya: ["all-17.png", "all-18.png", "all-19.png", "all-20.png", "all-21.png", "all-22.png", "all-23.png", "all-24.png"],
  "Sports Pub": ["all-25.png", "all-26.png", "all-27.png", "all-28.png", "all-29.png", "all-30.png", "all-31.png", "all-32.png"],
  "Local Pub": ["all-33.png", "all-34.png", "all-35.png", "all-36.png", "all-37.png", "all-38.png", "all-39.png", "all-40.png"],
};

const avatarLabelSpots = {
  "Cocktail Bar": [[23.4, 52.4], [40.3, 52.4], [55.5, 52.4], [69.6, 52.4], [26.5, 91.5], [42.3, 91.5], [58.3, 91.5], [72.4, 91.5]],
  "Pojang macha": [[30.0, 55.0], [46.9, 55.0], [61.6, 55.0], [74.7, 55.0], [25.6, 91.5], [43.8, 91.5], [59.6, 91.5], [74.2, 91.5]],
  Izakaya: [[29.3, 51.2], [46.9, 51.2], [61.8, 51.2], [73.7, 51.2], [28.3, 91.8], [44.9, 91.8], [61.0, 91.8], [73.7, 91.8]],
  "Sports Pub": [[28.9, 55.0], [45.4, 55.0], [58.1, 55.0], [73.7, 55.0], [25.3, 91.6], [41.5, 91.6], [57.6, 91.6], [72.5, 91.6]],
  "Local Pub": [[27.8, 50.0], [45.2, 50.0], [59.1, 50.0], [73.7, 50.0], [26.4, 91.8], [43.5, 91.8], [59.1, 91.8], [72.8, 91.8]],
};

const rainImages = ["rain-overlay-final-01.png", "rain-overlay-final-02.png"];
const smellImages = ["smell-overlay-final-01.png", "smell-overlay-final-02.png"];

const audioSlots = {
  join: "assets/audio/Joined.mp3",
  cheers: "assets/audio/Cheers.mp3",
  raise: "assets/audio/Cheers.mp3",
  toast: "assets/audio/Cheers.mp3",
};
const loopAudioConfig = {
  "Crowd Chatter": { src: "assets/audio/Crowd Chatter.mp3", gain: 0.34 },
  "Indoor Ambience": { src: null, gain: 0.24 },
  "Rain Sounds": { src: null, gain: 0.3 },
  "Street Noise": { src: null, gain: 0.2 },
  "Cooking Sounds": { src: null, gain: 0.28 },
  "Glass Clinks": { src: "assets/audio/Glass clinks.mp3", gain: 0.14 },
};
const loopAudios = {};
let audioUnlocked = false;

const participants = [];
let currentTheme = "Cocktail Bar";
let toastCount = 0;
let currentCrowd = 0;
const started = Date.now();

const $ = (id) => document.getElementById(id);
const scene = $("scene");
const roomCode = $("roomCode");

roomCode.textContent = Math.random().toString(36).slice(2, 8).toUpperCase();
$("joinCode").value = roomCode.textContent;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function sliderValue(name) {
  const index = sliderNames.indexOf(name);
  const input = document.querySelector(`.slider input[data-index="${index}"]`);
  return input ? Number(input.value) : defaults[currentTheme][index] || 0;
}

function randomizeStart(audio) {
  if (Number.isFinite(audio.duration) && audio.duration > 3) {
    audio.currentTime = Math.random() * Math.max(1, audio.duration - 1);
  }
}

Object.entries(loopAudioConfig).forEach(([name, config]) => {
  if (!config.src) return;
  const audio = new Audio(config.src);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  audio.addEventListener("loadedmetadata", () => randomizeStart(audio), { once: true });
  loopAudios[name] = { audio, gain: config.gain };
});

function updateAudioVolumes() {
  const master = sliderValue("Master Volume") / 100;
  Object.entries(loopAudios).forEach(([name, item]) => {
    const value = sliderValue(name) / 100;
    item.audio.volume = Math.min(0.85, master * value * item.gain);
    if (audioUnlocked && item.audio.paused) item.audio.play().catch(() => {});
  });
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  Object.values(loopAudios).forEach(({ audio }) => {
    randomizeStart(audio);
    audio.play().catch(() => {});
  });
  updateAudioVolumes();
}

function play(slot) {
  const src = audioSlots[slot];
  if (!src) return;
  unlockAudio();
  const audio = new Audio(src);
  audio.volume = Math.min(0.9, (sliderValue("Master Volume") / 100) * 0.72);
  audio.play().catch(() => {});
}

function renderThemes() {
  $("themeButtons").innerHTML = Object.keys(themes)
    .map((name) => `<button class="${name === currentTheme ? "active" : ""}" data-theme="${name}">${name}</button>`)
    .join("");
}

function setTheme(name) {
  currentTheme = name;
  document.documentElement.style.setProperty("--theme-color", themes[name].color);
  $("app").style.setProperty("--theme-color", themes[name].color);
  scene.classList.add("fade");
  setTimeout(() => {
    updateEffects();
    scene.classList.remove("fade");
  }, 140);
  renderThemes();
  setSliderValues(defaults[name]);
}

function setSliderValues(values) {
  document.querySelectorAll(".slider input").forEach((input, i) => {
    input.value = values[i];
  });
  updateEffects();
}

function renderSliders() {
  $("sliders").innerHTML = sliderNames
    .map((name, i) => `<div class="slider"><label>${name}</label><input data-index="${i}" type="range" min="0" max="100" value="${defaults[currentTheme][i]}" /></div>`)
    .join("");
}

function updateEffects() {
  const values = [...document.querySelectorAll(".slider input")].map((x) => Number(x.value));
  const crowd = values[1] || 0;
  const rain = values[3] || 0;
  const cooking = values[5] || 0;
  currentCrowd = crowd;
  scene.src = participants.length ? `assets/images/${themes[currentTheme].base}` : crowdScene(crowd);
  renderSmell(cooking);
  renderRain(rain);
  renderGlasses();
  renderPeopleTags();
  updateAudioVolumes();
}

function crowdScene(value) {
  if (value < 28) return `assets/images/${themes[currentTheme].base}`;
  const level = value < 50 ? 0 : value < 76 ? 1 : 2;
  return `assets/images/humans/${themes[currentTheme].humans[level]}`;
}

function renderRain(value) {
  if (value < 34) {
    $("rainLayer").innerHTML = "";
    return;
  }
  const level = value < 68 ? 0 : 1;
  $("rainLayer").innerHTML = `<img class="rain-asset" src="assets/images/objects/${rainImages[level]}" alt="" />`;
}

function renderSmell(value) {
  if (value < 34) {
    $("smellLayer").innerHTML = "";
    return;
  }
  const level = value < 68 ? 0 : 1;
  $("smellLayer").innerHTML = `<img class="smell-asset" src="assets/images/objects/${smellImages[level]}" alt="" />`;
}

function renderGlasses() {
  $("glassLayer").innerHTML = "";
}

function renderParticipants() {
  $("participants").innerHTML = participants.map((name) => `<div>${escapeHtml(name)}</div>`).join("");
  $("count").textContent = `${participants.length}/8`;
  $("leaveRoom").disabled = participants.length === 0;
  const values = [...document.querySelectorAll(".slider input")].map((x) => Number(x.value));
  scene.src = participants.length ? `assets/images/${themes[currentTheme].base}` : crowdScene(values[1] || 0);
  renderPeopleTags();
}

function renderPeopleTags() {
  const count = Math.min(participants.length, 8);
  if (!count) {
    $("peopleTags").innerHTML = "";
    return;
  }

  const image = avatarScenes[currentTheme][count - 1];
  const spots = avatarLabelSpots[currentTheme];
  const labels = participants.slice(0, 8).map((name, i) => {
    const [x, y] = spots[i];
    return `<div class="avatar-label" style="left:${x}%;top:${y}%">${escapeHtml(name)}</div>`;
  });

  $("peopleTags").innerHTML = `<img class="avatar-scene" src="assets/images/online-overlays-transparent/${image}" alt="" />${labels.join("")}`;
}

function youtubeEmbedUrl(raw) {
  const value = raw.trim();
  const match = value.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  const id = match ? match[1] : "jfKfPfyJRdk";
  return `https://www.youtube.com/embed/${id}?controls=1&rel=0`;
}

function showPopup(text, kind = "cheers") {
  play(kind);
  const el = document.createElement("div");
  el.className = "popup";
  el.textContent = text;
  $("toastLayer").appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function showAlert(text) {
  $("alertText").textContent = text;
  $("alertDialog").showModal();
  play("warning");
}

function addParticipant(name) {
  if (participants.length >= 8) {
    showAlert("Room is full. You cannot join.");
    play("room-full");
    return;
  }
  participants.push(name || `Guest ${participants.length + 1}`);
  renderParticipants();
  showPopup(`${participants.at(-1)} joined`, "join");
}

function leaveRoom() {
  if (!participants.length) return;
  const name = participants.pop();
  renderParticipants();
  showPopup(`${name} left`, "join");
}

function tick() {
  const s = Math.floor((Date.now() - started) / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  $("timer").textContent = `${h}:${m}:${sec}`;
}

renderThemes();
renderSliders();
renderParticipants();
$("app").style.setProperty("--theme-color", themes[currentTheme].color);
setInterval(tick, 1000);
tick();

$("themeButtons").addEventListener("click", (e) => {
  if (e.target.dataset.theme) setTheme(e.target.dataset.theme);
});

$("sliders").addEventListener("input", updateEffects);
document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });
$("openJoin").addEventListener("click", () => $("joinDialog").showModal());
$("leaveRoom").addEventListener("click", leaveRoom);
$("closeJoin").addEventListener("click", () => $("joinDialog").close());
$("alertOk").addEventListener("click", () => $("alertDialog").close());
$("loadYoutube").addEventListener("click", () => {
  const url = $("youtubeUrl").value.trim();
  $("youtubeFrame").src = youtubeEmbedUrl(url);
  $("openYoutube").href = url || "https://www.youtube.com/watch?v=jfKfPfyJRdk";
});

$("joinSubmit").addEventListener("click", () => {
  const code = $("joinCode").value.trim().toUpperCase();
  if (code) roomCode.textContent = code;
  addParticipant($("nickname").value.trim());
  $("nickname").value = "";
  $("joinDialog").close();
});

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") {
    toastCount += 1;
    showPopup("Cheers!", "raise");
    if (toastCount % 6 === 0) showAlert("That's a lot of toasts tonight!");
  }
  if (e.key.toLowerCase() === "t") {
    showPopup(`${participants[0] || "Someone"} proposed a toast!`, "toast");
  }
});

setTimeout(() => showAlert("You've been here for a while"), 1000 * 60 * 8);
