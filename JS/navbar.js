// ─────────────────────────────────────────
// NAVBAR CENTRALIZADO
// ─────────────────────────────────────────

// ── FUNCIÓN DE NAVEGACIÓN CON ANIMACIÓN ──
function navigateTo(url) {
    // Prevenir si no hay URL
    if (!url || url === '#') return;
    
    // Obtener la página actual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Si ya estamos en esa página, no hacer nada
    if (url === currentPage) return;
    
    // Crear overlay de transición
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0d0d0d;
        z-index: 99999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(0);
    `;
    document.body.appendChild(overlay);
    
    // Forzar reflow para que la transición funcione
    overlay.offsetHeight;
    
    // Efecto de salida: la página se oscurece y baja
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translateY(40px)';
    });
    
    // Después de la animación de salida, redirigir
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// ── FUNCIÓN PARA CARGAR EL NAVBAR ──
function loadNavbar() {
    const navHTML = `
    <nav class="nav-principal">
      <button class="nav-logo" onclick="navigateTo('index.html')">
        <div class="nav-logo-badge">DA</div>
        <span class="nav-logo-name">Daniel Acevedo</span>
      </button>
      <div class="nav-links">
        <a href="index.html" class="nav-link" data-page="index.html">Inicio</a>
        <a href="sobremi.html" class="nav-link" data-page="sobremi.html">Sobre Mí</a>
        <a href="stack.html" class="nav-link" data-page="stack.html">Stack</a>
        <a href="servicios.html" class="nav-link" data-page="servicios.html">Servicios</a>
        <a href="portafolio.html" class="nav-link" data-page="portafolio.html">Portafolio</a>
        <a href="casos.html" class="nav-link" data-page="casos.html">Casos</a>
        <a href="clientes.html" class="nav-link" data-page="clientes.html">Clientes</a>
      </div>
      <div class="nav-links-mobile">
        <a href="index.html" class="nav-link-icon" data-page="index.html" aria-label="Inicio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </a>
        <a href="sobremi.html" class="nav-link-icon" data-page="sobremi.html" aria-label="Sobre Mí">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
        </a>
        <a href="stack.html" class="nav-link-icon" data-page="stack.html" aria-label="Stack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        </a>
        <a href="servicios.html" class="nav-link-icon" data-page="servicios.html" aria-label="Servicios">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/></svg>
        </a>
        <a href="portafolio.html" class="nav-link-icon" data-page="portafolio.html" aria-label="Portafolio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </a>
        <a href="casos.html" class="nav-link-icon" data-page="casos.html" aria-label="Casos">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
        </a>
        <a href="clientes.html" class="nav-link-icon" data-page="clientes.html" aria-label="Clientes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </a>
      </div>
      <div class="nav-right">
        <a href="https://github.com/EndersenAcevedo" target="_blank" class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
        </a>
        <a href="https://www.linkedin.com/in/endersen-acevedo-615b53342" target="_blank" class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <button class="btn-contact" onclick="navigateTo('contacto.html')">Contacto →</button>
      </div>
    </nav>
    `;

    // Insertar navbar al inicio del body
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // ── MARCAR LINK ACTIVO SEGÚN PÁGINA ──
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .nav-link-icon').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ── CAPTURAR CLICKS EN LOS LINKS DEL NAVBAR ──
    document.querySelectorAll('.nav-link, .nav-link-icon').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                navigateTo(href);
            }
        });
    });

    // ── ANIMACIÓN DE ENTRADA DEL NAVBAR ──
    const nav = document.querySelector('.nav-principal');
    if (nav) {
        nav.style.opacity = '0';
        nav.style.transform = 'translateY(-12px)';
        nav.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
        requestAnimationFrame(() => {
            nav.style.opacity = '1';
            nav.style.transform = 'translateY(0)';
        });

        // Línea decorativa inferior que aparece y se desvanece
        const line = document.createElement('div');
        line.className = 'nav-divider-line';
        line.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--orange), transparent);
            width: 100%;
            opacity: 0;
            transition: opacity 0.6s ease;
            box-shadow: 0 0 15px rgba(255, 69, 0, 0.3);
        `;
        nav.style.position = 'relative';
        nav.appendChild(line);
        
        // Aparece la línea
        setTimeout(() => {
            line.style.opacity = '1';
        }, 300);
        
        // Después de 1.5 segundos, se desvanece
        setTimeout(() => {
            line.style.transition = 'opacity 1s ease';
            line.style.opacity = '0';
            
            // Eliminar la línea después de que termine la animación
            setTimeout(() => {
                if (line.parentNode) {
                    line.remove();
                }
            }, 1000);
        }, 1800);
    }

    // ── EFECTO DE ENTRADA DE LA PÁGINA ──
    pageEnterAnimation();
}

// ── EFECTO DE ENTRADA DE LA PÁGINA ──
function pageEnterAnimation() {
    // Buscar la primera sección de la página
    const mainContent = document.querySelector('section:first-of-type');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(25px)';
        mainContent.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Si es index, también animar el dashboard
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) {
            dashboard.style.opacity = '0';
            dashboard.style.transform = 'translateY(20px)';
            dashboard.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        // Pequeño retraso para que se vea el efecto
        setTimeout(() => {
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
            
            if (dashboard) {
                setTimeout(() => {
                    dashboard.style.opacity = '1';
                    dashboard.style.transform = 'translateY(0)';
                }, 150);
            }
        }, 100);
    }
}

// ── EJECUTAR CUANDO EL DOM ESTÉ LISTO ──
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
    loadNavbar();
}

/* ------------------------------------------------------------
   TRACKING DE VISITAS → WEBHOOK N8N
   Cooldown de 30 minutos por sesión para no spamear.
   ------------------------------------------------------------ */


(function trackVisit() {
    const COOLDOWN_MS = 30 * 60 * 1000;
    const STORAGE_KEY = 'portfolio_last_visit';
    const lastVisit   = sessionStorage.getItem(STORAGE_KEY);
    const now         = Date.now();

    if (lastVisit && (now - parseInt(lastVisit)) < COOLDOWN_MS) return;

    sessionStorage.setItem(STORAGE_KEY, now.toString());

    setTimeout(() => {
        fetch(WEBHOOK_VISIT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                page: window.location.href,
                referrer: document.referrer || 'directo',
                userAgent: navigator.userAgent,
                language: navigator.language,
                source: 'portfolio-visit-tracker'
            })
        }).catch(() => {});
    }, 1500);
})();