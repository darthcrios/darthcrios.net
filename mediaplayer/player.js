"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const audio = $("audio"), cover = $("cover"), trackTitle = $("trackTitle"), trackArtist = $("trackArtist");
  const statusText = $("statusText"), playlistEl = $("playlist"), seek = $("seek"), vol = $("vol");
  const btnPlay = $("btnPlay"), btnPrev = $("btnPrev"), btnNext = $("btnNext");
  const btnShuffle = $("btnShuffle"), btnRepeat = $("btnRepeat");
  const timeCur = $("timeCur"), timeDur = $("timeDur"), canvas = $("vizCanvas");
  if (![audio,cover,trackTitle,trackArtist,statusText,playlistEl,seek,vol,btnPlay,btnPrev,btnNext,btnShuffle,btnRepeat,timeCur,timeDur].every(Boolean)) {
    console.error("Media player: required HTML elements are missing."); return;
  }
  const tracks = [

  
  { title: "Isolated Red", artist: "Críos", src: "audio/IsolatedRed.mp3", art: "art/red_isolated.jpg" },
  { title: "LA Rain", artist: "Críos", src: "audio/LARain.mp3", art: "art/LA Rain.jpg"},
  { title: "Move Yo Body", artist: "Críos", src: "audio/MoveyoBody.mp3", art: "art/movyobody2.jpg"},
  { title: "Vibe With Me", artist: "Críos", src: "audio/VibeWithMe.mp3", art: "art/VWH4.jpg"},
  { title: "Riverbend Remix", artist: "Críos", src: "audio/Riverbend.mp3", art: "art/SinglesRemix.jpg"},
  { title: "You Got The Feeling", artist: "Críos", src: "audio/YouGotTheFeeling.mp3", art:"art/SinglesCover.jpg"},
  { title: "Keep Moving", artist: "Críos", src: "audio/KeepMoving.mp3", art: "art/Keep Moving.jpg"},
  { title: "Ghost on the Beach", artist: "Críos", src: "audio/GhostontheBeach.mp3", art: "art/Beach Ghost.jpeg" },
  ];
  let index = 0, shuffle = false, repeat = false, seeking = false;
  let context, analyser, frequencies, animationStarted = false;
  const fmt = n => Number.isFinite(n) && n >= 0 ? `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2,"0")}` : "0:00";
  const status = message => { statusText.textContent = message; };
  function renderPlaylist() {
    playlistEl.replaceChildren();
    tracks.forEach((track, i) => {
      const row = document.createElement("button");
      row.type = "button"; row.className = "item" + (i === index ? " active" : "");
      row.setAttribute("aria-current", i === index ? "true" : "false");
      const badge = document.createElement("span"); badge.className = "badge"; badge.textContent = String(i + 1);
      const details = document.createElement("span");
      const title = document.createElement("span"); title.className = "item-title"; title.textContent = track.title;
      const artist = document.createElement("span"); artist.className = "item-sub"; artist.textContent = track.artist;
      details.append(title, artist);
      const state = document.createElement("span"); state.className = "item-right"; state.textContent = i === index && !audio.paused ? "PLAY" : "";
      row.append(badge, details, state);
      row.addEventListener("click", () => loadTrack(i, true));
      playlistEl.append(row);
    });
  }
  function loadTrack(i, autoplay = false) {
    if (!tracks.length) { status("No tracks configured."); return; }
    index = (i + tracks.length) % tracks.length;
    const track = tracks[index];
    audio.pause(); audio.src = track.src; audio.load();
    cover.src = track.art; cover.alt = `Artwork for ${track.title}`;
    trackTitle.textContent = track.title; trackArtist.textContent = track.artist;
    seek.value = "0"; timeCur.textContent = "0:00"; timeDur.textContent = "0:00";
    btnPlay.textContent = "▶"; status(`Loaded: ${track.title}`); renderPlaylist();
    if (autoplay) play();
  }
  function setupVisualizer() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass || !canvas || context) return;
    try {
      context = new AudioContextClass();
      analyser = context.createAnalyser(); analyser.fftSize = 256;
      const source = context.createMediaElementSource(audio);
      source.connect(analyser); analyser.connect(context.destination);
      frequencies = new Uint8Array(analyser.frequencyBinCount);
      if (!animationStarted) { animationStarted = true; requestAnimationFrame(drawVisualizer); }
    } catch (error) { console.warn("Visualizer unavailable:", error); }
  }
  function drawVisualizer() {
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    analyser.getByteFrequencyData(frequencies);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0,0,canvas.width,canvas.height);
    const count = 38, width = canvas.width / count, step = Math.max(1,Math.floor(frequencies.length/count));
    for (let i=0; i<count; i++) {
      const height = Math.max(2,frequencies[i*step]/255*canvas.height);
      ctx.fillStyle = i%2 ? "#a259ff" : "#e60000";
      ctx.fillRect(i*width+1,canvas.height-height,Math.max(1,width-2),height);
    }
    if (!document.hidden || !audio.paused) requestAnimationFrame(drawVisualizer);
    else { animationStarted = false; }
  }
  async function play() {
    setupVisualizer();
    try {
      if (context?.state === "suspended") await context.resume();
      await audio.play();
    } catch (error) { status("Playback unavailable. Check the audio file and browser permissions."); console.warn(error); }
  }
  function next() {
    if (!tracks.length) return;
    if (shuffle && tracks.length > 1) {
      const offset = 1 + Math.floor(Math.random() * (tracks.length - 1));
      loadTrack(index + offset, true);
    } else loadTrack(index + 1, true);
  }
  btnPlay.addEventListener("click", () => audio.paused ? play() : audio.pause());
  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", () => {
    if (audio.currentTime > 2) audio.currentTime = 0;
    else loadTrack(index - 1, true);
  });
  btnShuffle.addEventListener("click", () => { shuffle = !shuffle; btnShuffle.classList.toggle("on",shuffle); btnShuffle.setAttribute("aria-pressed",String(shuffle)); status(`Shuffle: ${shuffle ? "ON" : "OFF"}`); });
  btnRepeat.addEventListener("click", () => { repeat = !repeat; btnRepeat.classList.toggle("on",repeat); btnRepeat.setAttribute("aria-pressed",String(repeat)); status(`Repeat: ${repeat ? "ON" : "OFF"}`); });
  vol.addEventListener("input", () => { audio.volume = Number(vol.value); });
  seek.addEventListener("input", () => { seeking = true; if (Number.isFinite(audio.duration)) timeCur.textContent = fmt(Number(seek.value)/1000*audio.duration); });
  seek.addEventListener("change", () => { if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = Number(seek.value)/1000*audio.duration; seeking = false; });
  audio.addEventListener("loadedmetadata", () => { timeDur.textContent = fmt(audio.duration); });
  audio.addEventListener("timeupdate", () => { if (seeking) return; timeCur.textContent = fmt(audio.currentTime); if (Number.isFinite(audio.duration) && audio.duration > 0) seek.value = String(Math.round(audio.currentTime/audio.duration*1000)); });
  audio.addEventListener("play", () => { btnPlay.textContent = "⏸"; status(`Playing: ${tracks[index].title}`); renderPlaylist(); if (analyser && !animationStarted) { animationStarted=true; requestAnimationFrame(drawVisualizer); } });
  audio.addEventListener("pause", () => { btnPlay.textContent = "▶"; if (!audio.ended) status("Paused."); renderPlaylist(); });
  audio.addEventListener("ended", () => { if (repeat) { audio.currentTime=0; play(); } else next(); });
  audio.addEventListener("error", () => { btnPlay.textContent="▶"; status(`Cannot load: ${tracks[index].title}. Check ${tracks[index].src}`); });
  cover.addEventListener("error", () => { cover.removeAttribute("src"); cover.alt = "Artwork unavailable"; });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && analyser && !animationStarted) { animationStarted=true; requestAnimationFrame(drawVisualizer); } });
  audio.volume = Number(vol.value);
  loadTrack(0);
})();
