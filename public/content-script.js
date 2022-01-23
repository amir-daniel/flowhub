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
    notify(+msg);

    progressContainer.style.visibility = "visible";
    let backgroundColor =
      +msg >= 0.978
        ? "#3fffa2"
        : +msg >= 0.567
        ? "#e9f08c"
        : +msg >= 0.33
        ? "#ffdb3a"
        : "#e5405e";
    let textColor =
      +msg >= 0.978 ? "#09492A" : +msg >= 0.33 ? "#AA5B00" : "#821226";

    document.querySelector(
      ".bg"
    ).style.background = `conic-gradient(${backgroundColor} ${
      +msg * 360
    }deg, #ddd ${+msg * 360}deg)`;
    document.getElementById("ol").innerHTML =
      `<span style="color:${textColor}">` + Math.floor(+msg * 100) + "%</span>";
  }
});
