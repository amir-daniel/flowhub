import "./AnimatedProgressBar.css";

const AnimatedProgressBar = (props) => {
  return (
    <div className="Loading">
      <div
        className="loadingAfter"
        style={{
          width: "" + Math.round(props.progress * 100) + "%",
          backgroundColor:
            props.progress >= 0.978
              ? "#3fffa2"
              : props.progress >= 0.567
              ? "#e9f08c"
              : props.progress >= 0.33
              ? "#ffdb3a"
              : "#e5405e",
        }}
      ></div>
    </div>
  );
};

export default AnimatedProgressBar;
