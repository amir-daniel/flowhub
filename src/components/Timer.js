/*global chrome*/
import { useEffect } from "react";
import { StartRecordingOut } from "./Integration";

const Timer = (props) => {
  const checkMonday = async () => {
    let isQuestRunning;
    let itemName;
    const shouldICheckMonday = true; // turn it off when saving version for daniel

    if (shouldICheckMonday === true) {
      // arabic work ahead **WARNING**
      let query = `{
      items_by_column_values(board_id: 1774709998, column_id: "status", column_value: "Quest in Progress", limit: 1) {
        name
        id
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
          console.log(e);
          chrome.notifications.create({
            type: "progress",
            iconUrl: "/images/get_started128.png",
            title: "River",
            message: "Something went connecting to Monday!",

            progress: 0,
          });
          // startHandler();

          props.onBufferChange("force-hide");
          return;
        })
        .then((res) => {
          console.log(res);
          if (res?.["data"]?.["items_by_column_values"] === undefined) {
            chrome.notifications.create({
              type: "progress",
              iconUrl: "/images/get_started128.png",
              title: "River",
              message: "Connection rejected by Monday!", // "Something went wrong!" message removed
              progress: 0,
            });
            props.onBufferChange("force-hide");
          } else if (res?.["data"]?.["items_by_column_values"]?.length === 0) {
            chrome.notifications.create({
              type: "progress",
              iconUrl: "/images/get_started128.png",
              title: "River",
              message: "No eligible quest was found on Monday!", // "Something went wrong!" message removed
              progress: 0,
            });
            props.onBufferChange("force-hide");
          } else {
            itemName = {
              name: res?.["data"]?.["items_by_column_values"]?.[0]?.["name"],
              id: res?.["data"]?.["items_by_column_values"]?.[0]?.["id"],
            };

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

            if (isQuestRunning === false) {
              //found a quest and it is not running, as desired
              startHandler();
              StartRecordingOut(itemName.id).then((res) => {
                console.log(res);
                props.onBufferChange(res);
              });
            } else {
              chrome.notifications.create({
                type: "progress",
                iconUrl: "/images/get_started128.png",
                title: "River",
                message:
                  "Syncing error, found quests are already recording on Monday!", // "Something went wrong!" message removed
                progress: 0,
              });
              props.onBufferChange("force-hide");
            }
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
          //startHandler()
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
    if (props.autoFocus !== false) {
      // can turn it off if you don't want constant refocusing during recording
      props.submitRef?.current?.focus();
    }
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
          props.onBufferChange("force-show"); // force show buffer
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
