/* ═══════════════════════════════════════════
   TOAST "PRÓXIMAMENTE" — para links no habilitados
═══════════════════════════════════════════ */
(function () {
  let toastEl = null;
  let hideTimer = null;

  const icons = {
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    construction: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20"/><path d="M4 20V10l8-6 8 6v10"/><path d="M9 20v-6h6v6"/><path d="M4 10l16 0" stroke-dasharray="2 2"/></svg>'
  };

  function showToast(x, y, message, iconKey) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'soon-toast';
      toastEl.innerHTML = `<span class="soon-toast-icon"></span><span class="soon-toast-text"></span>`;
      document.body.appendChild(toastEl);
    }

    toastEl.querySelector('.soon-toast-icon').innerHTML = icons[iconKey] || icons.lock;
    toastEl.querySelector('.soon-toast-text').textContent = message;

    const toastWidth = 260;
    let left = x - toastWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - toastWidth - 12));
    toastEl.style.left = left + 'px';
    toastEl.style.top  = (y - 60) + 'px';

    clearTimeout(hideTimer);
    requestAnimationFrame(() => toastEl.classList.add('show'));

    hideTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2200);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('.pf-link-soon, .caso-link-soon, .pf-hover-cta-soon');
    if (!link) return;

    e.preventDefault();
    const msg  = link.dataset.msg  || 'Disponible muy pronto';
    const icon = link.dataset.icon || 'lock';
    showToast(e.clientX, e.clientY, msg, icon);
  });
})();