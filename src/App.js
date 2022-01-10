// /*global chrome*/
import "./App.css";
import react from "react";

function App() {
  // ETA Mode (Forward Looking),
  // Sequential Mode (Time Elapsed)

  return (
    <div id="popup-container" className="Card">
      <div className="Card-header">
        <a className="headline">
          <b>Dbkillerex</b>
        </a>
        <a className="mode">ETA Mode</a>
      </div>

      <div className="Card-layout">
        <div className="stats seperated datasection">
          <div>Stats</div>
          <div>
            You have in total <b>808</b> recorded hours.
          </div>
        </div>
        <div className="initialize-data seperated datasection">
          <div className="data-row">
            <div>Start</div>
            <input type="text" className="data-input" placeholder="0" />
          </div>
          <div className="data-row">
            <div>Progress</div>
            <input type="text" className="data-input" placeholder="0" />
          </div>
          <div className="data-row">
            <div>Finish</div>
            <input type="text" className="data-input" placeholder="0" />
          </div>
        </div>
        <div className="actions datasection">
          <div>Actions</div>
          <div className="buttons-container">
            <button>Reset</button>
            <button>Record</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
