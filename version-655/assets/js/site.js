(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          window.location.href = "./movies.html";
        }
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
      var current = 0;
      var timer = null;
      var activate = function (index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };
      var next = function () {
        activate((current + 1) % slides.length);
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          activate(index);
          if (timer) {
            window.clearInterval(timer);
          }
          timer = window.setInterval(next, 6000);
        });
      });
      if (slides.length > 1) {
        timer = window.setInterval(next, 6000);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var applyFilter = function (value) {
      var keyword = normalize(value || query);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var visible = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("is-filter-hidden", !visible);
      });
    };
    if (query) {
      document.querySelectorAll("input[name='q']").forEach(function (input) {
        input.value = query;
      });
      applyFilter(query);
    }

    document.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        var bar = button.closest("[data-filter-bar]");
        if (bar) {
          bar.querySelectorAll("[data-filter]").forEach(function (other) {
            other.classList.remove("is-active");
          });
        }
        button.classList.add("is-active");
        applyFilter(button.getAttribute("data-filter"));
      });
    });
  });
})();

function MoviePagePlayer(config) {
  var video = document.querySelector(config.video);
  var overlay = document.querySelector(config.overlay);
  var button = document.querySelector(config.button);
  var errorBox = document.querySelector(config.error);
  var player = null;
  var attached = false;
  var useNative = false;
  var wantPlay = false;

  if (!video || !overlay || !button) {
    return;
  }

  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.hidden = false;
    }
  }

  function hideError() {
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }
  }

  function playNow() {
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        if (wantPlay) {
          showError("视频加载失败，请稍后重试。");
        }
      });
    }
  }

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;
    hideError();

    if (window.Hls && window.Hls.isSupported()) {
      player = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      player.loadSource(config.stream);
      player.attachMedia(video);
      player.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (wantPlay) {
          playNow();
        }
      });
      player.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showError("视频加载失败，请稍后重试。");
          if (player) {
            player.destroy();
            player = null;
          }
        }
      });
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      useNative = true;
      video.src = config.stream;
      return;
    }

    showError("视频加载失败，请稍后重试。");
  }

  function startVideo() {
    wantPlay = true;
    attachStream();
    if (useNative || video.readyState > 0 || player) {
      playNow();
    }
  }

  function toggleVideo() {
    if (video.paused) {
      startVideo();
    } else {
      video.pause();
    }
  }

  overlay.addEventListener("click", startVideo);
  button.addEventListener("click", function (event) {
    event.stopPropagation();
    startVideo();
  });
  video.addEventListener("click", toggleVideo);
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
    hideError();
  });
  video.addEventListener("pause", function () {
    overlay.classList.remove("is-hidden");
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
  video.addEventListener("error", function () {
    showError("视频加载失败，请稍后重试。");
  });
}
