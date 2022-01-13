let start = 0;
let progress = 0;
let end = 0;
let totalSeconds = 0;
let startedRecordingAt = null;
let savedTime = null;
let timerName = "timer";
let etaMode = false;
let userName = "River";
let itemName = null;
const ELAPSED_MODE = 0;
const ETA_MODE = 1;
let mode = 0; // for now it's local, and not accessable from the popup
const unknownETAChar = "∞";

const showErrorMsg = (msg) => {
  chrome.notifications.create({
    type: "progress",
    iconUrl: "/images/get_started128.png",
    title: "River",
    message: msg,
    progress: 0,
  });
};

const stopRecordingAndWriteOut = async (
  itemID,
  start,
  current,
  end,
  integrationEnabled
) => {
  if (integrationEnabled === true) {
    let query5 = `mutation ($data: JSON!) {
        change_multiple_column_values(board_id: 1774709998, item_id: ${itemID}, column_values: $data) {
          id
        }
      }`;
    let vars;
    vars =
      start === current
        ? {
            data: JSON.stringify({
              status:
                end === current && start !== end
                  ? "Quest Complete"
                  : "Quest in Progress",
            }),
          }
        : {
            data: JSON.stringify({
              status:
                end === current && start !== end
                  ? "Quest Complete"
                  : "Quest in Progress",
              numbers: +current,
            }),
          };

    fetch("https://api.monday.com/v2", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjE0MDU3ODMyNSwidWlkIjoxMjcyNjA0NSwiaWFkIjoiMjAyMi0wMS0xMlQxOTo1MDo0NS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTcwMTM4MCwicmduIjoidXNlMSJ9.fUP-1slk9PDDvoQtb1XgiSzMyOMbmCZbeDMnQZ_UyEU",
      },
      body: JSON.stringify({
        query: query5,
        variables: JSON.stringify(vars),
      }),
    })
      .then((res) => res.json())
      .catch((res) => {
        showErrorMsg("Connection error while trying to sync items to Monday!");
        return "force-hide";
      })
      .then((res) => {
        let responseString = JSON.stringify(res, null, 2);
        if (responseString.includes("error")) {
          showErrorMsg(
            "Item update was rejected by Monday! They said this: " +
              responseString
          );
          return "force-hide";
        } else {
          showErrorMsg("Item sync was successful!");
          return false;
        }
      })
      .catch((res) => {
        showErrorMsg("Processing error while trying to sync items to Monday!");
        return "force-hide";
      });
  }
};

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
  chrome.storage.sync.get(
    [
      "startedRecordingAt",
      "savedTime",
      "totalSeconds",
      "start",
      "progress",
      "end",
      "mode",
    ],
    (data) => {
      if (data.startedRecordingAt !== null || data.savedTime === null) {
        // started recording
        if (data.mode === ELAPSED_MODE) {
          chrome.action.setBadgeText({
            text: beautifyForBadge(
              (Date.now() - data.startedRecordingAt) / 1000
            ),
          });
        } else {
          chrome.action.setBadgeText({
            text: getETA(
              data.progress,
              data.start,
              data.end,
              (Date.now() - data.startedRecordingAt) / 1000
            ),
          });
        }

        // chrome.storage.sync.set({ totalSeconds: data.totalSeconds + 1 });
        scheduleAlarm();
      }
    }
  );
};

const updateTimerState = () => {
  chrome.storage.sync.get(
    ["startedRecordingAt", "savedTime", "start", "progress", "end", "mode"],
    (data) => {
      if (data.startedRecordingAt === null) {
        // not recording
        if (data.end === data.progress && data.progress !== data.start) {
          chrome.action.setBadgeBackgroundColor({ color: "#50C878" }); // green color
        } else {
          chrome.action.setBadgeBackgroundColor({ color: "#777" }); // grey color
        }

        if (data.savedTime !== null) {
          // not recording but some time is saved
          if (data.mode === 0) {
            chrome.action.setBadgeText({
              text: beautifyForBadge(data.savedTime),
            });
          } else {
            chrome.action.setBadgeText({
              // show infinity as ETA in that case
              text: unknownETAChar,
            });
          }
        } else {
          // not recording but no time is saved
          chrome.action.setBadgeText({ text: "?" });
        }
      } else {
        if (data.mode === 0) {
          chrome.action.setBadgeBackgroundColor({ color: "#800000" }); // red color
        } else {
          chrome.action.setBadgeBackgroundColor({ color: "#D4AF37" }); // gold color (could also try b30086,6a0dad,EEBC1D)
        }
        scheduleAlarm();
      }
    }
  );
};

const getETA = (progress, itemMin, itemMax, time) => {
  let totalProgress = progress - itemMin;
  let progressLeft = itemMax - progress;
  let totalMins = time / 60;

  if (
    time < 1 ||
    totalProgress === 0
    // an arbitrary value of time < 1 second was chosen
    // to designate inaccurate or insufficient enough data to provide ETA
  ) {
    return unknownETAChar;
  }

  let paceInMins = totalProgress / totalMins;
  let minsPerItem = 1 / paceInMins;
  let minsLeft = minsPerItem * progressLeft;
  let millisecondsLeft = minsLeft * 60 * 1000;
  let ETADate =
    itemMin === null || progress === null || itemMax === null
      ? null
      : new Date(Date.now() + millisecondsLeft);

  let dateFormatted =
    ETADate === null
      ? unknownETAChar
      : designDigit(ETADate.getHours()) +
        ":" +
        designDigit(ETADate.getMinutes());

  return dateFormatted;
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ start });
  chrome.storage.sync.set({ progress });
  chrome.storage.sync.set({ end });
  chrome.storage.sync.set({ startedRecordingAt });
  chrome.storage.sync.set({ savedTime });
  chrome.storage.sync.set({ userName });
  chrome.storage.sync.set({ totalSeconds });
  chrome.storage.sync.set({ mode });
  chrome.storage.sync.set({ itemName });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "change-view") {
    chrome.storage.sync.get(["mode"], (data) => {
      chrome.storage.sync.set({
        mode: data.mode === ELAPSED_MODE ? ETA_MODE : ELAPSED_MODE,
      });
    });
  } else if (command === "progress-up") {
    chrome.storage.sync.get(
      ["start", "progress", "end", "startedRecordingAt", "savedTime", "mode"],
      (data) => {
        if (data.progress < data.end && data.startedRecordingAt !== null) {
          chrome.storage.sync.set({ progress: data.progress + 1 });
          // don't forget to update in Timer.js the checker
          chrome.notifications.create({
            type: "progress",
            iconUrl: "/images/get_started128.png",
            title: "River",
            message: `Hi there, just wanted to let you know that your progress ${
              data.progress + 1 === data.end // it's progress + 1,
                ? // noticed that we incremented it a few lines ago
                  "was staggering, and you are done! ✅"
                : data.mode === 0
                ? `is staggering, and you are destined to be done at ${getETA(
                    data.progress + 1,
                    data.start,
                    data.end,
                    (Date.now() - data.startedRecordingAt) / 1000
                  )}.`
                : `is staggering, and you have already amassed a time of ${beautifyForBadge(
                    (Date.now() - data.startedRecordingAt) / 1000
                  )}.`
            } `,
            progress:
              data.end === 0
                ? 0
                : Math.floor(
                    ((data.progress + 1 - data.start) /
                      (data.end - data.start)) *
                      100
                  ),
          });
          if (data.progress + 1 === data.end) {
            chrome.alarms.clearAll();
            chrome.storage.sync.set(
              {
                startedRecordingAt: null,
                savedTime: (Date.now() - data.startedRecordingAt) / 1000,
              },
              () => {
                updateTimerState();
              }
            );
          }
        } else {
          chrome.notifications.create({
            type: "progress",
            iconUrl: "/images/get_started128.png",
            title: "River",
            message: "Something went wrong!",
            progress: 0,
          });
        }
      }
    );
  }
});

chrome.alarms.onAlarm.addListener(onTick);

chrome.runtime.onStartup.addListener(updateTimerState);

chrome.storage.onChanged.addListener((changes) => {
  if ("startedRecordingAt" in changes) {
    if (changes.startedRecordingAt.newValue === null) {
      // recording stopped, clear timer
      chrome.alarms.clear(timerName);

      chrome.storage.sync.get(
        ["startedRecordingAt", "start", "progress", "end", "itemName"],
        (data) => {
          if (data?.itemName?.id !== undefined) {
            // notice that if value changes manually through popup while recording is not on, syncing will not take place
            console.log(data.progress);
            stopRecordingAndWriteOut(
              data.itemName?.id,
              data.start,
              data.progress,
              data.end,
              true // ARABIC WORK cancel this when saving a version for daniel
            );
          }
        }
      );
    }
  }

  if (
    "savedTime" in changes ||
    "startedRecordingAt" in changes ||
    "mode" in changes ||
    "end" in changes // research later further if this causes any nasty bug or over refreshing
  ) {
    updateTimerState(); // update label
  }
});
