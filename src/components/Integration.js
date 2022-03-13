/*global chrome*/

// later possible to add: "which integration: monday, ..., and also option to add private key"
const showErrorMsg = (msg, checkMute = false) => {
  if (checkMute === true) {
    chrome.storage.sync.get(["muteMode"], (data) => {
      if (data.muteMode !== true) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "/images/get_started128.png",
          title: "River",
          message: msg,
        });
      }
    });
  }
};

export const StartRecordingOut = async (itemID, offlineMode) => {
  if (offlineMode !== true) {
    let query5 = `mutation ($data: JSON!) {
            change_multiple_column_values(board_id: 1774709998, item_id: ${itemID}, column_values: $data) {
              id
            }
          }`;
    let vars;
    vars = {
      data: JSON.stringify({
        status: "Quest in Progress",
      }),
    };

    return fetch("https://api.monday.com/v2", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjE0MDU3ODMyNSwidWlkIjoxMjcyNjA0NSwiaWFkIjoiMjAyMi0wMS0xMlQxOTo1MDo0NS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTcwMTM4MCwicmduIjoidXNlMSJ9.fUP-1slk9PDDvoQtb1XgiSzMyOMbmCZbeDMnQZ_UyEU",
      },
      body: JSON.stringify({
        query: query5,
        variables: JSON.stringify(vars),
      }),
    })
      .then((res) => res.json())
      .catch((res) => {
        showErrorMsg("Connection error while trying to sync items to Monday!");
        return "force-hide";
      })
      .then((res) => {
        let responseString = JSON.stringify(res, null, 2);
        if (responseString.includes("error")) {
          showErrorMsg("Item update was rejected by Monday!");
          return "force-hide";
        } else {
          // showErrorMsg("Item sync was successful!", true);
          return false;
        }
      })
      .catch((res) => {
        showErrorMsg("Processing error while trying to sync items to Monday!");
        return "force-hide";
      });
  }
};

export const fetchItemData = async (offlineMode) => {
  // add in NumberInput.js a style change (!)
  // returns [start, end, bufferingState]
  // start, end could be null
  if (offlineMode !== true) {
    let res;
    let query = `{
      items_by_column_values(board_id: 1774709998, column_id: "status", column_value: "Staged") {
        name
        id
        column_values(ids: ["numbers", "numbers_1"]) {
          id
          value
        }
      }
    }`;

    try {
      res = await fetch("https://api.monday.com/v2", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjE0MDU3ODMyNSwidWlkIjoxMjcyNjA0NSwiaWFkIjoiMjAyMi0wMS0xMlQxOTo1MDo0NS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTcwMTM4MCwicmduIjoidXNlMSJ9.fUP-1slk9PDDvoQtb1XgiSzMyOMbmCZbeDMnQZ_UyEU",
        },
        body: JSON.stringify({
          query: query,
        }),
      });
      res = await res.json();
    } catch (e) {
      // console.log(e);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "/images/get_started128.png",
        title: "River",
        message: "Something went wrong connecting to Monday!",
        // add all messages to a json file, right now it's * ARABIC *
      });

      return [null, null, "force-hide", null];
    }

    try {
      let [start, end, itemName] = [
        // add + or no? a conversion already happens at a later stage
        // so for now no, the only thing it does it remove data (loss of the ability to differentiate 0 and empty values)
        res?.["data"]?.["items_by_column_values"]?.[0]?.[
          "column_values"
        ]?.[0]?.["value"],
        res?.["data"]?.["items_by_column_values"]?.[0]?.[
          "column_values"
        ]?.[1]?.["value"],
        {
          name: res?.["data"]?.["items_by_column_values"]?.[0]?.["name"],
          id: res?.["data"]?.["items_by_column_values"]?.[0]?.["id"],
        },
      ];

      if (res?.["data"]?.["items_by_column_values"]?.length === 0) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "/images/get_started128.png",
          title: "River",
          message: "No eligible quest was found on Monday!", // "Something went wrong!" message removed
        });
        return [null, null, "force-hide", null];
      }
      if (start === undefined || end === undefined) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "/images/get_started128.png",
          title: "River",
          message: "Connection rejected by Monday!", // "Something went wrong!" message removed
        });
        return [null, null, "force-hide", null];
      } else if (res?.["data"]?.["items_by_column_values"]?.length > 1) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "/images/get_started128.png",
          title: "River",
          message:
            "More than one quest discovered. Currently no support for parallel items!", // check this works
        });
        return [null, null, "force-hide", null];
      } else {
        start = +JSON.parse(start, null, 2);
        end = +JSON.parse(end, null, 2);

        if (!Number.isInteger(+start) || !Number.isInteger(+end)) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "/images/get_started128.png",
            title: "River",
            message: "Bad input received. Import failed!", // check this works
          });
          return [null, null, "force-hide", null];
        } else {
          // success
          await chrome.storage.sync.set({
            itemName,
          });
          return [start, end, "force-hide", itemName];
        }
      }
    } catch (e) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "/images/get_started128.png",
        title: "River",
        message: "Something went wrong after connecting to Monday!",
      });

      return [null, null, "force-hide", null];
    }
  } else {
    // alert(`can't fetch data in Off Grid mode!`);
    return [null, null, "force-hide", null];
  }
};

// const initialFetch -> initial fetch,
// make Timer.js use this, and return [objectIDandName,isQuestRunning]

// -----------------------------------------------------------------

// for future multiple items support:

// chrome.notifications.create({
//   type: "list",
//   iconUrl: "/images/get_started128.png",
//   title: "River",
//   items: [
//     {
//       title: "option 1",
//       message: "... and its message",
//       buttons: ["cc", "a"],
//     },
//     {
//       title: "option 2",
//       message: "... and its message",
//       buttons: ["as", "ad"],
//     },
//     {
//       title: "option 3",
//       message: "... and its message",
//       buttons: ["first button"],
//     },
//   ],
//   message: "msg",
// });
