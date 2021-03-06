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
      // alert("error");
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
    progressContainer.style.visibility =
      msg.integrationEnabled === true ? "visible" : "visible";

    let backgroundColor =
      +msg.val >= 0.978
        ? "#3fffa2"
        : +msg.val >= 0.567
        ? "#e9f08c"
        : +msg.val >= 0.33
        ? "#ffdb3a"
        : "#e5405e";

    let injectedText =
      msg.percentageMode || msg.eta === undefined
        ? Math.floor(+msg.val * 100) + "%"
        : msg.eta;

    document.querySelector(
      ".bg"
    ).style.background = `conic-gradient(${backgroundColor} ${
      +msg.val * 360
    }deg, #ddd ${+msg.val * 360}deg)`;

    document.getElementById("ol").innerHTML =
      `<span style="color:${backgroundColor};">` + injectedText + "</span>";

    progressContainer.onmouseenter = () => {
      injectedText = msg.progress;

      document.getElementById("ol").innerHTML =
        `<span style="color:${backgroundColor}">` + injectedText + "</span>";
    };

    progressContainer.onmouseleave = () => {
      injectedText =
        msg.percentageMode || msg.eta === undefined
          ? Math.floor(+msg.val * 100) + "%"
          : msg.eta;

      document.getElementById("ol").innerHTML =
        `<span style="color:${backgroundColor}">` + injectedText + "</span>";
    };
    // timeout was 2000 ms
  }
});
