/* ═══════════════════════════════════════════
   STACK — JS
   • Tab category filtering with animated transition
   • Progress bar fill animation on reveal
   • Staggered card entrance
═══════════════════════════════════════════ */

const tabs  = document.querySelectorAll('.stab');
const cards = document.querySelectorAll('.sk-card');

/* ── ANIMATE BARS ──
   Sets width from 0 → data-w after card becomes visible */
function animateBars(cardEls) {
  cardEls.forEach((card, i) => {
    const fill = card.querySelector('.sk-bar-fill');
    if (!fill) return;
    const target = fill.dataset.w;

    // Reset first so re-entering category re-animates
    fill.style.width = '0%';

    // Stagger slightly per card
    setTimeout(() => {
      fill.style.width = target + '%';
    }, i * 60 + 80);
  });
}

/* ── SHOW CATEGORY ── */
function showCategory(cat) {
  // Hide all
  cards.forEach(c => {
    c.classList.remove('visible');
    c.querySelector('.sk-bar-fill').style.width = '0%';
  });

  // Short pause so CSS hide takes effect, then reveal
  requestAnimationFrame(() => {
    const toShow = [...cards].filter(c => c.dataset.cat === cat);

    toShow.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('visible');
      }, i * 55);
    });

    // Animate bars after cards start appearing
    setTimeout(() => animateBars(toShow), toShow.length * 55 + 50);
  });
}

/* ── TABS CLICK ── */
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    showCategory(tab.dataset.cat);
  });
});

/* ── INIT: show Frontend on load ── */
showCategory('frontend');


