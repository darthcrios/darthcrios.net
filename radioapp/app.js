/* FULL UPDATED APP.JS WITH REALTIME CHAT, TYPING, COLORS, TIMESTAMPS */

const playPauseBtn = document.getElementById("playPauseBtn");
const radioAudio = document.getElementById("radioAudio");

const sendBtn = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");
const chatBox = document.getElementById("chatBox");
const typingIndicator = document.getElementById("typingIndicator");

const usernameSetup = document.getElementById("usernameSetup");
const usernameInput = document.getElementById("usernameInput");
const saveUsernameBtn = document.getElementById("saveUsernameBtn");

const chatPing = document.getElementById("chatPing");

let username = localStorage.getItem("criosUsername");
let typingTimeout;
let lastMsgCount = 0;

/* USERNAME */
if (username) {
  usernameSetup.style.display = "none";
  startChatListener();
  listenForTyping();
}

saveUsernameBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) return;
  localStorage.setItem("criosUsername", username);
  usernameSetup.style.display = "none";

  startChatListener();
  listenForTyping();
});

/* RADIO */
playPauseBtn.addEventListener("click", () => {
  if (radioAudio.paused) {
    radioAudio.play();
    playPauseBtn.textContent = "Pause";
  } else {
    radioAudio.pause();
    playPauseBtn.textContent = "Play";
  }
});

/* USERNAME COLOR */
function usernameColor(name) {
  const colors = ["#e60000", "#a259ff", "#4ade80", "#60a5fa", "#facc15"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/* TIMESTAMP */
function formatTimestamp(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* SEND MESSAGE */
sendBtn.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text || !username) return;

  await firebaseAddDoc(firebaseCollection(db, "messages"), {
    username,
    text,
    timestamp: new Date()
  });

  chatInput.value = "";
  setTyping(false);
});

/* REALTIME CHAT LISTENER */
function startChatListener() {
  const q = firebaseQuery(
    firebaseCollection(db, "messages"),
    firebaseOrderBy("timestamp", "asc")
  );

  firebaseOnSnapshot(q, (snapshot) => {
    const docs = snapshot.docs;

    if (docs.length > lastMsgCount && lastMsgCount > 0) {
      chatPing.play().catch(()=>{});
    }

    lastMsgCount = docs.length;

    chatBox.innerHTML = "";

    docs.forEach((doc) => {
      const msg = doc.data();
      if (!msg.timestamp) return;

      const div = document.createElement("div");
      div.classList.add("chat-message");

      div.innerHTML = `
        <span class="chat-username" style="color:${usernameColor(msg.username)}">
          ${msg.username}:
        </span>
        <span class="chat-text">${msg.text}</span>
        <span class="chat-timestamp">
          ${formatTimestamp(msg.timestamp.toDate())}
        </span>
      `;

      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

/* TYPING INDICATOR */
function setTyping(state) {
  firebaseSetDoc(
    firebaseDoc(db, "typing", username),
    { isTyping: state },
    { merge: true }
  );
}

chatInput.addEventListener("input", ()=> {
  setTyping(true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(()=> setTyping(false), 2000);
});

function listenForTyping() {
  firebaseFireSnapshot(firebaseCollection(db, "typing"), (snapshot)=> {
    const typers = [];

    snapshot.forEach((doc)=> {
      const d = doc.data();
      if (d.isTyping && doc.id !== username) {
        typers.push(doc.id);
      }
    });

    typingIndicator.textContent =
      typers.length ? `${typers.join(", ")} is typing…` : "";
  });
}
