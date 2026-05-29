// =========================================================
//  ARGA Premium Cars — Motion + Interactions
//  Vanilla JS, Framer-Motion-like easings and behavior
// =========================================================

// Theme: always light (axioma-style)
document.documentElement.setAttribute('data-theme', 'light');

document.addEventListener('DOMContentLoaded', () => {

  // -------------------------------------------------------
  //  Header color toggle (invierte SOLO los colores del header)
  // -------------------------------------------------------
  const header = document.querySelector('.site-header');
  if (header){
    try{
      if (localStorage.getItem('arga-header') === 'light') header.classList.add('is-light');
    }catch(e){}
    document.querySelectorAll('.header-theme-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isLight = header.classList.toggle('is-light');
        try{ localStorage.setItem('arga-header', isLight ? 'light' : 'dark'); }catch(e){}
      });
    });
  }

  // -------------------------------------------------------
  //  Mobile nav (drawer)
  // -------------------------------------------------------
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav .close');
  if (burger && mobileNav){
    burger.addEventListener('click', () => {
      mobileNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (mobileClose){
    mobileClose.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }
  // Close on link click
  document.querySelectorAll('.mobile-nav a').forEach((a) => {
    a.addEventListener('click', () => {
      mobileNav?.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  // -------------------------------------------------------
  //  Reveal on scroll with stagger (sets --i incrementally)
  // -------------------------------------------------------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting){
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  // Auto-stagger groups: any container with .stagger sets --i on children
  document.querySelectorAll('.stagger').forEach((g) => {
    [...g.children].forEach((c, i) => {
      if (!c.classList.contains('reveal')) c.classList.add('reveal');
      c.style.setProperty('--i', i);
    });
  });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // -------------------------------------------------------
  //  Count-up for .count nodes (data-to="300")
  // -------------------------------------------------------
  const counters = document.querySelectorAll('[data-count-to]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const to = parseInt(el.dataset.countTo, 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur = parseInt(el.dataset.dur || '1400', 10);
      const start = performance.now();
      function tick(now){
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = prefix + Math.round(to * eased).toLocaleString('es-ES') + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => countIO.observe(c));

  // -------------------------------------------------------
  //  Hero: parallax big word with mouse + scroll
  // -------------------------------------------------------
  const heroFrame = document.querySelector('.hero-frame');
  const bigWord = document.querySelector('.hero-big-word');
  if (heroFrame && bigWord){
    let mx = 0, my = 0, cx = 0, cy = 0;
    heroFrame.addEventListener('mousemove', (e) => {
      const rect = heroFrame.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      my = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    });
    heroFrame.addEventListener('mouseleave', () => { mx = 0; my = 0; });
    function loop(){
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      bigWord.style.transform = `translate(calc(-50% + ${cx}px), ${cy}px)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  // Scroll parallax for big word (light, performance-friendly)
  const scrollTargets = document.querySelectorAll('[data-parallax]');
  if (scrollTargets.length){
    let ticking = false;
    function applyParallax(){
      const y = window.scrollY;
      scrollTargets.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translateY(${y * speed}px)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking){ requestAnimationFrame(applyParallax); ticking = true; }
    }, { passive: true });
  }

  // -------------------------------------------------------
  //  Slider arrows (horizontal scroll snap) — robust slide-by-slide nav
  //  Looks for [data-prev]/[data-next] inside the wrapper first, then
  //  falls back to the closest <section> so arrows can live anywhere
  //  inside the same section as the slider.
  // -------------------------------------------------------
  document.querySelectorAll('[data-slider]').forEach((wrap) => {
    const track = wrap.querySelector('.slider');
    if (!track) return;

    const scope = wrap.closest('section') || document;
    const prev = wrap.querySelector('[data-prev]') || scope.querySelector('[data-prev]');
    const next = wrap.querySelector('[data-next]') || scope.querySelector('[data-next]');

    function slidePositions(){
      const slides = [...track.children];
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 24);
      const positions = [0];
      for (let i = 0; i < slides.length - 1; i++){
        positions.push(positions[i] + slides[i].offsetWidth + gap);
      }
      return positions;
    }

    function go(dir){
      const positions = slidePositions();
      const cur = track.scrollLeft;
      let target;
      if (dir > 0){
        target = positions.find(p => p > cur + 8);
        if (target === undefined) target = positions[positions.length - 1];
      } else {
        const before = positions.filter(p => p < cur - 8);
        target = before.length ? before[before.length - 1] : 0;
      }
      track.scrollTo({ left: target, behavior: 'smooth' });
    }

    function updateDisabled(){
      if (!prev || !next) return;
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= max;
    }

    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(1));
    track.addEventListener('scroll', updateDisabled, { passive: true });
    window.addEventListener('resize', updateDisabled);
    // Initial state once layout settles
    requestAnimationFrame(updateDisabled);

    // -----------------------------------------------------
    //  Auto-scroll al pasar el cursor por los extremos
    // -----------------------------------------------------
    let edgeVel = 0;       // px por frame (negativo = izquierda)
    let edgeRaf = null;
    const EDGE_ZONE = 0.18; // 18% del ancho a cada lado
    const EDGE_MAX = 16;    // velocidad máxima en px/frame

    function edgeLoop(){
      if (edgeVel !== 0){
        track.scrollLeft += edgeVel;
        edgeRaf = requestAnimationFrame(edgeLoop);
      } else {
        edgeRaf = null;
        track.style.scrollSnapType = '';
      }
    }
    track.addEventListener('mousemove', (e) => {
      const r = track.getBoundingClientRect();
      const x = e.clientX - r.left;
      const zone = r.width * EDGE_ZONE;
      let v = 0;
      if (x < zone)               v = -EDGE_MAX * (1 - x / zone);
      else if (x > r.width - zone) v =  EDGE_MAX * (1 - (r.width - x) / zone);
      edgeVel = v;
      if (v !== 0){
        track.style.scrollSnapType = 'none';
        if (edgeRaf === null) edgeLoop();
      }
    });
    track.addEventListener('mouseleave', () => { edgeVel = 0; });

  });

  // -------------------------------------------------------
  //  Filter pills (Coches / Portfolio)
  // -------------------------------------------------------
  document.querySelectorAll('[data-filter-bar]').forEach((bar) => {
    const cards = document.querySelectorAll(bar.dataset.target);
    bar.querySelectorAll('.filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.filter-pill').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.dataset.filter;
        cards.forEach((c) => {
          const match = f === 'all' || c.dataset.cat === f;
          c.style.display = match ? '' : 'none';
        });
      });
    });
  });

  // -------------------------------------------------------
  //  Active nav link (pill-nav + mobile)
  // -------------------------------------------------------
  const here = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
  document.querySelectorAll('.pill-nav a, .mobile-nav a').forEach((a) => {
    const href = (a.getAttribute('href') || '').split('/').pop().replace(/\.html$/, '');
    if (href === here) a.classList.add('is-active');
  });

  // -------------------------------------------------------
  //  Footer year
  // -------------------------------------------------------
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // -------------------------------------------------------
  //  Smooth anchor scroll
  // -------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});
