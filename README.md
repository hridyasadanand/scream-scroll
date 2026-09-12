# SCREAM SCROLL 🎤😱

A deliberately useless/funny Chrome extension where you must scream into your microphone to scroll webpages.

"Your voice is now your mouse."

## Features

- Uses the Web Audio API to measure microphone intensity.
- The louder you scream, the faster the webpage scrolls.
- Prevents manual mouse-wheel scrolling while active.
- Plays a funny "CHEATER!" sound and shows an overlay if you try to use the mouse wheel.
- Persists across popup closures using Manifest V3 Offscreen API.
- Small non-intrusive HUD to show your scream power.

## Architecture

- **Manifest V3** compatible.
- **Popup (`popup.html`/`js`)**: UI to start/stop the extension.
- **Background Service Worker (`background.js`)**: Manages state and launches the offscreen document.
- **Offscreen Document (`offscreen.html`/`js`)**: Persistently listens to the microphone using `getUserMedia` and calculates the RMS volume, saving it to `chrome.storage.local` at 60fps.
- **Content Script (`content.js`)**: Injected into web pages to read the volume from storage, scroll the page via `requestAnimationFrame`, intercept the `wheel` event, and display the visual HUD overlay.

## Installation

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer Mode** in the top right corner.
3. Click **Load unpacked** and select the `scream-scroll` folder.
4. Pin the extension to your toolbar for easy access.

## Usage

1. Open any webpage (e.g., a long Wikipedia article).
2. Click the **SCREAM SCROLL** icon in your toolbar.
3. Click **🎤 START SCREAMING**.
4. Allow microphone access when prompted (if not previously allowed).
5. Start making noise! The louder you are, the faster the page scrolls.
6. Try scrolling with your mouse wheel while it's active. I dare you.
7. Click **STOP** in the popup to disable the extension.

## Limitations

- Does not work on special Chrome pages (e.g., `chrome://` or the Chrome Web Store) due to Chrome security policies (content scripts cannot be injected there).
- Microphone access is required. It requires an active microphone connected to the PC.
- Performance: Writes to `chrome.storage.local` heavily. In a real-world high-performance application, setting up a message port directly between offscreen and content script would be better, but storage works fine for this local funny extension.

## Developer

No frameworks, no npm, no backend. Just pure vanilla JavaScript, HTML, CSS, and Chrome APIs.
