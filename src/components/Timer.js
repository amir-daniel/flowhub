/*global chrome*/
import { useEffect } from "react";

const Timer = (props) => {
  const tickHandler = () => {
    props.onTick();
    // if (props.autoFocus !== false) {   <-------- now deprecated
    //   inputRef?.current.focus();
    // }
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
      ref={props.submitRef}
      // autoFocus={props.autoFocus}
      autoFocus="true"
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
      {props.timerID === false ? "Record" : "Harvest"}
    </button>
  );
};

export default Timer;
