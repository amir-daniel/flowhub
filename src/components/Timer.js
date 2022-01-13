/*global chrome*/
import { useEffect } from "react";

const Timer = (props) => {
  const checkMonday = () => {
    let isQuestRunning;
    let itemName;
    const shouldICheckMonday = true; // turn it off when saving version for daniel

    if (shouldICheckMonday === true) {
      let query = `{
      items_by_column_values(board_id: 1774709998, column_id: "status", column_value: "Quest in Progress", limit: 1) {
        name
        column_values(ids: "time_tracking") {
          value
        }
      }
    }
    `;

      fetch("https://api.monday.com/v2", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjE0MDU3ODMyNSwidWlkIjoxMjcyNjA0NSwiaWFkIjoiMjAyMi0wMS0xMlQxOTo1MDo0NS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTcwMTM4MCwicmduIjoidXNlMSJ9.fUP-1slk9PDDvoQtb1XgiSzMyOMbmCZbeDMnQZ_UyEU",
        },
        body: JSON.stringify({
          query: query,
        }),
      })
        .then((res) => res.json())
        .catch((e) => {
          chrome.notifications.create({
            type: "progress",
            iconUrl: "/images/get_started128.png",
            title: "River",
            message: "Something went wrong connecting to Monday!...",

            progress: 0,
          });
          // startHandler();

          props.onBufferChange("force-hide");
          return;
        })
        .then((res) => {
          itemName = res?.["data"]?.["items_by_column_values"]?.[0]?.["name"];

          chrome.storage.sync.set({
            itemName: itemName,
          });

          props.onStartNewItem(itemName);

          isQuestRunning =
            JSON.parse(
              res?.["data"]?.["items_by_column_values"]?.[0]?.[
                "column_values"
              ]?.[0]?.["value"],
              null,
              2
            )["running"] == "true";

          if (isQuestRunning === true) {
            //something is running in monday
            startHandler();
            props.onBufferChange(false);
          } else {
            chrome.notifications.create({
              type: "progress",
              iconUrl: "/images/get_started128.png",
              title: "River",
              message:
                "Something went wrong! No currenly running quest was found on Monday!",
              progress: 0,
            });
            props.onBufferChange(force - hide);
          }
        })
        .catch((e) => {
          chrome.notifications.create({
            type: "progress",
            iconUrl: "/images/get_started128.png",
            title: "River",
            message: "Something went wrong after connecting to Monday!",

            progress: 0,
          });
          // startHandler();

          props.onBufferChange("force-hide");
          return;
        });
    } else {
      startHandler();

      props.onBufferChange(false);
    }
  };
  const tickHandler = () => {
    props.onTick();
    // if (props.autoFocus !== false) {   <-------- now deprecated
    //   inputRef?.current.focus();
    // }
  };

  const startHandler = () => {
    if (props.timerID === false) {
      props.modifyTimerID(
        setInterval(() => {
          tickHandler();
        }, 1000)
      );
    }
  };

  useEffect(() => {
    chrome.storage.sync.get(["startedRecordingAt", "savedTime"], (data) => {
      if (data.startedRecordingAt !== null && data.savedTime === null) {
        startHandler();
      }
    });
  }, []);

  return (
    <button
      ref={props.submitRef}
      autoFocus={props.autoFocus}
      onClick={() => {
        if (props.timerID === false) {
          props.onBufferChange("force-show"); // undefined = force show buffer
          checkMonday(); // set buffer first and then check monday
        } else {
          // ascend action
          props.onAscend();
        }
      }}
      disabled={!props.enabled}
    >
      {props.timerID === false ? "Record" : "Harvest"}
    </button>
  );
};

export default Timer;
