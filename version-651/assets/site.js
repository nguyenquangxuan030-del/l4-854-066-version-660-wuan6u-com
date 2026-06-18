(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.primary-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-index')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var filters = document.querySelectorAll('.movie-filter-area');

  filters.forEach(function (filterArea) {
    var input = filterArea.querySelector('.filter-input');
    var year = filterArea.querySelector('.filter-year');
    var type = filterArea.querySelector('.filter-type');
    var resultText = filterArea.querySelector('.result-text');
    var scope = filterArea.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var yearValue = normalize(year ? year.value : '');
      var typeValue = normalize(type ? type.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var tags = normalize(card.getAttribute('data-tags'));
        var text = title + ' ' + cardYear + ' ' + cardType + ' ' + tags;
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (resultText) {
        resultText.textContent = '符合条件：' + visible + ' 部';
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });

  var shells = document.querySelectorAll('.video-shell');

  shells.forEach(function (shell) {
    var video = shell.querySelector('.video-player');
    var layer = shell.querySelector('.play-layer');
    var toggle = shell.querySelector('.video-toggle');
    var mute = shell.querySelector('.video-mute');
    var full = shell.querySelector('.video-full');
    var errorBox = shell.querySelector('.video-error');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;
    var attached = false;

    function showError(message) {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = message;
      }
    }

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            return;
          }

          showError('视频加载失败，请稍后重试');
          hlsInstance.destroy();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        showError('播放能力受限，请更换浏览器后重试');
      }
    }

    function playVideo() {
      attachStream();

      if (!video) {
        return;
      }

      video.play().then(function () {
        shell.classList.add('playing');
        if (toggle) {
          toggle.textContent = '暂停';
        }
      }).catch(function () {
        showError('视频暂时无法播放，请稍后重试');
      });
    }

    function toggleVideo() {
      if (!video) {
        return;
      }

      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (layer) {
      layer.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', toggleVideo);
      video.addEventListener('pause', function () {
        shell.classList.remove('playing');
        if (toggle) {
          toggle.textContent = '播放';
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('playing');
        if (toggle) {
          toggle.textContent = '暂停';
        }
      });
    }

    if (toggle) {
      toggle.addEventListener('click', toggleVideo);
    }

    if (mute && video) {
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (full) {
      full.addEventListener('click', function () {
        if (!document.fullscreenElement) {
          shell.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
