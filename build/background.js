let start = 0;
let progress = 0;
let end = 0;
let startedRecordingAt = null;
let savedTime = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ start });
  chrome.storage.sync.set({ progress });
  chrome.storage.sync.set({ end });
  // chrome.storage.sync.set({ isTimerOn });
  chrome.storage.sync.set({ startedRecordingAt });
  chrome.storage.sync.set({ savedTime });
});
