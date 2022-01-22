chrome.runtime.sendMessage("tab-startup");

function notify(msg) {
  if (+msg === 1) {
    document.querySelector("#injected-audio2").play();
  } else if (+msg > 0) {
    document.querySelector("#injected-audio").play();
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

    document.querySelector(
      ".bg"
    ).style.background = `conic-gradient(${backgroundColor} ${
      +msg * 360
    }deg, #ddd ${+msg * 360}deg)`;
    document.getElementById("ol").innerHTML =
      `<span style="color:${backgroundColor}">` +
      Math.floor(+msg * 100) +
      "%</span>";
  }
});
