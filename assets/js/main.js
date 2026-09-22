/* main.js : nav, scroll reveals, and the product finder. No dependencies. */
(function () {
  'use strict';

  /* ---- mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---- scroll motion ---- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal, .rise, .wipe, .stat');

  /* stagger siblings inside a grid so a row arrives as a wave, not a block */
  document.querySelectorAll('.grid, .stats').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (el, i) {
      if (i > 0 && i < 5) el.classList.add('reveal-d' + i);
    });
  });

  if (!reduce && 'IntersectionObserver' in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* hero video eases as the page scrolls past it */
  var heroVid = document.querySelector('.hero__media video');
  if (heroVid && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroVid.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0) scale(' + (1 + y * 0.00012) + ')';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- product finder ----
     A guide, not a quote. It narrows the catalogue to the product families that
     fit the project and states the capacity and speed bands those families are
     normally specified in. It never returns a price. */
  var finder = document.querySelector('[data-finder]');
  if (!finder) return;

  var COPY = JSON.parse(finder.getAttribute('data-copy'));
  var answers = { use: null, floors: null, priority: null };

  finder.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    var group = chip.getAttribute('data-group');
    var value = chip.getAttribute('data-value');
    answers[group] = value;
    finder.querySelectorAll('.chip[data-group="' + group + '"]').forEach(function (c) {
      c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
    });
    render();
  });

  /* Capacity and speed bands are read off the FUJI construction layout tables.
     They describe how a family is normally specified, not a quotation. */
  var FAMILY = {
    mrl:      { key: 'mrl',      cap: '450 - 2000 kg (6 - 26 pers.)', spd: '1.0 - 2.5 m/s' },
    smr:      { key: 'smr',      cap: '450 - 2000 kg (6 - 26 pers.)', spd: '1.0 - 4.0 m/s' },
    pano:     { key: 'pano',     cap: '450 - 2000 kg (6 - 26 pers.)', spd: '1.0 - 4.0 m/s' },
    villa:    { key: 'villa',    cap: '260 - 400 kg (3 - 5 pers.)',   spd: '0.4 m/s' },
    plat:     { key: 'plat',     cap: '150 - 400 kg',                 spd: '' },
    bed:      { key: 'bed',      cap: '1600 - 2000 kg (21 - 26 pers.)', spd: '1.0 - 2.5 m/s' },
    freight:  { key: 'freight',  cap: '630 - 10 000 kg',              spd: '0.25 - 4.0 m/s' },
    car:      { key: 'car',      cap: '3000 - 5000 kg',               spd: '0.25 - 0.5 m/s' },
    parking:  { key: 'parking',  cap: '2 - 15',             spd: '' },
    esc:      { key: 'esc',      cap: '3600 - 6000 pers./h',          spd: '0.5 m/s' },
    walk:     { key: 'walk',     cap: '0 / 12 deg',                spd: '0.5 m/s' },
    hydra:    { key: 'hydra',    cap: '1000 - 5000 kg',               spd: '0.25 - 0.5 m/s' },
    dumb:     { key: 'dumb',     cap: '100 - 300 kg',                 spd: '0.4 - 1.0 m/s' }
  };

  /* Ranking, not a decision tree. Each building type has a base score per
     equipment family; the number of levels and the stated priority adjust
     those scores. A family that is not in the base set is never injected,
     which is what keeps a home lift out of a 20 storey office. */
  var BASE = {
    residencial: { villa: 55, plat: 42, mrl: 90, smr: 40, pano: 35, freight: 60, parking: 45 },
    hotel:       { smr: 85, mrl: 80, freight: 75, esc: 45, dumb: 35 },
    comercial:   { esc: 95, mrl: 75, pano: 60, freight: 70, walk: 55 },
    hospital:    { bed: 110, mrl: 80, freight: 70, dumb: 55 },
    oficinas:    { mrl: 88, smr: 80, pano: 65, freight: 55 },
    aeropuerto:  { walk: 92, esc: 88, freight: 70, smr: 60 },
    industrial:  { freight: 95, hydra: 70, car: 55, dumb: 40 },
    parqueo:     { car: 95, parking: 90, mrl: 50 }
  };
  var BY_FLOORS = {
    '1-3':  { villa: 45, plat: 40, hydra: 40, smr: -60, pano: -5 },
    '4-8':  { villa: -70, plat: -60, hydra: 5, smr: -25 },
    '9-15': { villa: -100, plat: -100, hydra: -60, smr: 15 },
    '16+':  { villa: -100, plat: -100, hydra: -100, smr: 30, pano: 10 }
  };
  var BY_PRIORITY = {
    trafico:     { smr: 18, esc: 8, mrl: 5, freight: -5 },
    presupuesto: { plat: 18, hydra: 20, mrl: 8, pano: -25, smr: -10 },
    diseno:      { pano: 30, villa: 8, esc: 3 },
    espacio:     { mrl: 22, plat: 15, parking: 12, smr: -18, hydra: -10 }
  };

  function recommend(a) {
    var base = BASE[a.use];
    if (!base) return [];
    var fl = BY_FLOORS[a.floors] || {};
    var pr = BY_PRIORITY[a.priority] || {};
    var scored = [];
    for (var k in base) {
      if (!Object.prototype.hasOwnProperty.call(base, k)) continue;
      var score = base[k] + (fl[k] || 0) + (pr[k] || 0);
      if (score > 0) scored.push({ k: k, s: score });
    }
    scored.sort(function (x, y) { return y.s - x.s; });
    return scored.slice(0, 4).map(function (x) { return x.k; });
  }

  var out = finder.querySelector('[data-finder-out]');
  function render() {
    if (!answers.use || !answers.floors || !answers.priority) {
      out.innerHTML = '<p class="note">' + COPY.prompt + '</p>';
      return;
    }
    var keys = recommend(answers);
    var html = '<p class="eyebrow">' + COPY.resultTitle + '</p>';
    keys.forEach(function (k, i) {
      var fam = FAMILY[k];
      var t = COPY.families[k];
      if (!t) return;
      html += '<div class="rec">' +
              '<span class="rec__img"><img src="' + t.img + '" alt="' + t.name + '" loading="lazy"></span>' +
              '<span><h4>' + (i === 0 ? COPY.primary + ' ' : '') + t.name + '</h4>' +
              '<p>' + t.why + '</p>' +
              '<p class="rec__meta">' + COPY.capacity + ': ' + fam.cap + (fam.spd ? '  &middot;  ' + COPY.speed + ': ' + fam.spd : '') + '</p></span></div>';
    });
    html += '<p class="note">' + COPY.disclaimer + '</p>' +
            '<a class="btn btn--brass" href="#distribuidores" style="margin-top:1rem">' + COPY.cta + '</a>';
    out.innerHTML = html;
  }
  render();
})();

/* Distributor application form.
   Country is a list, and the city list follows the country (Pedro, 21 Sept).
   "Otra" opens a free text field. Every field and the consent box are required.
   Submissions go to a Google Sheet through a Google Apps Script web app: paste
   its /exec URL into data-endpoint on the form. The script and the setup steps
   are in _source/forms/ in the working folder. */
(function () {
  'use strict';
  var form = document.querySelector('[data-apply]');
  if (!form) return;
  var copy = JSON.parse(form.getAttribute('data-copy'));
  var CITIES = copy.cities;
  var country = form.querySelector('#country');
  var city = form.querySelector('#city');
  var cityOther = form.querySelector('#city-other');
  var otherWrap = form.querySelector('[data-city-other]');
  var status = form.querySelector('[data-form-status]');

  function fillCities() {
    var list = CITIES[country.value] || [];
    var html = '<option value="">' + copy.pickCity + '</option>';
    list.forEach(function (c) { html += '<option>' + c + '</option>'; });
    html += '<option value="__other">' + copy.other + '</option>';
    city.innerHTML = html;
    city.disabled = !country.value;
    toggleOther();
  }
  function toggleOther() {
    var on = city.value === '__other';
    otherWrap.hidden = !on;
    cityOther.required = on;
  }
  country.addEventListener('change', fillCities);
  city.addEventListener('change', toggleOther);
  fillCities();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form__status';
    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = copy.missing;
      status.classList.add('is-error');
      return;
    }
    var data = new FormData(form);
    if (data.get('city') === '__other') data.set('city', data.get('city_other'));
    data.delete('city_other');
    data.set('lang', document.documentElement.lang);
    data.set('page', location.href);
    data.set('sent_at', new Date().toISOString());
    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) {
      status.textContent = copy.notLive;
      status.classList.add('is-error');
      return;
    }
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    status.textContent = copy.sending;
    fetch(endpoint, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) })
      .then(function () {
        form.reset(); fillCities();
        status.textContent = copy.sent;
        status.classList.add('is-ok');
      })
      .catch(function () {
        status.textContent = copy.failed;
        status.classList.add('is-error');
      })
      .then(function () { btn.disabled = false; });
  });
})();

/* Design gallery tabs */
(function () {
  'use strict';
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var tabs = g.querySelectorAll('[role=tab]');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) {
          var on = x === t;
          x.setAttribute('aria-selected', on ? 'true' : 'false');
          document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
        });
      });
    });
  });
})();
