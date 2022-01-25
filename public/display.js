var drawn = false;
var created = false;

function draw() {
  var height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  if (!drawn) {
    // if (height > 0) {
    if (!created) {
      var progressContainer = document.createElement("div");
      progressContainer.className = "pc";
      progressContainer.style.visibility = "hidden"; // start hidden
      progressContainer.id = "pc";

      var scrollbar = document.createElement("div");
      scrollbar.className = "ol";
      scrollbar.id = "ol";

      var scrollbar2 = document.createElement("div");
      scrollbar2.className = "bg";

      progressContainer.appendChild(scrollbar);
      progressContainer.appendChild(scrollbar2);

      // document.body.prepend(progressContainer);
      document.body.insertBefore(progressContainer, document.body.firstChild);

      // insert audio
      const audio = new Audio(chrome.runtime.getURL("sounds/increment.mp3"));
      audio.id = "injected-audio";
      // audio.crossOrigin = "anonymous";
      document.body.appendChild(audio);
      const audio2 = new Audio(chrome.runtime.getURL("sounds/complete.mp3"));
      audio2.id = "injected-audio2";
      // audio2.crossOrigin = "anonymous";
      document.body.appendChild(audio2);
      // /insert audio

      // fontface;

      // let link = document.createElement("link");
      // link.setAttribute("rel", "stylesheet");
      // link.setAttribute("type", "text/css");
      // link.setAttribute(
      //   "href",
      //   chrome.runtime.getURL("/content-style2.css")
      //   //"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600"
      // );
      // // alert(chrome.runtime.getURL("/fonts/space-grotesk-latin-regular.woff"));
      // document.head.appendChild(link);
      // ------------------------------------->
      // var styles = `@font-face {font-family: Space Grotesk; font-style: normal; font-weight: 500; src: url("${chrome.runtime.getURL(
      //   "/fonts/space-grotesk-latin-regular.woff"
      // )}");}`;

      // var styleSheet = document.createElement("style");
      // styleSheet.setAttribute("type", "text/css");

      // styleSheet.innerText = styles;

      // document.head.appendChild(styleSheet);

      //fontface
      // <-------------------------------------------

      created = true;
      drawn = true;
    } else {
      // var progressContainer = document.getElementById(
      //   "exentsion-progress-container"
      // );
      // progressContainer.style.visibility = "visible";
      drawn = true;
    }
    // }
  } else {
    if (created) {
      //   if (height <= 0) {
      // var progressContainer = document.getElementById(
      //   "exentsion-progress-container"
      // );
      // progressContainer.style.visibility = "hidden";
      // drawn = false;
      //   }
    }
  }
}

draw();
// window.addEventListener("resize", draw);
