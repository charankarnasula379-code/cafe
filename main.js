/**
 * ============================================================
 * cherry — MAIN JAVASCRIPT
 * Premium Café Website
 * Libraries: GSAP, ScrollTrigger, Lenis, SplitType
 * ============================================================
 */

/* ──────────────────────────────────────────────────────────
   0. CORE INIT & ANIMATION BOOTSTRAP
   ────────────────────────────────────────────────────────── */
function initCore() {
  initNav();            // Navigation scroll + mobile menu
  initMenuFilter();     // Menu category tabs
  initGuestsSelector(); // Guests +/- buttons
  initReservationForm();// Reservation form submission
  initTestimonials();  // Keep testimonial controls working if animations are unavailable
}

function showContentWithoutAnimations(reason) {
  // Keep the website usable even if an optional animation library fails to load.
  document.body.classList.add('animations-fallback');
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('is-hidden');
  document.body.style.overflow = '';
  if (reason) console.warn('[cherry] Showing the page without animations:', reason);
}

function initAnimationsWhenReady() {
  setTimeout(() => {
    // The custom cursor does not need GSAP; initialize it independently so it
    // still works on hybrid touch-screen laptops and if an animation CDN fails.
    try {
      initCursor();
    } catch (err) {
      console.warn('Custom cursor initialization notice:', err);
    }

    try {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        showContentWithoutAnimations('GSAP or ScrollTrigger did not load.');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      initLoader();
      initSignatureImageAnimations();
    } catch (err) {
      console.warn('Animation initialization notice:', err);
      showContentWithoutAnimations(err);
    }
  }, 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCore();
    initAnimationsWhenReady();
  });
} else {
  initCore();
  initAnimationsWhenReady();
}

/* ──────────────────────────────────────────────────────────
   1. PAGE LOADER
   ────────────────────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loader-fill');

  const startContent = () => {
    loader && loader.classList.add('is-hidden');
    document.body.style.overflow = '';
    if (document.body.classList.contains('animations-fallback')) return;

    try {
      initLenis(); // Optional: native scrolling still works if Lenis is unavailable.
      initAnimations();
    } catch (err) {
      console.warn('Page animation notice:', err);
      showContentWithoutAnimations(err);
    }
  };

  if (!loader || !fill) {
    startContent();
    return;
  }

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      fill.style.width = '100%';

      setTimeout(() => {
        try {
          gsap.to(loader, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: startContent
          });
        } catch (err) {
          showContentWithoutAnimations(err);
        }
      }, 400);
    } else {
      fill.style.width = progress + '%';
    }
  }, 120);

  document.body.style.overflow = 'hidden';
}

/* ──────────────────────────────────────────────────────────
   2. LENIS SMOOTH SCROLL
   ────────────────────────────────────────────────────────── */
let lenisInstance;

function initLenis() {
  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;
  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  // Connect Lenis with GSAP ticker (handles ScrollTrigger sync automatically)
  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  // NOTE: Do NOT also call ScrollTrigger.update on Lenis scroll —
  // the GSAP ticker above already handles it, double-firing causes stutter.

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenisInstance.scrollTo(target, {
          offset: -80,
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });
}

/* ──────────────────────────────────────────────────────────
   3. ALL SCROLL ANIMATIONS (GSAP + ScrollTrigger + SplitType)
   ────────────────────────────────────────────────────────── */
function initAnimations() {
  // ---- A. HERO ENTRANCE ----
  animateHeroEntrance();

  // ---- B. SCROLL REVEAL — TEXT SPLIT ----
  initTextReveal();

  // ---- C. SCROLL REVEAL — FADE IN ----
  initFadeReveal();

  // ---- D. SCROLL REVEAL — SLIDE UP ----
  initSlideUpReveal();

  // ---- E. CLIP REVEAL (images) ----
  initClipReveal();

  // ---- F. HERO PARALLAX ----
  initHeroParallax();

  // ---- G. ATMOSPHERE PARALLAX ----
  initAtmosphereParallax();

  // ---- H. MAGNETIC BUTTONS ----
  initMagneticButtons();

  // ---- I. GALLERY STAGGER ----
  initGalleryReveal();

  // ---- J. MENU CARDS STAGGER ----
  initMenuCardsReveal();
}

/* ── A. Hero entrance ─────────────────────────────────────── */
function animateHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.1 });

  // Image scale in
  tl.fromTo('#hero-img',
    { scale: 1.12 },
    { scale: 1, duration: 1.8, ease: 'power3.out' }
  );

  // Overlay fade
  tl.fromTo('.hero-overlay',
    { opacity: 0 },
    { opacity: 1, duration: 1.2, ease: 'power2.out' },
    '-=1.8'
  );

  // Eyebrow
  tl.fromTo('.hero-eyebrow',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    '-=0.6'
  );

  // Hero title lines — each word
  const titleLines = document.querySelectorAll('.hero-title-line');
  if (titleLines.length > 0) {
    if (typeof SplitType !== 'undefined') {
      titleLines.forEach(line => new SplitType(line, { types: 'words' }));

      const words = document.querySelectorAll('.hero-title-line .word');
      tl.fromTo(words,
        { y: '110%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.06
        },
        '-=0.4'
      );
    } else {
      tl.fromTo(titleLines,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12 },
        '-=0.4'
      );
    }
  }

  // Tagline
  tl.fromTo('.hero-tagline',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    '-=0.5'
  );

  // CTA buttons
  tl.fromTo('.hero-cta .btn',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 },
    '-=0.5'
  );

  // Scroll indicator
  tl.fromTo('#scroll-indicator',
    { opacity: 0 },
    { opacity: 1, duration: 0.6, ease: 'power2.out' },
    '-=0.3'
  );
}

/* ── B. Text split reveal ────────────────────────────────── */
function initTextReveal() {
  // Get all .reveal-text NOT inside .hero (hero handles its own)
  const textEls = document.querySelectorAll('.reveal-text:not(.hero *)');

  if (typeof SplitType === 'undefined') {
    textEls.forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });
    return;
  }

  textEls.forEach(el => {
    const splitType = el.dataset.split || 'words';
    const split = new SplitType(el, { types: splitType });
    const targets = splitType === 'chars'
      ? split.chars
      : (splitType === 'lines' ? split.lines : split.words);

    if (!targets || targets.length === 0) return;

    // Wrap each char/word in overflow-hidden container
    targets.forEach(t => {
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.verticalAlign = 'bottom';
      t.parentNode.insertBefore(wrapper, t);
      wrapper.appendChild(t);
    });

    gsap.fromTo(targets,
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.9,
        ease: 'power4.out',
        stagger: splitType === 'chars' ? 0.025 : 0.06,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

/* ── C. Fade reveal ──────────────────────────────────────── */
function initFadeReveal() {
  const fadeEls = document.querySelectorAll('.reveal-fade:not(.hero *)');

  fadeEls.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

/* ── D. Slide-up reveal ─────────────────────────────────── */
function initSlideUpReveal() {
  const upEls = document.querySelectorAll('.reveal-up');

  upEls.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: (i % 3) * 0.08,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

/* ── E. Clip reveal (images) ────────────────────────────── */
function initClipReveal() {
  const clipEls = document.querySelectorAll('.clip-reveal');

  clipEls.forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );

    // Also scale up the inner image
    const img = el.querySelector('img');
    if (img) {
      gsap.fromTo(img,
        { scale: 1.1 },
        {
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        }
      );
    }
  });
}

/* ── F. Hero parallax ───────────────────────────────────── */
function initHeroParallax() {
  gsap.to('#hero-img-wrap', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    }
  });
}

/* ── G. Atmosphere parallax ──────────────────────────────── */
function initAtmosphereParallax() {
  const img = document.querySelector('.atmosphere-img');
  const wrap = document.querySelector('.atmosphere-image-wrap');
  if (!img || !wrap) return;

  gsap.fromTo(img,
    { yPercent: -8 },
    {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.atmosphere',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2
      }
    }
  );
}

/* ── G1. Signature dishes image animations ──────────────── */
function initSignatureImageAnimations() {
  const signatureItems = document.querySelectorAll('.signature-item');

  signatureItems.forEach(item => {
    const wrap = item.querySelector('.signature-image-wrap');
    const img  = item.querySelector('.signature-img');
    if (!wrap || !img) return;

    // Smooth Parallax Scroll Effect
    gsap.fromTo(img,
      { yPercent: -10, scale: 1.18 },
      {
        yPercent: 10,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      }
    );
  });
}

/* ── H. Magnetic button effect ──────────────────────────── */
function initMagneticButtons() {
  const magneticEls = document.querySelectorAll('.magnetic');

  magneticEls.forEach(el => {
    // Create ONE reusable quickTo tween per axis — avoids spawning hundreds
    // of new GSAP instances on every mousemove pixel
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    let rafId   = null;
    let targetX = 0;
    let targetY = 0;

    el.addEventListener('mousemove', (e) => {
      const rect    = el.getBoundingClientRect();
      const cx      = rect.left + rect.width  / 2;
      const cy      = rect.top  + rect.height / 2;
      const dx      = e.clientX - cx;
      const dy      = e.clientY - cy;
      const maxDist = Math.max(rect.width, rect.height) * 0.7;
      const pull    = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / maxDist);
      targetX = dx * pull * 0.45;
      targetY = dy * pull * 0.45;

      // Throttle: only apply on the next animation frame
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          xTo(targetX);
          yTo(targetY);
          rafId = null;
        });
      }
    });

    el.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.5)' });
    });
  });
}

/* ── I. Gallery stagger reveal ──────────────────────────── */
function initGalleryReveal() {
  const galleryItems = document.querySelectorAll('.gallery-item');

  gsap.fromTo(galleryItems,
    { opacity: 0, y: 40, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.10,
      scrollTrigger: {
        trigger: '#gallery-masonry',
        start: 'top 85%',
        once: true
      }
    }
  );
}

/* ── J. Menu cards stagger ──────────────────────────────── */
function initMenuCardsReveal() {
  const cards = document.querySelectorAll('.menu-card');

  gsap.fromTo(cards,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: '#menu-grid',
        start: 'top 88%',
        once: true
      }
    }
  );
}

/* ──────────────────────────────────────────────────────────
   4. CUSTOM CURSOR
   ────────────────────────────────────────────────────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  // Only on non-touch devices with fine pointer
  if (window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches) {
    cursor.style.display = 'block';

    const dot  = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let dotX = -100, dotY = -100;
    let ringX = -100, ringY = -100;
    let isInitialized = false;

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isInitialized) {
        dotX = mouseX;
        dotY = mouseY;
        ringX = mouseX;
        ringY = mouseY;
        isInitialized = true;
        cursor.style.opacity = '1';
      }
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // Smooth cursor follow RAF loop
    function animateCursor() {
      if (isInitialized) {
        dotX  += (mouseX - dotX) * 0.75;
        dotY  += (mouseY - dotY) * 0.75;
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;

        dot.style.transform  = `translate3d(${dotX}px, ${dotY}px, 0)`;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Single delegated listener for hover/text cursor states — clean & high performance
    const hoverSelector = 'a, button, .menu-tab, .btn, .menu-card, .gallery-item, .testimonial-btn, .guests-btn, input, select, textarea, label';
    const textSelector  = 'p, h1, h2, h3, blockquote, span.reveal-text';

    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      if (target.closest(hoverSelector)) {
        document.body.classList.add('cursor-hover');
        document.body.classList.remove('cursor-text');
      } else if (target.closest(textSelector)) {
        document.body.classList.add('cursor-text');
        document.body.classList.remove('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover', 'cursor-text');
      }
    }, { passive: true });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      document.body.classList.remove('cursor-hover', 'cursor-text');
    });
    document.addEventListener('mouseenter', () => {
      if (isInitialized) cursor.style.opacity = '1';
    });
  } else {
    cursor.style.display = 'none';
  }
}

/* ──────────────────────────────────────────────────────────
   5. NAVIGATION
   ────────────────────────────────────────────────────────── */
function initNav() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn  = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!navbar) return;

  // Scroll behaviour — throttled with RAF to avoid layout thrash on every pixel
  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const navLinks  = Array.from(document.querySelectorAll('.nav-link'));
  let scrollRAF   = null;
  let lastScrollY = -1;

  const handleScroll = () => {
    if (scrollRAF) return;             // already scheduled — skip
    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = null;
      const y = window.scrollY;
      if (y === lastScrollY) return;   // nothing changed
      lastScrollY = y;

      // Scrolled state
      navbar.classList.toggle('scrolled', y > 60);

      // Active nav link — read getBoundingClientRect in one batch
      let current = '';
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].getBoundingClientRect().top < 200) {
          current = sections[i].id;
          break;
        }
      }
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileMenu);
  }

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function openMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburger  = document.getElementById('nav-hamburger');
  if (!mobileMenu) return;
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  // Stagger menu links when GSAP is available; the CSS menu still works without it.
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.mobile-link',
      { opacity: 0, x: -24 },
      {
        opacity: 1, x: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.07,
        delay: 0.15
      }
    );
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburger  = document.getElementById('nav-hamburger');
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  hamburger && hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────
   6. MENU FILTER TABS
   ────────────────────────────────────────────────────────── */
function initMenuFilter() {
  const tabs = document.querySelectorAll('.menu-tab');
  const cards = document.querySelectorAll('.menu-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;
      cards.forEach((card, i) => {
        const show = filter === 'all' || card.dataset.category === filter;

        if (show) {
          card.style.display = '';
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(card,
              { opacity: 0, y: 20, scale: 0.97 },
              { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: i * 0.04 }
            );
          } else {
            card.style.opacity = '1';
            card.style.transform = 'none';
          }
        } else if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            opacity: 0, y: 10,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => { card.style.display = 'none'; }
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ──────────────────────────────────────────────────────────
   7. TESTIMONIALS SLIDER
   ────────────────────────────────────────────────────────── */
function initTestimonials() {
  const slider = document.getElementById('testimonials-slider');
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dotsContainer = document.getElementById('testimonials-dots');

  if (!track || !slider) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  if (total === 0) return;

  let current = 0;
  let autoplayTimer = null;

  // Determine cards per view: 1 on mobile/tablet (< 768px), 2 on desktop (>= 768px)
  const getVisible = () => window.innerWidth < 768 ? 1 : 2;

  // Dynamically size cards to cleanly fit within slider viewport
  const updateLayout = () => {
    const sliderWidth = slider.clientWidth;
    if (sliderWidth === 0) return { cardWidth: 500, gap: 28, visible: 2 };

    const visible = getVisible();
    const gap = window.innerWidth < 640 ? 16 : 28;
    track.style.gap = `${gap}px`;

    // 1 card fills 100% of slider; 2 cards fill slider side-by-side with exact gap
    const cardWidth = visible === 1
      ? sliderWidth
      : Math.floor((sliderWidth - gap) / 2);

    cards.forEach(card => {
      card.style.width = `${cardWidth}px`;
      card.style.flex = `0 0 ${cardWidth}px`;
      card.style.minWidth = '0';
    });

    return { cardWidth, gap, visible };
  };

  const getMaxIndex = () => Math.max(0, total - getVisible());

  // Create dot indicators
  const createDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIndex = getMaxIndex();
    const totalDots = maxIndex + 1;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === current ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to testimonial slide ${i + 1}`);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      dot.addEventListener('click', () => {
        goTo(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  };

  // Update active dot
  const updateDots = () => {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.testimonial-dot');
    dots.forEach((dot, i) => {
      const isActive = i === current;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  };

  // Slide to index
  const goTo = (index, immediate = false) => {
    const { cardWidth, gap } = updateLayout();
    const maxIndex = getMaxIndex();
    current = Math.min(Math.max(0, index), maxIndex);

    const offset = current * (cardWidth + gap);

    if (typeof gsap !== 'undefined') {
      if (immediate) {
        gsap.set(track, { x: -offset });
      } else {
        gsap.to(track, {
          x: -offset,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    } else {
      track.style.transform = 'translateX(' + (-offset) + 'px)';
    }

    updateDots();
  };

  // Prev / Next controls with looping
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const maxIndex = getMaxIndex();
      goTo(current <= 0 ? maxIndex : current - 1);
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const maxIndex = getMaxIndex();
      goTo(current >= maxIndex ? 0 : current + 1);
      resetAutoplay();
    });
  }

  // Autoplay (cycles every 5 seconds)
  const startAutoplay = () => {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      const maxIndex = getMaxIndex();
      goTo(current >= maxIndex ? 0 : current + 1);
    }, 5000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayTimer);
    startAutoplay();
  };

  // Pause on hover so readers can read the full reviews comfortably
  slider.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  slider.addEventListener('mouseleave', () => startAutoplay());

  // Touch / swipe support for mobile
  let startX = 0;
  let isSwiping = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
    clearInterval(autoplayTimer);
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const diff = startX - e.changedTouches[0].clientX;
    const maxIndex = getMaxIndex();

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goTo(current >= maxIndex ? 0 : current + 1);
      } else {
        goTo(current <= 0 ? maxIndex : current - 1);
      }
    }
    resetAutoplay();
  });

  // Initial layout & setup
  updateLayout();
  createDots();
  goTo(0, true);
  startAutoplay();

  // Resize handler — smoothly re-compute dimensions
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateLayout();
      createDots();
      goTo(current, true);
    }, 100);
  });
}

/* ──────────────────────────────────────────────────────────
   8. GUESTS SELECTOR
   ────────────────────────────────────────────────────────── */
function initGuestsSelector() {
  const minusBtn     = document.getElementById('guests-minus');
  const plusBtn      = document.getElementById('guests-plus');
  const countDisplay = document.getElementById('guests-count');
  const hiddenInput  = document.getElementById('res-guests');

  if (!minusBtn || !plusBtn || !countDisplay || !hiddenInput) return;

  let guests = Number.parseInt(countDisplay.textContent, 10) || 2;
  const MIN = 1, MAX = 12;

  const update = () => {
    countDisplay.textContent = String(guests);
    hiddenInput.value        = String(guests);
    minusBtn.disabled        = guests <= MIN;
    plusBtn.disabled         = guests >= MAX;

    // Restart the CSS animation on every valid change; it doesn't rely on GSAP.
    countDisplay.classList.remove('is-changing');
    void countDisplay.offsetWidth;
    countDisplay.classList.add('is-changing');
  };

  minusBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (guests > MIN) { guests--; update(); }
  });
  plusBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (guests < MAX) { guests++; update(); }
  });
}

/* ──────────────────────────────────────────────────────────
   9. RESERVATION FORM
   ────────────────────────────────────────────────────────── */
function initReservationForm() {
  const form    = document.getElementById('reservation-form');
  const success = document.getElementById('form-success');
  const submit  = document.getElementById('res-submit');

  if (!form || !success) return;

  // Set min date to today
  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // Clear existing error message
  const clearFormError = () => {
    const existingErr = form.querySelector('.form-error');
    if (existingErr) existingErr.remove();
  };

  // Display validation error message
  const showValidationError = (msg) => {
    clearFormError();
    const errorMsg = document.createElement('div');
    errorMsg.className = 'form-error';
    errorMsg.setAttribute('role', 'alert');
    errorMsg.textContent = msg;

    if (submit) {
      form.insertBefore(errorMsg, submit);
    } else {
      form.appendChild(errorMsg);
    }
  };

  // Helper to trigger success transition
  const showSuccessView = () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(form, {
        opacity: 0,
        y: -15,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          form.hidden = true;
          form.style.display = 'none';
          success.hidden = false;
          success.style.display = 'block';
          gsap.fromTo(success,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
          );
          gsap.fromTo('.form-success-icon',
            { scale: 0, rotation: -30 },
            { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2)', delay: 0.05 }
          );
        }
      });
    } else {
      form.hidden = true;
      form.style.display = 'none';
      success.hidden = false;
      success.style.display = 'block';
      success.style.opacity = '1';
    }
  };

  // "Book Another Table" button reset logic
  const resetFormView = () => {
    form.reset();
    clearFormError();
    form.hidden = false;
    form.style.display = 'flex';
    form.style.opacity = '1';
    success.hidden = true;
    success.style.display = 'none';
    if (submit) {
      submit.disabled = false;
      const btnText = submit.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Confirm Reservation';
    }
  };

  const anotherBtn = document.getElementById('res-another-btn');
  if (anotherBtn) {
    anotherBtn.addEventListener('click', resetFormView);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormError();

    // Field validation
    const name  = document.getElementById('res-name');
    const email = document.getElementById('res-email');
    const date  = document.getElementById('res-date');
    const time  = document.getElementById('res-time');

    const fields = [
      { el: name, label: 'Full Name' },
      { el: email, label: 'Email Address' },
      { el: date, label: 'Date' },
      { el: time, label: 'Time' }
    ];

    const missingLabels = [];
    fields.forEach(({ el, label }) => {
      if (!el || !el.value || !el.value.trim()) {
        missingLabels.push(label);
        if (el) shakeField(el);
      }
    });

    if (missingLabels.length > 0) {
      showValidationError(`Please complete all required fields: ${missingLabels.join(', ')}.`);
      return;
    }

    // Submit state UI (prevent duplicate submission)
    const btnText = submit ? submit.querySelector('.btn-text') : null;
    if (btnText) btnText.textContent = 'Recording Request…';
    if (submit) submit.disabled = true;

    const resId = 'RES-' + Math.floor(100000 + Math.random() * 900000);
    const nowIso = new Date().toISOString();

    const reservationData = {
      reservationId: resId,
      id: resId,
      customerName: name.value.trim(),
      name: name.value.trim(),
      email: email.value.trim(),
      phone: document.getElementById('res-phone') ? document.getElementById('res-phone').value.trim() : '',
      date: date.value,
      time: time.value,
      guests: parseInt(document.getElementById('res-guests') ? document.getElementById('res-guests').value : '2', 10) || 2,
      specialRequest: document.getElementById('res-notes') ? document.getElementById('res-notes').value.trim() : '',
      notes: document.getElementById('res-notes') ? document.getElementById('res-notes').value.trim() : '',
      status: 'pending',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Save directly to localStorage
    try {
      let existing = JSON.parse(localStorage.getItem('cherry_reservations') || '[]');
      if (!Array.isArray(existing)) existing = [];
      existing.push(reservationData);
      localStorage.setItem('cherry_reservations', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // Reset button UI
    if (submit) submit.disabled = false;
    if (btnText) btnText.textContent = 'Confirm Reservation';

    // Show customer feedback (Request Received)
    showToast('Reservation request received! We will review your booking shortly.', 'success');
    showSuccessView();
    openSuccessModal(reservationData);
  });
}

// Global Helper Functions for Modal & Toast Notifications
function formatTime(timeStr) {
  if (!timeStr) return '';
  if (timeStr.includes(':')) return timeStr;
  if (timeStr.length === 4) {
    let hours = parseInt(timeStr.substring(0, 2), 10);
    const mins = timeStr.substring(2);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${mins} ${ampm}`;
  }
  return timeStr;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  toast.innerHTML = `
    <span style="font-weight: bold;">${iconMap[type] || 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function openSuccessModal(res) {
  const modal = document.getElementById('reservation-success-modal');
  if (!modal) return;

  const resIdEl = document.getElementById('modal-res-id');
  const nameEl = document.getElementById('modal-res-name');
  const dateEl = document.getElementById('modal-res-date');
  const timeEl = document.getElementById('modal-res-time');
  const guestsEl = document.getElementById('modal-res-guests');

  const statusEl = document.getElementById('modal-res-status');

  if (resIdEl) resIdEl.textContent = res.reservationId || res.id || 'PENDING';
  if (nameEl) nameEl.textContent = res.customerName || res.name || 'Valued Guest';
  if (statusEl) statusEl.textContent = 'Pending Review';
  if (dateEl) dateEl.textContent = res.date || 'Today';
  if (timeEl) timeEl.textContent = formatTime(res.time) || res.time || '';
  if (guestsEl) guestsEl.textContent = `${res.guests || 2} ${res.guests === 1 ? 'Guest' : 'Guests'}`;

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');

  const closeIcon = document.getElementById('res-modal-close-icon');
  const viewBtn = document.getElementById('res-modal-view-btn');
  const homeBtn = document.getElementById('res-modal-home-btn');

  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  };

  if (closeIcon) closeIcon.onclick = closeModal;
  if (viewBtn) {
    viewBtn.onclick = () => {
      closeModal();
      const resSec = document.getElementById('reservation');
      if (resSec) resSec.scrollIntoView({ behavior: 'smooth' });
    };
  }
  if (homeBtn) {
    homeBtn.onclick = () => {
      closeModal();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }
}

// Field shake animation on validation error
function shakeField(field) {
  field.style.borderColor = '#B85C50';
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(field,
      { x: 0 },
      {
        x: 8,
        duration: 0.07,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 5
      }
    );
  }
  const clearBorder = () => { field.style.borderColor = ''; };
  field.addEventListener('input', clearBorder, { once: true });
  field.addEventListener('change', clearBorder, { once: true });
}

/* ──────────────────────────────────────────────────────────
   10. MISC: DATE INPUT minimum date set
   ────────────────────────────────────────────────────────── */
// (Already handled inside initReservationForm)
