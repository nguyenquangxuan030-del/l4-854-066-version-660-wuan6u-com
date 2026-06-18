(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function activateSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activateSlide(index);
      });
    });

    if (slides.length > 1) {
      activateSlide(0);
      window.setInterval(function () {
        activateSlide(current + 1);
      }, 5600);
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    filterPanels.forEach(function (panel) {
      var scope = document.querySelector(panel.getAttribute("data-filter-panel"));
      if (!scope) {
        return;
      }
      var input = panel.querySelector("[data-filter-search]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
      var empty = document.querySelector(panel.getAttribute("data-empty-target"));

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-type"));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var matchType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var visible = matchKeyword && matchYear && matchType;
          card.style.display = visible ? "" : "none";
          if (visible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
    });
  });

  window.setupMoviePlayer = function (source) {
    ready(function () {
      var video = document.getElementById("movieVideo");
      var overlay = document.getElementById("playOverlay");
      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.setAttribute("data-ready", "1");
      }

      function startPlayback() {
        attachSource();
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (overlay && !video.ended) {
          overlay.classList.remove("is-hidden");
        }
      });
    });
  };
})();
