/*global chrome*/
import "./NumberInput.css";

const NumberInput = (props) => {
  return (
    <div>
      <input
        type="text"
        className={props.className}
        placeholder={props.placeholder}
        onChange={props.onChange}
        value={props.value}
      />
    </div>
  );
};

export default NumberInput;
