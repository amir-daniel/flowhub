import { clear } from "@testing-library/user-event/dist/clear";
import { useState, useEffect, useRef } from "react";
import "./BufferElement.css";

const BufferElement = (props) => {
  let [message, setMessage] = useState(props.isActive);
  let isFirstRender = useRef(true);

  useEffect(() => {
    let cleaningTimer;
    if (
      props.isInitializing.current === false &&
      isFirstRender.current === true
    ) {
      // don't show loading screen on first initialization
      isFirstRender.current = false;
      setMessage(false);
    } else if (props.isInitializing.current === true) {
      setMessage(false);
    } else if (props.isActive === "force-hide") {
      setMessage(false);
    } else if (props.isActive === false) {
      setMessage(
        <div>
          <svg
            class="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle
              class="checkmark__circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              class="checkmark__check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>
      );
      cleaningTimer = setTimeout(() => {
        setMessage(false);
      }, 2000);
    } else {
      setMessage(
        <div className="lds-roller">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      );
    }
    if (props.isActive === "force-show") {
      setMessage(
        <div className="lds-roller">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      );
    }
    return () => {
      clearTimeout(cleaningTimer);
    };
  }, [props.isActive, props.isInitializing.current]);

  return message == false ? (
    <div style={{ paddingTop: "4px" }}>{props.timeDisplay}</div>
  ) : (
    message
  );
};

export default BufferElement;
