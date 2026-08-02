/* ═══════════════════════════════════════════
   CONTACTO — JS
   • Floating particle canvas background
   • Slide-in reveal for both columns
   • Form: live validation, char counter,
     loading state, success/error feedback
   • Input focus label float effect
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   PARTICLE CANVAS
══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('ct-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  const COUNT = 55;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
    }));
  }

  function drawLine(a, b) {
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (dist > 140) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(255,69,0,${(1 - dist / 140) * 0.12})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,69,0,${p.alpha})`;
      ctx.fill();

      // Connect nearby
      for (let j = i + 1; j < particles.length; j++) {
        drawLine(p, particles[j]);
      }
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); });
  resize();
  createParticles();
  tick();
})();

/* ══════════════════════════════════════════
   REVEAL ANIMATION — slide from sides
══════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal-left, .reveal-right');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 120);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObs.observe(el));

/* ══════════════════════════════════════════
   FORM
══════════════════════════════════════════ */

const form     = document.getElementById('ct-form');
const nameEl   = document.getElementById('ct-name');
const emailEl  = document.getElementById('ct-email');
const serviceEl= document.getElementById('ct-service');
const msgEl    = document.getElementById('ct-msg');
const charsEl  = document.getElementById('ct-chars');
const submitEl = document.getElementById('ct-submit');
const feedback = document.getElementById('ct-feedback');

/* ── Char counter ── */
msgEl.addEventListener('input', () => {
  const len = msgEl.value.length;
  charsEl.textContent = len;
  charsEl.style.color = len > 450 ? 'var(--orange)' : '';
});

/* ── Live validation ── */
function validate(el, fn) {
  el.addEventListener('blur', () => {
    if (fn(el.value)) {
      el.classList.add('valid'); el.classList.remove('error');
    } else {
      el.classList.add('error'); el.classList.remove('valid');
    }
  });
  el.addEventListener('input', () => {
    if (fn(el.value)) {
      el.classList.add('valid'); el.classList.remove('error');
    } else {
      el.classList.remove('valid');
    }
  });
}

validate(nameEl,  v => v.trim().length >= 2);
validate(emailEl, v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
validate(msgEl,   v => v.trim().length >= 10);

/* ── Input focus floating label & glow ── */
document.querySelectorAll('.ct-input').forEach(input => {
  input.addEventListener('focus', () => {
    input.closest('.ct-field')?.querySelector('.ct-label')
      ?.style.setProperty('color', 'var(--orange)');
  });
  input.addEventListener('blur', () => {
    input.closest('.ct-field')?.querySelector('.ct-label')
      ?.style.setProperty('color', '');
  });
});

/* ── Submit → n8n webhook real ── */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = nameEl.value.trim();
  const email   = emailEl.value.trim();
  const subject = serviceEl.value || 'No especificado';
  const message = msgEl.value.trim();
  let valid = true;

  if (name.length < 2)  { nameEl.classList.add('error');  valid = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailEl.classList.add('error'); valid = false; }
  if (message.length < 10) { msgEl.classList.add('error'); valid = false; }

  if (!valid) {
    showFeedback('Por favor completa todos los campos correctamente.', false);
    submitEl.style.animation = 'shake .4s ease';
    setTimeout(() => submitEl.style.animation = '', 400);
    return;
  }

  submitEl.classList.add('loading');
  hideFeedback();

  try {
    const response = await fetch(WEBHOOK_CONTACT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone: 'No proporcionado',
        subject,
        message,
        timestamp: new Date().toISOString(),
        source: 'portfolio-contact-form'
      })
    });

    submitEl.classList.remove('loading');

    if (response.ok) {
      showFeedback('✓ ¡Mensaje enviado! Te responderé en menos de 24 horas.', true);
      form.reset();
      charsEl.textContent = '0';
      document.querySelectorAll('.ct-input').forEach(i => i.classList.remove('valid','error'));
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    submitEl.classList.remove('loading');
    console.error('Error al enviar formulario:', err);
    showFeedback('✗ Error al enviar. Por favor intenta de nuevo o contáctame por WhatsApp.', false);
  }
});

function showFeedback(msg, success) {
  feedback.textContent = msg;
  feedback.className = 'ct-feedback show ' + (success ? 'success' : 'error-fb');
}
function hideFeedback() {
  feedback.className = 'ct-feedback';
}

/* Shake keyframe */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-8px)}
    40%{transform:translateX(8px)}
    60%{transform:translateX(-5px)}
    80%{transform:translateX(5px)}
  }
`;
document.head.appendChild(shakeStyle);


