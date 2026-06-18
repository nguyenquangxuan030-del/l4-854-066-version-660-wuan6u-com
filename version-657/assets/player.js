(function () {
  var shell = document.querySelector("[data-video-url]");

  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var button = shell.querySelector("[data-play-button]");
  var source = shell.getAttribute("data-video-url");

  if (!video || !source) {
    return;
  }

  function bindSource() {
    var HlsClass = window.Hls;

    if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
      var hls = new HlsClass({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      if (HlsClass.Events && HlsClass.Events.MANIFEST_PARSED) {
        hls.on(HlsClass.Events.MANIFEST_PARSED, function () {
          shell.classList.add("is-ready");
        });
      }

      window.addEventListener("beforeunload", function () {
        hls.destroy();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      shell.classList.add("is-ready");
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    var action = video.paused ? video.play() : video.pause();

    if (action && action.catch) {
      action.catch(function () {});
    }
  }

  bindSource();

  if (button) {
    button.addEventListener("click", playVideo);
  }

  video.addEventListener("click", playVideo);

  video.addEventListener("play", function () {
    shell.classList.add("is-playing");
  });

  video.addEventListener("pause", function () {
    shell.classList.remove("is-playing");
  });

  video.addEventListener("ended", function () {
    shell.classList.remove("is-playing");
  });
})();
