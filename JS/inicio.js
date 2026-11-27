/* ── Inicio: preguntas rápidas del Sox de la portada ── */
(function () {
  'use strict';
  const IMG = { smile: 'asset/sox/sox-smile.webp', talk: 'asset/sox/sox-talk.webp', happy: 'asset/sox/sox-happy.webp' };
  const QS = [
    { label: '¿Quién es Daniel?', a: 'Daniel construye aplicaciones web con IA y automatizaciones. Yo soy uno de sus proyectos: llevo dos años trabajando en producción.', pose: IMG.talk },
    { label: '¿Qué es Nexo?', a: 'Nexo es su plataforma de microservicios: inventarios, contabilidad, conciliaciones y horarios con IA, cada módulo con su propio asistente.', pose: IMG.talk },
    { label: '¿Qué puede hacer por mi negocio?', a: 'Si tienes una tarea repetitiva, Daniel la automatiza: reportes, documentos, publicaciones o un sistema web a tu medida.', pose: IMG.happy }
  ];
  const box = document.getElementById('in-q');
  const answer = document.getElementById('in-answer');
  const face = document.getElementById('in-face');
  if (!box || !answer || !face) return;
  let timer = null;
  QS.forEach((q, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = q.label;
    b.addEventListener('click', () => {
      box.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      answer.textContent = q.a;
      face.src = q.pose;
      clearTimeout(timer);
      timer = setTimeout(() => { face.src = IMG.smile; }, 2200);
      try { if (window.umami) window.umami.track('inicio-pregunta-sox', { pregunta: String(i + 1) }); } catch (e) { /* nada */ }
    });
    box.appendChild(b);
  });
})();
