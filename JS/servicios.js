/* ═══════════════════════════════════════════
   SERVICIOS — JS
   • Scroll-reveal with staggered delay
   • Radial glow that tracks mouse per card
   • Nav active state
═══════════════════════════════════════════ */

/* ── SCROLL REVEAL ── */
const cards = document.querySelectorAll('.srv-card');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.index) || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

cards.forEach((card) => revealObserver.observe(card));

/* ── MOUSE GLOW TRACKING ── */
cards.forEach((card) => {
  const glow = card.querySelector('.srv-card-glow');
  if (!glow) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.left = x + 'px';
    glow.style.top  = y + 'px';
  });

  card.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
});

/* ── CTA BUTTON ripple ── */
const ctaBtn = document.querySelector('.srv-cta-btn');
if (ctaBtn) {
  ctaBtn.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    const rect = ctaBtn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:rgba(255,255,255,.25);
      transform:scale(0);
      animation:ripple-anim .5s ease-out forwards;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top  - size/2}px;
      pointer-events:none;
    `;
    ctaBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
}

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple-anim {
    to { transform: scale(2.5); opacity: 0; }
  }
`;
document.head.appendChild(style);

