let audioCtx;
let analyser;
let microphone;
let stream;
let loopId;

const SMOOTHING_FACTOR = 0.8;
let currentIntensity = 0;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'OFFSCREEN_START') {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new AudioContext();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      
      microphone = audioCtx.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyzeAudio();
    } catch (err) {
      console.error('Mic error:', err);
      chrome.storage.local.set({ isActive: false, screamIntensity: 0 });
    }
  } else if (message.action === 'OFFSCREEN_STOP') {
    if (loopId) cancelAnimationFrame(loopId);
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (audioCtx) audioCtx.close();
    chrome.storage.local.set({ screamIntensity: 0 });
  } else if (message.action === 'OFFSCREEN_PLAY_CHEAT') {
    playCheatSound();
  }
});

function analyzeAudio() {
  const dataArray = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(dataArray);

  let sumSquares = 0.0;
  for (const amplitude of dataArray) {
    sumSquares += amplitude * amplitude;
  }
  let rms = Math.sqrt(sumSquares / dataArray.length);
  
  let rawIntensity = Math.min(1.0, rms * 5.0);
  
  currentIntensity = (currentIntensity * SMOOTHING_FACTOR) + (rawIntensity * (1.0 - SMOOTHING_FACTOR));
  
  chrome.storage.local.set({ screamIntensity: currentIntensity });

  loopId = requestAnimationFrame(analyzeAudio);
}

function playCheatSound() {
  // Play a custom audio file named 'cheat.mp3' from the extension folder
  const audio = new Audio('cheat.mp3');
  audio.volume = 1.0;
  audio.play().catch(err => {
    console.error("Failed to play custom audio. Make sure 'cheat.mp3' exists in the folder.", err);
  });
}
