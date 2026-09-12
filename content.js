let hud;
let intensityBar;
let intensityText;
let statusText;
let overlay;

let isActive = false;
let scrollLoopId;
let currentIntensity = 0;
let lastCheatTime = 0;
const MAX_SCROLL_SPEED = 100; // pixels per frame at max intensity

// Setup UI
function setupUI() {
  if (document.getElementById('scream-scroll-hud')) return;
  
  hud = document.createElement('div');
  hud.id = 'scream-scroll-hud';
  hud.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 15px;
    border: 2px solid #ff3333;
    border-radius: 8px;
    z-index: 999999;
    font-family: monospace;
    pointer-events: none;
    width: 250px;
  `;
  
  hud.innerHTML = `
    <div style="font-weight:bold; color:#ff3333; margin-bottom:5px;">🎤 SCREAM POWER</div>
    <div style="background:#444; height:15px; width:100%; margin-bottom:5px;">
      <div id="scream-bar" style="background:#ff3333; height:100%; width:0%; transition:width 0.1s;"></div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
      <span id="scream-status">WHISPER</span>
      <span id="scream-text">0%</span>
    </div>
  `;
  
  document.body.appendChild(hud);
  
  intensityBar = document.getElementById('scream-bar');
  intensityText = document.getElementById('scream-text');
  statusText = document.getElementById('scream-status');
  
  // Cheat overlay
  overlay = document.createElement('div');
  overlay.id = 'scream-cheat-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 0, 0, 0.4);
    color: white;
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 9999999;
    font-family: 'Arial', sans-serif;
    font-size: 50px;
    font-weight: bold;
    text-shadow: 2px 2px 10px black;
    pointer-events: none;
  `;
  overlay.innerHTML = `
    <div>🚨 CHEATER DETECTED 🚨</div>
    <div style="font-size:30px; margin-top:20px;">USE YOUR VOCAL CORDS.</div>
  `;
  document.body.appendChild(overlay);
}

function updateHUD(intensity) {
  if (!hud) return;
  const pct = Math.floor(intensity * 100);
  intensityBar.style.width = pct + '%';
  intensityText.innerText = pct + '%';
  
  let msg = "WHISPER";
  if (intensity > 0.95) msg = "WHAT IS WRONG WITH YOU";
  else if (intensity > 0.8) msg = "SCREAMING";
  else if (intensity > 0.6) msg = "LOUD";
  else if (intensity > 0.4) msg = "NOT BAD";
  else if (intensity > 0.2) msg = "KEEP GOING";
  
  statusText.innerText = msg;
}

function removeUI() {
  if (hud) hud.remove();
  if (overlay) overlay.remove();
  hud = null;
  overlay = null;
}

function handleWheel(e) {
  if (!isActive) return;
  e.preventDefault();
  
  const now = Date.now();
  if (now - lastCheatTime > 1000) {
    lastCheatTime = now;
    chrome.runtime.sendMessage({action: 'PLAY_CHEAT_SOUND'});
    
    overlay.style.display = 'flex';
    setTimeout(() => {
      if (overlay) overlay.style.display = 'none';
    }, 1500);
  }
}

function scrollLoop() {
  if (!isActive) return;
  
  if (currentIntensity > 0.05) {
    let speedMult = 0;
    if (currentIntensity > 0.8) speedMult = 1.0;
    else if (currentIntensity > 0.6) speedMult = 0.6;
    else if (currentIntensity > 0.4) speedMult = 0.3;
    else if (currentIntensity > 0.2) speedMult = 0.1;
    else speedMult = 0.05;
    
    window.scrollBy(0, speedMult * MAX_SCROLL_SPEED);
  }
  
  scrollLoopId = requestAnimationFrame(scrollLoop);
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.isActive !== undefined) {
      isActive = changes.isActive.newValue;
      if (isActive) {
        setupUI();
        window.addEventListener('wheel', handleWheel, {passive: false});
        scrollLoopId = requestAnimationFrame(scrollLoop);
      } else {
        removeUI();
        window.removeEventListener('wheel', handleWheel, {passive: false});
        cancelAnimationFrame(scrollLoopId);
      }
    }
    if (changes.screamIntensity !== undefined && isActive) {
      currentIntensity = changes.screamIntensity.newValue;
      updateHUD(currentIntensity);
    }
  }
});

chrome.storage.local.get(['isActive', 'screamIntensity'], (res) => {
  if (res.isActive) {
    isActive = true;
    currentIntensity = res.screamIntensity || 0;
    setupUI();
    window.addEventListener('wheel', handleWheel, {passive: false});
    scrollLoopId = requestAnimationFrame(scrollLoop);
  }
});
