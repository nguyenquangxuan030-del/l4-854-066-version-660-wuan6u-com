(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.hasAttribute('hidden') === false;
      if (isOpen) {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      } else {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    schedule();
  }

  function setupFilters() {
    var list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var input = document.querySelector('[data-page-search], [data-search-input]');
    var status = document.querySelector('[data-search-status]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var activeFilter = '';
    var queryValue = getQueryValue();

    if (input && queryValue) {
      input.value = queryValue;
    }

    function apply() {
      var q = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var typeValue = normalize(card.getAttribute('data-type'));
        var matchesText = !q || haystack.indexOf(q) !== -1;
        var matchesType = !activeFilter || typeValue.indexOf(normalize(activeFilter)) !== -1;
        var shouldShow = matchesText && matchesType;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = q ? '搜索结果：' + q : '精选影片';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || '';
        apply();
      });
    });

    if (chips[0]) {
      chips[0].classList.add('active');
    }

    apply();
  }

  function attachSource(video, source) {
    if (video.dataset.ready === '1') {
      return;
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = source;
  }

  window.MoviePlayer = {
    init: function (videoId, source) {
      var video = document.getElementById(videoId);
      if (!video) {
        return;
      }

      var shell = video.closest('.player-shell');
      var overlay = shell ? shell.querySelector('.player-overlay') : null;

      function start() {
        attachSource(video, source);
        if (overlay) {
          overlay.setAttribute('hidden', '');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.removeAttribute('hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.setAttribute('hidden', '');
        }
      });
    }
  };

  setupHero();
  setupFilters();
})();
