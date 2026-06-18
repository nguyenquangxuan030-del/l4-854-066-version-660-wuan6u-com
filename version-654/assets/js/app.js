(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      input.value = input.value.trim();
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function setHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setHero(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setHero(index);
        startHero();
      });
    });

    setHero(0);
    startHero();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var textInput = filterPanel.querySelector('[data-filter-text]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var text = textInput ? textInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var region = (card.getAttribute('data-region') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var textMatch = !text || title.indexOf(text) !== -1 || region.indexOf(text) !== -1 || cardType.toLowerCase().indexOf(text) !== -1 || cardYear.indexOf(text) !== -1;
        var yearMatch = !year || cardYear === year;
        var typeMatch = !type || cardType.indexOf(type) !== -1;
        card.classList.toggle('is-hidden', !(textMatch && yearMatch && typeMatch));
      });
    }

    [textInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !stream) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (!video.getAttribute('src') && !hlsInstance) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          playVideo();
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (cover) {
                cover.classList.remove('is-hidden');
              }
            }
          });
        } else {
          video.src = stream;
          playVideo();
        }
      } else {
        playVideo();
      }
    }

    function playVideo() {
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  var results = document.querySelector('[data-search-results]');
  if (results && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = document.querySelector('[data-search-title]');
    var pageForm = document.querySelector('[data-search-page-form]');
    var pageInput = pageForm ? pageForm.querySelector('input[name="q"]') : null;

    if (pageInput) {
      pageInput.value = query;
    }

    if (query) {
      var lowered = query.toLowerCase();
      var found = window.SEARCH_MOVIES.filter(function (item) {
        return item.text.toLowerCase().indexOf(lowered) !== -1;
      }).slice(0, 80);

      if (title) {
        title.textContent = '搜索结果';
      }

      if (found.length) {
        results.innerHTML = found.map(function (item) {
          return [
            '<article class="movie-card" data-movie-card>',
            '  <a class="movie-card__poster" href="' + item.url + '">',
            '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '    <span class="poster-shade"></span>',
            '    <span class="quality">HD</span>',
            '    <span class="play-chip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>',
            '  </a>',
            '  <div class="movie-card__body">',
            '    <div class="movie-card__labels"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
            '    <h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
            '    <p>' + escapeHtml(item.desc) + '</p>',
            '    <div class="movie-card__foot"><span class="score">★ ' + escapeHtml(item.rating) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
            '  </div>',
            '</article>'
          ].join('');
        }).join('');
      } else {
        results.innerHTML = '<div class="search-empty">没有找到匹配内容，可以尝试其他关键词。</div>';
      }
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
