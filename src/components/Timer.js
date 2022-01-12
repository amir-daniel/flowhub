/*global chrome*/
import { useEffect } from "react";

const Timer = (props) => {
  const tickHandler = () => {
    props.onTick();
  };

  const startHandler = () => {
    if (props.timerID === false) {
      props.modifyTimerID(
        setInterval(() => {
          tickHandler();
        }, 1000)
      );
    }
  };

  useEffect(() => {
    chrome.storage.sync.get(["startedRecordingAt", "savedTime"], (data) => {
      if (data.startedRecordingAt !== null && data.savedTime === null) {
        startHandler();
      }
    });
  }, []);

  return (
    <button
      autoFocus={props.autoFocus}
      onClick={() => {
        if (props.timerID === false) {
          startHandler();
        } else {
          // ascend action
          props.onAscend();
        }
      }}
      disabled={!props.enabled}
    >
      {props.timerID === false ? "Record" : "Ascend!"}
    </button>
  );
};

export default Timer;
