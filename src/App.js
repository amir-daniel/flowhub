/*global chrome*/
import "./App.css";
import ItemData from "./components/ItemData";
import Timer from "./components/Timer";
import react from "react";
import { useState, useEffect, useRef } from "react";

function App() {
  let [time, setTime] = useState(null);
  let [getStart, setStart] = useState(null);
  let [getCurrent, setCurrent] = useState(null);
  let [getEnd, setEnd] = useState(null);
  let [TimersID, setTimersID] = useState(false);
  let getTime = useRef();
  let getTimersID = useRef();

  getTimersID.current = TimersID;
  getTime.current = time;

  useEffect(() => {
    chrome.storage.sync.get(["startedRecordingAt", "savedTime"], (data) => {
      setTime(
        data.startedRecordingAt === null
          ? data.savedTime === null
            ? 0
            : data.savedTime
          : (Date.now() - data.startedRecordingAt) / 1000
      );
    });

    chrome.storage.sync.get(["start", "progress", "end"], (data) => {
      setCurrent(data.progress);
      setEnd(data.end);
      setStart(data.start);
    });

    // chrome.storage.sync.get(["isTimerOn"], (data) => {
    //   setTimersID(data.isTimerOn);
    // });
  }, []);

  const changeHandler = () => {
    setTime(getTime.current + 1);
    //update progress values from storage
    chrome.storage.sync.get(["progress"], (data) => {
      setCurrent(data.progress);
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

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {/* <Timer
            value={getTime}
            onTick={changeHandler}
            timerID={getTimersID}
            modifyTimerID={(id) => {
              setTimersID(id);
            }}
          /> */}
          <img
            onClick={() => {
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
                +timeArr[0] +
                +timeArr[1] * 60 +
                +timeArr[2] * 3600 +
                getTime.current;

              setTime(desiredTimeInSeconds);

              chrome.storage.sync.set({
                savedTime: desiredTimeInSeconds,
              });
            }}
            src="./logo.png"
          />
          <ItemData
            itemMin={getStart}
            itemMax={getEnd}
            progress={getCurrent}
            onMinChange={minHandler}
            onCurrentChange={currentHandler}
            onMaxChange={maxHandler}
            time={getTime}
            timerID={getTimersID}
            setTimerID={(id) => {
              setTimersID(id);
            }}
            onTick={changeHandler}
            onReset={resetHandler}
          />
        </p>
      </header>
    </div>
  );
}

export default App;
