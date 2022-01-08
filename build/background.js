let start = 0;
let progress = 0;
let end = 0;
let startedRecordingAt = null;
let savedTime = null;
let timerName = "timer";

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

const scheduleAlarm = () => {
  let alarmInfo = {
    when: Date.now() + 1000,
  };
  chrome.alarms.create(timerName, alarmInfo);
};

const onTick = () => {
  chrome.storage.sync.get(["startedRecordingAt", "savedTime"], (data) => {
    if (data.startedRecordingAt !== null || data.savedTime === null) {
      chrome.action.setBadgeText({
        text: beautifyForBadge((Date.now() - data.startedRecordingAt) / 1000),
      });
      scheduleAlarm();
    }
  });
};

const updateTimerState = (startedRecordingAt, savedTime) => {
  chrome.storage.sync.get(
    ["startedRecordingAt", "savedTime", "start", "progress", "end"],
    (data) => {
      startedRecordingAt = data.startedRecordingAt;
      savedTime = data.savedTime;

      if (startedRecordingAt === null) {
        // not recording
        if (data.end === data.progress && data.progress !== data.start) {
          chrome.action.setBadgeBackgroundColor({ color: "#50C878" }); // green color
        } else {
          chrome.action.setBadgeBackgroundColor({ color: "#777" }); // grey color
        }

        if (savedTime !== null) {
          chrome.action.setBadgeText({
            text: beautifyForBadge(savedTime),
          });
        } else {
          chrome.action.setBadgeText({ text: "?" });
        }
      } else {
        chrome.action.setBadgeBackgroundColor({ color: "#800000" }); // red color
        scheduleAlarm();
      }
    }
  );
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ start });
  chrome.storage.sync.set({ progress });
  chrome.storage.sync.set({ end });
  chrome.storage.sync.set({ startedRecordingAt });
  chrome.storage.sync.set({ savedTime });
});

chrome.commands.onCommand.addListener((command) => {
  chrome.notifications.create({
    type: "progress",
    iconUrl: "/images/get_started128.png",
    title: "lol 2",
    message: "hi lol",
    progress: 50,
  });
  // notifications.create
  // (optional string notificationId, notifications.NotificationOptions options, optional function callback):
  // Error at parameter 'options': Error at property 'type':
  // Value must be one of basic, image, list, progress.
});

chrome.alarms.onAlarm.addListener(onTick);

chrome.runtime.onStartup.addListener(updateTimerState);

chrome.storage.onChanged.addListener((changes) => {
  if ("startedRecordingAt" in changes) {
    if (changes.startedRecordingAt.newValue === null) {
      // recording stopped, clear timer
      chrome.alarms.clear(timerName);
    }
  }

  if ("savedTime" in changes || "startedRecordingAt" in changes) {
    updateTimerState(); // update label
  }
});
