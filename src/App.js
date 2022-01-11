/*global chrome*/
import "./App.css";
import NumberInput from "./components/NumberInput";
import Timer from "./components/Timer";
import { useState, useEffect, useRef, useReducer } from "react";

function App() {
  // ETA Mode (Forward Looking),
  // Sequential Mode (Time Elapsed)

  const filterInput = (newInput, oldInput) => {
    if (+newInput === 0) {
      return "";
    }
    return Number.isInteger(+newInput) ? +newInput : +oldInput;
  };

  const dataReducer = (state, action) => {
    let newVal;
    if (action.type === "USER_INITIALIZE") {
      return {
        start: filterInput(action.start, undefined),
        current: filterInput(action.current, undefined),
        end: filterInput(action.end, undefined),
        time: action.time,
        total: action.total,
        timerID: state.timerID,
      };
    } else if (action.type === "USER_ADDTIME") {
      return {
        start: state.start,
        current: state.current,
        end: state.end,
        time: +state.time + action.time,
        total: state.total,
        timerID: state.timerID,
      };
    } else if (action.type === "START_CHANGE") {
      newVal = filterInput(+action.value, +state.start);
      return {
        start: newVal,
        current: newVal > +state.current ? newVal : +state.current,
        end: newVal > +state.end ? newVal : state.end,
        time: state.time,
        total: state.total,
        timerID: state.timerID,
      };
    } else if (action.type === "CURRENT_CHANGE") {
      newVal = filterInput(+action.value, +state.current);
      return {
        start: newVal < +state.start ? newVal : +state.start,
        current: newVal,
        end: newVal > +state.end ? newVal : +state.end,
        time: state.time,
        total: state.total,
        timerID: state.timerID,
      };
    } else if (action.type === "END_CHANGE") {
      newVal = filterInput(+action.value, +state.end);
      return {
        start: newVal < +state.start ? newVal : state.start,
        current: newVal < +state.current ? newVal : state.current,
        end: newVal,
        time: state.time,
        total: state.total,
        timerID: state.timerID,
      };
    } else if (action.type === "TOTAL_UPDATE") {
      return {
        start: state.start,
        current: state.current,
        end: state.end,
        time: state.time,
        total: action.value,
        timerID: state.timerID,
      };
    } else if (action.type === "TIME_RESET") {
      clearInterval(state.timerID);
      return {
        start: state.start,
        current: state.current,
        end: state.end,
        time: null,
        total: state.total,
        timerID: false,
      };
    } else if (action.type === "FULL_RESET") {
      clearInterval(state.timerID);
      return {
        start: 0,
        current: 0,
        end: 0,
        time: null,
        total: state.total,
        timerID: false,
      };
    } else if (action.type === "MODIFY_TIMERID") {
      return {
        start: state.start,
        current: state.current,
        end: state.end,
        time: state.time,
        total: state.total,
        timerID: action.value,
      };
    } else if (action.type === "TIME_PAUSE") {
      clearInterval(state.timerID);
      return {
        start: state.start,
        current: state.current,
        end: state.end,
        time: state.time,
        total: state.total,
        timerID: false,
      };
    }
  };

  let [dataState, dataDispatch] = useReducer(dataReducer, {
    start: null,
    current: null,
    end: null,
    time: null,
    total: null,
    timerID: false,
  });

  let [getUserName, setUserName] = useState(null);
  let getTimersID = useRef(); // TODO: remove the ref

  getTimersID.current = dataState.timerID;

  useEffect(() => {
    // initialize some variables from chrome storage
    chrome.storage.sync.get(
      [
        "startedRecordingAt",
        "savedTime",
        "start",
        "progress",
        "end",
        "userName",
        "totalSeconds",
      ],
      (data) => {
        dataDispatch({
          type: "USER_INITIALIZE",
          time:
            data.startedRecordingAt === null // check if a recording is in progress
              ? data.savedTime === null
                ? null
                : data.savedTime
              : (Date.now() - data.startedRecordingAt) / 1000,
          start: data.start,
          current: data.progress,
          end: data.end,
          total: data.totalSeconds,
        });
        setUserName(data.userName);
      }
    );
  }, []);

  useEffect(() => {
    // update variables
    chrome.storage.sync.set({
      start: dataState.start,
      progress: dataState.current,
      end: dataState.end,
      startedRecordingAt:
        dataState.timerID === false ? null : Date.now() - dataState.time * 1000,
      savedTime: dataState.timerID === false ? dataState.time : null,
    });
  }, [
    dataState.start,
    dataState.current,
    dataState.end,
    dataState.timerID,
    dataState.time,
  ]);

  const timeAddHandler = () => {
    if (getTimersID.current !== false) {
      alert("Can't proceed while timer is active.");
      return;
    }

    let x = prompt(
      "Enter amount of time to load in the following format: h:mm:ss"
    );

    let timeArr = x.split(":").reverse();

    if (timeArr?.length !== 3) {
      alert("Invalid input! Too many or too few fields were input.");
      return;
    }

    if (
      !Number.isInteger(+timeArr[0]) ||
      !Number.isInteger(+timeArr[1]) ||
      !Number.isInteger(+timeArr[2])
    ) {
      alert("Invalid input! All fields must be integers.");
      return;
    }

    //All checks passed, now we're diving in to the addition.
    let desiredTimeInSeconds =
      +timeArr[0] + +timeArr[1] * 60 + +timeArr[2] * 3600;

    chrome.storage.sync.set({
      savedTime:
        desiredTimeInSeconds +
        dataDispatch({ type: "USER_ADDTIME", time: desiredTimeInSeconds }).time,
    });
  };

  const nameChangeHandler = () => {
    let newUserName = prompt("Please choose your nickname:")?.trim();
    setUserName(newUserName?.length === 0 ? getUserName : newUserName);
    chrome.storage.sync.set({
      userName: newUserName?.length === 0 ? getUserName : newUserName,
    });
  };

  const tickHandler = () => {
    chrome.storage.sync.get(
      ["start", "progress", "end", "totalSeconds"],

      (data) => {
        dataDispatch({ type: "START_CHANGE", value: data.start });
        dataDispatch({ type: "CURRENT_CHANGE", value: data.progress });
        dataDispatch({ type: "END_CHANGE", value: data.end });
        dataDispatch({ type: "TOTAL_UPDATE", value: data.totalSeconds });
      }
    );
  };

  return (
    <div id="popup-container" className="Card">
      <div className="Card-header">
        <a onClick={nameChangeHandler} className="headline">
          <b>{getUserName}</b>
        </a>
        <a onClick={timeAddHandler} className="mode">
          Import Time
        </a>
      </div>

      <div className="Card-layout">
        <div className="stats seperated datasection">
          <div>Stats</div>
          <div>
            You have in total <b>{Math.round(dataState.total / 3600)}</b>{" "}
            recorded hours.
          </div>
        </div>
        <div className="initialize-data seperated datasection">
          <div className="data-row">
            <div>Start</div>
            <NumberInput
              className="data-input"
              placeholder="0"
              onChange={(event) => {
                dataDispatch({
                  type: "START_CHANGE",
                  value: event.target.value,
                });
              }}
              value={dataState.start}
            />
          </div>
          <div className="data-row">
            <div>Progress</div>
            <NumberInput
              className="data-input"
              placeholder="0"
              onChange={(event) => {
                dataDispatch({
                  type: "CURRENT_CHANGE",
                  value: event.target.value,
                });
              }}
              value={dataState.current}
            />
          </div>
          <div className="data-row">
            <div>Finish</div>
            <NumberInput
              className="data-input"
              placeholder="0"
              onChange={(event) => {
                dataDispatch({ type: "END_CHANGE", value: event.target.value });
              }}
              value={dataState.end}
            />
          </div>
        </div>
        <div className="actions datasection">
          {/* <div>Actions</div> */}
          <div className="buttons-container">
            <button
              onClick={() => dataDispatch({ type: "TIME_RESET" })}
              onDoubleClick={() => dataDispatch({ type: "FULL_RESET" })}
            >
              Reset
            </button>
            <Timer
              timerID={getTimersID}
              modifyTimerID={(value) => {
                dataDispatch({ type: "MODIFY_TIMERID", value });
              }}
              onTick={tickHandler}
              onPause={() => dataDispatch({ type: "TIME_PAUSE" })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
