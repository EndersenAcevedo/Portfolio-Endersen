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
  let talkTimer = null;

  function render(goTo) {
    log.innerHTML = '';
    msgs.forEach(m => {
      const b = document.createElement('div');
      b.className = 'ch-msg ' + (m.from === 'user' ? 'ch-user' : 'ch-bot');
      b.textContent = m.text;
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

  function talk() {
    face.src = S.IMG.talk;
    clearTimeout(talkTimer);
    talkTimer = setTimeout(() => { face.src = S.IMG.smile; }, 1600);
  }

  // La conversación se guarda para que el Sox flotante la continúe en la otra página.
  function keep() { S.saveChat(msgs); }

  function soxSays(text, target) {
    msgs.push({ from: 'sox', text });
    keep(); talk(); render(target);
    if (target) S.go(target, 1200);
  }

  async function send(q) {
    q = String(q || '').trim();
    if (!q || busy) return;
    msgs.push({ from: 'user', text: q.slice(0, 200) });
    busy = true; render();
    const ans = await S.ask(q, msgs.slice(0, -1));
    busy = false;
    if (ans) soxSays(ans.mensaje, ans.ir_a); else render();
  }

  CHIPS.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ch-chip'; b.textContent = c.label;
    b.addEventListener('click', () => {
      if (busy) return;
      S.track('sox-opcion', { opcion: c.label, pagina: 'index.html' });
      msgs.push({ from: 'user', text: c.label });
      soxSays('Te llevo a ' + (S.PAGES[c.ir_a] || c.label) + '.', c.ir_a);
    });
    chipsBox.appendChild(b);
  });

  form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });

  setTimeout(() => {
    msgs.push({ from: 'sox', text: '¡Hola! Pregúntame o toca una opción y te llevo directo a esa página.' });
    talk(); render();
  }, 400);
})();
