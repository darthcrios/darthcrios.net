const input = document.getElementById("terminal-input");
const output = document.getElementById("output");
const audio = document.querySelector("audio");
const loreSection = document.getElementById("lore-archive");
const blogSection = document.getElementById("blog-feed");

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const command = input.value.trim();
    processCommand(command);
    input.value = "";
  }
});

function processCommand(command) {
  switch (command.toLowerCase()) {
    case "help":
      printLine("Available commands: help, decrypt archive, play stream, latest log, contact");
      break;
    case "decrypt archive":
      printLine("Decrypting... ✅ The Archive is Unlocked.");
      loreSection.style.display = "block";
      break;
    case "play stream":
      printLine("🔊 Stream Activated.");
      audio.play();
      break;
    case "latest log":
      printLine("Opening Log Feed...");
      blogSection.style.display = "block";
      break;

    case "contact":
      printLine("📡 Contact: management@darthcrios.net or @darthcrios");
      break;

    default:
      printLine(`Unknown command: "${command}"`);
  }
}

function printLine(text) {
  output.innerText += `\n${text}`;
  output.scrollTop = output.scrollHeight;
}
