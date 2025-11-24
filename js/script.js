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
    audio: "Masters/Críos - VibeWithMe.mp3"
  },
  {
    title: "Kollective - Riverbend Remix",
    albumArt: "AlbumArt/SinglesRemix.jpg",
    audio: "Masters/Críos - Riverbend.mp3"
  },
  {
    title: "Keep Moving",
    albumArt: "AlbumArt/Keep Moving.jpg",
    audio: "Masters/Críos - KeepMoving.mp3"
  },
  {
    title: "You Got the Feeling Ft Alan Martin",
    albumArt: "AlbumArt/SinglesCover.jpg",
    audio: "Masters/Críos - YouGotTheFeeling.mp3"
  },
  {
    title: "Killer Vibes",
    albumArt: "AlbumArt/KillerVibesArt.jpg",
    audio: "Masters/Críos - KillerVibes.mp3"
  },
  {
    title: "LA Rain",
    albumArt: "AlbumArt/LA Rain.jpg",
    audio: "Masters/Críos - LARain.mp3"
  },
  {
    title: "Isolated Red",
    albumArt: "AlbumArt/red_isolated.jpg",
    audio: "Masters/Críos - IsolatedRed.mp3"
  },
  {
    title: "Puca",
    albumArt: "AlbumArt/Beach Ghost.jpeg",
    audio: "Masters/Críos - GhostontheBeach.mp3"
  },
  {
    title: "Move Yo Body Ft Alex Arcana",
    albumArt: "AlbumArt/movyobody2.jpg",
    audio: "Masters/Críos - MoveyoBody.mp3"
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
    <audio controls>
      <source src="${track.audio}" type="${type}">
      Your browser does not support the audio element.
    </audio>
  `;

  tracksContainer.appendChild(trackDiv);
});
