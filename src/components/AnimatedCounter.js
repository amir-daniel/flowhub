import react from "react";
import { useState, useRef } from "react";

const AnimatedCounter = (props) => {
  const [getOldValue, setOldValue] = useState(0); //useState(props.value);
  const [timerID, setTimerID] = useState(false);
  let oldValue = useRef();
  oldValue.current = getOldValue;
  const delayInSeconds = 2;
  const refreshPerSecond =
    props.refreshRate === undefined ? 25 : props.refreshRate; // default refresh rate is 25 Hz
  const sign = (number) => (number < 0 ? -1 : 1);

  const executeTick = (oldVal, incSize) => {
    if (
      (+oldVal + +incSize) * sign(+incSize) >=
      +props.value * sign(+incSize)
    ) {
      // we've finished incrementing, let's reset the timer and oldValue
      setOldValue(props.value);

      clearTimeout(timerID);
      setTimerID(false);
    } else {
      setOldValue(oldVal + incSize);

      setTimerID(
        setTimeout(
          () => executeTick(oldVal + incSize, incSize),
          1000 * (1 / refreshPerSecond)
        )
      );
    }
  };

  let expression;
  if (+oldValue.current !== +props.value && !timerID) {
    // we get new value, set up increment
    let tempInc =
      (+props.value - +oldValue.current) / (delayInSeconds * refreshPerSecond);
    tempInc = props.inc === undefined ? tempInc : props.inc * sign(tempInc);
    // set minimum increment, if defined
    setTimerID(
      setTimeout(
        () => executeTick(oldValue.current + tempInc, tempInc),
        1000 * (1 / refreshPerSecond)
      )
    );

    expression = Math.floor(100 * (oldValue.current + tempInc)) / 100;
    return (
      (props.callback === undefined
        ? expression
        : props.callback(expression)) || oldValue.current
    );
    // run the callback on expression if defined
  }

  expression = Math.floor(100 * oldValue.current) / 100;
  return (
    (props.callback === undefined ? expression : props.callback(expression)) ||
    oldValue.current
  );
};

export default AnimatedCounter;
