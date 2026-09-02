/* ARGA Decks — navegación + escalado 16:9 */
(function () {
  var deck = document.getElementById('deck');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var i = 0;

  /* --- Footer automático en cada slide (salvo data-nofoot) --- */
  var deckName = deck.dataset.deck || document.title;
  slides.forEach(function (s, idx) {
    if (s.hasAttribute('data-nofoot')) return;
    var f = s.querySelector('.s-foot');
    if (!f) {
      f = document.createElement('footer');
      f.className = 's-foot';
      f.innerHTML =
        '<span class="brand"><img src="assets/logo.png" alt="ARGA">' +
        '<span>' + deckName + '</span></span>' +
        '<span class="pg"></span>';
      s.appendChild(f);
    }
    var pg = f.querySelector('.pg');
    if (pg) pg.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  });

  /* --- Barra de navegación --- */
  var nav = document.createElement('div');
  nav.id = 'nav';
  nav.innerHTML =
    '<button data-a="prev" title="Anterior (←)">‹</button>' +
    '<span class="count"><b class="cur">1</b> / <span class="tot"></span></span>' +
    '<button data-a="next" title="Siguiente (→)">›</button>' +
    '<button data-a="print" title="Exportar a PDF (P)">⎙</button>';
  document.body.appendChild(nav);
  nav.querySelector('.tot').textContent = slides.length;
  var curEl = nav.querySelector('.cur');

  /* Auditoría: recorre TODOS los slides y marca en el <title> los que
     tengan contenido cortado por debajo del pie. Solo con ?audit=1 */
  function auditAll() {
    var prev = i, hits = [];
    slides.forEach(function (s, idx) {
      slides.forEach(function (o, k) { o.classList.toggle('is-active', k === idx); });
      var sr = s.getBoundingClientRect();
      var foot = s.querySelector('.s-foot');
      var limit = foot ? foot.getBoundingClientRect().top : sr.bottom;
      var bad = 0;
      s.querySelectorAll('.s-body > *, .cta-box, .grid').forEach(function (el) {
        var over = el.getBoundingClientRect().bottom - limit;
        if (over > 2) bad = Math.max(bad, Math.round(over));
      });
      if (bad) hits.push((idx + 1) + ':+' + bad);
    });
    slides.forEach(function (o, k) { o.classList.toggle('is-active', k === prev); });
    var t = document.title.split(' [CUT')[0];
    if (hits.length) document.title = t + ' [CUT ' + hits.join(' ') + ']';
  }

  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, idx) { s.classList.toggle('is-active', idx === i); });
    curEl.textContent = i + 1;
    if (location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
  }
  function next() { show(i + 1); }
  function prev() { show(i - 1); }

  nav.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.dataset.a;
    if (a === 'next') next();
    else if (a === 'prev') prev();
    else if (a === 'print') window.print();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(slides.length - 1);
    else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); window.print(); }
    else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    }
  });

  /* Click en el slide: avanzar (mitad derecha) / retroceder (mitad izquierda) */
  document.getElementById('stage').addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    var r = deck.getBoundingClientRect();
    if (e.clientX < r.left + r.width * 0.28) prev(); else next();
  });

  /* Swipe táctil */
  var x0 = null;
  document.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) { dx < 0 ? next() : prev(); }
    x0 = null;
  }, { passive: true });

  /* --- Escalado responsive del 1280x720 --- */
  function fit() {
    var pad = 48;
    var s = Math.min((window.innerWidth - pad) / 1280, (window.innerHeight - pad) / 720);
    deck.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  fit();

  /* Mostrar nav brevemente al mover el ratón */
  var t;
  document.addEventListener('mousemove', function () {
    nav.classList.add('show');
    clearTimeout(t);
    t = setTimeout(function () { nav.classList.remove('show'); }, 1800);
  });

  var start = parseInt((location.hash || '').slice(1), 10);
  show(isNaN(start) ? 0 : start - 1);

  if (/[?&]audit=1/.test(location.search)) setTimeout(auditAll, 250);
})();
