document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const statusText = document.getElementById('status-text');
  const powerFill = document.getElementById('power-fill');
  const powerText = document.getElementById('power-text');
  const speedText = document.getElementById('speed-text');

  let updateInterval = null;

  startBtn.addEventListener('click', async () => {
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    statusText.textContent = 'SCREAMING ACTIVATED';
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Mic error:", err);
      if (err.message.toLowerCase().includes('dismissed') || err.name === 'NotAllowedError') {
        statusText.textContent = 'OPENING SETUP TAB...';
        chrome.tabs.create({ url: 'setup.html' });
      } else {
        statusText.textContent = 'MIC ERROR: ' + err.message;
      }
      setTimeout(resetUI, 2000);
      return;
    }

    // Set isActive immediately to avoid a race condition where the polling
    // interval reads it as undefined/false and immediately resets the UI.
    chrome.storage.local.set({ isActive: true }, () => {
      chrome.runtime.sendMessage({ action: 'START_SCREAM' });
      startPolling();
    });
  });

  stopBtn.addEventListener('click', () => {
    resetUI();
    chrome.runtime.sendMessage({ action: 'STOP_SCREAM' });
  });

  function resetUI() {
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    statusText.textContent = 'INACTIVE';
    powerFill.style.width = '0%';
    powerText.textContent = '0%';
    speedText.textContent = 'NONE';
    stopPolling();
  }

  function startPolling() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => {
      chrome.storage.local.get(['screamIntensity', 'isActive'], (res) => {
        if (!res.isActive) {
          resetUI();
          return;
        }
        
        let intensity = res.screamIntensity || 0;
        let percent = Math.floor(intensity * 100);
        powerFill.style.width = percent + '%';
        powerText.textContent = percent + '%';
        
        let speed = "NONE";
        if (intensity > 0.8) speed = "EXTREME";
        else if (intensity > 0.6) speed = "FAST";
        else if (intensity > 0.4) speed = "MEDIUM";
        else if (intensity > 0.2) speed = "SLOW";
        else if (intensity > 0.05) speed = "VERY SLOW";
        
        speedText.textContent = speed;
      });
    }, 100);
  }

  function stopPolling() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }

  // Check initial state
  chrome.storage.local.get(['isActive'], (res) => {
    if (res.isActive) {
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
      statusText.textContent = 'SCREAMING ACTIVATED';
      startPolling();
    }
  });
});
