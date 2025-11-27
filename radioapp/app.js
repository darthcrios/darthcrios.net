// Simple Críos Radio web app
const audioEl = document.getElementById('radioAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const statusText = document.getElementById('statusText');
const nowPlayingEl = document.getElementById('nowPlaying');

let isPlaying = false;

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

// Register service worker for PWA if available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(err => {
      console.warn('SW registration failed', err);
    });
  });
}

// Kick things off
setStatus('Ready');
fetchNowPlaying();
