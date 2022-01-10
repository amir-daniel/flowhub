/*global chrome*/
import "./NumberInput.css";
import AnimatedCounter from "./AnimatedCounter";
import Timer from "./Timer.js";
import { useRef, useEffect } from "react";

const playFile = (filepath) => {
  var audioPlayer = new Audio(chrome.runtime.getURL(filepath));
  audioPlayer.play();
};

const designDigit = (num) => (+num < 10 ? "0" + num : num);

const destructureSeconds = (time) => {
  time = Math.floor(time); // round time received in seconds

  let sec = designDigit(time % 60);
  let min = designDigit(((time - sec) / 60) % 60);
  let hr = (time - sec - 60 * min) / 3600;

  return [hr, min, sec];
};

const beautify = (time) => {
  let [hr, min, sec] = destructureSeconds(time);

  return `${hr}h${min}m${sec}s`;
};

const NumberInput = (props) => {
  const inputRef = useRef(null);

  const progressHandler = (event) => {
    if (+props.itemMax === +event.target.value) {
      playFile("sounds/complete.mp3");
      return;
    }
    playFile("sounds/increment.mp3");
  };

  const getETA = () => {
    let totalProgress = props.progress - props.itemMin;
    let progressLeft = props.itemMax - props.progress;
    let totalMins = props.time.current / 60;

    if (
      !props.timerID.current &
      (props.progress === props.itemMin ||
        props.itemMax !== props.progress ||
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
      props.itemMin === null ||
      props.progress === null ||
      props.itemMax === null
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
          value={ETADate === 0 ? 0 : ETADate.getMinutes()}
          inc={1}
          refreshRate={8}
          callback={designDigit}
        />
      </span>
    );

    return dateFormatted;
  };

  const getPercentage = () => {
    let totalProgressMade = props.progress - props.itemMin;
    let totalProgressPossible = props.itemMax - props.itemMin;

    if (
      totalProgressPossible === 0 ||
      props.progress === null ||
      props.itemMax === null ||
      props.itemMin === null
    ) {
      // wait when data is loading
      return 0;
    }

    return 100 * (totalProgressMade / totalProgressPossible);
  };

  return (
    <div>
      <input
        type="text"
        className={props.className}
        placeholder={props.placeholder}
        onChange={props.onChange}
        value={props.itemMin}
      />
    </div>
  );
};

export default NumberInput;
