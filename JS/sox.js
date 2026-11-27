/* ============================================================
   SOX — asistente del portafolio
   - Núcleo (window.SoxCore): ruteo por palabras clave, llamada a n8n,
     conversación compartida entre páginas (sessionStorage).
   - Widget flotante en todas las páginas, salvo las que tengan
     data-sox-widget="off" en <body> (la página de chat).
   La IA solo se usa para texto libre que no reconocen las reglas.
   Webhook: constante SOX_WEBHOOK en JS/config.js (si falta, Sox
   sigue funcionando solo con reglas y botones).
   ============================================================ */
(function () {
  'use strict';

  const IMG = {
    smile: 'asset/sox/sox-smile.webp',
    talk: 'asset/sox/sox-talk.webp',
    happy: 'asset/sox/sox-happy.webp'
  };

  // Páginas a las que Sox puede llevar al visitante (lista cerrada).
  const PAGES = {
    'inicio.html': 'Inicio',
    'portafolio.html': 'Proyectos',
    'servicios.html': 'Servicios',
    'contacto.html': 'Contacto',
    'sobremi.html': 'Sobre mí',
    'stack.html': 'Stack',
    'casos.html': 'Casos',
    'clientes.html': 'Clientes',
    'index.html': 'Chat con Sox'
  };

  // Reglas locales: no gastan tokens.
  const ROUTES = [
    { re: /proyect|portafolio|nexo|trabajos?\b|demo/i, ir_a: 'portafolio.html', msg: 'Te llevo a sus proyectos: ahí están Nexo, Sox y los demás.' },
    { re: /servicio|precio|cotiz|cu[aá]nto cuesta|ofrece/i, ir_a: 'servicios.html', msg: 'Te llevo a Servicios para que veas lo que Daniel puede construir.' },
    { re: /contact|reuni[oó]n|correo|whatsapp|llamar|escribir|agendar/i, ir_a: 'contacto.html', msg: 'Te llevo a Contacto para que le escribas.' },
    { re: /qui[eé]n es|daniel|experiencia|sobre (ti|[eé]l)|trayectoria|perfil/i, ir_a: 'sobremi.html', msg: 'Te llevo a su perfil: quién es y qué ha construido.' },
    { re: /stack|tecnolog|lenguaje|herramientas/i, ir_a: 'stack.html', msg: 'Te llevo a su stack de tecnologías.' },
    { re: /\bcasos?\b/i, ir_a: 'casos.html', msg: 'Te llevo a los casos.' },
    { re: /cliente/i, ir_a: 'clientes.html', msg: 'Te llevo a Clientes.' },
    { re: /^(inicio|entrar|ver (el )?sitio|p[aá]gina principal)/i, ir_a: 'inicio.html', msg: 'Te llevo a la página principal.' },
    { re: /\b(regresar|volver|atr[aá]s)\b/i, ir_a: '__back__', msg: 'Te regreso a la página anterior.' }
  ];

  // Botones rápidos por página: 2 visibles + "Más…".
  const CHIPS = {
    _default: [
      { label: 'Ver proyectos', ir_a: 'portafolio.html' },
      { label: 'Contacto', ir_a: 'contacto.html' },
      { label: 'Servicios', ir_a: 'servicios.html' },
      { label: '¿Quién es Daniel?', ir_a: 'sobremi.html' },
      { label: 'Ir al inicio', ir_a: 'inicio.html' }
    ],
    'portafolio.html': [
      { label: 'Probar Nexo', url: 'https://nexo.endanus.online/' },
      { label: 'Contactar a Daniel', ir_a: 'contacto.html' },
      { label: 'Servicios', ir_a: 'servicios.html' },
      { label: 'Ver casos', ir_a: 'casos.html' },
      { label: 'Volver', ir_a: '__back__' }
    ],
    'servicios.html': [
      { label: 'Pedir una cotización', ir_a: 'contacto.html' },
      { label: 'Ver proyectos', ir_a: 'portafolio.html' },
      { label: 'Ver su stack', ir_a: 'stack.html' },
      { label: 'Volver', ir_a: '__back__' }
    ],
    'contacto.html': [
      { label: 'Ver proyectos', ir_a: 'portafolio.html' },
      { label: 'Servicios', ir_a: 'servicios.html' },
      { label: 'Ir al inicio', ir_a: 'inicio.html' },
      { label: 'Volver', ir_a: '__back__' }
    ]
  };

  const KEY_CHAT = 'sox_chat_v1';
  const KEY_GREET = 'sox_greet_v1';
  const KEY_POS = 'sox_pos_v1';
  const KEY_IA = 'sox_ia_count_v1';
  const MAX_IA_PER_SESSION = 15;
  const KEY_BASIC = 'sox_basico_hasta_v1';
  const BASIC_MSG = 'Ese tipo de preguntas no las puedo responder por ahora, pero te llevo a donde quieras: Proyectos, Servicios, Contacto o el perfil de Daniel.';

  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const store = {
    get(k, def) { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
    lget(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  function track(name, data) {
    try { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); } catch (e) { /* nada */ }
  }

  function loadChat() { return store.get(KEY_CHAT, []); }
  function saveChat(msgs) { store.set(KEY_CHAT, msgs.slice(-30)); }

  function localAnswer(q) {
    if (/^(hola|buenas|hey|qu[eé] tal|saludos)\b/i.test(q)) {
      return { mensaje: '¡Hola! ¿Te muestro sus proyectos o prefieres saber quién es Daniel?' };
    }
    if (/\b(cv|curr[ií]culum|hoja de vida)\b/i.test(q)) {
      return { mensaje: 'Puedes descargar su CV desde la página de inicio.', ir_a: 'inicio.html' };
    }
    const r = ROUTES.find(x => x.re.test(q));
    return r ? { mensaje: r.msg, ir_a: r.ir_a } : null;
  }

  function cleanAnswer(data) {
    const msg = (data && typeof data.mensaje === 'string') ? data.mensaje.slice(0, 400) : '';
    let ir = (data && typeof data.ir_a === 'string') ? data.ir_a.trim().toLowerCase() : '';
    if (ir && !PAGES[ir]) ir = '';
    return msg ? { mensaje: msg, ir_a: ir || undefined } : null;
  }

  // Pregunta: primero reglas locales; si no, n8n (con límites).
  async function ask(q, history) {
    q = String(q || '').trim().slice(0, 200);
    if (!q) return null;
    const local = localAnswer(q);
    if (local) return local;

    const webhook = (typeof SOX_WEBHOOK !== 'undefined') ? SOX_WEBHOOK : '';
    const used = store.get(KEY_IA, 0);
    // Modo básico: sin IA (no hay webhook, se agotó el cupo o el servidor falló hace poco).
    if (!webhook || used >= MAX_IA_PER_SESSION || Date.now() < store.get(KEY_BASIC, 0)) {
      return { mensaje: BASIC_MSG };
    }
    store.set(KEY_IA, used + 1);
    track('sox-pregunta-ia', { pagina: current });

    const hist = (history || []).slice(-4).map(m => ({ rol: m.from === 'user' ? 'usuario' : 'sox', texto: String(m.text || '').slice(0, 200) }));
    const ctrl = ('AbortController' in window) ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), 8000);
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: q, historial: hist, pagina: current }),
        signal: ctrl ? ctrl.signal : undefined
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const ans = cleanAnswer(await res.json());
      if (ans) return ans;
      throw new Error('respuesta vacía');
    } catch (e) {
      // El servidor no respondió: Sox pasa a modo básico 5 minutos para no hacer esperar al visitante.
      store.set(KEY_BASIC, Date.now() + 5 * 60 * 1000);
      return { mensaje: BASIC_MSG };
    } finally {
      clearTimeout(timer);
    }
  }

  function go(target, delay) {
    if (!target) return;
    track('sox-navegar', { destino: target });
    setTimeout(() => {
      if (target === '__back__') {
        if (history.length > 1) history.back(); else location.href = 'inicio.html';
        return;
      }
      if (/^https?:/i.test(target)) { window.open(target, '_blank', 'noopener'); return; }
      if (typeof window.navigateTo === 'function') window.navigateTo(target); else location.href = target;
    }, delay == null ? 900 : delay);
  }

  function chipsFor(page) { return CHIPS[page] || CHIPS._default; }

  window.SoxCore = { ask, go, track, loadChat, saveChat, chipsFor, PAGES, IMG, current };

  /* ============================================================
     WIDGET FLOTANTE
     ============================================================ */
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    if (document.body.getAttribute('data-sox-widget') === 'off') return;

    if (!document.querySelector('link[data-sox-css]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = 'CSS/sox.css?v=2'; l.setAttribute('data-sox-css', '1');
      document.head.appendChild(l);
    }

    const pageName = PAGES[current] || 'esta página';
    const root = document.createElement('div');
    root.className = 'sox-w';
    root.innerHTML = `
      <span class="sox-pill" aria-hidden="true">¿Puedo ayudarte en algo?</span>
      <button type="button" class="sox-fab" aria-label="Abrir a Sox, el asistente" aria-expanded="false">
        <img class="sox-face" src="${IMG.smile}" alt="" width="64" height="64">
      </button>
      <div class="sox-panel" role="dialog" aria-label="Asistente Sox" hidden>
        <div class="sox-head">
          <img src="${IMG.smile}" alt="" width="34" height="34">
          <div class="sox-title"><strong>Sox</strong><span>Asistente de Endanus</span></div>
          <button type="button" class="sox-min" aria-label="Minimizar a Sox" title="Minimizar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>
          </button>
          <button type="button" class="sox-close" aria-label="Cerrar" title="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>
        <div class="sox-log" aria-live="polite"></div>
        <div class="sox-chips"></div>
        <form class="sox-form">
          <label class="sox-sr" for="sox-q">Escríbele a Sox</label>
          <input id="sox-q" type="text" maxlength="200" autocomplete="off" placeholder="Escribe aquí…">
          <button type="submit" aria-label="Enviar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </button>
        </form>
      </div>
      <button type="button" class="sox-tab" aria-label="Mostrar a Sox" hidden><img src="${IMG.smile}" alt="" width="28" height="28"></button>`;
    document.body.appendChild(root);

    const fab = root.querySelector('.sox-fab');
    const face = root.querySelector('.sox-face');
    const panel = root.querySelector('.sox-panel');
    const log = root.querySelector('.sox-log');
    const chipsBox = root.querySelector('.sox-chips');
    const form = root.querySelector('.sox-form');
    const input = root.querySelector('#sox-q');
    const tab = root.querySelector('.sox-tab');

    let msgs = loadChat();
    let showAllChips = false;
    let busy = false;
    let talkTimer = null;

    // ── posición en esquinas ──
    const CORNERS = ['br', 'bl', 'tr', 'tl'];
    let corner = store.lget(KEY_POS, 'br');
    if (CORNERS.indexOf(corner) < 0) corner = 'br';
    function applyCorner() {
      CORNERS.forEach(c => root.classList.remove('sox-' + c));
      root.classList.add('sox-' + corner);
      root.style.left = root.style.top = root.style.right = root.style.bottom = '';
    }
    applyCorner();

    // ── conversación ──
    function render() {
      log.innerHTML = '';
      msgs.forEach(m => {
        const b = document.createElement('div');
        b.className = 'sox-msg ' + (m.from === 'user' ? 'sox-user' : 'sox-bot');
        b.textContent = m.text;
        log.appendChild(b);
      });
      if (busy) {
        const t = document.createElement('div');
        t.className = 'sox-msg sox-bot sox-typing';
        t.innerHTML = '<span></span><span></span><span></span>';
        t.setAttribute('aria-label', 'Sox está escribiendo');
        log.appendChild(t);
      }
      log.scrollTop = log.scrollHeight;
    }
    function renderChips() {
      chipsBox.innerHTML = '';
      const list = chipsFor(current).filter(c => c.ir_a !== current);
      const visible = showAllChips ? list : list.slice(0, 2);
      visible.forEach(c => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'sox-chip'; b.textContent = c.label;
        b.addEventListener('click', () => pickChip(c));
        chipsBox.appendChild(b);
      });
      if (list.length > 2) {
        const more = document.createElement('button');
        more.type = 'button'; more.className = 'sox-chip sox-more';
        more.textContent = showAllChips ? 'Menos' : 'Más…';
        more.addEventListener('click', () => { showAllChips = !showAllChips; renderChips(); });
        chipsBox.appendChild(more);
      }
    }
    function push(from, text) { msgs.push({ from, text }); saveChat(msgs); render(); }
    function talk() {
      face.src = IMG.talk;
      clearTimeout(talkTimer);
      talkTimer = setTimeout(() => { face.src = IMG.smile; }, 1600);
    }
    function soxSays(text, target) {
      push('sox', text); talk();
      if (target) go(target);
    }
    function pickChip(c) {
      track('sox-opcion', { opcion: c.label, pagina: current });
      push('user', c.label);
      if (c.url) { soxSays('Te abro Nexo en otra pestaña.', c.url); return; }
      const name = c.ir_a === '__back__' ? 'la página anterior' : (PAGES[c.ir_a] || c.label);
      soxSays(c.ir_a === '__back__' ? 'Te regreso a la página anterior.' : 'Te llevo a ' + name + '.', c.ir_a);
    }
    async function send(q) {
      q = q.trim();
      if (!q || busy) return;
      push('user', q.slice(0, 200));
      busy = true; render();
      const ans = await ask(q, msgs.slice(0, -1));
      busy = false;
      if (ans) soxSays(ans.mensaje, ans.ir_a); else render();
    }

    // ── abrir / cerrar / minimizar ──
    function open() {
      panel.hidden = false; fab.setAttribute('aria-expanded', 'true'); root.classList.add('sox-open');
      const greeted = store.get(KEY_GREET, []);
      if (greeted.indexOf(current) < 0) {
        greeted.push(current); store.set(KEY_GREET, greeted);
        push('sox', current === 'inicio.html'
          ? '¡Hola! Soy Sox. Te llevo a cualquier parte del sitio.'
          : 'Estás en ' + pageName + '. ¿Te ayudo a ir a otro lugar?');
        talk();
      } else { render(); }
      renderChips();
      track('sox-abrir', { pagina: current });
      setTimeout(() => input.focus({ preventScroll: true }), 50);
    }
    function close() { panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); root.classList.remove('sox-open'); }
    function minimize() {
      close(); root.classList.add('sox-minimized');
      tab.hidden = false;
      tab.classList.toggle('sox-tab-left', corner === 'bl' || corner === 'tl');
    }
    function restore() { root.classList.remove('sox-minimized'); tab.hidden = true; }

    root.querySelector('.sox-min').addEventListener('click', minimize);
    root.querySelector('.sox-close').addEventListener('click', () => { close(); fab.focus(); });
    tab.addEventListener('mouseenter', restore);
    tab.addEventListener('click', restore);
    form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { close(); fab.focus(); } });
    document.addEventListener('pointerdown', e => { if (!panel.hidden && !root.contains(e.target)) close(); });

    // ── arrastrar a una esquina (más de 5 px = arrastre, si no = clic) ──
    let drag = null;
    fab.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, moved: false };
      fab.setPointerCapture(e.pointerId);
    });
    fab.addEventListener('pointermove', e => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) {
        drag.moved = true; close(); root.classList.add('sox-dragging');
      }
      if (drag.moved) {
        root.style.right = root.style.bottom = 'auto';
        root.style.left = (e.clientX - 32) + 'px';
        root.style.top = (e.clientY - 32) + 'px';
      }
    });
    fab.addEventListener('pointerup', e => {
      if (!drag) return;
      const moved = drag.moved; drag = null;
      root.classList.remove('sox-dragging');
      if (moved) {
        const right = e.clientX > window.innerWidth / 2;
        const bottom = e.clientY > window.innerHeight / 2;
        corner = (bottom ? 'b' : 't') + (right ? 'r' : 'l');
        store.lset(KEY_POS, corner); applyCorner();
      } else {
        if (panel.hidden) open(); else close();
      }
    });
    // Teclado (Enter/Espacio) dispara click sin eventos de puntero.
    fab.addEventListener('click', e => { if (e.detail === 0) { if (panel.hidden) open(); else close(); } });
    fab.addEventListener('pointercancel', () => { drag = null; root.classList.remove('sox-dragging'); applyCorner(); });

    // ── en la portada, Sox flotante aparece cuando el Sox grande sale de vista ──
    const hero = document.querySelector('[data-sox-hero]');
    if (hero && 'IntersectionObserver' in window) {
      root.classList.add('sox-hidden');
      new IntersectionObserver(entries => {
        entries.forEach(en => root.classList.toggle('sox-hidden', en.isIntersecting));
      }, { threshold: 0.15 }).observe(hero);
    }

    // Expuesto para que otras partes de la página puedan abrir a Sox.
    window.SoxWidget = { open, close };
  });
})();
