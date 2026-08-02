/* ═══════════════════════════════════════════
   CLIENTES — JS
   • Slider simple y estable
   • Auto-advance con dots y controles
   • 3D tilt en tarjetas "¿Por qué?"
   • Scroll reveal
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   TESTIMONIOS SLIDER (VERSIÓN SIMPLE)
══════════════════════════════════════════ */
const track = document.getElementById('tsl-track');
const slides = document.querySelectorAll('.tsl-slide');
const dotsWrap = document.getElementById('tsl-dots');
const prevBtn = document.getElementById('tsl-prev');
const nextBtn = document.getElementById('tsl-next');

const TOTAL = slides.length;
let current = 0;
let autoTimer = null;
const AUTO_DELAY = 4000;

/* Crear dots */
slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'tsl-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(dot);
});

function getDots() {
  return dotsWrap.querySelectorAll('.tsl-dot');
}

/* Ir a slide */
function goTo(index) {
  current = (index + TOTAL) % TOTAL;
  
  // Mover track
  track.style.transform = `translateX(-${current * 100}%)`;
  
  // Actualizar dots
  getDots().forEach((dot, i) => {
    dot.classList.toggle('active', i === current);
  });
  
  resetAuto();
}

/* Auto-play */
function startAuto() {
  autoTimer = setInterval(() => goTo(current + 1), AUTO_DELAY);
}

function resetAuto() {
  clearInterval(autoTimer);
  startAuto();
}

/* Controles */
prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));

/* Teclado */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goTo(current - 1);
  if (e.key === 'ArrowRight') goTo(current + 1);
});

/* Touch / swipe */
let touchStartX = 0;
track.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

track.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) {
    goTo(dx < 0 ? current + 1 : current - 1);
  }
});

/* Pausa al pasar el mouse */
track.addEventListener('mouseenter', () => {
  clearInterval(autoTimer);
});

track.addEventListener('mouseleave', () => {
  startAuto();
});

/* Iniciar */
startAuto();

/* ══════════════════════════════════════════
   ¿POR QUÉ CONMIGO? — CARDS
══════════════════════════════════════════ */
const pqCards = document.querySelectorAll('.pq-card');

/* Scroll reveal */
const pqObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const idx = parseInt(entry.target.dataset.index) || 0;
    setTimeout(() => {
      entry.target.classList.add('visible');
    }, idx * 90);
    pqObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

pqCards.forEach(c => pqObserver.observe(c));

/* 3D tilt + glow */
pqCards.forEach(card => {
  const glow = card.querySelector('.pq-card-glow');
  
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    card.style.transform = `translateY(-5px) perspective(800px) rotateX(${y * -7}deg) rotateY(${x * 7}deg)`;
    
    if (glow) {
      glow.style.left = (e.clientX - rect.left) + 'px';
      glow.style.top = (e.clientY - rect.top) + 'px';
    }
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'border-color .3s, box-shadow .3s, transform .4s cubic-bezier(.34,1.4,.64,1)';
  });
  
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'border-color .3s, box-shadow .3s, transform .12s ease';
  });
});

