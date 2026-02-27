/* ==============================================================
   PORTFOLIO CHRISNAËL BERDIER — JavaScript Principal V3
   ============================================================== */

/* === MODULE 1 : THÈME JOUR/NUIT === */
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
    if (btn) {
      btn.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next); localStorage.setItem(STORAGE_KEY, next);
      });
    }
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

/* === MODULE 5 : FILTRES + RECHERCHE PROJETS === */
const ProjectFilters = (() => {
  function init() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card[data-category]');
    const searchInput = document.getElementById('project-search');
    const emptyMsg = document.getElementById('projects-empty');
    if (!buttons.length && !searchInput) return;

    let currentFilter = 'all';
    let currentSearch = '';

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
        } else {
          card.classList.add('is-hidden');
        }
      });
      if (emptyMsg) {
        emptyMsg.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        buttons.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase().trim();
        applyFilters();
      });
    }
  }
  return { init };
})();

/* === MODULE 6 : BARRES DE COMPÉTENCES === */
const SkillBars = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-item__fill').forEach(fill => {
            fill.style.width = fill.dataset.width + '%';
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.skill-category').forEach(cat => observer.observe(cat));
  }
  return { init };
})();

/* === MODULE 7 : COMPTEUR ANIMÉ === */
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
          entry.target.querySelectorAll('[data-count]').forEach(el => {
            animateCount(el, parseInt(el.dataset.count));
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.about__stats').forEach(s => observer.observe(s));
  }
  return { init };
})();

/* === MODULE 8 : FORMULAIRE DE CONTACT === */
const ContactForm = (() => {
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('form-status');

    // Check if redirected back after successful submit
    if (window.location.search.includes('sent=true')) {
      if (status) {
        status.textContent = '✓ Message envoyé avec succès ! Je vous répondrai rapidement.';
        status.className = 'form-status is-success';
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    form.addEventListener('submit', (e) => {
      const name = form.querySelector('#form-name');
      const email = form.querySelector('#form-email');
      const message = form.querySelector('#form-message');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        e.preventDefault();
        status.textContent = 'Veuillez remplir tous les champs obligatoires.';
        status.className = 'form-status is-error';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        e.preventDefault();
        status.textContent = 'Veuillez entrer une adresse email valide.';
        status.className = 'form-status is-error';
        return;
      }
      // If validation passes, let the form submit naturally to FormSubmit.co
      // The _next hidden field will redirect back to the page
    });
  }
  return { init };
})();

/* === MODULE 9 : PROJECT DETAIL MODAL (zoom + drag/pan + save) === */
const ProjectModal = (() => {
  let currentZoom = 1;
  let panX = 0, panY = 0;
  let isDragging = false, dragStartX = 0, dragStartY = 0, startPanX = 0, startPanY = 0;
  const ZOOM_STEP = 0.25;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;

  function initModal(cfg) {
    const overlay = document.getElementById(cfg.overlayId);
    if (!overlay) return;

    const closeBtn = overlay.querySelector(cfg.closeSelector);
    const imgEl = document.getElementById(cfg.imgId);
    const zoomInBtn = document.getElementById(cfg.zoomInId);
    const zoomOutBtn = document.getElementById(cfg.zoomOutId);
    const zoomResetBtn = document.getElementById(cfg.zoomResetId);
    const saveBtnEl = document.getElementById(cfg.saveId);
    const imgContainer = overlay.querySelector('.project-modal__image');

    function applyTransform() {
      if (imgEl) imgEl.style.transform = `scale(${currentZoom}) translate(${panX}px, ${panY}px)`;
      if (imgEl) {
        if (currentZoom > 1) { imgEl.classList.add('is-draggable'); } 
        else { imgEl.classList.remove('is-draggable'); }
      }
    }
    function resetView() { currentZoom = 1; panX = 0; panY = 0; applyTransform(); }

    function openOverlay() {
      resetView();
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
    function closeOverlay() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      resetView();
      if (cfg.onClose) cfg.onClose();
    }

    // Zoom
    if (zoomInBtn) zoomInBtn.addEventListener('click', (e) => { e.stopPropagation(); if (currentZoom < ZOOM_MAX) { currentZoom += ZOOM_STEP; applyTransform(); } });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', (e) => { e.stopPropagation(); if (currentZoom > ZOOM_MIN) { currentZoom -= ZOOM_STEP; if (currentZoom <= 1) { panX = 0; panY = 0; } applyTransform(); } });
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', (e) => { e.stopPropagation(); resetView(); });

    // Wheel zoom
    if (imgContainer) {
      imgContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0 && currentZoom < ZOOM_MAX) currentZoom += ZOOM_STEP;
        else if (e.deltaY > 0 && currentZoom > ZOOM_MIN) currentZoom -= ZOOM_STEP;
        if (currentZoom <= 1) { panX = 0; panY = 0; }
        applyTransform();
      }, { passive: false });
    }

    // Drag/pan (only when zoomed > 1)
    if (imgEl && imgEl.tagName === 'IMG') {
      imgEl.addEventListener('mousedown', (e) => {
        if (currentZoom <= 1) return;
        isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY;
        startPanX = panX; startPanY = panY;
        imgEl.classList.add('is-dragging');
        e.preventDefault();
      });
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        panX = startPanX + (e.clientX - dragStartX) / currentZoom;
        panY = startPanY + (e.clientY - dragStartY) / currentZoom;
        applyTransform();
      });
      document.addEventListener('mouseup', () => {
        if (isDragging) { isDragging = false; if (imgEl) imgEl.classList.remove('is-dragging'); }
      });

      // Touch drag
      imgEl.addEventListener('touchstart', (e) => {
        if (currentZoom <= 1 || e.touches.length !== 1) return;
        isDragging = true; dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY;
        startPanX = panX; startPanY = panY;
        imgEl.classList.add('is-dragging');
      }, { passive: true });
      document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        panX = startPanX + (e.touches[0].clientX - dragStartX) / currentZoom;
        panY = startPanY + (e.touches[0].clientY - dragStartY) / currentZoom;
        applyTransform();
      }, { passive: true });
      document.addEventListener('touchend', () => {
        if (isDragging) { isDragging = false; if (imgEl) imgEl.classList.remove('is-dragging'); }
      });
    }

    // Close
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
    });

    // Save
    if (saveBtnEl && cfg.onSave) saveBtnEl.addEventListener('click', (e) => { e.stopPropagation(); cfg.onSave(); });

    return { open: openOverlay, close: closeOverlay };
  }

  function init() {
    // --- PROJECT MODAL ---
    const modalImg = document.getElementById('project-modal-img');
    const modalTitle = document.getElementById('project-modal-title');
    const modalDesc = document.getElementById('project-modal-desc');
    const modalTags = document.getElementById('project-modal-tags');

    const projectModal = initModal({
      overlayId: 'project-modal',
      closeSelector: '.project-modal__close-btn',
      imgId: 'project-modal-img',
      zoomInId: 'modal-zoom-in',
      zoomOutId: 'modal-zoom-out',
      zoomResetId: 'modal-zoom-reset',
      saveId: 'modal-save-png',
      onClose: () => { if (modalImg) modalImg.src = ''; },
      onSave: () => {
        if (!modalImg || !modalImg.src) return;
        const src = modalImg.src.replace('.webp', '.png');
        const title = (modalTitle ? modalTitle.textContent : 'projet') || 'projet';
        const filename = title.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüçæœ\s-]/gi, '').replace(/\s+/g, '-').toLowerCase() + '.png';
        fetch(src).then(r => r.ok ? r : fetch(modalImg.src)).then(r => r.blob()).then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = filename;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }).catch(() => window.open(modalImg.src, '_blank'));
      }
    });

    if (projectModal) {
      document.querySelectorAll('.project-card[data-project-img]').forEach(card => {
        function openProject() {
          const img = card.dataset.projectImg;
          const title = card.dataset.projectTitle;
          const desc = card.dataset.projectDesc;
          const tags = (card.dataset.projectTags || '').split(',').filter(Boolean);
          if (modalImg) { modalImg.src = img; modalImg.alt = title; }
          if (modalTitle) modalTitle.textContent = title;
          if (modalDesc) modalDesc.textContent = desc;
          if (modalTags) modalTags.innerHTML = tags.map((t, i) =>
            `<span class="tag ${i > 0 ? 'tag--secondary' : ''}">${t.trim()}</span>`
          ).join('');
          projectModal.open();
        }
        const btn = card.querySelector('.project-card__link');
        if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openProject(); });
        card.addEventListener('click', openProject);
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openProject(); });
      });
    }

    // --- CV MODAL ---
    const cvOpenBtn = document.getElementById('open-cv-viewer');
    const cvIframe = document.getElementById('cv-modal-iframe');
    if (cvOpenBtn && cvIframe) {
      const cvModal = initModal({
        overlayId: 'cv-modal',
        closeSelector: '#cv-modal-close',
        imgId: 'cv-modal-iframe',
        zoomInId: 'cv-zoom-in',
        zoomOutId: 'cv-zoom-out',
        zoomResetId: 'cv-zoom-reset',
        saveId: 'cv-save',
        onClose: () => { cvIframe.src = ''; },
        onSave: () => {
          const a = document.createElement('a');
          a.href = 'assets/cv/CV_BERDIER_CHRISNAEL.pdf';
          a.download = 'CV_BERDIER_CHRISNAEL.pdf';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }
      });
      cvOpenBtn.addEventListener('click', () => {
        cvIframe.src = 'assets/cv/CV_BERDIER_CHRISNAEL.pdf';
        cvModal.open();
      });
    }
  }
  return { init };
})();

/* === MODULE 10 : MODAL MENTIONS LÉGALES === */
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
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });
  }
  return { init };
})();

/* === MODULE 11 : WIDGET ACCESSIBILITÉ === */
const A11yWidget = (() => {
  let zoomLevel = 1;
  function init() {
    const toggle = document.getElementById('a11y-toggle');
    const panel = document.getElementById('a11y-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.a11y-widget')) { panel.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    document.querySelectorAll('[data-zoom]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.zoom;
        if (action === 'increase' && zoomLevel < 1.5) zoomLevel += 0.1;
        if (action === 'decrease' && zoomLevel > 0.85) zoomLevel -= 0.1;
        if (action === 'reset') zoomLevel = 1;
        document.documentElement.style.setProperty('--a11y-zoom', zoomLevel);
      });
    });
    const contrastBtn = document.getElementById('contrast-toggle');
    if (contrastBtn) contrastBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('high-contrast');
      contrastBtn.setAttribute('aria-pressed', active);
    });
    const motionBtn = document.getElementById('motion-toggle');
    if (motionBtn) motionBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('reduce-motion');
      motionBtn.setAttribute('aria-pressed', active);
    });
    const spacingBtn = document.getElementById('spacing-toggle');
    if (spacingBtn) spacingBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('wide-spacing');
      spacingBtn.setAttribute('aria-pressed', active);
    });
  }
  return { init };
})();

/* === MODULE 12 : BOUTON RETOUR EN HAUT === */
const BackToTop = (() => {
  function init() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  return { init };
})();

/* === INIT === */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Navigation.init();
  ParticleSystem.init();
  ScrollReveal.init();
  ProjectFilters.init();
  ProjectModal.init();
  SkillBars.init();
  CountUp.init();
  ContactForm.init();
  LegalModal.init();
  A11yWidget.init();
  BackToTop.init();
});
