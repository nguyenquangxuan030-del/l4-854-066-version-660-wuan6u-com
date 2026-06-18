(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      var expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || '0'));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('.js-card-filter');
  var yearInput = document.querySelector('.js-year-filter');
  var categorySelect = document.querySelector('.js-category-filter');
  var list = document.querySelector('.js-card-list');

  var normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  var updateFilter = function () {
    if (!list) {
      return;
    }

    var keyword = normalize(filterInput && filterInput.value);
    var year = normalize(yearInput && yearInput.value);
    var category = normalize(categorySelect && categorySelect.value);
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var passYear = !year || cardYear.indexOf(year) !== -1;
      var passCategory = !category || cardCategory === category;
      var show = passKeyword && passYear && passCategory;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    var empty = list.querySelector('.empty-state');
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = '没有找到匹配影片';
      list.appendChild(empty);
    }
    empty.classList.toggle('is-hidden', visible !== 0);
  };

  [filterInput, yearInput, categorySelect].forEach(function (field) {
    if (field) {
      field.addEventListener('input', updateFilter);
      field.addEventListener('change', updateFilter);
    }
  });

  updateFilter();

  var results = document.getElementById('searchResults');
  var searchInput = document.getElementById('searchInput');

  if (results && window.MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', function () {
        renderSearch(searchInput.value);
      });
    }
    renderSearch(initialQuery);
  }

  function escapeText(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearch(query) {
    var keyword = normalize(query);
    var source = window.MOVIES || [];
    var matched = source.filter(function (movie) {
      if (!keyword) {
        return true;
      }
      return normalize([
        movie.title,
        movie.region,
        movie.year,
        movie.genre,
        movie.tags,
        movie.category
      ].join(' ')).indexOf(keyword) !== -1;
    }).slice(0, 96);

    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
      return;
    }

    results.innerHTML = matched.map(function (movie) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + escapeText(movie.url) + '">',
        '<img src="' + escapeText(movie.cover) + '" alt="' + escapeText(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="play-mark">▶</span>',
        '<span class="card-badge">' + escapeText(movie.category) + '</span>',
        '</a>',
        '<div class="card-body">',
        '<h2><a href="' + escapeText(movie.url) + '">' + escapeText(movie.title) + '</a></h2>',
        '<p>' + escapeText(movie.oneLine) + '</p>',
        '<div class="card-meta">',
        '<span>' + escapeText(movie.region) + '</span>',
        '<span>' + escapeText(movie.year) + '</span>',
        '<span>' + escapeText(movie.genre) + '</span>',
        '</div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }
})();
