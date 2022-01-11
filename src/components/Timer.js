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
      onClick={() => {
        if (props.timerID.current === false) {
          startHandler();
        } else {
          props.onPause();
        }
      }}
    >
      {props.timerID.current === false ? "Record" : "Pause"}
    </button>
  );
};

export default Timer;
