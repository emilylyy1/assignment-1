// Little Keys uses the Web Audio API to create notes without extra audio files.
const keys = document.querySelectorAll(".key");
const statusText = document.querySelector("#status");
const soundToggle = document.querySelector("#sound-toggle");
const surpriseButton = document.querySelector("#surprise-button");
let audioContext;
let soundOn = true;
const baseFrequency = 261.63;
const noteNames = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti", "Do!"];

function playNote(note, keyButton) {
  // Browsers start audio after a user gesture, so create the audio context here.
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      statusText.textContent = "Audio is not supported in this browser.";
      return;
    }
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  if (soundOn) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = baseFrequency * Math.pow(2, note / 12);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.48);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  }
  keyButton.classList.add("is-playing");
  window.setTimeout(() => keyButton.classList.remove("is-playing"), 150);
  statusText.textContent = `You played ${noteNames[Array.from(keys).indexOf(keyButton)] || "a note"}!`;
}

keys.forEach((key) => {
  key.addEventListener("click", () => playNote(Number(key.dataset.note), key));
});

document.addEventListener("keydown", (event) => {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
  const letter = event.key.toUpperCase();
  const keyButton = Array.from(keys).find((key) => key.dataset.letter === letter);
  if (keyButton) {
    event.preventDefault();
    playNote(Number(keyButton.dataset.note), keyButton);
  }
});

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "♫ Sound: on" : "♫ Sound: off";
  soundToggle.setAttribute("aria-pressed", String(!soundOn));
  statusText.textContent = soundOn ? "Sound is on. Choose a colour to play!" : "Sound is off. You can still explore the keys.";
});

surpriseButton.addEventListener("click", () => {
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  playNote(Number(randomKey.dataset.note), randomKey);
});
