// --- RADIO ---
const playPauseBtn = document.getElementById("playPauseBtn");
const radioAudio = document.getElementById("radioAudio");
const statusText = document.getElementById("statusText");
const nowPlaying = document.getElementById("nowPlaying");

let isPlaying = false;

// Play / Pause
playPauseBtn.addEventListener("click", () => {
  if (!isPlaying) {
    radioAudio.play();
    isPlaying = true;
    playPauseBtn.textContent = "Pause";
    statusText.textContent = "Playing…";
  } else {
    radioAudio.pause();
    isPlaying = false;
    playPauseBtn.textContent = "Play";
    statusText.textContent = "Paused";
  }
});

// Pull Now Playing Metadata
async function updateNowPlaying() {
  try {
    const response = await fetch("https://radio.darthcrios.net/status-json.xsl");
    const data = await response.json();
    const track = data.icestats?.source?.title || "Unknown";
    nowPlaying.textContent = track;
  } catch {
    nowPlaying.textContent = "Unable to load";
  }
}
setInterval(updateNowPlaying, 5000);
updateNowPlaying();

// --- SECRET UNLOCK SYSTEM ---
const unlockBtn = document.getElementById("unlockBtn");
const secretCode = document.getElementById("secretCode");
const secretStatus = document.getElementById("secretStatus");
const secretContent = document.getElementById("secretContent");

// CHANGE THIS TO YOUR REAL SECRET CODE:
const CORRECT_CODE = "crios777";

unlockBtn.addEventListener("click", () => {
  const entered = secretCode.value.trim();

  if (!entered) {
    secretStatus.textContent = "Enter a code.";
    return;
  }

  if (entered === CORRECT_CODE) {
    secretStatus.textContent = "Unlocked!";
    secretContent.classList.remove("hidden");
  } else {
    secretStatus.textContent = "Incorrect code.";
  }
});
