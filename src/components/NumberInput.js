/*global chrome*/
import "./NumberInput.css";
import { useEffect, useState } from "react";

const NumberInput = (props) => {
  // let btnRef = props.submitBtnRef;

  const [firstInit, setFirstInit] = useState(true);
  const [justChanged, setJustChanged] = useState(false);

  useEffect(() => {
    if (firstInit !== true) {
      setJustChanged(true);
      setTimeout(() => setJustChanged(false), 500);
    }
  }, [props.value]);

  useEffect(() => {
    setFirstInit(false);
  }, []);

  return (
    <div>
      <input
        min={0}
        onKeyDown={props.onSubmit}
        type="number"
        className={
          props.className + (justChanged === true ? " input-changed" : "")
        }
        placeholder={props.placeholder}
        onChange={props.onChange}
        value={props.value}
      />
    </div>
  );
};

export default NumberInput;
