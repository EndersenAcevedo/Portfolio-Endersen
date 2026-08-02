/* ═══════════════════════════════════════════
   PORTAFOLIO — JS
   • Filter tabs with animated transition
   • Expand/collapse detail panel (accordion)
   • Scroll-reveal staggered entrance
   • Image tilt parallax on hover
═══════════════════════════════════════════ */

const cards     = document.querySelectorAll('.pf-card');
const tabs      = document.querySelectorAll('.ptab');
const expandBtns = document.querySelectorAll('.pf-expand-btn');

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = [...cards].indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

cards.forEach(c => revealObserver.observe(c));

/* ── FILTER TABS ── */
function filterCards(cat) {
  cards.forEach((card, i) => {
    const cats = card.dataset.cat?.split(' ') || [];
    const show = cat === 'all' || cats.includes(cat);

    if (show) {
      card.classList.remove('hidden');
      // Re-animate
      card.style.animationDelay = (i * 60) + 'ms';
      card.classList.remove('visible');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => card.classList.add('visible'));
      });
    } else {
      card.classList.add('hidden');
      // Collapse any open detail
      const detailId = card.querySelector('.pf-expand-btn')?.dataset.id;
      if (detailId) collapseDetail(detailId, card);
    }
  });
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    filterCards(tab.dataset.filter);
  });
});

/* ── EXPAND / COLLAPSE DETAIL ── */
function collapseDetail(id, card) {
  const detail = document.getElementById('detail-' + id);
  if (!detail) return;
  detail.classList.remove('open');
  card.classList.remove('expanded');
  const btn = card.querySelector('.pf-expand-btn');
  if (btn) btn.innerHTML = 'Ver más <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
}

expandBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const id     = btn.dataset.id;
    const card   = btn.closest('.pf-card');
    const detail = document.getElementById('detail-' + id);
    const isOpen = detail.classList.contains('open');

    // Close all others first
    expandBtns.forEach(other => {
      if (other !== btn) {
        const otherId   = other.dataset.id;
        const otherCard = other.closest('.pf-card');
        collapseDetail(otherId, otherCard);
      }
    });

    if (isOpen) {
      collapseDetail(id, card);
    } else {
      detail.classList.add('open');
      card.classList.add('expanded');
      btn.innerHTML = 'Ver menos <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
      // Scroll card into view smoothly
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    }
  });
});

/* ── IMAGE TILT PARALLAX ── */
cards.forEach(card => {
  const imgWrap = card.querySelector('.pf-img-wrap');
  if (!imgWrap) return;

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5;

    const tiltX =  y * 8;
    const tiltY = -x * 8;

    card.style.transform = `translateY(-4px) perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    imgWrap.style.transform = `scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    imgWrap.style.transform = '';
  });

  card.style.transition = 'border-color .3s ease, box-shadow .3s ease, transform .25s ease';
});


/* ── VIDEO PREVIEW ON HOVER / TOUCH ── */
const previewVideos = document.querySelectorAll('.pf-video');

previewVideos.forEach(video => {
  const card = video.closest('.pf-card');
  if (!card) return;

  // Desktop: mouse enter/leave
  card.addEventListener('mouseenter', () => {
    video.currentTime = 0;
    video.play().catch(() => {}); // catch por si el navegador bloquea el play
  });

  card.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });

  // Móvil: touch — reproduce mientras se mantiene el dedo, pausa al soltar
  card.addEventListener('touchstart', () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  }, { passive: true });

  card.addEventListener('touchend', () => {
    video.pause();
    video.currentTime = 0;
  });
});

