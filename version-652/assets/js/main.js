(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    if (!button) return;
    button.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('is-menu-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      button.textContent = isOpen ? '×' : '☰';
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) return;
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) window.clearInterval(timer);
        activate(i);
        start();
      });
    });

    activate(0);
    start();
  }

  function setupFilters(root) {
    var panel = qs('[data-filter-panel]', root);
    var list = qs('[data-card-list]', root) || qs('[data-search-results]', root);
    if (!panel || !list) return;
    var inputs = {
      keyword: qs('[data-filter-keyword]', panel),
      region: qs('[data-filter-region]', panel),
      type: qs('[data-filter-type]', panel),
      year: qs('[data-filter-year]', panel),
      category: qs('[data-filter-category]', panel)
    };

    function apply() {
      var keyword = normalize(inputs.keyword && inputs.keyword.value);
      var region = normalize(inputs.region && inputs.region.value);
      var type = normalize(inputs.type && inputs.type.value);
      var year = normalize(inputs.year && inputs.year.value);
      var category = normalize(inputs.category && inputs.category.value);
      qsa('.movie-card', list).forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var show = true;
        if (keyword && text.indexOf(keyword) === -1) show = false;
        if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) show = false;
        if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) show = false;
        if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) show = false;
        if (category && normalize(card.getAttribute('data-category')) !== category) show = false;
        card.style.display = show ? '' : 'none';
      });
    }

    Object.keys(inputs).forEach(function (key) {
      var el = inputs[key];
      if (!el) return;
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card card-grid" data-title="', escapeHtml(movie.title), '" data-region="', escapeHtml(movie.region), '" data-type="', escapeHtml(movie.type), '" data-year="', escapeHtml(movie.year), '" data-category="', escapeHtml(movie.category), '" data-search="', escapeHtml([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.description, movie.categoryName].join(' ')), '">',
      '<a class="poster-link" href="./', escapeHtml(movie.link), '" aria-label="观看', escapeHtml(movie.title), '">',
      '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy">',
      '<span class="poster-shade"></span><span class="play-badge">▶</span><span class="quality-badge">HD</span>',
      '</a><div class="card-body"><a class="card-title" href="./', escapeHtml(movie.link), '">', escapeHtml(movie.title), '</a>',
      '<div class="card-meta"><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.type), '</span><span>', escapeHtml(movie.year), '</span></div>',
      '<p>', escapeHtml(movie.description), '</p><div class="card-foot"><span class="rating">★ ', escapeHtml(movie.rating), '</span><a href="./', escapeHtml(movie.category), '.html">', escapeHtml(movie.categoryName), '</a></div>',
      '</div></article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var resultRoot = qs('[data-search-results]');
    if (!resultRoot || !window.MOVIES) return;
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q'));
    var title = qs('[data-search-title]');
    var pageInput = qs('.page-search input[name="q"]');
    if (pageInput && params.get('q')) pageInput.value = params.get('q');
    var found = window.MOVIES.filter(function (movie) {
      if (!query) return true;
      return normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.description, movie.categoryName].join(' ')).indexOf(query) !== -1;
    });
    resultRoot.innerHTML = found.map(cardTemplate).join('');
    if (title) {
      title.textContent = query ? '搜索结果：' + params.get('q') : '全部可检索影片';
    }
    setupFilters(document);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters(document);
    setupSearchPage();
  });
})();
