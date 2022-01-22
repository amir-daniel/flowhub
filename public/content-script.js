chrome.runtime.sendMessage("tab-startup");

chrome.runtime.onMessage.addListener((msg, sender, sndResponse) => {
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
});
