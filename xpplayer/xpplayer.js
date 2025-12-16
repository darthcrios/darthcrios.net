// ========= XP Media Player (simple, solid foundation) =========

const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const statusText = document.getElementById("statusText");

const playlistEl = document.getElementById("playlist");
const seek = document.getElementById("seek");
const vol = document.getElementById("vol");

const btnPlay = document.getElementById("btnPlay");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnShuffle = document.getElementById("btnShuffle");
const btnRepeat = document.getElementById("btnRepeat");
const btnAddMock = document.getElementById("btnAddMock");

const timeCur = document.getElementById("timeCur");
const timeDur = document.getElementById("timeDur");

// ---- Edit this list to your real tracks ----
let tracks = [
  { title: "Ghost on the Beach", artist: "Críos", src: "audio/GhostontheBeach.mp3", art: "art/Beach Ghost.jpeg" },
  { title: "Track 02", artist: "Críos", src: "audio/track2.mp3", art: "art/cover2.jpg" }
];

// Player state
let index = 0;
let isShuffle = false;
let isRepeat = false;
let isSeeking = false;

// ---- Visualizer (Web Audio API) ----
const canvas = document.getElementById("vizCanvas");
const ctx = canvas.getContext("2d");

let audioCtx, analyser, sourceNode, freqData;

function setupVisualizerOnce() {
  if (audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  sourceNode = audioCtx.createMediaElementSource(audio);
  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);

  freqData = new Uint8Array(analyser.frequencyBinCount);
  requestAnimationFrame(drawViz);
}

function drawViz() {
  if (!analyser) return;
  analyser.getByteFrequencyData(freqData);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background glow
  const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "rgba(50,199,255,.20)");
  grd.addColorStop(1, "rgba(54,209,107,.12)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bars = 38;
  const step = Math.floor(freqData.length / bars);
  const barW = canvas.width / bars;

  for (let i = 0; i < bars; i++) {
    const v = freqData[i * step] / 255;
    const h = Math.max(4, v * canvas.height);

    const x = i * barW;
    const y = canvas.height - h;

    ctx.fillStyle = "rgba(159,231,255,.85)";
    ctx.fillRect(x + 2, y, barW - 4, h);
  }

  requestAnimationFrame(drawViz);
}

// ---- UI helpers ----
function fmtTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function setStatus(msg) {
  statusText.textContent = msg;
}

function currentTrack() {
  return tracks[index];
}

function loadTrack(i, { autoplay = false } = {}) {
  index = (i + tracks.length) % tracks.length;
  const t = currentTrack();

  audio.src = t.src;
  cover.src = t.art;
  trackTitle.textContent = t.title;
  trackArtist.textContent = t.artist;

  setStatus(`Loaded: ${t.title}`);
  renderPlaylist();

  // Reset seek UI
  seek.value = 0;
  timeCur.textContent = "0:00";
  timeDur.textContent = "0:00";

  if (autoplay) play();
}

function play() {
  // Some browsers require user gesture; we ensure by calling from click handler
  setupVisualizerOnce();
  if (audioCtx?.state === "suspended") audioCtx.resume();

  audio.play().then(() => {
    btnPlay.textContent = "⏸";
    setStatus(`Playing: ${currentTrack().title}`);
  }).catch(() => {
    setStatus("Click Play to allow audio.");
  });
}

function pause() {
  audio.pause();
  btnPlay.textContent = "▶";
  setStatus("Paused.");
}

function togglePlay() {
  if (audio.paused) play();
  else pause();
}

function next() {
  if (!tracks.length) return;

  if (isShuffle && tracks.length > 1) {
    let n = index;
    while (n === index) n = Math.floor(Math.random() * tracks.length);
    loadTrack(n, { autoplay: true });
    return;
  }

  loadTrack(index + 1, { autoplay: true });
}

function prev() {
  if (audio.currentTime > 2) {
    audio.currentTime = 0;
    setStatus("Restarted track.");
    return;
  }
  loadTrack(index - 1, { autoplay: true });
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle("on", isShuffle);
  setStatus(isShuffle ? "Shuffle: ON" : "Shuffle: OFF");
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  btnRepeat.classList.toggle("on", isRepeat);
  setStatus(isRepeat ? "Repeat: ON" : "Repeat: OFF");
}

// ---- Playlist rendering ----
function renderPlaylist() {
  playlistEl.innerHTML = "";

  tracks.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "item" + (i === index ? " active" : "");
    row.innerHTML = `
      <div class="badge">${i + 1}</div>
      <div>
        <div class="item-title">${escapeHtml(t.title)}</div>
        <div class="item-sub">${escapeHtml(t.artist)}</div>
      </div>
      <div class="item-right">${i === index && !audio.paused ? "PLAY" : ""}</div>
    `;

    row.addEventListener("click", () => {
      loadTrack(i, { autoplay: true });
    });

    playlistEl.appendChild(row);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---- Events ----
btnPlay.addEventListener("click", togglePlay);
btnNext.addEventListener("click", next);
btnPrev.addEventListener("click", prev);
btnShuffle.addEventListener("click", toggleShuffle);
btnRepeat.addEventListener("click", toggleRepeat);

vol.addEventListener("input", () => {
  audio.volume = Number(vol.value);
});

seek.addEventListener("input", () => {
  // while dragging, update current time label but don't fight playback updates
  isSeeking = true;
  const dur = audio.duration || 0;
  const ratio = Number(seek.value) / Number(seek.max);
  const t = ratio * dur;
  timeCur.textContent = fmtTime(t);
});

seek.addEventListener("change", () => {
  const dur = audio.duration || 0;
  const ratio = Number(seek.value) / Number(seek.max);
  audio.currentTime = ratio * dur;
  isSeeking = false;
});

audio.addEventListener("loadedmetadata", () => {
  timeDur.textContent = fmtTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (isSeeking) return;
  const dur = audio.duration || 0;
  const cur = audio.currentTime || 0;

  timeCur.textContent = fmtTime(cur);
  if (dur > 0) {
    seek.value = Math.floor((cur / dur) * Number(seek.max));
  }
});

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    play();
  } else {
    next();
  }
});

// Demo button: quickly inject more items for testing UI
btnAddMock.addEventListener("click", () => {
  tracks = [
    ...tracks,
    { title: `Bonus Track ${tracks.length + 1}`, artist: "Clovermind", src: tracks[0]?.src || "", art: tracks[0]?.art || "" }
  ];
  renderPlaylist();
  setStatus("Added demo item (points to track1 for quick testing).");
});

// ---- Init ----
audio.volume = Number(vol.value);
cover.src = tracks[0]?.art || "";
loadTrack(0);
renderPlaylist();
setStatus("Ready. Click Play.");
