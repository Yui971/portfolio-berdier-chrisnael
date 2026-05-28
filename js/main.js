/* ==============================================================
   PORTFOLIO CHRISNAEL BERDIER - JavaScript Principal V6

   ARCHITECTURE GÉNÉRALE
   ─────────────────────
   Ce fichier utilise le pattern "Module IIFE" (Immediately Invoked
   Function Expression). Chaque fonctionnalité est encapsulée dans
   une variable constante qui exécute immédiatement une fonction
   anonyme et retourne un objet { init }.

   Pourquoi ce pattern ?
   → Les variables internes (ex: lastScroll, particles, zoom...)
     restent privées et ne polluent PAS le scope global window.
   → Seule la méthode init() est exposée : c'est le principe
     d'encapsulation, base de la POO en JavaScript.
   → Alternative moderne = ES Modules (import/export), mais
     ceux-ci nécessitent un bundler (Webpack, Vite) ou un serveur.
     Ici on est en vanilla pur, donc IIFE = le bon choix.

   ORDRE D'INITIALISATION (bas du fichier)
   → Loader, CustomCursor et PageTransitions s'initialisent
     immédiatement (hors DOMContentLoaded) car ils doivent
     s'exécuter AVANT que le DOM soit complètement prêt.
   → Les autres modules attendent DOMContentLoaded pour être
     sûrs que tous les éléments HTML sont disponibles.
   ============================================================== */


/* ═══════════════════════════════════════════════════════════════
   MODULE 1 : GESTIONNAIRE DE THÈME (ThemeManager)
   ───────────────────────────────────────────────
   RÔLE : Gère le basculement entre le mode sombre et le mode clair.

   LOGIQUE :
   Au chargement, lit localStorage pour restaurer la dernière
   préférence de l'utilisateur. Si rien n'est sauvegardé, applique
   'dark' par défaut (getAutoTheme). Quand l'utilisateur clique sur
   le toggle switch, alterne dark ↔ light et sauvegarde dans
   localStorage pour que la préférence survive au rechargement.

   Le thème est appliqué via l'attribut data-theme sur <html>.
   Toutes les couleurs du CSS lisent les variables CSS --bg-primary,
   --text-primary, etc. qui sont redéfinies selon [data-theme="dark"]
   ou [data-theme="light"] dans style.css.

   EFFET DOMINO :
   → Changer 'dark' en 'light' dans getAutoTheme() = le site
     s'ouvre en mode clair par défaut au lieu de sombre.
   → Changer 'portfolio-theme' (STORAGE_KEY) = les préférences
     déjà sauvegardées par les visiteurs ne seront plus lues
     (ils verront à nouveau le thème par défaut).
   → Supprimer localStorage.setItem() dans le listener = le thème
     change visuellement mais ne persiste plus entre les pages.
   ═══════════════════════════════════════════════════════════════ */
const ThemeManager = (() => {
  const html = document.documentElement;
  const STORAGE_KEY = 'portfolio-theme';
  function getAutoTheme() { return 'dark'; }
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


/* ═══════════════════════════════════════════════════════════════
   MODULE 2 : NAVIGATION (Navigation)
   ───────────────────────────────────
   RÔLE : Gère deux comportements de la barre de navigation :
   1. L'auto-hide au scroll (la nav se cache quand on descend,
      réapparaît quand on remonte).
   2. Le drawer mobile (menu hamburger latéral).

   LOGIQUE AUTO-HIDE :
   À chaque événement scroll, compare la position actuelle
   (window.scrollY) à la dernière position mémorisée (lastScroll).
   Si on descend ET qu'on est à plus de 100px du haut → .is-hidden
   (translateY(-100% dans le CSS). Sinon → retire .is-hidden.
   L'option { passive: true } dit au navigateur que ce listener
   ne va PAS appeler e.preventDefault(), ce qui permet au
   navigateur d'optimiser le scroll (ne bloque pas le thread).

   LOGIQUE DRAWER :
   Le burger toggle la classe .is-open sur le drawer et le backdrop.
   body.style.overflow = 'hidden' bloque le scroll de la page
   derrière le menu ouvert. La fermeture peut se déclencher via :
   le bouton ×, un clic sur le backdrop, Échap, ou un lien du menu.

   EFFET DOMINO :
   → Changer 100 (seuil de déclenchement) en 300 = la nav attend
     que l'utilisateur ait scrollé 300px avant de se cacher.
   → Changer 280px (largeur du drawer dans le CSS) = le panneau
     mobile sera plus ou moins large. min(280px, 82vw) garantit
     qu'il ne dépasse jamais 82% de la largeur de l'écran.
   → Supprimer body.style.overflow = 'hidden' = l'arrière-plan
     reste scrollable quand le menu est ouvert (mauvaise UX).
   ═══════════════════════════════════════════════════════════════ */
const Navigation = (() => {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const drawer = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('drawer-backdrop');
  let lastScroll = 0;
  function init() {
    if (!nav) return;
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current > 100 && current > lastScroll) nav.classList.add('is-hidden');
      else nav.classList.remove('is-hidden');
      lastScroll = current;
    }, { passive: true });
    if (burger && drawer) {
      function closeMenu() {
        drawer.classList.remove('is-open');
        if (backdrop) backdrop.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
      }
      burger.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('is-open');
        if (backdrop) backdrop.classList.toggle('is-open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      const closeBtn = document.getElementById('nav-mobile-close');
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);
      if (backdrop) backdrop.addEventListener('click', closeMenu);
      drawer.querySelectorAll('.nav__drawer-link').forEach(link => {
        link.addEventListener('click', closeMenu);
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeMenu();
      });
    }
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 3 : SYSTÈME DE PARTICULES (ParticleSystem)
   ──────────────────────────────────────────────────
   RÔLE : Anime un fond de particules connectées sur un <canvas>
   qui couvre toute la page en position:fixed.

   LOGIQUE :
   Chaque particule est une instance de la classe Particle avec
   une position, taille, vitesse et opacité aléatoires.
   La boucle d'animation (requestAnimationFrame) tourne en
   continu à ~60fps. À chaque frame :
   1. Le canvas est effacé (clearRect).
   2. Chaque particule est mise à jour (déplacement) puis dessinée.
   3. drawLines() parcourt toutes les paires de particules :
      si leur distance est < CONNECT_DIST (140px), une ligne
      semi-transparente est tracée entre elles. L'opacité de la
      ligne diminue proportionnellement à la distance.
   4. L'interaction souris : si la souris est à moins de
      MOUSE_RADIUS (180px) d'une particule, celle-ci est
      attirée vers la souris et devient plus visible.

   La propriété will-change n'est pas utilisée ici mais le canvas
   lui-même est en position:fixed (z-index: 1) et pointer-events:none
   donc il ne bloque pas les interactions avec le contenu.

   EFFET DOMINO :
   → COUNT_MOBILE = 40 / COUNT_DESKTOP = 80 : augmenter ces valeurs
     = plus de particules mais plus de calculs par frame → risque
     de chute de performance sur appareils peu puissants.
   → CONNECT_DIST = 140 : augmenter à 200 = les particules tracent
     des lignes sur de plus grandes distances, le réseau devient
     plus dense visuellement.
   → MOUSE_RADIUS = 180 : augmenter = la zone d'attraction de la
     souris est plus grande (effet plus prononcé).
   → 0.015 (force d'attraction) : augmenter = les particules
     suivent la souris plus rapidement, effet "magnétique".
   ═══════════════════════════════════════════════════════════════ */
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
      // Wrap-around : une particule qui sort à droite réapparaît à gauche
      if (this.x < 0) this.x = canvas.width; if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height; if (this.y > canvas.height) this.y = 0;
    }
    draw() {
      // Couleur des particules adaptée au thème actif
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
          // Plus la distance est grande, plus la ligne est transparente
          ctx.strokeStyle = `rgba(${c}, ${(1 - dist / CONNECT_DIST) * 0.15})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); }); drawLines();
    animId = requestAnimationFrame(animate); // Boucle native du navigateur, ~60fps
  }
  function init() {
    resize(); animate();
    // On annule l'animation avant de resize pour éviter plusieurs boucles parallèles
    window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); animate(); });
    const mouseTarget = isFullPage ? document : canvas;
    mouseTarget.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    mouseTarget.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    mouseTarget.addEventListener('touchmove', (e) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });
    mouseTarget.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 4 : ANIMATIONS AU SCROLL (ScrollReveal)
   ────────────────────────────────────────────────
   RÔLE : Anime l'apparition des éléments quand ils entrent
   dans le viewport (zone visible de l'écran).

   LOGIQUE :
   Utilise l'API native IntersectionObserver. On observe tous les
   éléments portant la classe .reveal. Quand un élément entre dans
   le viewport à 10% de visibilité (threshold: 0.1), on lui ajoute
   la classe .is-visible, qui dans le CSS déclenche la transition
   opacity 0→1 + translateY(30px→0).
   rootMargin: '0px 0px -40px 0px' = déclenche l'animation
   40px AVANT que l'élément atteigne le bas du viewport,
   ce qui évite un effet de pop brutal.

   Les classes .stagger-2, .stagger-3, .stagger-4 dans le CSS
   ajoutent des transition-delay de 0.15s, 0.3s, 0.45s pour
   créer des apparitions en cascade sur des éléments groupés.

   POURQUOI IntersectionObserver plutôt que scroll + getBoundingClientRect ?
   → IntersectionObserver est géré nativement par le navigateur
     sur un thread séparé. Il ne bloque pas le thread JS principal,
     contrairement à un écouteur scroll qui s'exécute à chaque frame.

   EFFET DOMINO :
   → Changer threshold: 0.1 en 0.5 = l'animation ne se déclenche
     que quand 50% de l'élément est visible (plus tardif).
   → Changer translateY(30px) dans le CSS en translateY(80px) =
     les éléments arrivent de plus bas, effet plus dramatique.
   → Changer 0.7s en 1.5s (durée de transition CSS) = l'animation
     d'apparition sera deux fois plus lente.
   ═══════════════════════════════════════════════════════════════ */
const ScrollReveal = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 5 : FILTRES ET RECHERCHE DE PROJETS (ProjectFilters)
   ─────────────────────────────────────────────────────────────
   RÔLE : Gère le filtrage des cartes projets par catégorie OU
   par UE (unité d'enseignement), ainsi que la recherche textuelle
   en temps réel.

   LOGIQUE :
   L'état est maintenu dans 4 variables : mode ('cat' ou 'ue'),
   catFilter, ueFilter, search. Chaque interaction utilisateur
   met à jour l'une de ces variables puis appelle applyFilters().

   applyFilters() parcourt TOUTES les cartes et, pour chacune,
   évalue deux conditions :
   1. matchFilter : la carte correspond-elle au filtre actif ?
      Selon le mode, on lit data-category ou data-ue sur la carte.
   2. matchSearch : le terme de recherche est-il présent dans
      le titre, la description ou les tags de la carte ?
   Si les deux conditions sont vraies → la carte est visible.
   Sinon → .is-hidden (display:none dans le CSS).

   Le toggle mode (Catégories / UE) est un bouton avec
   role="switch" et aria-checked : c'est le pattern ARIA correct
   pour un interrupteur à deux états.

   aria-live="polite" sur la grille = quand les cartes changent,
   les lecteurs d'écran annoncent le changement sans interrompre.

   EFFET DOMINO :
   → Ajouter data-category="video" sur une carte sans l'ajouter
     dans les boutons de filtre = la carte est filtrée correctement
     mais il n'y a pas de bouton pour y accéder directement.
   → Changer la valeur de data-filter="graphique" en "design" =
     les cartes ayant data-category="graphique" ne seront plus
     affichées par ce bouton (mismatch de valeurs).
   → Modifier la recherche pour chercher aussi dans les outils =
     il faudrait ajouter un data-project-tools sur les cartes HTML
     et lire cet attribut dans la condition matchSearch.
   ═══════════════════════════════════════════════════════════════ */
const ProjectFilters = (() => {
  function init() {
    const toolbar    = document.querySelector('.projects__toolbar');
    const catBtns    = document.querySelectorAll('#filters-cat .filter-btn');
    const ueBtns     = document.querySelectorAll('#filters-ue .filter-btn');
    const cards      = document.querySelectorAll('.project-card');
    const searchInput = document.getElementById('project-search');
    const emptyMsg   = document.getElementById('projects-empty');
    const modeToggle = document.getElementById('filter-mode-toggle');
    const labelCat   = document.getElementById('label-cat');
    const labelUe    = document.getElementById('label-ue');
    if (!cards.length) return;

    let mode = 'cat', catFilter = 'all', ueFilter = 'all', search = '';

    function applyFilters() {
      let n = 0;
      cards.forEach(card => {
        const matchFilter = mode === 'cat'
          ? (catFilter === 'all' || card.dataset.category === catFilter)
          : (ueFilter  === 'all' || card.dataset.ue       === ueFilter);
        const title = (card.dataset.projectTitle || '').toLowerCase();
        const desc  = (card.dataset.projectDesc  || '').toLowerCase();
        const tags  = (card.dataset.projectTags  || '').toLowerCase();
        const matchSearch = !search || title.includes(search) || desc.includes(search) || tags.includes(search);
        if (matchFilter && matchSearch) {
          card.classList.remove('is-hidden');
          card.style.animation = 'fadeInUp 0.5s var(--ease-out) forwards';
          n++;
        } else { card.classList.add('is-hidden'); }
      });
      // Affiche le message "aucun résultat" si toutes les cartes sont masquées
      if (emptyMsg) emptyMsg.classList.toggle('is-visible', n === 0);
    }

    catBtns.forEach(btn => btn.addEventListener('click', () => {
      catFilter = btn.dataset.filter;
      catBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
      applyFilters();
    }));

    ueBtns.forEach(btn => btn.addEventListener('click', () => {
      ueFilter = btn.dataset.ueFilter;
      ueBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
      applyFilters();
    }));

    if (modeToggle) {
      function switchMode() {
        mode = mode === 'cat' ? 'ue' : 'cat';
        const isUe = mode === 'ue';
        modeToggle.setAttribute('aria-checked', isUe ? 'true' : 'false');
        if (toolbar) toolbar.classList.toggle('projects__toolbar--ue', isUe);
        if (labelCat) labelCat.classList.toggle('is-active', !isUe);
        if (labelUe)  labelUe.classList.toggle('is-active', isUe);
        applyFilters();
      }
      if (labelCat) labelCat.classList.add('is-active');
      modeToggle.addEventListener('click', switchMode);
      // Accessibilité clavier : Space et Entrée activent le switch
      modeToggle.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); switchMode(); } });
    }

    // Recherche en temps réel : déclenche applyFilters à chaque frappe
    if (searchInput) searchInput.addEventListener('input', e => { search = e.target.value.toLowerCase().trim(); applyFilters(); });
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 6 : BARRES DE COMPÉTENCES (SkillBars)
   ──────────────────────────────────────────────
   RÔLE : Anime les barres de progression des compétences quand
   elles entrent dans le viewport.

   LOGIQUE :
   IntersectionObserver observe chaque bloc .skill-category.
   Quand il entre à 30% de visibilité, on lit data-width sur
   chaque .skill-item__fill et on l'applique comme width inline.
   La transition CSS (width 1.2s) fait le reste visuellement.
   observer.unobserve() arrête l'observation après le premier
   déclenchement : l'animation ne se rejoue pas si on rescrolle.

   EFFET DOMINO :
   → Changer data-width="40" en "70" dans le HTML = la barre
     d'Adobe Illustrator atteindra 70% au lieu de 40%.
   → Changer threshold: 0.3 en 0.8 = l'animation se déclenche
     seulement quand 80% du bloc est visible (plus tardif).
   → Supprimer observer.unobserve() = l'animation se redéclenche
     chaque fois qu'on scroll vers la section compétences.
   ═══════════════════════════════════════════════════════════════ */
const SkillBars = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-item__fill').forEach(fill => { fill.style.width = fill.dataset.width + '%'; });
          observer.unobserve(entry.target); // Ne rejoue pas l'animation
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.skill-category').forEach(cat => observer.observe(cat));
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 7 : COMPTEUR ANIMÉ (CountUp)
   ─────────────────────────────────────
   RÔLE : Anime les chiffres des statistiques (ex: "0" → "10+")
   quand le bloc de stats entre dans le viewport.

   LOGIQUE :
   Pour chaque élément [data-count], on calcule un increment
   step = valeur_cible / (1500ms / 16ms). 1500ms = durée totale
   de l'animation, 16ms ≈ un frame à 60fps. requestAnimationFrame
   appelle update() en boucle jusqu'à ce que current >= target.
   data-suffix (par défaut '+') est lu depuis l'attribut HTML :
   data-suffix="" sur le "2" (BAC+2) pour ne pas afficher "+".

   EFFET DOMINO :
   → Changer 1500 en 500 = le compteur s'anime 3x plus vite.
   → Changer data-count="10" en "25" dans le HTML = le compteur
     ira jusqu'à 25 au lieu de 10.
   → Changer data-suffix en "-" = le chiffre affiché sera "10-"
     au lieu de "10+".
   ═══════════════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════════════════
   MODULE 8 : FORMULAIRE DE CONTACT (ContactForm)
   ─────────────────────────────────────────────────
   RÔLE : Valide le formulaire côté client avant soumission et
   affiche le message de confirmation après envoi réussi.

   LOGIQUE :
   Le formulaire utilise FormSubmit (action= dans le HTML) qui
   gère l'envoi email côté serveur. On intercepte le submit pour
   valider les champs avant que le navigateur envoie les données.
   Si un champ obligatoire est vide ou l'email invalide → on
   appelle e.preventDefault() pour bloquer la soumission et
   afficher un message d'erreur.

   Après envoi réussi, FormSubmit redirige vers l'URL courante
   avec ?sent=true. On détecte ce paramètre au chargement pour
   afficher le message de succès, puis on nettoie l'URL avec
   history.replaceState pour éviter le re-affichage au refresh.

   L'input honeypot (name="_honey", display:none) est un piège
   anti-spam : les bots remplissent tous les champs visibles et
   invisibles. FormSubmit ignore les soumissions où _honey n'est
   pas vide.

   EFFET DOMINO :
   → Changer l'action du formulaire = les emails seront envoyés
     à une autre adresse (ou un autre service).
   → Supprimer e.preventDefault() dans la validation = le
     formulaire se soumet même si les champs sont vides.
   → Changer le regex email = plus ou moins de formats d'emails
     seront acceptés comme valides.
   ═══════════════════════════════════════════════════════════════ */
const ContactForm = (() => {
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('form-status');
    if (window.location.search.includes('sent=true')) {
      if (status) { status.textContent = '✓ Message envoyé avec succès ! Je vous répondrai rapidement.'; status.className = 'form-status is-success'; }
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


/* ═══════════════════════════════════════════════════════════════
   MODULE 9 : MODAL PROJETS (ProjectModal)
   ─────────────────────────────────────────
   RÔLE : Affiche le détail d'un projet dans une fenêtre modale.
   Supporte trois types de médias : image statique (avec zoom,
   pan, drag), vidéo YouTube (iframe embed), site web (iframe live).

   LOGIQUE D'OUVERTURE (openModal) :
   La fonction lit les data-attributes de la carte cliquée pour
   déterminer quel type de média afficher. Ordre de priorité :
   1. data-project-video → embed YouTube avec autoplay
   2. data-project-url   → iframe du site live + lien externe
   3. data-project-img   → image statique avec contrôles zoom

   Ce système de priorité permet à une même carte d'avoir une
   capture d'écran pour la miniature (data-project-img) et un
   site live dans la modale (data-project-url).

   ZOOM & PAN :
   Trois variables d'état : zoom (facteur), panX, panY (décalage).
   Les boutons +/- modifient zoom par ±STEP (0.25). Le drag
   capture les coordonnées mousedown (dsx, dsy) et calcule le
   déplacement relatif à chaque mousemove.
   La transformation CSS appliquée = scale(zoom) translate(panX, panY).

   ACCESSIBILITÉ :
   - role="dialog" aria-modal="true" sur l'overlay.
   - closeBtn.focus() quand la modale s'ouvre = le focus est
     envoyé sur le bouton Fermer pour les utilisateurs clavier.
   - Échap ferme la modale.

   EFFET DOMINO :
   → Changer MIN = 0.5 en 0.25 = on peut dézoomer jusqu'à 25%
     de la taille originale.
   → Changer MAX = 3 en 5 = zoom maximum de 500%.
   → Changer STEP = 0.25 en 0.5 = chaque clic +/- change le zoom
     de 50% au lieu de 25% (plus brutal).
   → Inverser l'ordre des conditions (img avant siteUrl) = les
     projets web afficheraient la capture statique au lieu du live.
   ═══════════════════════════════════════════════════════════════ */
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
      // Génère les tags HTML dynamiquement depuis la liste séparée par virgules
      if (tags) tags.innerHTML = tgs.map(function(tg, i) { return '<span class="tag ' + (i > 0 ? 'tag--secondary' : '') + '">' + tg.trim() + '</span>'; }).join('');

      if (videoId) {
        // YouTube embed
        img.style.display = 'none';
        controls.style.display = 'none';
        var vw = document.createElement('div');
        vw.className = 'project-modal__video-wrap';
        vw.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        container.insertBefore(vw, controls);
      } else if (siteUrl) {
        if (card.dataset.noIframe) {
          // Site bloque les iframes : afficher la capture statique + lien externe
          img.src = imgSrc;
          img.alt = t;
          img.style.display = '';
          controls.style.display = '';
          if (extLink) { extLink.href = siteUrl; extLink.style.display = 'inline-flex'; }
        } else {
          // Website iframe (prioritaire sur la capture statique)
          img.style.display = 'none';
          controls.style.display = 'none';
          var sw = document.createElement('div');
          sw.className = 'project-modal__site-wrap';
          sw.innerHTML = '<iframe src="' + siteUrl + '" loading="lazy"></iframe>';
          container.insertBefore(sw, controls);
          if (extLink) { extLink.href = siteUrl; extLink.style.display = 'inline-flex'; }
        }
      } else if (imgSrc) {
        // Image statique (projets graphiques)
        img.src = imgSrc;
        img.alt = t;
        controls.style.display = '';
      }

      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus(); // Envoie le focus sur Fermer pour l'accessibilité clavier
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      clearMedia();
      resetView();
    }

    // Zoom boutons
    if (zoomIn) zoomIn.addEventListener('click', function(e) { e.stopPropagation(); if (zoom < MAX) { zoom += STEP; applyTransform(); } });
    if (zoomOut) zoomOut.addEventListener('click', function(e) { e.stopPropagation(); if (zoom > MIN) { zoom -= STEP; if (zoom <= 1) { panX = 0; panY = 0; } applyTransform(); } });
    if (zoomReset) zoomReset.addEventListener('click', function(e) { e.stopPropagation(); resetView(); });

    // Zoom molette souris
    if (container) container.addEventListener('wheel', function(e) {
      if (!img || img.style.display === 'none') return;
      e.preventDefault();
      if (e.deltaY < 0 && zoom < MAX) zoom += STEP;
      else if (e.deltaY > 0 && zoom > MIN) zoom -= STEP;
      if (zoom <= 1) { panX = 0; panY = 0; }
      applyTransform();
    }, { passive: false }); // passive:false nécessaire pour appeler preventDefault()

    // Drag/pan souris
    if (img) {
      img.addEventListener('mousedown', function(e) {
        if (zoom <= 1) return; // Le pan n'est actif qu'au zoom > 1
        dragging = true; dsx = e.clientX; dsy = e.clientY; spx = panX; spy = panY;
        img.classList.add('is-dragging'); e.preventDefault();
      });
      document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        // Division par zoom pour que le déplacement soit proportionnel au niveau de zoom
        panX = spx + (e.clientX - dsx) / zoom;
        panY = spy + (e.clientY - dsy) / zoom;
        applyTransform();
      });
      document.addEventListener('mouseup', function() { if (dragging) { dragging = false; if (img) img.classList.remove('is-dragging'); } });

      // Drag/pan tactile (même logique avec les coordonnées touch)
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

    // Téléchargement PNG : essaie d'abord la version .png, sinon utilise le .webp
    if (savePng) savePng.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!img || !img.src || img.style.display === 'none') return;
      var src = img.src.replace('.webp', '.png');
      var fn = (title.textContent || 'projet').replace(/[^a-zA-Z0-9à-ÿ\s-]/gi, '').replace(/\s+/g, '-').toLowerCase() + '.png';
      fetch(src).then(function(r) { return r.ok ? r : fetch(img.src); }).then(function(r) { return r.blob(); }).then(function(blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = fn;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url); // Libère la mémoire après téléchargement
      }).catch(function() { window.open(img.src, '_blank'); });
    });

    // Attache les événements d'ouverture sur toutes les cartes projet
    document.querySelectorAll('.project-card[data-project-title]').forEach(function(card) {
      var btn = card.querySelector('.project-card__link');
      if (btn) btn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); openModal(card); });
      card.addEventListener('click', function() { openModal(card); });
      card.addEventListener('keydown', function(e) { if (e.key === 'Enter') openModal(card); });
    });

    // Fermeture : bouton ×, clic overlay, touche Échap
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal(); });
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 10 : VISUALISEUR DE CV (CVViewer)
   ─────────────────────────────────────────
   RÔLE : Affiche le CV PDF dans une modale iframe, avec option
   de téléchargement direct.

   LOGIQUE :
   Le bouton "Visualiser le CV" définit le src de l'iframe au
   moment de l'ouverture (pas avant, pour éviter un chargement
   inutile). Quand la modale se ferme, src est remis à '' pour
   libérer le PDF de la mémoire du navigateur.

   EFFET DOMINO :
   → Changer le src du PDF = un autre document PDF sera affiché.
   → Supprimer iframe.src = '' dans close() = le PDF reste chargé
     en mémoire même après fermeture, consommant de la RAM.
   ═══════════════════════════════════════════════════════════════ */
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
      iframe.src = ''; // Libère le PDF de la mémoire
    }
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 11 : MODAL MENTIONS LÉGALES (LegalModal)
   ─────────────────────────────────────────────────
   RÔLE : Ouvre/ferme la modale des mentions légales depuis le
   lien dans le footer.

   LOGIQUE :
   Pattern identique aux autres modales : toggle de .is-open,
   gestion du focus, blocage du scroll, fermeture Échap.
   openBtn.focus() à la fermeture = le focus retourne sur
   l'élément qui a ouvert la modale (meilleure pratique ARIA).
   ═══════════════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════════════════
   MODULE 12 : WIDGET D'ACCESSIBILITÉ (A11yWidget)
   ─────────────────────────────────────────────────
   RÔLE : Panneau de contrôles d'accessibilité (taille de texte,
   contraste élevé, réduction des animations, espacement).

   LOGIQUE :
   Le panneau est caché par défaut (opacity:0, pointer-events:none).
   Le bouton toggle ajoute/retire .is-open. Un clic en dehors du
   widget ferme le panneau automatiquement.

   Taille de texte : modifie la custom property --a11y-zoom sur
   :root, qui est multipliée par font-size: 100% sur <html>.
   Effet : toutes les tailles relatives (rem, em, clamp) s'adaptent.

   Contraste élevé, réduction animations, espacement : ajoutent/
   retirent des classes sur <body> qui correspondent à des règles
   CSS dans style.css (.high-contrast, .reduce-motion, .wide-spacing).

   aria-pressed reflète l'état actif/inactif de chaque option,
   ce qui permet aux lecteurs d'écran de l'annoncer correctement.

   EFFET DOMINO :
   → Changer 1.5 (max zoom) en 2 = la taille de texte peut
     atteindre 200% au lieu de 150%.
   → Changer 0.85 (min zoom) en 0.7 = le texte peut être réduit
     jusqu'à 70% de sa taille normale.
   → Modifier .high-contrast dans le CSS = les couleurs du mode
     contraste élevé seront différentes.
   ═══════════════════════════════════════════════════════════════ */
const A11yWidget = (() => {
  let zoomLevel = 1;
  function init() {
    const toggle = document.getElementById('a11y-toggle');
    const panel = document.getElementById('a11y-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function() { var isOpen = panel.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', isOpen); });
    // Ferme le panneau si on clique en dehors du widget
    document.addEventListener('click', function(e) { if (!e.target.closest('.a11y-widget')) { panel.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); } });
    document.querySelectorAll('[data-zoom]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = btn.dataset.zoom;
        if (action === 'increase' && zoomLevel < 1.5) zoomLevel += 0.1;
        if (action === 'decrease' && zoomLevel > 0.85) zoomLevel -= 0.1;
        if (action === 'reset') zoomLevel = 1;
        // Injecte la valeur comme variable CSS custom → toutes les tailles rem s'adaptent
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


/* ═══════════════════════════════════════════════════════════════
   MODULE 13 : RETOUR EN HAUT (BackToTop)
   ────────────────────────────────────────
   RÔLE : Affiche un bouton flottant pour remonter en haut de page
   quand l'utilisateur a scrollé plus de 400px.

   LOGIQUE :
   Le listener scroll (passive:true) ajoute/retire .is-visible
   selon window.scrollY > 400. Le bouton est rendu invisible via
   opacity:0 et pointer-events:none dans le CSS par défaut.
   window.scrollTo({ behavior: 'smooth' }) utilise le scroll
   natif du navigateur (respecte prefers-reduced-motion si le
   CSS @media reduce est en place).

   EFFET DOMINO :
   → Changer 400 en 100 = le bouton apparaît dès 100px de scroll.
   → Changer 'smooth' en 'auto' = le scroll est instantané.
   ═══════════════════════════════════════════════════════════════ */
const BackToTop = (() => {
  function init() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function() { btn.classList.toggle('is-visible', window.scrollY > 400); }, { passive: true });
    btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   INITIALISATION PRINCIPALE
   ──────────────────────────
   Tous les modules qui manipulent le DOM sont initialisés ici,
   dans le callback DOMContentLoaded. Ce callback est déclenché
   quand le HTML est entièrement parsé, avant que les images
   et feuilles de style soient chargées (contrairement à 'load').

   L'ordre ici n'est généralement pas critique car chaque module
   est indépendant, mais ThemeManager doit idéalement être en
   premier pour éviter un flash du mauvais thème.
   ═══════════════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════════════════
   MODULE V8 : LOADER DE PAGE (Loader)
   ─────────────────────────────────────
   RÔLE : Affiche un écran de chargement avec le logo animé
   pendant que la page se charge, puis le fait disparaître.

   LOGIQUE :
   S'initialise HORS DOMContentLoaded (appel direct en bas du
   fichier) pour être prêt le plus tôt possible. Attend l'événement
   'load' (toutes les ressources chargées) puis déclenche la
   disparition après 2200ms via .is-done (opacity:0 + visibility:hidden).

   EFFET DOMINO :
   → Changer 2200 en 500 = le loader disparaît beaucoup plus vite
     (avant même que les fonts Google soient chargées).
   → Changer 0.7s (durée de la transition CSS du loader) = fondu
     de sortie plus rapide ou plus lent.
   ═══════════════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════════════════
   MODULE V8 : CURSEUR PERSONNALISÉ (CustomCursor)
   ─────────────────────────────────────────────────
   RÔLE : Remplace le curseur natif du navigateur par un point
   orange qui grossit au survol des éléments interactifs.

   LOGIQUE :
   Un div #custom-cursor est positionné en fixed et suit la souris
   via left/top. Actif uniquement sur appareils à pointeur précis
   (pointer: fine = souris), pas sur tactile. Mix-blend-mode:
   difference crée un effet d'inversion de couleur sur le fond.

   EFFET DOMINO :
   → Changer 8px (taille par défaut) en 16px = le point de base
     sera deux fois plus grand.
   → Changer 40px (.is-hover) en 60px = l'agrandissement au survol
     sera plus prononcé.
   → Retirer window.matchMedia('(pointer: fine)') = le curseur
     s'activerait aussi sur mobile/tablette (bug visuel).
   ═══════════════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════════════════
   MODULE V8 : TRANSITIONS DE PAGE (PageTransitions)
   ───────────────────────────────────────────────────
   RÔLE : Anime une transition (overlay qui monte/descend) entre
   chaque changement de page du site.

   LOGIQUE :
   Intercepte tous les clics sur les liens internes (href relatif).
   Au clic → .is-entering sur l'overlay (translateY: 100% → 0),
   puis après 650ms (durée de l'animation) → navigation effective.
   Au chargement de la nouvelle page → .is-leaving
   (translateY: 0 → -100%) fait disparaître l'overlay vers le haut.

   sessionStorage sert à distinguer la première visite (pas de
   transition d'entrée) des navigations suivantes (avec transition).

   Les liens exclus : ancres (#), liens externes (http), mailto,
   téléchargements (download), liens _blank.

   EFFET DOMINO :
   → Changer 650 (setTimeout) = le délai avant navigation change.
     Il doit être ≥ à la durée CSS de la transition (0.65s).
   → Changer cubic-bezier(0.76, 0, 0.24, 1) dans le CSS =
     la courbe d'accélération de l'overlay change (plus ou moins
     fluide, plus ou moins "punchy").
   → Supprimer sessionStorage = la transition d'entrée se rejoue
     à chaque rechargement de page.
   ═══════════════════════════════════════════════════════════════ */
const PageTransitions = (() => {
  function init() {
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;
    // Intercepte les liens de navigation interne
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.hasAttribute('download') || link.getAttribute('target') === '_blank') return;
      link.addEventListener('click', e => {
        e.preventDefault();
        overlay.classList.add('is-entering');
        setTimeout(() => { window.location.href = href; }, 650);
      });
    });
    // Slide de sortie au chargement de la nouvelle page
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

/* Initialisation immédiate (avant DOMContentLoaded) */
Loader.init();
CustomCursor.init();
PageTransitions.init();


/* ═══════════════════════════════════════════════════════════════
   MODULE V8 : SÉLECTEUR DE LANGUE (LangSelector)
   ─────────────────────────────────────────────────
   RÔLE : Gère le multilingue FR/EN/ES du site. Applique les
   traductions à tous les éléments portant data-i18n, et persiste
   la langue choisie dans localStorage.

   LOGIQUE :
   Un dictionnaire JavaScript (objet imbriqué) contient les
   traductions pour chaque langue. Chaque clé correspond à un
   attribut data-i18n dans le HTML.
   applyTranslations() parcourt tous les [data-i18n] et remplace
   leur contenu textuel par la valeur du dictionnaire.
   Précaution SVG : si un élément contient un SVG (bouton avec
   icône), on clone le SVG avant de modifier textContent pour
   ne pas le perdre.

   La langue est sauvegardée dans localStorage ('portfolio-lang').
   Au chargement, si une langue non-française est détectée, elle
   est appliquée automatiquement.

   EFFET DOMINO :
   → Ajouter une clé manquante dans le dictionnaire 'en' mais pas
     dans 'fr' = si on bascule vers l'anglais, l'élément concerné
     sera bien traduit ; au retour en français, il restera en anglais
     car il n'y a pas de clé correspondante dans 'fr'.
   → Changer 'portfolio-lang' (clé localStorage) = les préférences
     de langue existantes des visiteurs ne seront plus reconnues.
   → Ajouter data-i18n="nav.home" sur un élément sans ajouter la
     clé dans le dictionnaire = l'élément ne sera pas traduit
     (la condition if (dict[key]) protège contre ça).
   ═══════════════════════════════════════════════════════════════ */
const LangSelector = (() => {
  const translations = {
    fr: {
      // NAV
      'nav.home': 'Accueil', 'nav.about': 'À propos', 'nav.projects': 'Projets', 'nav.skills': 'Compétences', 'nav.contact': 'Contact',
      // HERO
      'hero.greeting': '👋 Salut, moi c\'est',
      'hero.subtitle': 'Étudiant en BUT MMI, je crée des identités visuelles percutantes, des interfaces soignées et des supports de communication qui marquent les esprits.',
      'hero.badge': 'Disponible pour un stage ou une alternance',
      // ABOUT (homepage)
      'about.label': 'À propos',
      'about.title': 'Le design au service du sens',
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
      'hero.subtitle': 'Multimedia & Internet student, I create striking visual identities, refined interfaces and communication materials that leave a lasting impression.',
      'hero.badge': 'Available for internship or work-study',
      'about.label': 'About',
      'about.title': 'Design in service of meaning',
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
      'hero.subtitle': 'Estudiante de Multimedia e Internet, creo identidades visuales impactantes, interfaces cuidadas y materiales de comunicación que dejan huella.',
      'hero.badge': 'Disponible para prácticas o alternancia',
      'about.label': 'Sobre mí',
      'about.title': 'Diseño al servicio del sentido',
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
        // Préserve les icônes SVG à l'intérieur des boutons/liens
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
    // Traduit aussi les attributs placeholder des inputs
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
      e.stopPropagation(); // Empêche le clic de remonter et fermer le dropdown immédiatement
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
        document.documentElement.setAttribute('lang', lang); // Mise à jour attribut lang du <html> (SEO + a11y)
        localStorage.setItem('portfolio-lang', lang);
        applyTranslations(lang);
      });
    });

    // Restaure la langue sauvegardée (si différente du français par défaut)
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
