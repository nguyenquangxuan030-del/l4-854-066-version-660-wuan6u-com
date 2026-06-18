(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHeroSlider() {
    var slides = all("[data-hero-slide]");
    var panels = all("[data-hero-panel]");
    var dots = all("[data-hero-dot]");
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    var index = 0;
    var timer;

    if (!slides.length || !panels.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      panels.forEach(function (panel, panelIndex) {
        panel.classList.toggle("is-active", panelIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  function initCatalogFilters() {
    all("[data-filter-area]").forEach(function (area) {
      var input = area.querySelector("[data-filter-input]");
      var year = area.querySelector("[data-filter-year]");
      var type = area.querySelector("[data-filter-type]");
      var count = area.querySelector("[data-filter-count]");
      var cards = all(".movie-card", area);

      function update() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();

          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var okType = !typeValue || card.getAttribute("data-type") === typeValue;

          if (okKeyword && okYear && okType) {
            card.classList.remove("is-hidden");
            visible += 1;
          } else {
            card.classList.add("is-hidden");
          }
        });

        if (count) {
          count.textContent = visible + " 部";
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });

      update();
    });
  }

  function initPlayers() {
    all("[data-player]").forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector("[data-player-start]");
      var status = frame.querySelector("[data-player-status]");
      var hlsInstance = null;
      var bound = false;

      if (!video) {
        return;
      }

      var source = video.getAttribute("data-src");

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function bindSource() {
        if (bound || !source) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          setStatus("HLS 播放源已就绪");
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("原生 HLS 播放源已就绪");
        } else {
          video.src = source;
          setStatus("正在尝试加载播放源");
        }

        bound = true;
      }

      function playVideo() {
        bindSource();
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setStatus("请再次点击播放按钮开始观看");
          });
        }
      }

      function toggleVideo() {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      video.addEventListener("click", function () {
        toggleVideo();
      });

      video.addEventListener("play", function () {
        frame.classList.add("is-playing");
        setStatus("正在播放");
      });

      video.addEventListener("pause", function () {
        frame.classList.remove("is-playing");
        setStatus("已暂停");
      });

      video.addEventListener("ended", function () {
        frame.classList.remove("is-playing");
        setStatus("播放结束");
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  }

  function renderSearchResults() {
    var container = document.getElementById("search-results");
    var summary = document.getElementById("search-summary");
    var field = document.getElementById("search-keyword");

    if (!container || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();

    if (field) {
      field.value = keyword;
    }

    function card(movie) {
      return [
        '<a class="movie-card" href="' + escapeHtml(movie.href) + '" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '" data-region="' + escapeHtml(movie.region) + '">',
        '  <div class="poster-wrap">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-play">▶</span>',
        '    <span class="region-badge">' + escapeHtml(movie.region) + '</span>',
        '  </div>',
        '  <div class="card-body">',
        '    <h3>' + escapeHtml(movie.title) + '</h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.category) + '</span></div>',
        '  </div>',
        '</a>'
      ].join("");
    }

    if (!keyword) {
      var sample = window.MOVIES.slice(0, 24);
      container.innerHTML = sample.map(card).join("");
      if (summary) {
        summary.textContent = "请输入关键词搜索，或先浏览下方推荐影片。";
      }
      return;
    }

    var lower = keyword.toLowerCase();
    var results = window.MOVIES.filter(function (movie) {
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine,
        movie.category
      ].join(" ").toLowerCase().indexOf(lower) !== -1;
    });

    container.innerHTML = results.length ? results.map(card).join("") : [
      '<div class="empty-state">',
      '  <h2>未找到相关影片</h2>',
      '  <p>请尝试更换片名、地区、类型或年份关键词。</p>',
      '  <a class="btn" href="categories.html">浏览分类</a>',
      '</div>'
    ].join("");

    if (summary) {
      summary.textContent = "搜索 “" + keyword + "” 找到 " + results.length + " 部影片";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroSlider();
    initCatalogFilters();
    initPlayers();
    renderSearchResults();
  });
})();
