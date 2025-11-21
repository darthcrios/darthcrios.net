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
    audio: "Masters/Críos - Vibe With Me.wav"
  },
  {
    title: "Kollective - Riverbend Remix",
    albumArt: "AlbumArt/SinglesRemix.jpg",
    audio: "Masters/Críos - Riverbend (Mastered with Sunroof at 55pct).wav"
  },
  {
    title: "Keep Moving",
    albumArt: "AlbumArt/Keep Moving.jpg",
    audio: "Masters/Críos - Keep Moving.wav"
  },
  {
    title: "You Got the Feeling Ft Alan Martin",
    albumArt: "AlbumArt/SinglesCover.jpg",
    audio: "Masters/Críos - You Got The Feeling.wav"
  },
  {
    title: "Killer Vibes (Free Download)",
    albumArt: "AlbumArt/KillerVibesArt.jpg",
    audio: "Masters/Críos - Killer Vibes(Demo Exclusive).wav"
  },
  {
    title: "LA Rain",
    albumArt: "AlbumArt/LA Rain.jpg",
    audio: "Masters/Críos - LARain.wav"
  },
  {
    title: "Isolated Red",
    albumArt: "AlbumArt/red_isolated.jpg",
    audio: "Masters/Críos - Isolated Red.wav"
  },
  {
    title: "Puca",
    albumArt: "AlbumArt/Beach Ghost.jpeg",
    audio: "Masters/Críos - Ghost on the beach(Ghostwave Contest).wav"
  },
  {
    title: "Move Yo Body Ft Alex Arcana",
    albumArt: "AlbumArt/movyobody2.jpg",
    audio: "Masters/Críos - MoveyoBody.wav"
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
