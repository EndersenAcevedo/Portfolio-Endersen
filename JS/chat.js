/* ── Página principal: conversación con Sox (usa window.SoxCore de sox.js) ── */
(function () {
  'use strict';
  const S = window.SoxCore;
  if (!S) return;

  const log = document.getElementById('ch-log');
  const chipsBox = document.getElementById('ch-chips');
  const form = document.getElementById('ch-form');
  const input = document.getElementById('ch-q');
  const face = document.getElementById('ch-face');

  const CHIPS = [
    { label: 'Ver proyectos', ir_a: 'portafolio.html' },
    { label: '¿Quién es Daniel?', ir_a: 'sobremi.html' },
    { label: 'Servicios', ir_a: 'servicios.html' },
    { label: 'Contacto', ir_a: 'contacto.html' }
  ];

  let msgs = [];
  let busy = false;

  function render(goTo, typingLast) {
    log.innerHTML = '';
    msgs.forEach((m, i) => {
      const b = document.createElement('div');
      b.className = 'ch-msg ' + (m.from === 'user' ? 'ch-user' : 'ch-bot');
      b.textContent = (typingLast && i === msgs.length - 1) ? '' : m.text;
      log.appendChild(b);
    });
    if (goTo) {
      const card = document.createElement('div');
      card.className = 'ch-go';
      const name = goTo === '__back__' ? 'la página anterior' : (S.PAGES[goTo] || goTo);
      card.innerHTML = 'Abriendo <b></b>…<div class="ch-bar"><i></i></div>';
      card.querySelector('b').textContent = name;
      log.appendChild(card);
    }
    if (busy) {
      const t = document.createElement('div');
      t.className = 'ch-msg ch-bot ch-typing';
      t.setAttribute('aria-label', 'Sox está escribiendo');
      t.innerHTML = '<span></span><span></span><span></span>';
      log.appendChild(t);
    }
    log.scrollTop = log.scrollHeight;
  }



  // La conversación se guarda para que el Sox flotante la continúe en la otra página.
  function keep() { S.saveChat(msgs); }

  // Sox dice el mensaje: lo escribe poco a poco mientras mueve la boca.
  function soxSays(text, target) {
    msgs.push({ from: 'sox', text });
    keep();
    render(null, true);
    const bubbles = log.querySelectorAll('.ch-bot');
    const last = bubbles[bubbles.length - 1];
    S.mouth(face, true);
    S.typeText(last, text, () => { log.scrollTop = log.scrollHeight; }, () => {
      S.mouth(face, false);
      if (target) { render(target); S.go(target, 1300); }
    });
  }

  async function send(q) {
    q = String(q || '').trim();
    if (!q || busy) return;
    msgs.push({ from: 'user', text: q.slice(0, 200) });
    document.body.classList.add('ch-conversando');
    busy = true; render(); S.mouth(face, true);
    const ans = await S.ask(q, msgs.slice(0, -1));
    busy = false;
    if (ans) soxSays(ans.mensaje, ans.ir_a); else { S.mouth(face, false); render(); }
  }

  CHIPS.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ch-chip'; b.textContent = c.label;
    b.addEventListener('click', () => {
      if (busy) return;
      S.track('sox-opcion', { opcion: c.label, pagina: 'index.html' });
      msgs.push({ from: 'user', text: c.label });
      document.body.classList.add('ch-conversando');
      soxSays('Te llevo a ' + (S.PAGES[c.ir_a] || c.label) + '.', c.ir_a);
    });
    chipsBox.appendChild(b);
  });

  // Desvanece el borde de arriba solo cuando hay mensajes ocultos por el scroll.
  log.addEventListener('scroll', () => log.classList.toggle('ch-scrolled', log.scrollTop > 4));
  new MutationObserver(() => log.classList.toggle('ch-scrolled', log.scrollTop > 4)).observe(log, { childList: true, subtree: true, characterData: true });

  form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });

  setTimeout(() => {
    soxSays('¡Hola! Pregúntame o toca una opción y te llevo directo a esa página.');
  }, 400);
})();
