chrome.runtime.sendMessage("tab-startup");

function notify(msg) {
  let playObj;
  if (+msg === 1) {
    playObj = document.querySelector("#injected-audio2").play();
  } else if (+msg > 0) {
    playObj = document.querySelector("#injected-audio").play();
  }

  if (playObj !== undefined) {
    playObj.catch((e) => {
      console.log("Something went wrong playing sound! " + e.message);
    });
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sndResponse) => {
  var progressContainer = document.getElementById("pc");

  if (msg === "off") {
    progressContainer.style.visibility = "hidden";
  } else {
    if (msg.msg !== "no-audio") {
      notify(+msg.val);
    }
    progressContainer.style.visibility = "visible";
    let backgroundColor =
      +msg.val >= 0.978
        ? "#3fffa2"
        : +msg.val >= 0.567
        ? "#e9f08c"
        : +msg.val >= 0.33
        ? "#ffdb3a"
        : "#e5405e";
    let textColor =
      +msg.val >= 0.978 ? "#09492A" : +msg.val >= 0.33 ? "#AA5B00" : "#821226";

    document.querySelector(
      ".bg"
    ).style.background = `conic-gradient(${backgroundColor} ${
      +msg.val * 360
    }deg, #ddd ${+msg.val * 360}deg)`;
    document.getElementById("ol").innerHTML =
      `<span style="color:${textColor}">` +
      Math.floor(+msg.val * 100) +
      "%</span>";
  }
});
