/*global chrome*/
import { useEffect } from "react";
const Timer = (props) => {
  const tickHandler = () => {
    props.onTick();
  };

  const startHandler = () => {
    if (props.timerID.current === false) {
      props.modifyTimerID(
        setInterval(() => {
          tickHandler();
        }, 1000)
      );
      chrome.storage.sync.get(["startedRecordingAt", "savedTime"], (data) => {
        if (data.startedRecordingAt === null && data.savedTime === null) {
          chrome.storage.sync.set({
            startedRecordingAt: Date.now(),
          });
        } else {
          chrome.storage.sync.get(["startedRecordingAt"], (data) => {});

          chrome.storage.sync.set({
            startedRecordingAt: Date.now() - props.value.current * 1000,
            savedTime: null,
          });
        }
      });
    }
  };

  const stopHandler = () => {
    clearInterval(props.timerID.current);
    props.modifyTimerID(false);

    chrome.storage.sync.set({
      startedRecordingAt: null,
    });

    chrome.storage.sync.set({
      savedTime: props.value.current,
    });
  };

  const resetHandler = () => {
    stopHandler(); // pause time recording
    props.onTick(true); // remove time recorded -> reset === true

    chrome.storage.sync.set({
      startedRecordingAt: null,
      savedTime: null,
    });
  };

  useEffect(() => {
    chrome.storage.sync.get(["startedRecordingAt", "savedTime"], (data) => {
      if (data.startedRecordingAt !== null && data.savedTime === null) {
        startHandler();
      }
    });
  }, []);

  return (
    <span>
      <button disabled={props.value.current < 1} onClick={resetHandler}>
        ⏹️
      </button>
      <button disabled={!props.timerID.current} onClick={stopHandler}>
        ⏸️
      </button>
      <button disabled={props.timerID.current} onClick={startHandler}>
        ▶️
      </button>
    </span>
  );
};

export default Timer;
