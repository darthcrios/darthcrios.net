// ---------------------------------------------
// Tone.js Synth
// ---------------------------------------------
const synth = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 0.3
    }
}).toDestination();

const filter = new Tone.Filter(800, "lowpass").toDestination();
filter.Q.value = 1;

synth.connect(filter);

// ---------------------------------------------
// UI Controls
// ---------------------------------------------
document.getElementById("waveform").addEventListener("change", e => {
    synth.oscillator.type = e.target.value;
});

document.getElementById("attack").addEventListener("input", e => {
    synth.envelope.attack = parseFloat(e.target.value);
});

document.getElementById("decay").addEventListener("input", e => {
    synth.envelope.decay = parseFloat(e.target.value);
});

document.getElementById("sustain").addEventListener("input", e => {
    synth.envelope.sustain = parseFloat(e.target.value);
});

document.getElementById("release").addEventListener("input", e => {
    synth.envelope.release = parseFloat(e.target.value);
});

document.getElementById("filter").addEventListener("input", e => {
    filter.frequency.value = parseFloat(e.target.value);
});

document.getElementById("res").addEventListener("input", e => {
    filter.Q.value = parseFloat(e.target.value);
});

// ---------------------------------------------
// Keyboard
// ---------------------------------------------
const notes = [
    "C4", "D4", "E4", "F4", "G4", "A4", "B4",
    "C5", "D5", "E5"
];

const keyboardDiv = document.getElementById("keyboard");

notes.forEach(note => {
    const key = document.createElement("div");
    key.classList.add("key");
    key.textContent = note;

    key.addEventListener("mousedown", () => {
        synth.triggerAttack(note);
    });

    key.addEventListener("mouseup", () => {
        synth.triggerRelease();
    });

    keyboardDiv.appendChild(key);
});
