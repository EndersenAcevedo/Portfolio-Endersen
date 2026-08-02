/* ─────────────────────────────────────────
   TERMINAL ANIMATION
───────────────────────────────────────── */
const termLines = [
  '[OK] Docker container restarted: api-gateway — 14:30:55',
  '[OK] PostgreSQL replication lag 0ms — 14:30:30',
  '[OK] Cloudflare Tunnel reconnected — 14:29:58',
  '[OK] SSL cert renewed — 14:29:12',
  '[OK] n8n workflow "lead-capture" executed — 14:28:45',
  '[OK] OpenAI API response 312ms — 14:28:10',
  '[INFO] Java Spring Boot health check passed — 14:27:59',
  '[OK] C# API endpoint /v2/process 200 — 14:27:33',
  '[OK] Redis cache hit ratio 94% — 14:27:01',
  '[OK] k8s pod api-worker-3 running — 14:26:44',
  '[OK] GitHub Actions deploy succeeded — 14:26:10',
  '[INFO] n8n AI agent queued 3 tasks — 14:25:55',
  '[OK] PostgreSQL vacuum completed — 14:25:30',
  '[OK] Docker image built: v2.4.1 — 14:24:58',
  '[OK] OpenAI embeddings processed 1024 vectors — 14:24:30',
  '[INFO] C# worker service restarted — 14:24:01',
  '[OK] n8n cron job "daily-report" triggered — 14:23:44',
  '[OK] Java microservice /api/health 200 — 14:23:10',
];

const termOutput = document.getElementById('term-output');
let lineIndex = 0;
let visibleLines = [];
const MAX_VISIBLE = 3;

function addTermLine() {
  const raw = termLines[lineIndex % termLines.length];
  lineIndex++;

  if (visibleLines.length >= MAX_VISIBLE) visibleLines.shift();
  visibleLines.push(raw);

  termOutput.innerHTML = visibleLines.map(l => {
    const colored = l
      .replace('[OK]',   '<span class="ok">[OK]</span>')
      .replace('[INFO]', '<span class="warn">[INFO]</span>');
    return `<div class="term-line">${colored}</div>`;
  }).join('');
}

// Seed with 3 initial lines then rotate
addTermLine(); addTermLine(); addTermLine();
setInterval(addTermLine, 2800);

/* Hover highlight */
termOutput.addEventListener('mouseover', e => {
  const line = e.target.closest('.term-line');
  if (!line) return;
  document.querySelectorAll('.term-line').forEach(l => l.classList.remove('highlighted'));
  line.classList.add('highlighted');
});
termOutput.addEventListener('mouseleave', () => {
  document.querySelectorAll('.term-line').forEach(l => l.classList.remove('highlighted'));
});

/* ─────────────────────────────────────────
   CPU / RAM / DISK LIVE ANIMATION
───────────────────────────────────────── */
const sysCurrent = { cpu: 34, ram: 62, disk: 41 };
const sysBase    = { cpu: 34, ram: 62, disk: 41 };
const sysRange   = { cpu: 10, ram: 7,  disk: 4  };

function randomDrift(current, base, range) {
  const delta = (Math.random() - 0.5) * range * 2;
  let next = current + delta;
  next = Math.max(base - range * 2, Math.min(base + range * 2, next));
  return Math.round(next);
}

function updateSys() {
  sysCurrent.cpu  = randomDrift(sysCurrent.cpu,  sysBase.cpu,  sysRange.cpu);
  sysCurrent.ram  = randomDrift(sysCurrent.ram,  sysBase.ram,  sysRange.ram);
  sysCurrent.disk = randomDrift(sysCurrent.disk, sysBase.disk, sysRange.disk);

  document.getElementById('cpu-val').textContent  = sysCurrent.cpu  + '%';
  document.getElementById('ram-val').textContent  = sysCurrent.ram  + '%';
  document.getElementById('disk-val').textContent = sysCurrent.disk + '%';
  document.getElementById('cpu-bar').style.width  = sysCurrent.cpu  + '%';
  document.getElementById('ram-bar').style.width  = sysCurrent.ram  + '%';
  document.getElementById('disk-bar').style.width = sysCurrent.disk + '%';
}
setInterval(updateSys, 1500);

/* PostgreSQL latency flicker */
setInterval(() => {
  const ms = Math.floor(38 + Math.random() * 32);
  document.getElementById('pg-ms').textContent = ms + 'ms';
}, 3000);

/* ─────────────────────────────────────────
   COUNTER ANIMATION — "Números que hablan"
───────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const stepMs   = 16;
  const steps    = duration / stepMs;
  const inc      = target / steps;
  let current    = 0;

  const timer = setInterval(() => {
    current += inc;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + suffix;
  }, stepMs);
}

/* Trigger counters when section enters viewport */
const statsSection = document.getElementById('stats');
let counted = false;

const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    document.querySelectorAll('.stat-number[data-target]').forEach(el => animateCounter(el));
  }
}, { threshold: 0.3 });

statsObserver.observe(statsSection);


