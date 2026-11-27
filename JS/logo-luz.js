/* ============================================================
   LOGO EN EJECUCIÓN + HILO DE LUZ
   La luz baja por el eje del logo, recorre la firma, enciende la
   cruz y activa código, base de datos y agente IA. Después sigue
   por la línea a lo largo de la página y enciende cada sección
   marcada con [data-node]. Se repite en bucle.
   Requiere: [data-luz-root], #in-logo (SVG) y #in-luz (canvas).
   ============================================================ */
(function () {
  'use strict';
  const root = document.querySelector('[data-luz-root]');
  const cv = document.getElementById('in-luz');
  const logo = document.getElementById('in-logo');
  if (!root || !cv || !logo || !cv.getContext) return;

  fetch('asset/sox/logo-paths.json').then(r => r.json()).then(start).catch(() => { /* sin animación */ });

  function start(D) {
    const ctx = cv.getContext('2d');
    const SX = 432;                 // eje vertical del logo (coordenadas del SVG)
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let k = 0.2, offX = 0, offY = 0, dpr = 1;

    class Fiber {
      constructor(p) { this.p = p; this.L = [0]; for (let i = 1; i < p.length; i++) this.L.push(this.L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); this.t = this.L[this.L.length - 1]; }
      at(d) { d = Math.max(0, Math.min(this.t, d)); let lo = 0, hi = this.L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (this.L[m] < d) lo = m; else hi = m; } const s = this.L[hi] - this.L[lo] || 1, u = (d - this.L[lo]) / s, a = this.p[lo], b = this.p[hi]; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; }
    }
    const near = (pts, x, y) => { let bi = 0, bd = 1e12; pts.forEach((p, i) => { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; bi = i; } }); return bi; };

    const C = D.center, cY = D.crossY, spine = [[SX, -60], [SX, D.bot]];
    const iW = near(C, 350, 340), iCode = near(C, 300, 140), iDB = near(C, 262, 552), iAg = near(C, 312, 650);
    const B = { code: [292, 108], db: [190, 668], agent: [300, 716] };
    const rev = a => a.slice().reverse();
    const R = {
      trigger: spine, signature: D.serpent, bar: [[350, cY], [D.bar[1], cY]],
      code: rev(C.slice(iCode, iW + 1)).concat([B.code]),
      db: C.slice(iW, iDB + 1).concat(D.br[0].slice(1), [B.db]),
      agent: C.slice(iDB, iAg + 1).concat(D.br[3].slice(1), [B.agent]),
      out: C.slice(iAg)
    };
    const logoNodes = { cross: { x: 432, y: 340, r: 26, s: 'idle' }, code: { x: 292, y: 108, r: 56, s: 'idle' }, db: { x: 190, y: 668, r: 52, s: 'idle' }, agent: { x: 300, y: 716, r: 50, s: 'idle' } };
    const baseF = [...D.strands, D.serpent, spine, ...D.br].map(p => new Fiber(p));

    let pageNodes = [], extEnd = D.bot + 400, ext = new Fiber([[SX, D.bot], [SX, extEnd]]), amb = [];

    function makeAmb() {
      const a = []; if (reduce) return a;
      baseF.concat([ext]).forEach(f => { const n = Math.max(1, Math.round(f.t / 300)); for (let i = 0; i < n; i++) a.push({ f, s: Math.random() * f.t, v: 160 + Math.random() * 140, r: 1 + Math.random() * .8 }); });
      return a;
    }
    function measure() {
      const cr = cv.getBoundingClientRect();
      if (!cr.width || !cr.height) { cv.width = cv.height = 0; return; }
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(cr.width * dpr); cv.height = Math.round(cr.height * dpr);
      const lr = logo.getBoundingClientRect();
      k = lr.width / 744;
      offX = lr.left - cr.left; offY = lr.top - cr.top;
      const toY = py => (py - offY) / k - 90;
      const lit = pageNodes.map(n => n.lit);
      pageNodes = Array.from(root.querySelectorAll('[data-node]')).map((el, i) => {
        const b = el.getBoundingClientRect();
        return { y: toY(b.top - cr.top + Math.min(b.height, 60) / 2), lit: !!lit[i] || reduce };
      });
      extEnd = pageNodes.length ? pageNodes[pageNodes.length - 1].y : toY(cr.height - 120);
      ext = new Fiber([[SX, D.bot], [SX, extEnd]]);
      amb = makeAmb();
    }

    const pk = [];
    const glow = (x, y, r, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,238,224,${a})`); g.addColorStop(.25, `rgba(255,140,60,${a * .8})`); g.addColorStop(1, 'rgba(255,90,10,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
    const trail = (f, s, len, w, a) => { const N = 8; for (let i = 0; i < N; i++) { const p0 = f.at(s - len * i / N), p1 = f.at(s - len * (i + 1) / N); ctx.strokeStyle = `rgba(255,${170 - i * 10},${110 - i * 10},${a * (1 - i / N)})`; ctx.lineWidth = w * (1 - i / N * .6); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); } };
    const check = (x, y, r) => { ctx.fillStyle = '#2FCB71'; ctx.strokeStyle = '#0B1626'; ctx.lineWidth = r * .2; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - r * .5, y + r * .05); ctx.lineTo(x - r * .15, y + r * .4); ctx.lineTo(x + r * .55, y - r * .4); ctx.stroke(); };

    let spinA = 0, last = performance.now();
    function line(w, color) { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(SX, D.bot - 4); ctx.lineTo(SX, extEnd); ctx.stroke(); }

    function draw(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now; spinA += dt * 12;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      if (cv.width) {
        ctx.setTransform(k * dpr, 0, 0, k * dpr, (offX - 60 * k) * dpr, (offY + 90 * k) * dpr);
        ctx.lineCap = 'round';
        // la línea de la página, con las mismas tres capas del eje del logo
        ctx.save(); ctx.shadowColor = 'rgba(255,90,10,0.9)'; ctx.shadowBlur = 14 * dpr; line(16, 'rgba(255,90,10,0.5)'); ctx.restore();
        line(7, '#FF6A1A'); line(2, 'rgba(255,226,204,0.9)');
        // nodos de las secciones
        pageNodes.forEach(n => {
          if (n.lit) glow(SX, n.y, 120, .55);
          ctx.fillStyle = '#0B1626'; ctx.strokeStyle = '#FF5A0A'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(SX, n.y, 38, 0, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = n.lit ? '#FFE2CC' : '#FF8A3D'; ctx.beginPath(); ctx.arc(SX, n.y, 14, 0, 7); ctx.fill();
          if (n.lit) check(SX + 52, n.y - 52, 30);
        });
        ctx.globalCompositeOperation = 'lighter';
        for (const p of amb) { p.s += p.v * dt; if (p.s > p.f.t + 60) p.s = -Math.random() * 200; if (p.s < 0) continue; const [x, y] = p.f.at(p.s); trail(p.f, p.s, 48, 2 * p.r, .55); glow(x, y, 8 * p.r, .75); }
        for (let i = pk.length - 1; i >= 0; i--) { const q = pk[i]; q.s += q.v * dt; const [x, y] = q.f.at(q.s); trail(q.f, q.s, 150 * q.z, 6 * q.z, .95); glow(x, y, 26 * q.z, 1); if (q.onMove) q.onMove(y); if (q.s >= q.f.t) { pk.splice(i, 1); if (q.done) q.done(); } }
        ctx.globalCompositeOperation = 'source-over';
        // estado de los nodos del logo: gira mientras se ejecuta, check al terminar
        Object.values(logoNodes).forEach(n => {
          if (n.s === 'run') { glow(n.x, n.y, n.r * 1.5, .6); ctx.strokeStyle = '#FF8A3D'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, spinA, spinA + 1.4); ctx.stroke(); }
          if (n.s === 'ok') { ctx.strokeStyle = '#2FCB71'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.stroke(); check(n.x + n.r * .75, n.y - n.r * .75, n.r * .45); }
        });
      }
      requestAnimationFrame(draw);
    }

    const go = (pts, v = 2400, z = 1, onMove) => new Promise(res => { if (reduce) return res(); pk.push({ f: pts instanceof Fiber ? pts : new Fiber(pts), s: 0, v, z, onMove, done: res }); });
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const step = async (key, work) => { const n = logoNodes[key]; n.s = 'run'; await work(); n.s = 'ok'; };

    async function run() {
      Object.values(logoNodes).forEach(n => { n.s = 'idle'; });
      pageNodes.forEach(n => { n.lit = false; });
      await go(R.trigger, 2600, 1.1);
      await step('cross', async () => { await go(R.signature, 2900, 1.1); await go(R.bar, 1400, 1); await sleep(180); });
      await step('code', async () => { await go(R.code, 1500); await sleep(300); });
      await step('db', async () => { await go(R.db, 1500); await sleep(340); });
      await step('agent', async () => { await go(R.agent, 1400); await sleep(400); });
      D.strands.forEach((p, i) => { if (i % 3 === 0) setTimeout(() => go(p, 1700, .7), i * 18); });
      go(D.serpent, 3200, .9);
      await go(R.out, 1700, 1.1);
      // la luz sale del logo y baja por la página encendiendo cada sección
      await go(ext, 3600, 1.4, y => pageNodes.forEach(n => { if (!n.lit && y >= n.y) n.lit = true; }));
      await sleep(2600);
      run();
    }

    const begin = () => {
      measure();
      if ('ResizeObserver' in window) new ResizeObserver(measure).observe(root); else window.addEventListener('resize', measure);
      if (reduce) Object.values(logoNodes).forEach(n => { n.s = 'ok'; });
      requestAnimationFrame(draw);
      if (!reduce) setTimeout(run, 600);
    };
    if (logo.complete) begin(); else logo.addEventListener('load', begin, { once: true });
  }
})();
