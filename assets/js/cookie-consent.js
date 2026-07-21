/**
 * Consentimiento de cookies (RGPD) + carga condicional del Meta Pixel.
 * El Pixel NO se carga hasta que el usuario acepta explícitamente.
 * La decisión se guarda en localStorage y se respeta en las siguientes visitas.
 */
(function () {
  var PIXEL_ID = '1033012012713811';
  var STORAGE_KEY = 'arga_cookies_consent'; // valores: 'granted' | 'denied'

  // --- Carga del Meta Pixel (solo se llama con consentimiento) ---
  function loadMetaPixel() {
    if (window._argaPixelLoaded) return;
    window._argaPixelLoaded = true;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }

  // --- Si ya hay consentimiento previo, actuar sin mostrar el banner ---
  var prev = getConsent();
  if (prev === 'granted') { loadMetaPixel(); return; }
  if (prev === 'denied') { return; }

  // --- Sin decisión previa: mostrar el banner ---
  function injectStyles() {
    if (document.getElementById('arga-cc-styles')) return;
    var css =
      '#arga-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:520px;margin:0 auto;' +
      'background:#0a0a0a;color:#fff;border-radius:16px;padding:20px 22px;' +
      'box-shadow:0 12px 40px rgba(0,0,0,.28);font-family:Inter,system-ui,-apple-system,sans-serif;' +
      'opacity:0;transform:translateY(12px);transition:opacity .35s ease,transform .35s ease;}' +
      '#arga-cc.is-in{opacity:1;transform:translateY(0);}' +
      '#arga-cc p{margin:0 0 14px;font-size:14px;line-height:1.55;color:#e8e8e8;}' +
      '#arga-cc a{color:#fff;text-decoration:underline;}' +
      '#arga-cc .arga-cc-actions{display:flex;gap:10px;flex-wrap:wrap;}' +
      '#arga-cc button{flex:1 1 auto;min-width:130px;cursor:pointer;border-radius:999px;' +
      'padding:11px 18px;font-size:14px;font-weight:600;font-family:inherit;border:1px solid transparent;transition:opacity .2s ease;}' +
      '#arga-cc button:hover{opacity:.85;}' +
      '#arga-cc .arga-cc-accept{background:#fff;color:#0a0a0a;}' +
      '#arga-cc .arga-cc-reject{background:transparent;color:#fff;border-color:rgba(255,255,255,.35);}' +
      '@media(max-width:480px){#arga-cc button{flex:1 1 100%;}}';
    var style = document.createElement('style');
    style.id = 'arga-cc-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildBanner() {
    injectStyles();
    var box = document.createElement('div');
    box.id = 'arga-cc';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Consentimiento de cookies');
    box.innerHTML =
      '<p>Usamos cookies propias y de terceros (Meta) para analizar el tráfico y ' +
      'medir nuestras campañas. Puedes aceptarlas o rechazarlas. ' +
      'Más info en nuestra <a href="/cookies.html">política de cookies</a>.</p>' +
      '<div class="arga-cc-actions">' +
      '<button type="button" class="arga-cc-reject">Rechazar</button>' +
      '<button type="button" class="arga-cc-accept">Aceptar</button>' +
      '</div>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('is-in'); });

    function close() {
      box.classList.remove('is-in');
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 350);
    }
    box.querySelector('.arga-cc-accept').addEventListener('click', function () {
      setConsent('granted'); loadMetaPixel(); close();
    });
    box.querySelector('.arga-cc-reject').addEventListener('click', function () {
      setConsent('denied'); close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildBanner);
  } else {
    buildBanner();
  }
})();
