(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slider = document.querySelector("[data-hero-carousel]");

  if (slider) {
    var slides = Array.prototype.slice.call(
      slider.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      slider.querySelectorAll("[data-hero-dot]"),
    );
    var current = 0;

    function showSlide(index) {
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
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var filterForm = document.querySelector("[data-filter-form]");
  var cards = Array.prototype.slice.call(
    document.querySelectorAll("[data-keywords]"),
  );
  var emptyState = document.querySelector("[data-empty-state]");

  if (filterForm && cards.length) {
    var keyword = filterForm.querySelector("[data-filter-keyword]");
    var region = filterForm.querySelector("[data-filter-region]");
    var year = filterForm.querySelector("[data-filter-year]");

    function applyFilters() {
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var selectedRegion = region ? region.value : "";
      var selectedYear = year ? year.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        var cardRegion = card.getAttribute("data-region") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchKeyword = !q || keywords.indexOf(q) !== -1;
        var matchRegion = !selectedRegion || cardRegion === selectedRegion;
        var matchYear = !selectedYear || cardYear === selectedYear;
        var visible = matchKeyword && matchRegion && matchYear;

        card.style.display = visible ? "" : "none";

        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", shown === 0);
      }
    }

    filterForm.addEventListener("input", applyFilters);
    filterForm.addEventListener("change", applyFilters);

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (keyword && initialQuery) {
      keyword.value = initialQuery;
    }

    applyFilters();
  }
})();
