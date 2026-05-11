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
      function closeMenu() {
        mobileMenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
      }
      burger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', isOpen);
        burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      const closeBtn = document.getElementById('nav-mobile-close');
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);
      mobileMenu.querySelectorAll('.nav__mobile-link').forEach(link => {
        link.addEventListener('click', closeMenu);
      });
    }
  }
  return { init };
})();

/* === MODULE 3 : PARTICULES === */
const ParticleSystem = (() => {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return { init: () => {} };
  const ctx = canvas.getContext('2d');
  let particles = []; let mouse = { x: null, y: null }; let animId;
  const COUNT_MOBILE = 40; const COUNT_DESKTOP = 80;
  const CONNECT_DIST = 140; const MOUSE_RADIUS = 180;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 1;
      this.speedX = (Math.random() - 0.5) * 0.6; this.speedY = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      if (mouse.x !== null) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          this.x += dx * force * 0.015; this.y += dy * force * 0.015;
          this.opacity = Math.min(0.8, this.opacity + 0.02);
        } else { this.opacity = Math.max(0.1, this.opacity - 0.005); }
      }
      if (this.x < 0) this.x = canvas.width; if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height; if (this.y > canvas.height) this.y = 0;
    }
    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const c = isDark ? '255,255,255' : '26,26,46';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c}, ${this.opacity})`; ctx.fill();
    }
  }

  const isFullPage = canvas.classList.contains('page-particles');
  function resize() {
    if (isFullPage) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    else { const hero = canvas.parentElement; canvas.width = hero.clientWidth; canvas.height = hero.clientHeight; }
    const count = window.innerWidth < 768 ? COUNT_MOBILE : COUNT_DESKTOP;
    particles = Array.from({ length: count }, () => new Particle());
  }
  function drawLines() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const c = isDark ? '255,255,255' : '26,26,46';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${c}, ${(1 - dist / CONNECT_DIST) * 0.15})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); }); drawLines();
    animId = requestAnimationFrame(animate);
  }
  function init() {
    resize(); animate();
    window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); animate(); });
    const mouseTarget = isFullPage ? document : canvas;
    mouseTarget.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    mouseTarget.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    mouseTarget.addEventListener('touchmove', (e) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });
    mouseTarget.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });
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
  ParticleSystem.init();
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

/* === MODULE V8 : LOADER === */
const Loader = (() => {
  function init() {
    const loader = document.getElementById('site-loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('is-done'), 2200);
    });
  }
  return { init };
})();

/* === MODULE V8 : CUSTOM CURSOR === */
const CustomCursor = (() => {
  function init() {
    const cur = document.getElementById('custom-cursor');
    if (!cur || !window.matchMedia('(pointer: fine)').matches) return;
    document.addEventListener('mousemove', e => {
      cur.style.left = e.clientX + 'px';
      cur.style.top = e.clientY + 'px';
      if (!cur.classList.contains('is-visible')) cur.classList.add('is-visible');
    });
    document.querySelectorAll('a, button, .project-card, .nav__link, .filter-btn').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
    });
  }
  return { init };
})();

/* === MODULE V8 : PAGE TRANSITIONS === */
const PageTransitions = (() => {
  function init() {
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;
    // Intercept internal navigation links
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.hasAttribute('download') || link.getAttribute('target') === '_blank') return;
      link.addEventListener('click', e => {
        e.preventDefault();
        overlay.classList.add('is-entering');
        setTimeout(() => { window.location.href = href; }, 650);
      });
    });
    // On page load, slide overlay out
    overlay.classList.remove('is-entering');
    if (performance.navigation && performance.navigation.type === 1) return; // skip on reload
    if (sessionStorage.getItem('page-transition')) {
      overlay.style.transform = 'translateY(0)';
      overlay.style.transition = 'none';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.transition = '';
          overlay.classList.add('is-leaving');
          setTimeout(() => {
            overlay.classList.remove('is-leaving');
            overlay.style.transform = '';
          }, 700);
        });
      });
    }
    sessionStorage.setItem('page-transition', '1');
  }
  return { init };
})();

/* === INIT V8 MODULES === */
Loader.init();
CustomCursor.init();
PageTransitions.init();

/* === MODULE V8 : LANGUAGE SELECTOR + TRANSLATIONS === */
const LangSelector = (() => {
  const translations = {
    fr: {
      // NAV
      'nav.home': 'Accueil', 'nav.about': 'À propos', 'nav.projects': 'Projets', 'nav.skills': 'Compétences', 'nav.contact': 'Contact',
      // HERO
      'hero.greeting': '👋 Salut, moi c\'est',
      'hero.subtitle': 'Étudiant en BUT MMI — Je crée des identités visuelles percutantes, des interfaces soignées et des supports de communication qui marquent les esprits.',
      'hero.badge': 'Disponible pour un stage ou une alternance',
      // ABOUT (homepage)
      'about.label': 'À propos',
      'about.title': 'Le design au service du\u00a0sens',
      'about.p1': 'Étudiant en BUT Métiers du Multimédia et de l\'Internet, je me spécialise en design graphique et communication visuelle. Mon approche mêle créativité, rigueur typographique et sensibilité esthétique pour concevoir des visuels et des identités qui racontent une histoire.',
      'about.p2': 'Passionné par la direction artistique, je m\'investis autant dans la recherche UX que dans la création d\'affiches, de logos et d\'univers visuels cohérents. L\'accessibilité est au cœur de ma démarche.',
      'about.cta': 'En savoir plus',
      'stat.projects': 'Projets réalisés', 'stat.degree': 'BAC+2 en cours', 'stat.tools': 'Outils maîtrisés',
      // PROJETS PAGE
      'projets.title': 'Mes projets', 'projets.subtitle': 'Production graphique, développement web et audiovisuel',
      'projets.search': 'Rechercher un projet…', 'projets.empty': 'Aucun projet ne correspond à votre recherche.',
      'filter.all': 'Tous', 'filter.graphic': 'Production graphique', 'filter.web': 'Développement web', 'filter.video': 'Audio & Vidéo',
      // A PROPOS PAGE
      'apropos.title': 'À propos', 'apropos.subtitle': 'Mon parcours, mes valeurs, ma vision du design', 'apropos.name': 'Chrisnaël Berdier',
      'apropos.p1': 'J\'ai 19 ans et je suis actuellement en première année de BUT Métiers du Multimédia et de l\'Internet à l\'Université des Antilles, campus de Saint-Claude en Guadeloupe. Avant cela, j\'ai débuté par une L1 Humanités qui m\'a apporté une solide base en réflexion et communication.',
      'apropos.p2': 'Ma passion pour le design graphique s\'exprime à travers la création d\'identités visuelles, de compositions typographiques et de supports de communication. Je suis convaincu que le design est un langage : chaque couleur, chaque forme, chaque espace a un sens.',
      'apropos.p3': 'En parallèle de mes études, j\'ai acquis de l\'expérience professionnelle en tant qu\'hôte de caisse chez Carrefour Milenis et vendeur chez Be Sport. Ces expériences m\'ont appris la rigueur, le travail d\'équipe et la relation client.',
      'apropos.p4': 'Dynamique et motivé, je suis à la recherche d\'un stage ou d\'une alternance en design graphique, direction artistique ou communication visuelle.',
      'apropos.dl': 'Télécharger mon CV', 'apropos.view': 'Visualiser le CV', 'apropos.contact': 'Me contacter',
      'val.precision': 'Précision', 'val.a11y': 'Accessibilité', 'val.creative': 'Créativité',
      // SKILLS PAGE
      'skills.title': 'Mes compétences',
      // CONTACT PAGE
      'contact.title': 'Me contacter',
      // FOOTER
      'footer.legal': 'Mentions légales'
    },
    en: {
      'nav.home': 'Home', 'nav.about': 'About', 'nav.projects': 'Projects', 'nav.skills': 'Skills', 'nav.contact': 'Contact',
      'hero.greeting': '👋 Hi, I\'m',
      'hero.subtitle': 'Multimedia & Internet student — I create striking visual identities, refined interfaces and communication materials that leave a lasting impression.',
      'hero.badge': 'Available for internship or work-study',
      'about.label': 'About',
      'about.title': 'Design in service of\u00a0meaning',
      'about.p1': 'Multimedia & Internet student, I specialize in graphic design and visual communication. My approach blends creativity, typographic precision and aesthetic sensibility to craft visuals and identities that tell a story.',
      'about.p2': 'Passionate about art direction, I invest equally in UX research and in creating posters, logos and cohesive visual universes. Accessibility is at the heart of my process.',
      'about.cta': 'Learn more',
      'stat.projects': 'Projects completed', 'stat.degree': 'BAC+2 in progress', 'stat.tools': 'Tools mastered',
      'projets.title': 'My projects', 'projets.subtitle': 'Graphic design, web development and audiovisual',
      'projets.search': 'Search a project…', 'projets.empty': 'No project matches your search.',
      'filter.all': 'All', 'filter.graphic': 'Graphic design', 'filter.web': 'Web development', 'filter.video': 'Audio & Video',
      'apropos.title': 'About', 'apropos.subtitle': 'My journey, my values, my vision of design', 'apropos.name': 'Chrisnaël Berdier',
      'apropos.p1': 'I am 19 years old and currently a first-year student in Multimedia & Internet at the Université des Antilles, Saint-Claude campus in Guadeloupe. Before that, I started with a first year in Humanities which gave me a solid foundation in critical thinking and communication.',
      'apropos.p2': 'My passion for graphic design comes through in creating visual identities, typographic compositions and communication materials. I am convinced that design is a language: every color, every shape, every space has meaning.',
      'apropos.p3': 'Alongside my studies, I gained professional experience as a cashier at Carrefour Milenis and a sales associate at Be Sport. These experiences taught me discipline, teamwork and customer relations.',
      'apropos.p4': 'Dynamic and motivated, I am looking for an internship or work-study in graphic design, art direction or visual communication.',
      'apropos.dl': 'Download my CV', 'apropos.view': 'View CV', 'apropos.contact': 'Contact me',
      'val.precision': 'Precision', 'val.a11y': 'Accessibility', 'val.creative': 'Creativity',
      'skills.title': 'My skills',
      'contact.title': 'Contact me',
      'footer.legal': 'Legal notice'
    },
    es: {
      'nav.home': 'Inicio', 'nav.about': 'Sobre mí', 'nav.projects': 'Proyectos', 'nav.skills': 'Habilidades', 'nav.contact': 'Contacto',
      'hero.greeting': '👋 Hola, soy',
      'hero.subtitle': 'Estudiante de Multimedia e Internet — Creo identidades visuales impactantes, interfaces cuidadas y materiales de comunicación que dejan huella.',
      'hero.badge': 'Disponible para prácticas o alternancia',
      'about.label': 'Sobre mí',
      'about.title': 'Diseño al servicio del\u00a0sentido',
      'about.p1': 'Estudiante de Multimedia e Internet, me especializo en diseño gráfico y comunicación visual. Mi enfoque combina creatividad, rigor tipográfico y sensibilidad estética para crear visuales e identidades que cuentan una historia.',
      'about.p2': 'Apasionado por la dirección artística, me involucro tanto en la investigación UX como en la creación de carteles, logotipos y universos visuales coherentes. La accesibilidad está en el corazón de mi proceso.',
      'about.cta': 'Saber más',
      'stat.projects': 'Proyectos realizados', 'stat.degree': 'BAC+2 en curso', 'stat.tools': 'Herramientas dominadas',
      'projets.title': 'Mis proyectos', 'projets.subtitle': 'Diseño gráfico, desarrollo web y audiovisual',
      'projets.search': 'Buscar un proyecto…', 'projets.empty': 'Ningún proyecto coincide con su búsqueda.',
      'filter.all': 'Todos', 'filter.graphic': 'Diseño gráfico', 'filter.web': 'Desarrollo web', 'filter.video': 'Audio y vídeo',
      'apropos.title': 'Sobre mí', 'apropos.subtitle': 'Mi trayectoria, mis valores, mi visión del diseño', 'apropos.name': 'Chrisnaël Berdier',
      'apropos.p1': 'Tengo 19 años y actualmente estoy en primer año de Multimedia e Internet en la Université des Antilles, campus de Saint-Claude en Guadalupe. Antes, empecé con un primer año en Humanidades que me dio una sólida base en reflexión y comunicación.',
      'apropos.p2': 'Mi pasión por el diseño gráfico se expresa a través de la creación de identidades visuales, composiciones tipográficas y materiales de comunicación. Estoy convencido de que el diseño es un lenguaje: cada color, cada forma, cada espacio tiene un significado.',
      'apropos.p3': 'Paralelamente a mis estudios, adquirí experiencia profesional como cajero en Carrefour Milenis y vendedor en Be Sport. Estas experiencias me enseñaron rigor, trabajo en equipo y atención al cliente.',
      'apropos.p4': 'Dinámico y motivado, busco unas prácticas o alternancia en diseño gráfico, dirección artística o comunicación visual.',
      'apropos.dl': 'Descargar mi CV', 'apropos.view': 'Ver CV', 'apropos.contact': 'Contactarme',
      'val.precision': 'Precisión', 'val.a11y': 'Accesibilidad', 'val.creative': 'Creatividad',
      'skills.title': 'Mis habilidades',
      'contact.title': 'Contactarme',
      'footer.legal': 'Aviso legal'
    }
  };

  function applyTranslations(lang) {
    const dict = translations[lang];
    if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        // Preserve SVG icons inside buttons/links
        const svg = el.querySelector('svg');
        if (svg) {
          const svgClone = svg.cloneNode(true);
          el.textContent = dict[key] + ' ';
          el.appendChild(svgClone);
        } else {
          el.innerHTML = dict[key];
        }
      }
    });
    // Handle placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });
  }

  function init() {
    const selector = document.getElementById('lang-selector');
    const btn = document.getElementById('lang-btn');
    if (!selector || !btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selector.classList.toggle('is-open');
    });
    document.addEventListener('click', () => { selector.classList.remove('is-open'); });

    selector.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = opt.dataset.lang;
        selector.querySelectorAll('.lang-option').forEach(o => o.classList.remove('is-active'));
        opt.classList.add('is-active');
        selector.classList.remove('is-open');
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('portfolio-lang', lang);
        applyTranslations(lang);
      });
    });

    const saved = localStorage.getItem('portfolio-lang');
    if (saved && saved !== 'fr') {
      document.documentElement.setAttribute('lang', saved);
      selector.querySelectorAll('.lang-option').forEach(o => {
        o.classList.toggle('is-active', o.dataset.lang === saved);
      });
      applyTranslations(saved);
    }
  }
  return { init };
})();

LangSelector.init();

