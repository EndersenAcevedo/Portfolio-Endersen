/* ═══════════════════════════════════════════
   CASOS DE ÉXITO — JS
   • Scroll reveal staggered
   • Counter animation for stats strip
   • Card 3D tilt on mousemove
   • Metric values count up on card reveal
═══════════════════════════════════════════ */

/* ── SCROLL REVEAL ── */
const cards = document.querySelectorAll('.caso-card');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = parseInt(entry.target.dataset.index) || 0;
      setTimeout(() => entry.target.classList.add('visible'), idx * 120);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

cards.forEach(c => revealObserver.observe(c));

/* ── COUNTER ANIMATION (stats strip) ── */
function animateCount(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1600;
  const step = 16;
  const steps = duration / step;
  const inc = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += inc;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, step);
}

const statsSection = document.querySelector('.casos-stats');
let counted = false;
const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    document.querySelectorAll('.cs-num[data-target]').forEach(el => animateCount(el));
  }
}, { threshold: 0.4 });
if (statsSection) statsObserver.observe(statsSection);

/* ── 3D TILT per card ── */
cards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;

    const rx =  y * 7;
    const ry = -x * 7;

    card.style.transform = `translateY(-6px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'border-color .3s ease, box-shadow .3s ease, transform .4s cubic-bezier(.34,1.3,.64,1)';
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'border-color .3s ease, box-shadow .3s ease, transform .1s ease';
  });
});

/* ── METRIC COUNT-UP when card becomes visible ── */
const metricObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const vals = entry.target.querySelectorAll('.cm-val');
    vals.forEach((el, i) => {
      const text = el.textContent;
      // Extract numeric part
      const numMatch = text.match(/[\d.]+/);
      if (!numMatch) return;
      const num = parseFloat(numMatch[0]);
      const prefix = text.match(/^[^0-9]*/)[0];
      const suffix = text.replace(/^[^0-9]*[\d.]+/, '');

      let current = 0;
      const duration = 1200;
      const stepMs = 16;
      const steps = duration / stepMs;
      const inc = num / steps;
      const isInt = Number.isInteger(num);

      setTimeout(() => {
        const timer = setInterval(() => {
          current += inc;
          if (current >= num) {
            current = num;
            clearInterval(timer);
          }
          el.textContent = prefix + (isInt ? Math.floor(current) : current.toFixed(1)) + suffix;
        }, stepMs);
      }, i * 150);
    });
    metricObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

cards.forEach(c => metricObserver.observe(c));

/* ── CTA button ripple ── */
const ctaBtn = document.querySelector('.casos-cta-btn');
if (ctaBtn) {
  ctaBtn.addEventListener('click', e => {
    const ripple = document.createElement('span');
    const rect = ctaBtn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute; pointer-events:none;
      width:${size}px; height:${size}px; border-radius:50%;
      background:rgba(255,255,255,.22);
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top  - size/2}px;
      transform:scale(0); animation:ripple-caso .55s ease-out forwards;
    `;
    ctaBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 560);
  });
}

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes ripple-caso { to { transform:scale(2.6); opacity:0; } }`;
document.head.appendChild(rippleStyle);

