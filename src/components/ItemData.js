/*global chrome*/
import styles from "./ItemData.module.css";
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

// const beautifyForBadge = (time) => {
//   let timeInMin = time / 60;
//   let [hr, min, sec] = destructureSeconds(time);

//   if (timeInMin < 60) {
//     // less than an hour recorded
//     return min + ":" + sec;
//   } else {
//     // at least an hour recorded
//     return hr + ":" + min;
//   }
// };

const ItemData = (props) => {
  const inputRef = useRef(null);

  // useEffect(() => {
  //   if (inputRef.current) {
  //     inputRef.current.focus();
  //   }
  // }, []);

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
        props.itemMax != props.progress ||
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
          value={ETADate === 0 ? 0 : designDigit(ETADate.getMinutes())}
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

  // useEffect(() => {
  //   chrome.action.setBadgeText({
  //     text: beautifyForBadge(props.time.current),
  //   });
  // }, [props.time]);

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <input
        style={{ width: `2.7em` }}
        type="number"
        className={styles.items}
        min="0"
        step="1"
        onChange={props.onMinChange}
        value={props.itemMin}
        disabled={props.timerID.current}
      />
      <input
        className={styles.items}
        style={{ width: `2.7em` }}
        type="number"
        onChange={(event) => {
          props.onCurrentChange(event);
          progressHandler(event);
        }}
        min="0"
        step="1"
        value={props.progress}
        disabled={props.timerID.current !== false}
      />
      <input
        className={styles.items}
        style={{ width: `2.7em` }}
        type="number"
        onChange={props.onMaxChange}
        value={props.itemMax}
        min="0"
        step="1"
        disabled={props.timerID.current}
      />

      <br />
      <br />
      <Timer
        timerID={props.timerID}
        modifyTimerID={props.setTimerID}
        onTick={() => {
          inputRef.current.focus();
          props.onTick();
        }}
        isResettable={
          props.time.current >= 1 || props.progress != props.itemMin
        }
        isRecordable={
          +props.progress !== +props.itemMax || +props.itemMin === props.itemMax
        }
        onReset={props.onReset}
        value={props.time}
      />
      <button
        autofocus="true"
        ref={inputRef}
        onClick={() => {
          props.onCurrentChange({ target: { value: props.progress + 1 } });
          progressHandler({ target: { value: props.progress + 1 } });
        }}
        type="submit"
        disabled={+props.progress === +props.itemMax}
      >
        ⬆️
      </button>
      <span>
        <br />
        <br />
        <div style={{ fontSize: "0.9em" }}>
          {beautify(props.time.current)}
          {`${
            props.timerID.current === false ||
            props.progress === null || // these 3 nulls are to wait for the data to load
            props.itemMax === null ||
            props.itemMin === null
              ? ""
              : " 🔴"
          }`}
          {getETA()}
        </div>
      </span>
      <br />
      <div class={styles.progress}>
        <div
          className={styles[`progress-value`]}
          style={{
            width: getPercentage() + "%",
            background:
              getPercentage() < 100
                ? getPercentage() < 50
                  ? "rgb(197, 52, 52)"
                  : "rgb(209, 135, 51)"
                : "rgb(32, 189, 17)",
          }}
        >
          <AnimatedCounter value={getPercentage()} />%
        </div>
      </div>
    </form>
  );
};

export default ItemData;
