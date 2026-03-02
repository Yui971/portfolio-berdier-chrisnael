/* ==============================================================
   PORTFOLIO CHRISNAEL BERDIER — JavaScript Principal V6
   ============================================================== */

/* === MODULE 1 : THEME === */
const ThemeManager = (() => {
  const html = document.documentElement;
  const STORAGE_KEY = 'portfolio-theme';
  function getAutoTheme() { const h = new Date().getHours(); return (h >= 7 && h < 20) ? 'light' : 'dark'; }
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    const btn = document.querySelector('.theme-switch');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit');
  }
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    setTheme(saved || getAutoTheme());
    const btn = document.querySelector('.theme-switch');
    if (btn) btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next); localStorage.setItem(STORAGE_KEY, next);
    });
  }
  return { init };
})();

/* === MODULE 2 : NAVIGATION === */
const Navigation = (() => {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.nav__mobile');
  let lastScroll = 0;
  function init() {
    if (!nav) return;
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current > 100 && current > lastScroll) nav.classList.add('is-hidden');
      else nav.classList.remove('is-hidden');
      lastScroll = current;
    }, { passive: true });
    if (burger && mobileMenu) {
      burger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', isOpen);
        burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      mobileMenu.querySelectorAll('.nav__mobile-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }
  return { init };
})();

/* === MODULE 3 : SILK AURORA (replaces particles) === */
const SilkAurora = (() => {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return { init: () => {} };
  const ctx = canvas.getContext('2d');
  let w, h, t = 0, mouse = { x: -1000, y: -1000 };
  const RIBBON_COUNT = 6;

  // Simple noise function (value noise)
  const seed = Math.random() * 1000;
  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }
  function smoothNoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = noise(ix, iy), b = noise(ix + 1, iy);
    const c = noise(ix, iy + 1), d = noise(ix + 1, iy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function fbm(x, y) {
    let v = 0, a = 0.5;
    for (let i = 0; i < 4; i++) { v += a * smoothNoise(x, y); x *= 2; y *= 2; a *= 0.5; }
    return v;
  }

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }

  function getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark
      ? [
          { r: 255, g: 112, b: 67 },   // accent orange
          { r: 92, g: 160, b: 255 },    // accent blue
          { r: 200, g: 80, b: 180 },    // purple
          { r: 255, g: 180, b: 100 },   // gold
          { r: 100, g: 220, b: 200 },   // teal
          { r: 180, g: 120, b: 255 }    // violet
        ]
      : [
          { r: 232, g: 85, b: 46 },     // accent orange
          { r: 29, g: 122, b: 242 },    // accent blue
          { r: 180, g: 60, b: 150 },    // purple
          { r: 240, g: 160, b: 60 },    // gold
          { r: 16, g: 185, b: 160 },    // teal
          { r: 140, g: 80, b: 220 }     // violet
        ];
  }

  function drawRibbon(index, colors) {
    const color = colors[index % colors.length];
    const speed = 0.0003 + index * 0.00008;
    const baseY = (h / (RIBBON_COUNT + 1)) * (index + 1);
    const amplitude = h * 0.15 + index * 20;
    const segments = 80;

    ctx.beginPath();
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const px = (i / segments) * (w + 200) - 100;
      const n = fbm(px * 0.002 + t * speed * 50, index * 3.7 + t * speed * 20);
      const mouseDistX = px - mouse.x;
      const mouseDistY = baseY - mouse.y;
      const mouseDist = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY);
      const mouseInfluence = Math.max(0, 1 - mouseDist / 300) * 40;
      const mouseDir = mouseDist > 0 ? mouseDistY / mouseDist : 0;
      const py = baseY + (n - 0.5) * amplitude * 2 + mouseInfluence * mouseDir;
      points.push({ x: px, y: py });
    }

    // Draw filled ribbon with varying width
    for (let i = 0; i < points.length - 1; i++) {
      const p = points[i], np = points[i + 1];
      const progress = i / points.length;
      const ribbonWidth = (8 + 18 * Math.sin(progress * Math.PI)) * (1 + 0.3 * Math.sin(t * speed * 80 + i * 0.1));
      const alpha = 0.04 + 0.08 * Math.sin(progress * Math.PI) * (1 + 0.3 * smoothNoise(t * 0.5 + i * 0.01, index));

      ctx.beginPath();
      ctx.moveTo(p.x, p.y - ribbonWidth / 2);
      ctx.lineTo(np.x, np.y - ribbonWidth / 2);
      ctx.lineTo(np.x, np.y + ribbonWidth / 2);
      ctx.lineTo(p.x, p.y + ribbonWidth / 2);
      ctx.closePath();
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.fill();
    }

    // Draw bright core line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1], curr = points[i];
      const midX = (prev.x + curr.x) / 2, midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.12)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function animate() {
    t++;
    ctx.clearRect(0, 0, w, h);
    const colors = getColors();
    for (let i = 0; i < RIBBON_COUNT; i++) drawRibbon(i, colors);
    requestAnimationFrame(animate);
  }

  function init() {
    resize();
    animate();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    document.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });
    document.addEventListener('touchmove', (e) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchend', () => { mouse.x = -1000; mouse.y = -1000; });
  }
  return { init };
})();

/* === MODULE 4 : SCROLL REVEAL === */
const ScrollReveal = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  return { init };
})();

/* === MODULE 5 : FILTERS + SEARCH === */
const ProjectFilters = (() => {
  function init() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card[data-category]');
    const searchInput = document.getElementById('project-search');
    const emptyMsg = document.getElementById('projects-empty');
    if (!buttons.length && !searchInput) return;
    let currentFilter = 'all', currentSearch = '';

    function applyFilters() {
      let visibleCount = 0;
      cards.forEach(card => {
        const matchFilter = currentFilter === 'all' || card.dataset.category === currentFilter;
        const title = (card.dataset.projectTitle || '').toLowerCase();
        const desc = (card.dataset.projectDesc || '').toLowerCase();
        const tags = (card.dataset.projectTags || '').toLowerCase();
        const matchSearch = !currentSearch || title.includes(currentSearch) || desc.includes(currentSearch) || tags.includes(currentSearch);
        if (matchFilter && matchSearch) {
          card.classList.remove('is-hidden');
          card.style.animation = 'fadeInUp 0.5s var(--ease-out) forwards';
          visibleCount++;
        } else { card.classList.add('is-hidden'); }
      });
      if (emptyMsg) emptyMsg.classList.toggle('is-visible', visibleCount === 0);
    }
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        buttons.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
        applyFilters();
      });
    });
    if (searchInput) searchInput.addEventListener('input', (e) => { currentSearch = e.target.value.toLowerCase().trim(); applyFilters(); });
  }
  return { init };
})();

/* === MODULE 6 : SKILL BARS === */
const SkillBars = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-item__fill').forEach(fill => { fill.style.width = fill.dataset.width + '%'; });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.skill-category').forEach(cat => observer.observe(cat));
  }
  return { init };
})();

/* === MODULE 7 : COUNT UP === */
const CountUp = (() => {
  function animateCount(el, target) {
    const suffix = el.dataset.suffix || '+';
    let current = 0; const step = target / (1500 / 16);
    function update() {
      current += step;
      if (current >= target) { el.textContent = target + suffix; return; }
      el.textContent = Math.floor(current) + suffix;
      requestAnimationFrame(update);
    }
    update();
  }
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('[data-count]').forEach(el => animateCount(el, parseInt(el.dataset.count)));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.about__stats').forEach(s => observer.observe(s));
  }
  return { init };
})();

/* === MODULE 8 : CONTACT FORM === */
const ContactForm = (() => {
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('form-status');
    if (window.location.search.includes('sent=true')) {
      if (status) { status.textContent = '\u2713 Message envoy\u00e9 avec succ\u00e8s ! Je vous r\u00e9pondrai rapidement.'; status.className = 'form-status is-success'; }
      window.history.replaceState({}, '', window.location.pathname);
    }
    form.addEventListener('submit', (e) => {
      const name = form.querySelector('#form-name'), email = form.querySelector('#form-email'), message = form.querySelector('#form-message');
      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) { e.preventDefault(); status.textContent = 'Veuillez remplir tous les champs obligatoires.'; status.className = 'form-status is-error'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { e.preventDefault(); status.textContent = 'Veuillez entrer une adresse email valide.'; status.className = 'form-status is-error'; }
    });
  }
  return { init };
})();

/* === MODULE 9 : PROJECT MODAL (images + video + iframe + drag/pan) === */
const ProjectModal = (() => {
  let zoom = 1, panX = 0, panY = 0;
  let dragging = false, dsx = 0, dsy = 0, spx = 0, spy = 0;
  const STEP = 0.25, MIN = 0.5, MAX = 3;

  function init() {
    const overlay = document.getElementById('project-modal');
    if (!overlay) return;

    const closeBtn = overlay.querySelector('.project-modal__close-btn');
    const container = document.getElementById('modal-media-container');
    const img = document.getElementById('project-modal-img');
    const controls = document.getElementById('modal-controls');
    const title = document.getElementById('project-modal-title');
    const desc = document.getElementById('project-modal-desc');
    const tags = document.getElementById('project-modal-tags');
    const extLink = document.getElementById('project-modal-ext');
    const zoomIn = document.getElementById('modal-zoom-in');
    const zoomOut = document.getElementById('modal-zoom-out');
    const zoomReset = document.getElementById('modal-zoom-reset');
    const savePng = document.getElementById('modal-save-png');

    function applyTransform() {
      if (img) img.style.transform = 'scale(' + zoom + ') translate(' + panX + 'px,' + panY + 'px)';
      if (img) img.classList.toggle('is-draggable', zoom > 1);
    }
    function resetView() { zoom = 1; panX = 0; panY = 0; applyTransform(); }

    function clearMedia() {
      // Remove any video/site iframes
      container.querySelectorAll('.project-modal__video-wrap, .project-modal__site-wrap').forEach(el => el.remove());
      img.style.display = '';
      img.src = '';
      controls.style.display = '';
      if (extLink) { extLink.style.display = 'none'; extLink.href = '#'; }
    }

    function openModal(card) {
      clearMedia();
      resetView();

      const imgSrc = card.dataset.projectImg;
      const videoId = card.dataset.projectVideo;
      const siteUrl = card.dataset.projectUrl;
      const t = card.dataset.projectTitle;
      const d = card.dataset.projectDesc;
      const tgs = (card.dataset.projectTags || '').split(',').filter(Boolean);

      if (title) title.textContent = t;
      if (desc) desc.textContent = d;
      if (tags) tags.innerHTML = tgs.map(function(tg, i) { return '<span class="tag ' + (i > 0 ? 'tag--secondary' : '') + '">' + tg.trim() + '</span>'; }).join('');

      if (videoId) {
        // YouTube embed
        img.style.display = 'none';
        controls.style.display = 'none';
        var vw = document.createElement('div');
        vw.className = 'project-modal__video-wrap';
        vw.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        container.insertBefore(vw, controls);
      } else if (siteUrl && !imgSrc) {
        // Website iframe
        img.style.display = 'none';
        controls.style.display = 'none';
        var sw = document.createElement('div');
        sw.className = 'project-modal__site-wrap';
        sw.innerHTML = '<iframe src="' + siteUrl + '" loading="lazy"></iframe>';
        container.insertBefore(sw, controls);
        if (extLink) { extLink.href = siteUrl; extLink.style.display = 'inline-flex'; }
      } else if (imgSrc) {
        // Regular image
        img.src = imgSrc;
        img.alt = t;
        controls.style.display = '';
      }

      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      clearMedia();
      resetView();
    }

    // Zoom
    if (zoomIn) zoomIn.addEventListener('click', function(e) { e.stopPropagation(); if (zoom < MAX) { zoom += STEP; applyTransform(); } });
    if (zoomOut) zoomOut.addEventListener('click', function(e) { e.stopPropagation(); if (zoom > MIN) { zoom -= STEP; if (zoom <= 1) { panX = 0; panY = 0; } applyTransform(); } });
    if (zoomReset) zoomReset.addEventListener('click', function(e) { e.stopPropagation(); resetView(); });

    // Wheel zoom
    if (container) container.addEventListener('wheel', function(e) {
      if (!img || img.style.display === 'none') return;
      e.preventDefault();
      if (e.deltaY < 0 && zoom < MAX) zoom += STEP;
      else if (e.deltaY > 0 && zoom > MIN) zoom -= STEP;
      if (zoom <= 1) { panX = 0; panY = 0; }
      applyTransform();
    }, { passive: false });

    // Drag/pan
    if (img) {
      img.addEventListener('mousedown', function(e) {
        if (zoom <= 1) return;
        dragging = true; dsx = e.clientX; dsy = e.clientY; spx = panX; spy = panY;
        img.classList.add('is-dragging'); e.preventDefault();
      });
      document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        panX = spx + (e.clientX - dsx) / zoom;
        panY = spy + (e.clientY - dsy) / zoom;
        applyTransform();
      });
      document.addEventListener('mouseup', function() { if (dragging) { dragging = false; if (img) img.classList.remove('is-dragging'); } });

      img.addEventListener('touchstart', function(e) {
        if (zoom <= 1 || e.touches.length !== 1) return;
        dragging = true; dsx = e.touches[0].clientX; dsy = e.touches[0].clientY; spx = panX; spy = panY;
        img.classList.add('is-dragging');
      }, { passive: true });
      document.addEventListener('touchmove', function(e) {
        if (!dragging) return;
        panX = spx + (e.touches[0].clientX - dsx) / zoom;
        panY = spy + (e.touches[0].clientY - dsy) / zoom;
        applyTransform();
      }, { passive: true });
      document.addEventListener('touchend', function() { if (dragging) { dragging = false; if (img) img.classList.remove('is-dragging'); } });
    }

    // Save PNG
    if (savePng) savePng.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!img || !img.src || img.style.display === 'none') return;
      var src = img.src.replace('.webp', '.png');
      var fn = (title.textContent || 'projet').replace(/[^a-zA-Z0-9\u00e0-\u00ff\s-]/gi, '').replace(/\s+/g, '-').toLowerCase() + '.png';
      fetch(src).then(function(r) { return r.ok ? r : fetch(img.src); }).then(function(r) { return r.blob(); }).then(function(blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = fn;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }).catch(function() { window.open(img.src, '_blank'); });
    });

    // Attach cards
    document.querySelectorAll('.project-card[data-project-title]').forEach(function(card) {
      var btn = card.querySelector('.project-card__link');
      if (btn) btn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); openModal(card); });
      card.addEventListener('click', function() { openModal(card); });
      card.addEventListener('keydown', function(e) { if (e.key === 'Enter') openModal(card); });
    });

    // Close
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal(); });
  }
  return { init };
})();

/* === MODULE 10 : CV VIEWER === */
const CVViewer = (() => {
  function init() {
    const openBtn = document.getElementById('open-cv-viewer');
    const overlay = document.getElementById('cv-modal');
    if (!openBtn || !overlay) return;

    const closeBtn = document.getElementById('cv-modal-close');
    const iframe = document.getElementById('cv-modal-iframe');

    function open() {
      iframe.src = 'assets/cv/CV_BERDIER_CHRISNAEL.pdf';
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      iframe.src = '';
    }
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });
  }
  return { init };
})();

/* === MODULE 11 : LEGAL MODAL === */
const LegalModal = (() => {
  function init() {
    const overlay = document.getElementById('legal-modal');
    const openBtn = document.getElementById('open-legal');
    if (!overlay || !openBtn) return;
    const closeBtn = overlay.querySelector('.modal__close');
    function open() { overlay.classList.add('is-open'); closeBtn.focus(); document.body.style.overflow = 'hidden'; }
    function close() { overlay.classList.remove('is-open'); openBtn.focus(); document.body.style.overflow = ''; }
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });
  }
  return { init };
})();

/* === MODULE 12 : A11Y WIDGET === */
const A11yWidget = (() => {
  let zoomLevel = 1;
  function init() {
    const toggle = document.getElementById('a11y-toggle');
    const panel = document.getElementById('a11y-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function() { var isOpen = panel.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', isOpen); });
    document.addEventListener('click', function(e) { if (!e.target.closest('.a11y-widget')) { panel.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); } });
    document.querySelectorAll('[data-zoom]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = btn.dataset.zoom;
        if (action === 'increase' && zoomLevel < 1.5) zoomLevel += 0.1;
        if (action === 'decrease' && zoomLevel > 0.85) zoomLevel -= 0.1;
        if (action === 'reset') zoomLevel = 1;
        document.documentElement.style.setProperty('--a11y-zoom', zoomLevel);
      });
    });
    var contrastBtn = document.getElementById('contrast-toggle');
    if (contrastBtn) contrastBtn.addEventListener('click', function() { var a = document.body.classList.toggle('high-contrast'); contrastBtn.setAttribute('aria-pressed', a); });
    var motionBtn = document.getElementById('motion-toggle');
    if (motionBtn) motionBtn.addEventListener('click', function() { var a = document.body.classList.toggle('reduce-motion'); motionBtn.setAttribute('aria-pressed', a); });
    var spacingBtn = document.getElementById('spacing-toggle');
    if (spacingBtn) spacingBtn.addEventListener('click', function() { var a = document.body.classList.toggle('wide-spacing'); spacingBtn.setAttribute('aria-pressed', a); });
  }
  return { init };
})();

/* === MODULE 13 : BACK TO TOP === */
const BackToTop = (() => {
  function init() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function() { btn.classList.toggle('is-visible', window.scrollY > 400); }, { passive: true });
    btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  return { init };
})();

/* === INIT === */
document.addEventListener('DOMContentLoaded', function() {
  ThemeManager.init();
  Navigation.init();
  SilkAurora.init();
  ScrollReveal.init();
  ProjectFilters.init();
  ProjectModal.init();
  CVViewer.init();
  SkillBars.init();
  CountUp.init();
  ContactForm.init();
  LegalModal.init();
  A11yWidget.init();
  BackToTop.init();
});
