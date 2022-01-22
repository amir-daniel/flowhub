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

      var scrollbar = document.createElement("div");
      scrollbar.className = "ol";
      scrollbar.id = "ol";

      var scrollbar2 = document.createElement("div");
      scrollbar2.className = "bg";

      progressContainer.appendChild(scrollbar);
      progressContainer.appendChild(scrollbar2);

      // document.body.prepend(progressContainer);
      document.body.insertBefore(progressContainer, document.body.firstChild);

      created = true;
      drawn = true;
    } else {
      var progressContainer = document.getElementById(
        "exentsion-progress-container"
      );
      progressContainer.style.visibility = "visible";
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
