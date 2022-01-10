/*global chrome*/
import "./App.css";
import NumberInput from "./components/NumberInput";
import Timer from "./components/Timer";
import react from "react";
import { useState, useEffect, useRef } from "react";

function App() {
  // ETA Mode (Forward Looking),
  // Sequential Mode (Time Elapsed)

  let [time, setTime] = useState(null);
  let [getStart, setStart] = useState(null);
  let [getCurrent, setCurrent] = useState(null);
  let [getEnd, setEnd] = useState(null);
  let [getUserName, setUserName] = useState(null);
  let [totalSeconds, setTotalSeconds] = useState(0);
  let [TimersID, setTimersID] = useState(false);
  let getTime = useRef();
  let getTimersID = useRef();

  getTimersID.current = TimersID;
  getTime.current = time;

  useEffect(() => {
    // initialize some variables from chrome storage
    chrome.storage.sync.get(["startedRecordingAt", "savedTime"], (data) => {
      setTime(
        data.startedRecordingAt === null // check if a recording is in progress
          ? data.savedTime === null
            ? 0
            : data.savedTime
          : (Date.now() - data.startedRecordingAt) / 1000
      );
    });

    chrome.storage.sync.get(
      ["start", "progress", "end", "userName", "totalSeconds"],
      (data) => {
        setCurrent(data.progress);
        setEnd(data.end);
        setStart(data.start);
        setUserName(data.userName);
        setTotalSeconds(data.totalSeconds);
      }
    );
  }, []);

  const changeHandler = () => {
    setTime(getTime.current + 1);

    //update progress values from storage
    chrome.storage.sync.get(["progress", "totalSeconds"], (data) => {
      setCurrent(data.progress);
      setTotalSeconds(data.totalSeconds + 1);
      chrome.storage.sync.set({ totalSeconds });
    });
  };

  const resetHandler = () => {
    setTime(0);
    setStart(0);
    setCurrent(0);
    setEnd(0);
    chrome.storage.sync.set({
      start: 0,
      progress: 0,
      end: 0,
    });
    // if reset mode requested, reset timer!
  };

  const minHandler = (event) => {
    if (+event.target.value <= getCurrent) {
      setStart(+event.target.value);
      chrome.storage.sync.set({ start: +event.target.value });
    }
  };
  const currentHandler = (event) => {
    if (+event.target.value >= getStart) {
      if (+event.target.value <= getEnd) {
        setCurrent(+event.target.value);
        chrome.storage.sync.set({ progress: +event.target.value });
      }
    }
  };
  const maxHandler = (event) => {
    if (+event.target.value >= getCurrent) {
      setEnd(+event.target.value);
      chrome.storage.sync.set({ end: +event.target.value });
    }
  };

  const timeAddHandler = () => {
    if (getTimersID.current !== false) {
      alert("Can't proceed while timer is active.");
      return;
    }

    let x = prompt(
      "Enter amount of time to load in the following format: h:mm:ss"
    );

    let timeArr = x.split(":").reverse();

    if (timeArr.length !== 3) {
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
      +timeArr[0] + +timeArr[1] * 60 + +timeArr[2] * 3600 + getTime.current;

    setTime(desiredTimeInSeconds);

    chrome.storage.sync.set({
      savedTime: desiredTimeInSeconds,
    });
  };

  const nameChangeHandler = () => {
    let newUserName = prompt("Please choose your nickname:")?.trim();
    setUserName(newUserName.length === 0 ? getUserName : newUserName);
    chrome.storage.sync.set({
      userName: newUserName.length === 0 ? getUserName : newUserName,
    });
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
            You have in total <b>{Math.round(totalSeconds / 3600)}</b> recorded
            hours.
          </div>
        </div>
        <div className="initialize-data seperated datasection">
          <div className="data-row">
            <div>Start</div>
            <NumberInput
              min={0}
              max={getCurrent}
              className="data-input"
              placeholder="0"
              onChange={minHandler}
              value={getStart}
            />
          </div>
          <div className="data-row">
            <div>Progress</div>
            <NumberInput
              min={getStart}
              max={getEnd}
              className="data-input"
              placeholder="0"
              onChange={currentHandler}
              value={getCurrent}
            />
          </div>
          <div className="data-row">
            <div>Finish</div>
            <NumberInput
              min={getCurrent}
              className="data-input"
              placeholder="0"
              onChange={maxHandler}
              value={getEnd}
            />
          </div>
        </div>
        <div className="actions datasection">
          <div>Actions</div>
          <div className="buttons-container">
            <button>Reset</button>
            <button>Record</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
