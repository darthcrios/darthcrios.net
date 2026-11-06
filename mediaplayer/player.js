"use strict";

/* Críos Media Player
 * Track data, playlist rendering, playback, controls, and visualizer.
 * All media paths are relative to mediaplayer/player.html.
 */
(() => {
  // 1. DOM REFERENCES: Find the player controls and display elements.
  const $ = id => document.getElementById(id);
  const audio = $("audio"), cover = $("cover"), trackTitle = $("trackTitle"), trackArtist = $("trackArtist");
  const statusText = $("statusText"), playlistEl = $("playlist"), seek = $("seek"), vol = $("vol");
  const btnPlay = $("btnPlay"), btnPrev = $("btnPrev"), btnNext = $("btnNext");
  const btnShuffle = $("btnShuffle"), btnRepeat = $("btnRepeat");
  const timeCur = $("timeCur"), timeDur = $("timeDur"), canvas = $("vizCanvas");
  // Stop cleanly if the HTML is missing a required element.
  if (![audio,cover,trackTitle,trackArtist,statusText,playlistEl,seek,vol,btnPlay,btnPrev,btnNext,btnShuffle,btnRepeat,timeCur,timeDur].every(Boolean)) {
    console.error("Media player: required HTML elements are missing."); return;
  }
  // 2. MUSIC LIBRARY: Edit track names, artist names, and file paths here.
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
  // 3. PLAYER STATE: Current track and playback modes.
  let index = 0, shuffle = false, repeat = false, seeking = false;
  let context, analyser, frequencies, animationStarted = false;
  // 4. SMALL HELPERS: Format time and show player status messages.
  const fmt = n => Number.isFinite(n) && n >= 0 ? `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2,"0")}` : "0:00";
  const status = message => { statusText.textContent = message; };
  // 5. PLAYLIST UI: Build accessible, clickable track rows.
  function renderPlaylist() {
    playlistEl.replaceChildren();
    tracks.forEach((track, i) => {
      const row = document.createElement("button");
      row.type = "button"; row.className = "item" + (i === index ? " active" : "");
      row.setAttribute("aria-current", i === index ? "true" : "false");
      const badge = document.createElement("span"); badge.className = "badge"; badge.textContent = String(i + 1);
      const details = document.createElement("span");
      // Keep title and artist on separate lines with visible spacing.
      details.style.display = "flex";
      details.style.flexDirection = "column";
      details.style.gap = "6px";
      details.style.minWidth = "0";
      const title = document.createElement("span"); title.className = "item-title"; title.textContent = track.title;
      const artist = document.createElement("span"); artist.className = "item-sub"; artist.textContent = track.artist;
      details.append(title, artist);
      const state = document.createElement("span"); state.className = "item-right"; state.textContent = i === index && !audio.paused ? "PLAY" : "";
      row.append(badge, details, state);
      row.addEventListener("click", () => loadTrack(i, true));
      playlistEl.append(row);
    });
  }
  // 6. TRACK LOADING: Update audio source, artwork, labels, and timeline.
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
  // 7. AUDIO VISUALIZER: Initialize Web Audio only when needed.
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
  // Draw frequency bars in the site's red and purple colors.
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
  // 8. PLAYBACK: Start audio and resume suspended browser audio contexts.
  async function play() {
    setupVisualizer();
    try {
      if (context?.state === "suspended") await context.resume();
      await audio.play();
    } catch (error) { status("Playback unavailable. Check the audio file and browser permissions."); console.warn(error); }
  }
  // Choose the next track; shuffle avoids replaying the current one.
  function next() {
    if (!tracks.length) return;
    if (shuffle && tracks.length > 1) {
      const offset = 1 + Math.floor(Math.random() * (tracks.length - 1));
      loadTrack(index + offset, true);
    } else loadTrack(index + 1, true);
  }
  // 9. CONTROL EVENTS: Play/pause, skip, shuffle, repeat, volume, seek.
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
  // 10. AUDIO EVENTS: Keep the UI synchronized with real playback.
  audio.addEventListener("loadedmetadata", () => { timeDur.textContent = fmt(audio.duration); });
  audio.addEventListener("timeupdate", () => { if (seeking) return; timeCur.textContent = fmt(audio.currentTime); if (Number.isFinite(audio.duration) && audio.duration > 0) seek.value = String(Math.round(audio.currentTime/audio.duration*1000)); });
  audio.addEventListener("play", () => { btnPlay.textContent = "⏸"; status(`Playing: ${tracks[index].title}`); renderPlaylist(); if (analyser && !animationStarted) { animationStarted=true; requestAnimationFrame(drawVisualizer); } });
  audio.addEventListener("pause", () => { btnPlay.textContent = "▶"; if (!audio.ended) status("Paused."); renderPlaylist(); });
  audio.addEventListener("ended", () => { if (repeat) { audio.currentTime=0; play(); } else next(); });
  audio.addEventListener("error", () => { btnPlay.textContent="▶"; status(`Cannot load: ${tracks[index].title}. Check ${tracks[index].src}`); });
  // 11. ERROR HANDLING: Gracefully handle unavailable artwork.
  cover.addEventListener("error", () => { cover.removeAttribute("src"); cover.alt = "Artwork unavailable"; });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && analyser && !animationStarted) { animationStarted=true; requestAnimationFrame(drawVisualizer); } });
  // 12. INITIALIZATION: Set volume and display the first track.
  audio.volume = Number(vol.value);
  loadTrack(0);
})();
