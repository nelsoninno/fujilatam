/* map.js : renders the distributor map and its detail panel.
   Geometry comes from latam-geo.js. All copy comes from data attributes so the
   three language builds share one script. */
(function () {
  'use strict';
  var host = document.querySelector('[data-map]');
  if (!host || !window.FUJI_GEO) return;

  var GEO = window.FUJI_GEO;
  var COPY = JSON.parse(host.getAttribute('data-copy'));
  var NAMES = COPY.countries;
  var DIST = COPY.distributors;     // { cc: [names] }  present = named coverage
  var ORDER = Object.keys(NAMES);

  /* A country under this rendered area is too small to click reliably, so it
     also gets a marker. Driven by real geometry, not a hand kept list. */
  var SMALL_AREA = 1600;

  var svgns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgns, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + GEO.w + ' ' + GEO.h);
  svg.setAttribute('class', 'map__svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', COPY.mapLabel);

  /* built with createElementNS: setting innerHTML on an SVG node parses as HTML
     and leaves a visible filter-region box in some browsers */
  function el(name, attrs) {
    var n = document.createElementNS(svgns, name);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]); }
    return n;
  }
  var defs = el('defs', {});
  var filt = el('filter', { id: 'mglow', x: '-60%', y: '-60%', width: '220%', height: '220%' });
  filt.appendChild(el('feGaussianBlur', { stdDeviation: '5', result: 'b' }));
  var merge = el('feMerge', {});
  merge.appendChild(el('feMergeNode', { 'in': 'b' }));
  merge.appendChild(el('feMergeNode', { 'in': 'SourceGraphic' }));
  filt.appendChild(merge);
  defs.appendChild(filt);
  svg.appendChild(defs);

  var gShapes = document.createElementNS(svgns, 'g');
  var gMarks = document.createElementNS(svgns, 'g');
  svg.appendChild(gShapes);
  svg.appendChild(gMarks);

  var nodes = {};
  ORDER.forEach(function (cc) {
    var geo = GEO.paths[cc];
    if (!geo) return;
    var p = document.createElementNS(svgns, 'path');
    p.setAttribute('d', geo.d);
    p.setAttribute('class', 'map__c' + (DIST[cc] ? ' is-named' : ''));
    p.setAttribute('tabindex', '0');
    p.setAttribute('role', 'button');
    p.setAttribute('aria-label', NAMES[cc]);
    p.dataset.cc = cc;
    gShapes.appendChild(p);
    nodes[cc] = p;

    /* small countries need a real hit target and a visible presence */
    if (geo.c && geo.a < SMALL_AREA) {
      var c = document.createElementNS(svgns, 'circle');
      c.setAttribute('cx', geo.c[0]);
      c.setAttribute('cy', geo.c[1]);
      c.setAttribute('r', 8);
      c.setAttribute('class', 'map__dot' + (DIST[cc] ? ' is-named' : ''));
      c.dataset.cc = cc;
      c.setAttribute('tabindex', '0');
      c.setAttribute('role', 'button');
      c.setAttribute('aria-label', NAMES[cc]);
      gMarks.appendChild(c);
    }
  });

  var wrap = host.querySelector('[data-map-canvas]');
  wrap.appendChild(svg);
  var panel = host.querySelector('[data-map-panel]');

  function select(cc) {
    Object.keys(nodes).forEach(function (k) { nodes[k].classList.toggle('is-on', k === cc); });
    Array.prototype.forEach.call(gMarks.children, function (d) {
      d.classList.toggle('is-on', d.dataset.cc === cc);
    });
    var names = DIST[cc];
    var html = '<p class="eyebrow">' + NAMES[cc] + '</p>';
    if (names && names.length) {
      html += '<p class="map__status map__status--named">' + COPY.covered + '</p><ul class="map__list">';
      names.forEach(function (n) { html += '<li>' + n + '</li>'; });
      html += '</ul><p class="map__note">' + COPY.coveredNote + '</p>';
    } else {
      html += '<p class="map__status">' + COPY.ask + '</p>' +
              '<p class="map__note">' + COPY.askNote + '</p>';
    }
    html += '<a class="btn btn--brass" style="margin-top:1.1rem" href="' + COPY.ctaHref + '">' + COPY.cta + '</a>';
    panel.innerHTML = html;
  }

  function onPick(e) {
    var t = e.target.closest('[data-cc]');
    if (!t) return;
    select(t.dataset.cc);
  }
  svg.addEventListener('click', onPick);
  svg.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(e); }
  });

  select(COPY.initial);
})();
