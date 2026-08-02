/* ═══════════════════════════════════════════
   SOBRE MÍ — JS
   • Timeline scroll-reveal with staggered delay
   • Nav active state
═══════════════════════════════════════════ */

/* ── TIMELINE SCROLL REVEAL ── */
const timelineItems = document.querySelectorAll('.timeline-item');

const tlObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Stagger each item based on its index
        const idx = [...timelineItems].indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('tl-visible');
        }, idx * 120);
        tlObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

timelineItems.forEach((item) => tlObserver.observe(item));

/* ── TIMELINE LINE FILL ANIMATION ──
   Draws an orange progress line as you scroll through the timeline */
(function () {
  const lines = document.querySelectorAll('.tl-line');

  const lineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.background = 'linear-gradient(to bottom, var(--orange), var(--border))';
          lineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.8 }
  );

  lines.forEach((line) => lineObserver.observe(line));
})();



/* ── PHOTO CARD SUBTLE PARALLAX ── */
const photoCard = document.querySelector('.photo-card');
if (photoCard) {
  document.addEventListener('mousemove', (e) => {
    const rect = photoCard.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;

    // Only apply when mouse is somewhat near the card
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1.2) {
      const rx = dy * -6;
      const ry = dx * 6;
      photoCard.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
    } else {
      photoCard.style.transform = '';
    }
  });

  photoCard.addEventListener('mouseleave', () => {
    photoCard.style.transform = '';
  });

  photoCard.style.transition = 'transform .25s ease';
}
