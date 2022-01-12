/*global chrome*/
import "./NumberInput.css";

const NumberInput = (props) => {
  let btnRef = props.submitBtnRef;

  return (
    <div>
      <input
        min={0}
        onKeyDown={props.onSubmit}
        type="number"
        className={props.className}
        placeholder={props.placeholder}
        onChange={props.onChange}
        value={props.value}
      />
    </div>
  );
};

export default NumberInput;
