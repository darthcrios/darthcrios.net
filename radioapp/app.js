// Simple Críos Radio web app with secret unlock
const audioEl = document.getElementById('radioAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const statusText = document.getElementById('statusText');
const nowPlayingEl = document.getElementById('nowPlaying');

const secretInput = document.getElementById('secretCode');
const unlockBtn = document.getElementById('unlockBtn');
const secretStatus = document.getElementById('secretStatus');
const secretContent = document.getElementById('secretContent');

let isPlaying = false;

// Radio logic
async function fetchNowPlaying() {
  try {
    const res = await fetch('https://radio.darthcrios.net/status-json.xsl', {
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();
    let source = data.icestats && data.icestats.source;

    if (Array.isArray(source)) {
      source = source[0];
    }

    const title = source && source.title ? source.title : 'Unknown Track';
    nowPlayingEl.textContent = title;
  } catch (err) {
    console.warn('Failed to fetch now playing:', err);
    if (!nowPlayingEl.textContent || nowPlayingEl.textContent === 'Loading…') {
      nowPlayingEl.textContent = 'Unable to load track info';
    }
  } finally {
    setTimeout(fetchNowPlaying, 10000);
  }
}

function setStatus(text) {
  statusText.textContent = text;
}

playPauseBtn.addEventListener('click', async () => {
  try {
    if (!isPlaying) {
      await audioEl.play();
      isPlaying = true;
      playPauseBtn.textContent = 'Pause';
      setStatus('Live');
    } else {
      audioEl.pause();
      isPlaying = false;
      playPauseBtn.textContent = 'Play';
      setStatus('Paused');
    }
  } catch (err) {
    console.error('Playback error', err);
    setStatus('Playback error – check stream.');
  }
});

// Secret unlock logic
function checkSecret() {
  const code = (secretInput.value || '').trim().toUpperCase();
  if (!code) {
    secretStatus.textContent = 'Enter a code.';
    return;
  }

  if (code === 'CLOVERMIND') {
    secretStatus.textContent = 'Unlocked. Enjoy the secret track.';
    secretContent.classList.remove('hidden');
  } else {
    secretStatus.textContent = 'Nope.';
  }
}

unlockBtn.addEventListener('click', checkSecret);

secretInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    checkSecret();
  }
});

// Register service worker for PWA if available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(err => {
      console.warn('SW registration failed', err);
    });
  });
}

// Kick things off
fetchNowPlaying();