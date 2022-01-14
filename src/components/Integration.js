/*global chrome*/
const integrationEnabled = true; // or maybe state
// later possible to add: "which integration: monday, ..., and also option to add private key"
const showErrorMsg = (msg) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/images/get_started128.png",
    title: "River",
    message: msg,
  });
};
export const StartRecordingOut = async (itemID) => {
  if (integrationEnabled === true) {
    let query5 = `mutation ($data: JSON!) {
            change_multiple_column_values(board_id: 1774709998, item_id: ${itemID}, column_values: $data) {
              id
            }
          }`;
    let vars;
    vars = {
      data: JSON.stringify({
        status: "Recording",
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
          showErrorMsg("Item sync was successful!");
          return false;
        }
      })
      .catch((res) => {
        showErrorMsg("Processing error while trying to sync items to Monday!");
        return "force-hide";
      });
  }
};

// const initialFetch -> initial fetch,
// make Timer.js use this, and return [objectIDandName,isQuestRunning]
