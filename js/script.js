// Darth Críos music player — independent of the former preview overlay.
// Keep the homepage visible even if this script cannot load.
(() => {
  "use strict";

const tracksData = [
  {
    title: "Sample Pack Era EP",
    albumArt: "AlbumArt/AlbumCover.jpg",
    audio: "Masters/VibeWithMe.mp3",
    buyLink:"https://darthcrios.bandcamp.com/album/sample-pack-era"
  },
  {
    title: "Kollective - Riverbend Remix",
    albumArt: "AlbumArt/KollectiveRemix.jpg",
    audio: "Masters/Riverbend.mp3",
    buyLink: "https://hypeddit.com/y7pwp7"
  },
  {
    title: "Killer Vibes",
    albumArt: "AlbumArt/SinglesRemix.jpg",
    audio: "Masters/KillerVibes.mp3",
    buyLink: "https://hypeddit.com/jgb5q7"
  },
  {
    title: "Keep Moving",
    albumArt: "AlbumArt/Keep Moving.jpg",
    audio: "Masters/KeepMoving.mp3",
    buyLink: "https://darthcrios.bandcamp.com/album/sample-pack-era"
  },
  {
    title: "You Got the Feeling Ft Alan Martin",
    albumArt: "AlbumArt/SinglesCover.jpg",
    audio: "Masters/YouGotTheFeeling.mp3",
    buyLink: "https://darthcrios.bandcamp.com/album/sample-pack-era"
  },
  {
    title: "LA Rain",
    albumArt: "AlbumArt/LA Rain.jpg",
    audio: "Masters/LARain.mp3",
    buyLink: "https://darthcrios.bandcamp.com/album/sample-pack-era"
  },
  {
    title: "Isolated Red",
    albumArt: "AlbumArt/red_isolated.jpg",
    audio: "Masters/IsolatedRed.mp3",
    buyLink: "https://darthcrios.bandcamp.com/album/sample-pack-era"
  },
  {
    title: "Move Yo Body Ft Alex Arcana",
    albumArt: "AlbumArt/movyobody2.jpg",
    audio: "Masters/MoveyoBody.mp3",
    buyLink: "https://darthcrios.bandcamp.com/album/sample-pack-era"
  },

];

  function initMusicPlayer() {
    const container = document.getElementById("tracks-container");
    if (!container) return; // Other pages may not have a track grid.

    container.replaceChildren();
    const players = [];

    for (const track of tracksData) {
      const card = document.createElement("article");
      card.className = "track";

      const art = document.createElement("img");
      art.src = track.albumArt;
      art.alt = `${track.title} album artwork`;
      art.loading = "lazy";
      card.appendChild(art);

      const title = document.createElement("div");
      title.className = "track-title";
      title.textContent = track.title;
      card.appendChild(title);

      const wave = document.createElement("div");
      wave.className = "track-wave";
      card.appendChild(wave);

      const audio = document.createElement("audio");
      audio.className = "hidden-audio";
      audio.preload = "none";
      audio.setAttribute("controlsList", "nodownload noplaybackrate");
      const source = document.createElement("source");
      source.src = track.audio;
      source.type = track.audio.toLowerCase().endsWith(".mp3") ? "audio/mpeg" : "audio/wav";
      audio.appendChild(source);
      card.appendChild(audio);
      players.push(audio);

      const controls = document.createElement("div");
      controls.className = "player-controls";
      const play = document.createElement("button");
      play.type = "button";
      play.className = "play-btn";
      play.textContent = "▶ Play";
      play.setAttribute("aria-label", `Play ${track.title}`);
      play.addEventListener("click", async () => {
        players.forEach(other => { if (other !== audio) other.pause(); });
        try { await audio.play(); }
        catch (error) { console.warn(`Unable to play ${track.title}:`, error); }
      });
      const pause = document.createElement("button");
      pause.type = "button";
      pause.className = "pause-btn";
      pause.textContent = "⏸ Pause";
      pause.setAttribute("aria-label", `Pause ${track.title}`);
      pause.addEventListener("click", () => audio.pause());
      const buy = document.createElement("a");
      buy.className = "buy-btn";
      buy.href = track.buyLink;
      buy.target = "_blank";
      buy.rel = "noopener noreferrer";
      buy.textContent = "💰";
      buy.setAttribute("aria-label", `Buy or listen to ${track.title}`);
      controls.append(play, pause, buy);
      card.appendChild(controls);
      container.appendChild(card);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMusicPlayer, { once: true });
  } else {
    initMusicPlayer();
  }
})();
