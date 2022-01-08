let start = 0;
let progress = 0;
let end = 0;
let startedRecordingAt = null;
let savedTime = null;
let timerID = null;

const designDigit = (num) => (+num < 10 ? "0" + num : num);

const destructureSeconds = (time) => {
  time = Math.floor(time); // round time received in seconds

  let sec = designDigit(time % 60);
  let min = designDigit(((time - sec) / 60) % 60);
  let hr = (time - sec - 60 * min) / 3600;

  return [hr, min, sec];
};

const beautifyForBadge = (time) => {
  let timeInMin = time / 60;
  let [hr, min, sec] = destructureSeconds(time);

  if (timeInMin < 60) {
    // less than an hour recorded
    return min + ":" + sec;
  } else {
    // at least an hour recorded
    return hr + ":" + min;
  }
};

const updateTimerState = (startedRecordingAt, savedTime) => {
  chrome.storage.sync.get(["startedRecordingAt", "savedTime"], (data) => {
    startedRecordingAt = data.startedRecordingAt;
    savedTime = data.savedTime;

    if (startedRecordingAt === null) {
      // not recording
      chrome.action.setBadgeBackgroundColor({ color: "#777" }); // grey color
      if (savedTime !== null) {
        chrome.action.setBadgeText({
          text: beautifyForBadge(savedTime),
        });
      } else {
        chrome.action.setBadgeText({ text: "?" });
      }
    } else {
      chrome.action.setBadgeBackgroundColor({ color: "#800000" }); // red color
      timerID = setInterval(onTick, 1000);
    }
  });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ start });
  chrome.storage.sync.set({ progress });
  chrome.storage.sync.set({ end });
  chrome.storage.sync.set({ startedRecordingAt });
  chrome.storage.sync.set({ savedTime });
  // chrome.action.setBadgeBackgroundColor({ color: "#953553" });
  // updateTimerState();
});

chrome.runtime.onStartup.addListener(updateTimerState);

const onTick = () => {
  chrome.storage.sync.get(["startedRecordingAt", "savedTime"], (data) => {
    if (data.startedRecordingAt !== null && data.savedTime === null) {
      chrome.action.setBadgeText({
        text: beautifyForBadge((Date.now() - data.startedRecordingAt) / 1000),
      });
    }
  });
};

chrome.storage.onChanged.addListener((changes, namespace) => {
  if ("startedRecordingAt" in changes) {
    if (changes.startedRecordingAt.newValue === null) {
      // recording stopped, clear timer
      clearInterval(timerID);
    }
  }

  if ("savedTime" in changes || "startedRecordingAt" in changes) {
    updateTimerState(); // update label
  }
});
