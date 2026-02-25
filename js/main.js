/* ==============================================================
   PORTFOLIO CHRISNAËL BERDIER — JavaScript Principal
   Architecture modulaire : chaque fonctionnalité est un module
   autonome avec sa propre méthode init().
   ============================================================== */


/* ==============================================================
   MODULE 1 : THÈME JOUR/NUIT
   - Auto-détection selon l'heure (7h–20h = jour)
   - Toggle manuel avec persistance localStorage
   ============================================================== */
const ThemeManager = (() => {
  const html = document.documentElement;
  const STORAGE_KEY = 'portfolio-theme';

  function getAutoTheme() {
    const hour = new Date().getHours();
    return (hour >= 7 && hour < 20) ? 'light' : 'dark';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    // Met à jour l'aria-label du bouton
    const btn = document.querySelector('.theme-switch');
    if (btn) {
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit'
      );
    }
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    setTheme(saved || getAutoTheme());

    const btn = document.querySelector('.theme-switch');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
      });
    }
  }

  return { init };
})();


/* ==============================================================
   MODULE 2 : NAVIGATION
   - Hide/show on scroll
   - Menu mobile hamburger
   ============================================================== */
const Navigation = (() => {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.nav__mobile');
  let lastScroll = 0;

  function init() {
    if (!nav) return;

    // Auto-hide nav on scroll
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current > 100 && current > lastScroll) {
        nav.classList.add('is-hidden');
      } else {
        nav.classList.remove('is-hidden');
      }
      lastScroll = current;
    }, { passive: true });

    // Mobile menu
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


/* ==============================================================
   MODULE 3 : PARTICULES INTERACTIVES (Hero)
   - Canvas plein écran centré
   - Suivi souris et tactile
   ============================================================== */
const ParticleSystem = (() => {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };
  let animId;
  const COUNT_MOBILE = 40;
  const COUNT_DESKTOP = 80;
  const CONNECT_DIST = 140;
  const MOUSE_RADIUS = 180;

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 1;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          this.x += dx * force * 0.015;
          this.y += dy * force * 0.015;
          this.opacity = Math.min(0.8, this.opacity + 0.02);
        } else {
          this.opacity = Math.max(0.1, this.opacity - 0.005);
        }
      }

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }
    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const c = isDark ? '255,255,255' : '26,26,46';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c}, ${this.opacity})`;
      ctx.fill();
    }
  }

  const isFullPage = canvas.classList.contains('page-particles');

  function resize() {
    if (isFullPage) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      const hero = canvas.parentElement;
      canvas.width = hero.clientWidth;
      canvas.height = hero.clientHeight;
    }
    const count = window.innerWidth < 768 ? COUNT_MOBILE : COUNT_DESKTOP;
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawLines() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const c = isDark ? '255,255,255' : '26,26,46';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${c}, ${(1 - dist / CONNECT_DIST) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    animId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    animate();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animId);
      resize();
      animate();
    });

    // Mouse tracking — use document if full-page (canvas has pointer-events:none)
    const mouseTarget = isFullPage ? document : canvas;

    mouseTarget.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    mouseTarget.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    mouseTarget.addEventListener('touchmove', (e) => {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }, { passive: true });
    mouseTarget.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });
  }

  return { init };
})();


/* ==============================================================
   MODULE 4 : SCROLL REVEAL (IntersectionObserver)
   ============================================================== */
const ScrollReveal = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  return { init };
})();


/* ==============================================================
   MODULE 5 : FILTRES PROJETS
   ============================================================== */
const ProjectFilters = (() => {
  function init() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        buttons.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        cards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('is-hidden');
            card.style.animation = 'fadeInUp 0.5s var(--ease-out) forwards';
          } else {
            card.classList.add('is-hidden');
          }
        });
      });
    });
  }
  return { init };
})();


/* ==============================================================
   MODULE 6 : BARRES DE COMPÉTENCES
   ============================================================== */
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


/* ==============================================================
   MODULE 7 : COMPTEUR ANIMÉ
   ============================================================== */
const CountUp = (() => {
  function animateCount(el, target) {
    const suffix = el.dataset.suffix || '+';
    let current = 0;
    const step = target / (1500 / 16);

    function update() {
      current += step;
      if (current >= target) {
        el.textContent = target + suffix;
        return;
      }
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

    const statsSection = document.querySelector('.about__stats');
    if (statsSection) observer.observe(statsSection);
  }
  return { init };
})();


/* ==============================================================
   MODULE 8 : FORMULAIRE DE CONTACT
   ============================================================== */
const ContactForm = (() => {
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const status = document.getElementById('form-status');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#form-name');
      const email = form.querySelector('#form-email');
      const message = form.querySelector('#form-message');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        status.textContent = 'Veuillez remplir tous les champs obligatoires.';
        status.className = 'form-status is-error';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        status.textContent = 'Veuillez entrer une adresse email valide.';
        status.className = 'form-status is-error';
        return;
      }

      const formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          status.textContent = '✓ Message envoyé ! Je vous répondrai rapidement.';
          status.className = 'form-status is-success';
          form.reset();
        } else { throw new Error('Erreur'); }
      })
      .catch(() => {
        // Fallback : ouvre le client mail
        const subject = encodeURIComponent(form.querySelector('#form-subject')?.value || 'Contact portfolio');
        const body = encodeURIComponent(`Nom: ${name.value}\nEmail: ${email.value}\n\n${message.value}`);
        window.location.href = `mailto:berdierchrisnael@gmail.com?subject=${subject}&body=${body}`;
        status.textContent = 'Ouverture de votre client mail…';
        status.className = 'form-status is-success';
      });
    });
  }
  return { init };
})();


/* ==============================================================
   MODULE 9 : MODAL MENTIONS LÉGALES
   ============================================================== */
const LegalModal = (() => {
  function init() {
    const overlay = document.getElementById('legal-modal');
    const openBtn = document.getElementById('open-legal');
    if (!overlay || !openBtn) return;

    const closeBtn = overlay.querySelector('.modal__close');

    function open() {
      overlay.classList.add('is-open');
      closeBtn.focus();
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('is-open');
      openBtn.focus();
      document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  }
  return { init };
})();


/* ==============================================================
   MODULE 10 : WIDGET ACCESSIBILITÉ
   ============================================================== */
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
      if (!e.target.closest('.a11y-widget')) {
        panel.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Zoom
    document.querySelectorAll('[data-zoom]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.zoom;
        if (action === 'increase' && zoomLevel < 1.5) zoomLevel += 0.1;
        if (action === 'decrease' && zoomLevel > 0.85) zoomLevel -= 0.1;
        if (action === 'reset') zoomLevel = 1;
        document.documentElement.style.setProperty('--a11y-zoom', zoomLevel);
      });
    });

    // Contraste
    const contrastBtn = document.getElementById('contrast-toggle');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => {
        const active = document.body.classList.toggle('high-contrast');
        contrastBtn.setAttribute('aria-pressed', active);
      });
    }

    // Animations
    const motionBtn = document.getElementById('motion-toggle');
    if (motionBtn) {
      motionBtn.addEventListener('click', () => {
        const active = document.body.classList.toggle('reduce-motion');
        motionBtn.setAttribute('aria-pressed', active);
      });
    }

    // Espacement
    const spacingBtn = document.getElementById('spacing-toggle');
    if (spacingBtn) {
      spacingBtn.addEventListener('click', () => {
        const active = document.body.classList.toggle('wide-spacing');
        spacingBtn.setAttribute('aria-pressed', active);
      });
    }
  }
  return { init };
})();


/* ==============================================================
   MODULE 11 : BOUTON RETOUR EN HAUT
   ============================================================== */
const BackToTop = (() => {
  function init() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  return { init };
})();


/* ==============================================================
   INITIALISATION GLOBALE
   Chaque module vérifie en interne si ses éléments existent,
   ce qui permet d'utiliser le même JS sur toutes les pages.
   ============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Navigation.init();
  ParticleSystem.init();
  ScrollReveal.init();
  ProjectFilters.init();
  SkillBars.init();
  CountUp.init();
  ContactForm.init();
  LegalModal.init();
  A11yWidget.init();
  BackToTop.init();
});
