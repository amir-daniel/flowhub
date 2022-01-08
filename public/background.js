let start = 0;
let progress = 0;
let end = 0;
let startedRecordingAt = null;
let savedTime = null;
let timerName = "timer";
let etaMode = false;

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

const getETA = () => {
  let totalProgress = props.progress - props.itemMin;
  let progressLeft = props.itemMax - props.progress;
  let totalMins = props.time.current / 60;

  if (
    !props.timerID.current &
    (props.progress === props.itemMin ||
      props.itemMax != props.progress ||
      props.progress === null || // these 3 nulls are to wait for the data to load
      props.itemMax === null ||
      props.itemMin === null)
  ) {
    return "";
  }

  if (
    props.timerID.current &&
    (props.time.current < 1 || totalProgress === 0)
  ) {
    return " ∞";
  }

  if (progressLeft === 0) {
    if (props.timerID.current) {
      // probably redundant since button disabled, remove in the future
      clearInterval(props.timerID.current);
      props.setTimerID(false);

      chrome.storage.sync.set({
        // does it even go into effect?
        startedRecordingAt: null,
        savedTime: props.time.current,
      });
    }
    return " ✅";
  }

  let paceInMins = totalProgress / totalMins;
  let minsPerItem = 1 / paceInMins;
  let minsLeft = minsPerItem * progressLeft;
  let millisecondsLeft = minsLeft * 60 * 1000;
  let ETADate =
    props.itemMin === null || props.progress === null || props.itemMax === null
      ? 0
      : new Date(Date.now() + millisecondsLeft);
  let dateFormatted = (
    <span>
      {" "}
      <AnimatedCounter
        key={"h"}
        value={ETADate === 0 ? 0 : ETADate.getHours()}
        inc={1}
        refreshRate={24}
        callback={designDigit}
      />
      :
      <AnimatedCounter
        key={"m"}
        value={ETADate === 0 ? 0 : designDigit(ETADate.getMinutes())}
        inc={1}
        refreshRate={8}
        callback={designDigit}
      />
    </span>
  );

  return dateFormatted;
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ start });
  chrome.storage.sync.set({ progress });
  chrome.storage.sync.set({ end });
  chrome.storage.sync.set({ startedRecordingAt });
  chrome.storage.sync.set({ savedTime });
});

chrome.commands.onCommand.addListener((command) => {
  chrome.storage.sync.get(["start", "progress", "end"], (data) => {
    chrome.notifications.create({
      type: "progress",
      iconUrl: "/images/get_started128.png",
      title: "River",
      message: `Hi there, just wanted to let you know that your progress
      is staggering, and you are destined to be done at ${s}.`,
      progress:
        data.end === 0
          ? 0
          : Math.floor(
              ((data.progress - data.start) / (data.end - data.start)) * 100
            ),
    });

    if (data.startedRecordingAt !== null || data.savedTime === null) {
      chrome.action.setBadgeText({
        text: beautifyForBadge((Date.now() - data.startedRecordingAt) / 1000),
      });
      scheduleAlarm();
    }
  });

  chrome.storage.sync.set({ start });
  chrome.storage.sync.set({ progress });
  chrome.storage.sync.set({ end });
  chrome.storage.sync.set({ startedRecordingAt });
  chrome.storage.sync.set({ savedTime });
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
