let offscreenCreating = null;

async function setupOffscreenDocument(path) {
  if (await chrome.offscreen.hasDocument()) return;
  if (offscreenCreating) {
    await offscreenCreating;
    return;
  }
  offscreenCreating = chrome.offscreen.createDocument({
    url: path,
    reasons: ['USER_MEDIA', 'AUDIO_PLAYBACK'],
    justification: 'Listen to microphone for scream scroll and play cheat sound'
  });
  await offscreenCreating;
  offscreenCreating = null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'START_SCREAM') {
    chrome.storage.local.set({ isActive: true }, async () => {
      await setupOffscreenDocument('offscreen.html');
      chrome.runtime.sendMessage({ action: 'OFFSCREEN_START' });
      
      // Inject content script into active tab
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] && tabs[0].url.startsWith('http')) {
          chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            files: ['content.js']
          }).catch(err => console.log('Inject error:', err));
        }
      });
    });
  } else if (message.action === 'STOP_SCREAM') {
    chrome.storage.local.set({ isActive: false }, () => {
      chrome.runtime.sendMessage({ action: 'OFFSCREEN_STOP' });
      chrome.offscreen.closeDocument().catch(() => {});
    });
  } else if (message.action === 'PLAY_CHEAT_SOUND') {
    chrome.runtime.sendMessage({ action: 'OFFSCREEN_PLAY_CHEAT' });
  }
});
