// ─────────────────────────────────────────
// PARTÍCULAS / NEURONAS ANIMADAS
// ─────────────────────────────────────────

class ParticleNetwork {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
        `;
        document.body.prepend(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.scrollY = window.scrollY || 0;
        this.count = 80;
        this.connectionDistance = 150;
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        this.resize();
        this.initParticles();
        this.bindEvents();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                radius: 2 + Math.random() * 3,
                baseX: Math.random() * this.canvas.width,
                baseY: Math.random() * this.canvas.height,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        // ── SCROLL ──
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
            this.isScrolling = true;
            
            // Limpiar timeout anterior
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            
            // Desactivar estado de scroll después de 100ms sin scroll
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 100);
        });
        
        // ── MOUSE ──
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        document.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Obtener scroll actual
        const currentScroll = window.scrollY || 0;
        
        // Si hay scroll, actualizar
        if (currentScroll !== this.scrollY) {
            this.scrollY = currentScroll;
        }
        
        // Factor de scroll para el movimiento
        const scrollFactor = this.scrollY * 0.06;
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Movimiento base
            p.x += p.vx;
            p.y += p.vy;
            
            // ── EFECTO DE SCROLL ──
            // Movimiento oscilante basado en scroll
            const scrollWave = Math.sin(this.scrollY * 0.002 + p.phase) * 0.5;
            p.y += scrollWave * 0.1;
            
            // Desplazamiento vertical por scroll
            const scrollDrift = (this.scrollY - (this._lastScrollY || 0)) * -0.5;
            p.y += scrollDrift;
            
            // Rebote en bordes
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            
            // Interacción con mouse
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120 * 0.3;
                    p.x += (dx / dist) * force;
                    p.y += (dy / dist) * force;
                }
            }
            
            // Dibujar punto
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            
            const gradient = this.ctx.createRadialGradient(
                p.x - p.radius * 0.3, p.y - p.radius * 0.3, 0,
                p.x, p.y, p.radius * 2
            );
            gradient.addColorStop(0, 'rgba(255, 69, 0, 0.9)');
            gradient.addColorStop(0.5, 'rgba(255, 69, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 200, 150, 0.8)';
            this.ctx.fill();
        }
        
        this._lastScrollY = this.scrollY;
        
        // Dibujar conexiones
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.connectionDistance) {
                    const opacity = 1 - (dist / this.connectionDistance);
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(255, 69, 0, ${opacity * 0.5})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.stroke();
                    
                    if (opacity > 0.7) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(255, 200, 150, ${opacity * 0.15})`;
                        this.ctx.lineWidth = 2;
                        this.ctx.stroke();
                    }
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// ── INICIAR CUANDO EL DOM ESTÉ LISTO ──
document.addEventListener('DOMContentLoaded', () => {
    new ParticleNetwork();
});