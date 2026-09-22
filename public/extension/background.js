const DEFAULTS = {
  enabled: true,
  rate: 1.02,
  pitch: 1,
  voiceURI: "",
  announceAuthor: true,
  autoAdvance: false,
  skipUrls: true,
  skipHashtags: false,
  readThread: true,
  includeQuote: true,
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(null);
  const patch = {};
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (stored[key] === undefined) patch[key] = value;
  }
  if (Object.keys(patch).length) await chrome.storage.sync.set(patch);

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "speakx-selection",
      title: "Speak selection with SpeakX",
      contexts: ["selection"],
      documentUrlPatterns: ["https://x.com/*", "https://twitter.com/*"],
    });
  });
});

function sendToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;
    const url = tab.url ?? "";
    if (!/^https:\/\/(x|twitter)\.com\//.test(url)) return;
    chrome.tabs.sendMessage(tab.id, message, () => {
      void chrome.runtime.lastError;
    });
  });
}

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "speakx-selection") return;
  const text = (info.selectionText || "").trim();
  if (!text) return;
  sendToActiveTab({ type: "SPEAK_TEXT", text });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "speak-post") sendToActiveTab({ type: "SPEAK_CURRENT" });
  if (command === "stop-speaking") sendToActiveTab({ type: "STOP" });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "GET_SETTINGS") {
    chrome.storage.sync.get(DEFAULTS).then((settings) => sendResponse(settings));
    return true;
  }
  if (message?.type === "SET_SETTINGS") {
    chrome.storage.sync.set(message.settings ?? {}).then(() => {
      sendToActiveTab({ type: "SETTINGS_UPDATED" });
      sendResponse({ ok: true });
    });
    return true;
  }
  if (message?.type === "FORWARD_ACTIVE") {
    sendToActiveTab(message.payload);
    sendResponse({ ok: true });
    return false;
  }
  return false;
});
