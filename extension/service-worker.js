let creatingOffscreen;

async function ensureOffscreen() {
  const url = chrome.runtime.getURL('offscreen.html');
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'], documentUrls: [url] });
  if (contexts.length) return;
  if (!creatingOffscreen) {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Procesar el audio de la pestaña activa con un ecualizador local.'
    });
  }
  await creatingOffscreen;
  creatingOffscreen = null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_CAPTURE') {
    (async () => {
      try {
        await ensureOffscreen();
        chrome.tabCapture.getMediaStreamId({ targetTabId: message.tabId }, streamId => {
          if (chrome.runtime.lastError) {
            sendResponse({ ok: false, error: chrome.runtime.lastError.message });
            return;
          }
          chrome.runtime.sendMessage({ type: 'ATTACH_STREAM', streamId });
          sendResponse({ ok: true });
        });
      } catch (error) { sendResponse({ ok: false, error: error.message }); }
    })();
    return true;
  }

  if (message.type === 'STOP_CAPTURE' || message.type === 'SET_GAINS' || message.type === 'SET_BYPASS') {
    chrome.runtime.sendMessage(message);
    sendResponse({ ok: true });
    return true;
  }
});
