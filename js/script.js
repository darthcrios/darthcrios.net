// ENTER SITE BUTTON
const enterBtn = document.getElementById('enter-btn');
const preview = document.getElementById('preview');
const main = document.getElementById('main');

main.style.display = 'none';
main.style.opacity = 0;

enterBtn.addEventListener('click', () => {
  preview.style.opacity = 0;
  setTimeout(() => {
    preview.style.display = 'none';
    main.style.display = 'block';
    setTimeout(() => main.style.opacity = 1, 50);
  }, 800);
});

// Tracks data
const tracksData = [
  {
    title: "Vibe With Me",
    albumArt: "AlbumArt/VWH4.jpg",
    audio: "Masters/VibeWithMe.mp3"
  },
  {
    title: "Kollective - Riverbend Remix",
    albumArt: "AlbumArt/SinglesRemix.jpg",
    audio: "Masters/Riverbend.mp3"
  },
  {
    title: "Keep Moving",
    albumArt: "AlbumArt/Keep Moving.jpg",
    audio: "Masters/KeepMoving.mp3"
  },
  {
    title: "You Got the Feeling Ft Alan Martin",
    albumArt: "AlbumArt/SinglesCover.jpg",
    audio: "Masters/YouGotTheFeeling.mp3"
  },
  {
    title: "Killer Vibes",
    albumArt: "AlbumArt/KillerVibesArt.jpg",
    audio: "Masters/KillerVibes.mp3"
  },
  {
    title: "LA Rain",
    albumArt: "AlbumArt/LA Rain.jpg",
    audio: "Masters/LARain.mp3"
  },
  {
    title: "Isolated Red",
    albumArt: "AlbumArt/red_isolated.jpg",
    audio: "Masters/IsolatedRed.mp3"
  },
  {
    title: "Puca",
    albumArt: "AlbumArt/Beach Ghost.jpeg",
    audio: "Masters/GhostontheBeach.mp3"
  },
  {
    title: "Move Yo Body Ft Alex Arcana",
    albumArt: "AlbumArt/movyobody2.jpg",
    audio: "Masters/MoveyoBody.mp3"
  },

];

const tracksContainer = document.getElementById('tracks-container');

tracksData.forEach(track => {
  const trackDiv = document.createElement('div');
  trackDiv.classList.add('track');

  const ext = track.audio.split('.').pop().toLowerCase();
  const type = ext === 'mp3' ? 'audio/mpeg' : 'audio/wav';

  trackDiv.innerHTML = `
    <img src="${track.albumArt}" alt="${track.title} Album Art">
    <div class="track-title">${track.title}</div>
    <div class="track-wave"></div>

    <!-- Hidden audio element -->
    <audio preload="none" controlsList="nodownload noplaybackrate" class="hidden-audio">
      <source src="${track.audio}" type="${type}">
    </audio>

    <!-- Custom buttons -->
    <div class="player-controls">
      <button class="play-btn">▶️ Play</button>
      <button class="pause-btn">⏸️ Pause</button>
    </div>
  `;

  tracksContainer.appendChild(trackDiv);
});

// Hook up custom buttons
document.querySelectorAll('.track').forEach(trackEl => {
  const audio = trackEl.querySelector('audio');
  const playBtn = trackEl.querySelector('.play-btn');
  const pauseBtn = trackEl.querySelector('.pause-btn');

  playBtn.addEventListener('click', () => {
    audio.play();
  });

  pauseBtn.addEventListener('click', () => {
    audio.pause();
  });
});