import { H as Hls } from './hls.js';

var players = Array.prototype.slice.call(document.querySelectorAll('.static-player'));

players.forEach(function (player) {
  var video = player.querySelector('video');
  var button = player.querySelector('.player-overlay');
  var media = player.getAttribute('data-media');
  var hlsInstance = null;

  var start = function () {
    if (!video || !media) {
      return;
    }

    player.classList.add('is-playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = media;
      }
      video.play().catch(function () {
        player.classList.remove('is-playing');
      });
      return;
    }

    if (Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(media);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            player.classList.remove('is-playing');
          });
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hlsInstance.destroy();
            hlsInstance = null;
            player.classList.remove('is-playing');
          }
        });
      } else {
        video.play().catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.currentTime) {
        player.classList.remove('is-playing');
      }
    });
  }
});
