var MoviePlayer = {
  init: function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var ready = false;

    function load() {
      if (ready || !video) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      if (button) button.classList.add('is-hidden');
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {
          if (button) button.classList.remove('is-hidden');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
      video.addEventListener('play', function () {
        if (button) button.classList.add('is-hidden');
      });
      video.addEventListener('ended', function () {
        if (button) button.classList.remove('is-hidden');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  }
};
