document.getElementById('allow-btn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = "Waiting for permission...";
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Permission granted! Stop the stream immediately since we just needed the permission.
    stream.getTracks().forEach(track => track.stop());
    
    statusEl.style.color = '#4CAF50';
    statusEl.textContent = "✅ Permission Granted! You can close this tab and use the extension.";
  } catch (err) {
    statusEl.style.color = '#ff3333';
    statusEl.textContent = "❌ Error: " + err.message + ". Please try again or check Chrome settings.";
  }
});
