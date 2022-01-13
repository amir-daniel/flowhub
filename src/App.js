/*global chrome*/
import "./App.css";
import NumberInput from "./components/NumberInput";
import Timer from "./components/Timer";
import BufferElement from "./components/BufferElement";
import AnimatedProgressBar from "./components/AnimatedProgressBar";
import { useState, useEffect, useReducer, useRef } from "react";

const playFile = (filepath) => {
  var audioPlayer = new Audio(chrome.runtime.getURL(filepath));
  audioPlayer.play();
};

function App() {
  // ETA Mode (Forward Looking),
  // Sequential Mode (Time Elapsed)

  const [isBuffering, setIsBuffering] = useState(false);
  const isInInitialization = useRef(true); // to signal to the buffer not to load while first initializing
  const isBufferingRef = useRef(false);
  const [itemName, setItemName] = useState(null);

  let inputRef = useRef(null);

  isBufferingRef.current = isBuffering;

  const designDigit = (num) => (+num < 10 ? "0" + num : num);

  const destructureSeconds = (time) => {
    time = Math.round(time); // round time received in seconds

    let sec = designDigit(time % 60);
    let min = designDigit(((time - sec) / 60) % 60);
    let hr = (time - sec - 60 * min) / 3600;

    return [hr, min, sec];
  };

  const beautify = (time) => {
    let [hr, min, sec] = destructureSeconds(time);

    return `${hr}h${min}m${sec}s`;
  };

  const filterInput = (newInput, oldInput) => {
    if ((newInput + "")?.trim() === "") {
      return 0;
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
    } else if (action.type === "DATA_REFRESH") {
      return {
        start: action.start,
        current: action.progress,
        end: action.end,
        total: action.totalSeconds,
        time: state.time,
        timerID: state.timerID,
      };
    } else if (action.type === "USER_ADDTIME") {
      chrome.storage.sync.set({
        startedRecordingAt: null,
        savedTime: +state.time + action.value,
      });
      return {
        start: state.start,
        current: state.current,
        end: state.end,
        time: +state.time + action.value,
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
      // <----------- deprecated completely
      throw new Error();
    } else if (action.type === "TIME_RESET") {
      let accumulatedTime = state.total + state.time;

      clearInterval(state.timerID);
      chrome.storage.sync.set({
        startedRecordingAt: null,
        savedTime: null,
        totalSeconds: accumulatedTime,
      });
      return {
        start: state.start,
        current: state.current,
        end: state.end,
        time: null,
        total: accumulatedTime,
        timerID: false,
      };
    } else if (action.type === "FULL_RESET") {
      let accumulatedTime = state.total + state.time;

      clearInterval(state.timerID);
      chrome.storage.sync.set({
        startedRecordingAt: null,
        savedTime: null,
        totalSeconds: accumulatedTime,
      });
      return {
        start: 0,
        current: 0,
        end: 0,
        time: null,
        total: accumulatedTime,
        timerID: false,
      };
    } else if (action.type === "MODIFY_TIMERID") {
      chrome.storage.sync.get(["startedRecordingAt"], (data) => {
        if (data.startedRecordingAt === null) {
          chrome.storage.sync.set({
            startedRecordingAt: Date.now() - +state.time * 1000,
            savedTime: null,
          });
        }
      });
      return {
        start: state.start,
        current: state.current,
        end: state.end,
        time: null,
        total: state.total,
        timerID: action.value,
      };
    } else if (action.type === "TIME_START") {
      throw new Error(); // this area is now deprecated!
    } else if (action.type === "TIME_PAUSE") {
      let newTime = null;
      clearInterval(state.timerID);

      if (action.value !== null) {
        newTime = (Date.now() - action.value) / 1000;
        chrome.storage.sync.set({
          startedRecordingAt: null,
          savedTime: newTime,
        });
      }

      return {
        start: state.start,
        current: state.current,
        end: state.end,
        time: newTime,
        total: state.total,
        timerID: false,
      };
    }
  };

  const incrementCurrent = (val) => {
    dataDispatch({ type: "CURRENT_CHANGE", value: val });
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
  let [timeToShow, setTimeToShow] = useState(false); // it's false here to suit the JSX element later

  useEffect(() => {
    if (dataState.timerID === false) {
      if (dataState.time > 0) {
        setTimeToShow(dataState.time);
      } else {
        setTimeToShow(false);
      }
    } else {
      chrome.storage.sync.get(["startedRecordingAt"], (data) => {
        if (data.startedRecordingAt !== null) {
          setTimeToShow((Date.now() - data.startedRecordingAt) / 1000);
        }
      });
    }
  }, [dataState.timerID, dataState.time]);

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
              : null,
          start: data.start,
          current: data.progress,
          end: data.end,
          total: data.totalSeconds,
        });
        setUserName(data.userName);
        isInInitialization.current = false;
      }
    );
  }, []);

  useEffect(() => {
    // update variables in a debounced way (to avoid going over the 1800 MAX_WRITE_OPERATIONS / hr)
    let delayedUpdate;
    if (!isInInitialization.current) {
      // don't write back values on first initializating

      delayedUpdate = setTimeout(() => {
        chrome.storage.sync.set(
          {
            start: dataState.start,
            progress: dataState.current,
            end: dataState.end,
          },
          () => {
            if (
              dataState.end === dataState.current &&
              dataState.end !== dataState.start
            ) {
              playFile("sounds/complete.mp3");
              chrome.storage.sync.get(["startedRecordingAt"], (data) => {
                dataDispatch({
                  type: "TIME_PAUSE",
                  value: data.startedRecordingAt,
                });
              });
            }

            setIsBuffering(false);
          }
        );
      }, 2000); // add buffering
      setIsBuffering(true);
    }
    return () => {
      clearTimeout(delayedUpdate);
    };
  }, [dataState.start, dataState.current, dataState.end]);

  const timeAddHandler = () => {
    if (dataState.timerID !== false) {
      alert("Can't proceed while timer is active.");
      return;
    }

    let x = prompt(
      "Enter amount of time to load in the following format: h:mm:ss"
    );

    if (x !== undefined && x !== null) {
      let timeArr = x?.split(":").reverse();

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

      dataDispatch({ type: "USER_ADDTIME", value: desiredTimeInSeconds });
    }
  };

  const nameChangeHandler = () => {
    let newUserName = prompt("Please choose your nickname:")?.trim();

    if (newUserName?.length === 0) {
      alert("Invalid input! Name must contain at least one charachter.");
    } else if (newUserName !== undefined && newUserName !== null) {
      setUserName(newUserName);
      chrome.storage.sync.set({
        userName: newUserName,
      });
    }
  };

  const tickHandler = () => {
    if (isBufferingRef.current === false) {
      chrome.storage.sync.get(
        [
          "start",
          "progress",
          "end",
          "totalSeconds",
          "startedRecordingAt",
          "itemName",
        ],
        (data) => {
          setItemName(data.itemName);
          dataDispatch({
            type: "DATA_REFRESH",
            start: data.start,
            progress: data.progress,
            end: data.end,
            totalSeconds: data.totalSeconds,
          });
          setTimeToShow(
            (Date.now() - data.startedRecordingAt) / 1000 // add 1 second to account for delay
          );
        }
      );
    }
  };

  return (
    <div id="popup-container" className="Card">
      <div className="Card-header">
        <a onClick={nameChangeHandler} className="headline">
          <b>
            {dataState.timerID !== false && itemName !== null ? (
              <span style={{ color: "red" }}>{itemName}</span>
            ) : (
              "@" + getUserName
            )}
          </b>
        </a>
        <a onClick={timeAddHandler} className="mode">
          Import Time
        </a>
      </div>

      <div className="Card-layout">
        <div className="stats seperated datasection">
          <div>
            <b>Stats</b>
          </div>
          <div>
            You have in total <b>{Math.round(dataState.total / 3600)}</b>{" "}
            recorded hours.
          </div>
        </div>

        <div className="initialize-data seperated datasection">
          <div className="data-row">
            <div>Start</div>
            <NumberInput
              min={0}
              className="data-input"
              onSubmit={(event) => {
                if (event.key === "Enter") {
                  inputRef.current.focus();
                }
              }}
              placeholder="0"
              onChange={(event) => {
                dataDispatch({
                  type: "START_CHANGE",
                  value: event.target.value,
                });
              }}
              value={+dataState.start === 0 ? "" : dataState.start}
            />
          </div>
          <div className="data-row">
            <div>Progress</div>
            <NumberInput
              className="data-input"
              placeholder="0"
              onSubmit={(event) => {
                if (event.key === "Enter") {
                  inputRef.current.focus();
                }
              }}
              onChange={(event) => {
                dataDispatch({
                  type: "CURRENT_CHANGE",
                  value: event.target.value,
                });
              }}
              value={+dataState.current === 0 ? "" : dataState.current}
            />
          </div>
          <div className="data-row">
            <div>Finish</div>
            <NumberInput
              className="data-input"
              placeholder="0"
              onSubmit={(event) => {
                if (event.key === "Enter") {
                  inputRef.current.focus();
                }
              }}
              onChange={(event) => {
                dataDispatch({
                  type: "END_CHANGE",
                  value: event.target.value,
                });
              }}
              value={+dataState.end === 0 ? "" : dataState.end}
            />
          </div>
        </div>
        <div
          className={
            "actions datasection" +
            (dataState.end > dataState.start ? " button-seperated" : "")
          }
        >
          {/* <div>Actions</div> */}
          <div className="buttons-container">
            <button
              onClick={
                dataState.timerID === false
                  ? () => dataDispatch({ type: "TIME_RESET" })
                  : () =>
                      chrome.storage.sync.get(
                        ["startedRecordingAt"],
                        (data) => {
                          dataDispatch({
                            type: "TIME_PAUSE",
                            value: data.startedRecordingAt,
                          });
                        }
                      )
              }
              onDoubleClick={() => dataDispatch({ type: "FULL_RESET" })}
            >
              {dataState.timerID === false ? "Reset" : "Pause"}
            </button>
            <BufferElement
              isActive={isBuffering}
              isInitializing={isInInitialization}
              timeDisplay={
                timeToShow !== false
                  ? beautify(timeToShow) +
                    (dataState.timerID !== false ? " 🔴" : "")
                  : timeToShow
              }
            />
            <Timer
              onBufferChange={setIsBuffering}
              submitRef={inputRef}
              autoFocus={true}
              timerID={dataState.timerID}
              onStartNewItem={setItemName}
              onAscend={() => {
                if (dataState.current < dataState.end) {
                  playFile("sounds/increment.mp3");

                  incrementCurrent(dataState.current + 1);
                } else {
                  alert("Something went wrong!");
                }
              }}
              enabled={
                dataState.timerID === false || dataState.end > dataState.current
              }
              modifyTimerID={(newID) => {
                dataDispatch({ type: "MODIFY_TIMERID", value: newID });
              }}
              onTick={tickHandler}
            />
          </div>
        </div>

        {dataState.end > dataState.start ? (
          <div className="progress-section prog-actions">
            <AnimatedProgressBar
              progress={
                dataState.end - dataState.start === 0
                  ? 0
                  : (dataState.current - dataState.start) /
                    (dataState.end - dataState.start)
              }
            />
          </div>
        ) : (
          false
        )}
      </div>
    </div>
  );
}

export default App;
