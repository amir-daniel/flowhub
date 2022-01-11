/*global chrome*/
import "./NumberInput.css";

const NumberInput = (props) => {
  return (
    <div>
      <input
        min={0}
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
