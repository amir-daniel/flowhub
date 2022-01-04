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

  const changeHandler = (reset = false) => {
    setTime((prevState) => (reset ? 0 : prevState + 1));
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
          <img src="./logo.png" />
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
          />
        </p>
      </header>
    </div>
  );
}

export default App;
