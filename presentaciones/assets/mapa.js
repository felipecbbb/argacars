/* ARGA — mapas mentales: conectores automáticos + escalado + atajos */
(function () {
  var map = document.getElementById('map');
  var svg = map.querySelector('svg.wires');

  /* --- Conectores: solo para el layout .auto (los mapas con posiciones
         absolutas traen sus paths escritos a mano en el HTML). --- */
  function wires() {
    var auto = map.querySelector('.auto');
    if (!auto || !svg) return;
    var core = auto.querySelector('.core');
    if (!core) return;

    /* Coordenadas locales vía offsetLeft/offsetTop: no dependen del zoom
       aplicado al #map, así que valen igual en pantalla y al imprimir. */
    function box(el) {
      var x = 0, y = 0, n = el;
      while (n && n !== map) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
    }
    var c = box(core);
    var cy = c.y + c.h / 2;
    var d = [];

    function curve(x1, y1, x2, y2) {
      var dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
      /* Tirador horizontal: crece con el desnivel para que la curva salga y
         entre plana en las cajas en vez de quedarse casi vertical. */
      var k = Math.min(dx * 0.92, Math.max(dx * 0.5, dy * 0.34));
      var s = x2 > x1 ? 1 : -1;
      return 'M' + r(x1) + ',' + r(y1) +
             ' C ' + r(x1 + k * s) + ',' + r(y1) +
             ' ' + r(x2 - k * s) + ',' + r(y2) +
             ' ' + r(x2) + ',' + r(y2);
    }
    function r(v) { return Math.round(v * 10) / 10; }

    auto.querySelectorAll('.col.left > .node').forEach(function (n) {
      var b = box(n);
      d.push('<path d="' + curve(c.x, cy, b.x + b.w, b.y + b.h / 2) + '"/>');
    });
    auto.querySelectorAll('.col.right > .node').forEach(function (n) {
      var b = box(n);
      d.push('<path d="' + curve(c.x + c.w, cy, b.x, b.y + b.h / 2) + '"/>');
    });

    var flow = map.querySelector('.flow');
    if (flow) {
      var f = box(flow);
      var x = c.x + c.w / 2;
      var y1 = c.y + c.h, y2 = f.y;
      d.push('<path class="soft" d="M' + x + ',' + y1 + ' C ' + x + ',' + (y1 + (y2 - y1) * 0.5) +
             ' ' + x + ',' + (y1 + (y2 - y1) * 0.7) + ' ' + x + ',' + y2 + '"/>');
    }
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.innerHTML = d.join('');
  }

  function fit() {
    var s = Math.min((window.innerWidth - 48) / 1600, (window.innerHeight - 48) / 900);
    map.style.transform = 'scale(' + s + ')';
  }

  /* --- Aviso de desborde: marca el título para poder detectarlo al generar --- */
  function overflow() {
    var bad = null;
    var auto = map.querySelector('.auto');
    if (auto) {
      var a = auto.getBoundingClientRect();
      var fl = map.querySelector('.flow');
      var limit = fl ? fl.getBoundingClientRect().top - 4 : a.bottom + 8;
      map.querySelectorAll('.auto .col').forEach(function (c) {
        if (c.scrollHeight - c.clientHeight > 8) bad = 'col+' + (c.scrollHeight - c.clientHeight);
      });
      map.querySelectorAll('.auto .node').forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top < a.top - 14) bad = 'top-' + Math.round(a.top - r.top);
        else if (r.bottom > limit) bad = 'bot+' + Math.round(r.bottom - limit);
      });
    }
    var t = document.title.split(' [OVERFLOW')[0];
    document.title = bad ? t + ' [OVERFLOW ' + bad + ']' : t;
  }

  function refresh() { fit(); wires(); overflow(); }
  window.addEventListener('resize', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  refresh();
  setTimeout(refresh, 120);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); window.print(); }
    if (e.key === 'f' || e.key === 'F') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    }
  });
})();
