// Finance Forward Network, shared site behavior
document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile nav panel ---------- */
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('mobile-panel');
  const closeBtn = document.getElementById('mobile-close');
  const scrim = document.getElementById('nav-scrim');

  const openPanel = () => {
    panel.classList.add('open');
    scrim.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closePanel = () => {
    panel.classList.remove('open');
    scrim.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  if (toggle && panel) {
    toggle.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    scrim.addEventListener('click', closePanel);
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closePanel));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
  }

  /* ---------- "More" nav dropdown ---------- */
  const moreItem = document.getElementById('more-item');
  const moreToggle = document.getElementById('more-toggle');
  if (moreItem && moreToggle) {
    const closeMore = () => { moreItem.classList.remove('open'); moreToggle.setAttribute('aria-expanded', 'false'); };
    const toggleMore = () => {
      const isOpen = moreItem.classList.toggle('open');
      moreToggle.setAttribute('aria-expanded', String(isOpen));
    };
    moreToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleMore(); });
    document.addEventListener('click', (e) => { if (!moreItem.contains(e.target)) closeMore(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMore(); });
    moreItem.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMore));
  }

  /* ---------- header background strengthens once page has scrolled ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const setScrolled = () => header.classList.toggle('scrolled', window.scrollY > 16);
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- education: scroll-triggered card assembly (staged, not one fade) ---------- */
  const eventCard = document.getElementById('education-event-card');
  if (eventCard) {
    if ('IntersectionObserver' in window) {
      const eduIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { eventCard.classList.add('is-assembled'); eduIo.unobserve(entry.target); }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
      eduIo.observe(eventCard);
    } else {
      eventCard.classList.add('is-assembled');
    }
  }

  /* ---------- count-up on stat numbers ---------- */
  const countEls = document.querySelectorAll('[data-count-to]');
  if (countEls.length) {
    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-count-to'), 10);
      if (reduceMotion || isNaN(target)) { el.textContent = target; return; }
      const duration = 1100;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const countIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { animateCount(entry.target); countIo.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      countEls.forEach(el => countIo.observe(el));
    } else {
      countEls.forEach(animateCount);
    }
  }

  /* ==========================================================================
     MOTION ENGINE — one rAF loop drives the scroll progress bar, blob
     parallax, hero shrink-on-scroll, pinned "statement" + "simulation"
     reveals, and a subtle background tone shift. Everything here is skipped
     when the person has requested reduced motion, so CSS then shows all of
     this content fully visible and static (see the reduced-motion block in
     styles.css).
     ========================================================================== */
  if (!reduceMotion) {

    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const progressFill = document.getElementById('scroll-progress-fill');
    const blobs = Array.from(document.querySelectorAll('.blob[data-speed]'));
    const heroVisual = document.querySelector('.hero-visual');
    const heroLeft = document.querySelector('.hero-inner > .reveal');
    const heroSection = document.querySelector('.hero');
    const heroGlow = document.querySelector('.hero-scroll-glow');
    const heroCards = Array.from(document.querySelectorAll('[data-hv-card]'));
    const statementSection = document.querySelector('.statement-pin');
    const statementWords = statementSection ? Array.from(statementSection.querySelectorAll('.statement-word')) : [];
    const researchSection = document.querySelector('.research-pin');
    const researchPhaseEls = researchSection ? Array.from(researchSection.querySelectorAll('[data-phase]')) : [];
    const researchLines = researchSection ? Array.from(researchSection.querySelectorAll('.rd-line[data-phase]')) : [];
    const researchDiagram = researchSection ? researchSection.querySelector('.research-diagram') : null;
    const simSection = document.querySelector('.sim-pin');
    const simPhaseEls = simSection ? Array.from(simSection.querySelectorAll('[data-phase]')) : [];
    const simMock = simSection ? simSection.querySelector('.sim-mock') : null;
    const simVisual = simSection ? simSection.querySelector('.sim-visual') : null;
    const bgGlowA = document.querySelector('.bg-field .glow-a');
    const bgGlowB = document.querySelector('.bg-field .glow-b');
    const root = document.documentElement;

    // background motion was too slow to read as "alive" — scale up scroll-linked
    // blob parallax speed on top of each blob's own data-speed value.
    const BLOB_SPEED_MULT = 1.45;

    // hero cards separate from one another as the hero scrolls away, using the
    // CSS `translate` property so it composites cleanly alongside the existing
    // `transform`-based float/tilt animations on the same elements.
    const heroCardOffsets = { budget: [-26, -34], shield: [-18, 30], chart: [30, 10] };

    // cache blob offsets; recomputed on resize
    let blobOffsets = [];
    const cacheBlobOffsets = () => {
      blobOffsets = blobs.map(el => {
        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY;
      });
    };
    cacheBlobOffsets();

    const bgFrom = { r: 0x29, g: 0x02, b: 0x07 }; // --bg
    const bgTo   = { r: 0x45, g: 0x0A, b: 0x10 }; // slightly deeper warm burgundy tone
    const lerp = (a, b, t) => Math.round(a + (b - a) * t);

    let frame = 0;

    const update = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const docMax = document.documentElement.scrollHeight - vh;

      // 1) scroll progress bar
      const overallProgress = docMax > 0 ? Math.min(Math.max(scrollY / docMax, 0), 1) : 0;
      if (progressFill) progressFill.style.transform = `scaleX(${overallProgress})`;

      // 2) blob parallax (position-based, GPU-friendly translate3d) — a slight
      //    scroll-linked rotation is layered on top so the shapes feel organic
      //    rather than sliding in a straight line.
      const speedMult = (isMobile ? 0.5 : 1) * BLOB_SPEED_MULT;
      blobs.forEach((el, i) => {
        const offset = (scrollY - blobOffsets[i]) * parseFloat(el.dataset.speed) * speedMult;
        const rot = (offset * 0.035).toFixed(2);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) rotate(${rot}deg)`;
      });

      // 2b) ambient page-wide glows drift slowly with overall progress so the
      //     background reads as one continuous canvas rather than resetting
      //     between sections.
      if (bgGlowA) bgGlowA.style.transform = `translate3d(${(-70 * overallProgress).toFixed(1)}px, ${(90 * overallProgress).toFixed(1)}px, 0)`;
      if (bgGlowB) bgGlowB.style.transform = `translate3d(${(80 * overallProgress).toFixed(1)}px, ${(-60 * overallProgress).toFixed(1)}px, 0)`;

      // 3) hero scroll-linked transformation: typography lifts, dashboard scales
      //    down, and the floating cards separate from one another and from the
      //    dashboard, so the hero reads as one continuous transform rather than
      //    a simple fade.
      if (heroSection && heroVisual) {
        const heroH = heroSection.offsetHeight;
        const hp = Math.min(Math.max(scrollY / heroH, 0), 1);
        heroVisual.style.transform = `scale(${(1 - 0.16 * hp).toFixed(3)}) translateY(${(-30 * hp).toFixed(1)}px)`;
        heroVisual.style.opacity = (1 - 0.5 * hp).toFixed(2);
        heroVisual.style.filter = hp > 0.02 ? `blur(${(hp * 3.5).toFixed(1)}px)` : 'none';
        if (heroLeft) {
          heroLeft.style.transform = `translateY(${(-34 * hp).toFixed(1)}px)`;
          heroLeft.style.opacity = (1 - 0.6 * hp).toFixed(2);
        }
        heroCards.forEach(card => {
          const [dx, dy] = heroCardOffsets[card.dataset.hvCard] || [0, 0];
          card.style.translate = `${(dx * hp).toFixed(1)}px ${(dy * hp).toFixed(1)}px`;
        });
        if (heroGlow) {
          heroGlow.style.transform = `translate(-50%,-50%) scale(${(0.8 + 0.9 * hp).toFixed(3)})`;
          heroGlow.style.opacity = (0.35 * (1 - hp * 0.75)).toFixed(2);
        }
      }

      // 4) pinned "Learn. Practice. Protect." statement — the word changes AND
      //    the ambient visual environment behind it builds up with each state.
      if (statementSection && statementWords.length) {
        const rect = statementSection.getBoundingClientRect();
        const runway = rect.height - vh;
        const sp = runway > 0 ? Math.min(Math.max(-rect.top / runway, 0), 1) : 0;
        const idx = Math.min(2, Math.floor(sp * 3));
        statementWords.forEach((w, i) => w.classList.toggle('is-active', i === idx));
        const states = ['learn', 'practice', 'protect'];
        statementSection.dataset.state = states[idx];
      }

      // 5) pinned research diagram — lines draw in continuously (scrubbable),
      //    nodes/labels/pulses step in once their line reaches them.
      if (researchSection && researchPhaseEls.length) {
        const rect = researchSection.getBoundingClientRect();
        const runway = rect.height - vh;
        const sp = runway > 0 ? Math.min(Math.max(-rect.top / runway, 0), 1) : 0;
        const phase = sp * 5.6;
        researchPhaseEls.forEach(el => {
          const p = parseFloat(el.dataset.phase);
          el.classList.toggle('node-in', phase >= p);
        });
        researchLines.forEach(line => {
          const p = parseFloat(line.dataset.phase);
          const local = Math.min(Math.max((phase - p) / 1.2, 0), 1);
          line.style.strokeDashoffset = (100 - 100 * local).toFixed(1);
        });
        if (researchDiagram) researchDiagram.style.transform = `rotate(${(sp * 2.4).toFixed(2)}deg)`;
      }

      // 6) pinned simulation — the biggest scroll experience: dashboard frame,
      //    balance, savings, a cybersecurity alert, progress, and finally the
      //    launch button all step in across the pin's scroll runway, and step
      //    back out cleanly if the user scrolls up.
      if (simSection && simPhaseEls.length) {
        const rect = simSection.getBoundingClientRect();
        const runway = rect.height - vh;
        const sp = runway > 0 ? Math.min(Math.max(-rect.top / runway, 0), 1) : 0;
        const phase = sp * 9.6; // slight overshoot so phase 9 settles before release
        simPhaseEls.forEach(el => {
          const p = parseFloat(el.dataset.phase);
          el.classList.toggle('phase-in', phase >= p);
        });
        const isFinal = phase >= 8;
        if (simMock) {
          simMock.classList.toggle('is-final', isFinal);
          const simRot = Math.min(sp, 1) * 1.4;
          const simScale = isFinal ? 1.015 : 1;
          simMock.style.transform = `rotateZ(${simRot.toFixed(2)}deg) scale(${simScale})`;
        }
        if (simVisual) simVisual.classList.toggle('is-final', isFinal);
      }

      // 7) subtle background tone shift across the whole page (throttled)
      if (frame % 4 === 0) {
        const r = lerp(bgFrom.r, bgTo.r, overallProgress);
        const g = lerp(bgFrom.g, bgTo.g, overallProgress);
        const b = lerp(bgFrom.b, bgTo.b, overallProgress);
        root.style.setProperty('--bg', `rgb(${r}, ${g}, ${b})`);
      }

      frame++;
      ticking = false;
    };

    let ticking = false;
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', () => { cacheBlobOffsets(); requestUpdate(); }, { passive: true });

    /* ---------- cursor tilt on hero cards (desktop, fine pointer only) ---------- */
    if (canHover && heroVisual) {
      const tiltCards = Array.from(heroVisual.querySelectorAll('.hv-tilt'));
      let tiltRaf = null;
      heroVisual.addEventListener('mousemove', (e) => {
        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(() => {
          const rect = heroVisual.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          tiltCards.forEach(card => {
            const depth = parseFloat(card.dataset.tiltDepth || '1');
            const rotY = relX * 8 * depth;
            const rotX = -relY * 8 * depth;
            card.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
          });
          tiltRaf = null;
        });
      });
      heroVisual.addEventListener('mouseleave', () => {
        tiltCards.forEach(card => { card.style.transform = ''; });
      });
    }

    /* ---------- cursor nudge on the nearest background blob (hero only, desktop) ----------
       Extremely subtle: the closest fluid shape shifts a few pixels away from the
       cursor. No trail, no whole-background chase. */
    if (canHover && heroSection) {
      const heroBlobs = Array.from(heroSection.querySelectorAll('.blob'));
      let blobRaf = null;
      heroSection.addEventListener('mousemove', (e) => {
        if (blobRaf || !heroBlobs.length) return;
        blobRaf = requestAnimationFrame(() => {
          const heroRect = heroSection.getBoundingClientRect();
          const cx = e.clientX - heroRect.left;
          const cy = e.clientY - heroRect.top;
          heroBlobs.forEach(blob => {
            const r = blob.getBoundingClientRect();
            const bx = r.left - heroRect.left + r.width / 2;
            const by = r.top - heroRect.top + r.height / 2;
            const dx = bx - cx, dy = by - cy;
            const dist = Math.max(Math.hypot(dx, dy), 1);
            const influence = Math.max(0, 1 - dist / 700);
            const nudge = 14 * influence;
            const nx = (dx / dist) * nudge;
            const ny = (dy / dist) * nudge;
            blob.style.marginLeft = `${nx.toFixed(1)}px`;
            blob.style.marginTop = `${ny.toFixed(1)}px`;
          });
          blobRaf = null;
        });
      });
      heroSection.addEventListener('mouseleave', () => {
        heroBlobs.forEach(blob => { blob.style.marginLeft = ''; blob.style.marginTop = ''; });
      });
    }

    /* ---------- magnetic buttons (desktop, fine pointer only) ----------
       Primary/CTA buttons drift a few px toward the cursor within a small
       radius, and settle back via the existing CSS transform transition. */
    if (canHover) {
      const magneticButtons = Array.from(document.querySelectorAll('.btn-primary, .btn-cta, .btn-outline-light'));
      magneticButtons.forEach(btn => {
        const strength = btn.classList.contains('btn-sm') ? 6 : (btn.classList.contains('btn-cta') ? 11 : 9);
        let raf = null;
        btn.addEventListener('mousemove', (e) => {
          if (raf) return;
          raf = requestAnimationFrame(() => {
            const r = btn.getBoundingClientRect();
            const relX = (e.clientX - r.left) / r.width - 0.5;
            const relY = (e.clientY - r.top) / r.height - 0.5;
            const dx = relX * strength;
            const dy = relY * strength;
            btn.style.transform = `translate(${dx.toFixed(1)}px, ${(dy - 2).toFixed(1)}px)`;
            raf = null;
          });
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
      });

      /* ---------- cursor-reactive cards: radial highlight + subtle 3D tilt ----------
         .card-muted (roadmap / "coming soon" items) intentionally stays static,
         matching its existing dashed, non-interactive treatment. */
      const glowEls = Array.from(document.querySelectorAll('.card:not(.card-muted), .contact-card, .role-chip'));
      glowEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
          el.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
        });
      });

      const tiltCards = Array.from(document.querySelectorAll('.card:not(.card-muted)'));
      tiltCards.forEach(el => {
        let raf = null;
        el.addEventListener('mousemove', (e) => {
          if (raf) return;
          raf = requestAnimationFrame(() => {
            const r = el.getBoundingClientRect();
            const relX = (e.clientX - r.left) / r.width - 0.5;
            const relY = (e.clientY - r.top) / r.height - 0.5;
            el.style.transform = `perspective(900px) rotateX(${(-relY * 3.2).toFixed(2)}deg) rotateY(${(relX * 3.2).toFixed(2)}deg) translateY(-5px)`;
            raf = null;
          });
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      });
    }
  } else {
    // reduced motion: still keep the progress bar working, just without the rest
    const progressFill = document.getElementById('scroll-progress-fill');
    const updateProgressOnly = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      if (progressFill) progressFill.style.transform = `scaleX(${progress})`;
    };
    updateProgressOnly();
    window.addEventListener('scroll', updateProgressOnly, { passive: true });
  }

});
