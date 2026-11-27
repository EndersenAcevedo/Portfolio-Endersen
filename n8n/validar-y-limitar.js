// Lee el mensaje, recorta el historial y aplica límites diarios (por IP y total).
const req = $input.first().json;
let body = req.body;
if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
body = body || {};
const mensaje = String(body.mensaje || '').trim().slice(0, 200);
const historial = Array.isArray(body.historial) ? body.historial.slice(-6) : [];
const hora = String(body.hora || '').slice(0, 60);
const pagina = String(body.pagina || '').slice(0, 40);
const h = req.headers || {};
const ip = String(h['cf-connecting-ip'] || h['x-real-ip'] || String(h['x-forwarded-for'] || '').split(',')[0] || 'desconocida').trim();

const LIMITE_POR_IP = 30;     // preguntas a la IA por visitante al día
const LIMITE_TOTAL = 400;     // preguntas a la IA en total al día
const dia = new Date().toISOString().slice(0, 10);
const st = $getWorkflowStaticData('global');
if (st.dia !== dia) { st.dia = dia; st.total = 0; st.ips = {}; }
const usadas = st.ips[ip] || 0;

if (!mensaje) return [{ json: { bloqueado: true, motivo: 'vacio' } }];
if (usadas >= LIMITE_POR_IP || st.total >= LIMITE_TOTAL) return [{ json: { bloqueado: true, motivo: 'limite' } }];
st.ips[ip] = usadas + 1;
st.total += 1;

const SYSTEM = "Eres Sox, el asistente amable del portafolio web de Daniel Acevedo, desarrollador full stack y de automatización con IA en El Salvador (marca Endanus). Conversa de forma natural, cálida y breve (1 a 3 frases), como una persona: puedes saludar, charlar un poco y responder cosas simples del momento, como la hora o el día, usando el dato del visitante que te doy. Tu tema principal es el portafolio: proyectos (Nexo: plataforma web de microservicios con asistentes de IA; Sox: agente de WhatsApp hecho en n8n; Finanzas: gastos por WhatsApp con voz o foto; MVPs en AWS; IA Studio; servidor propio con Docker y n8n), servicios (aplicaciones web con IA, automatizaciones, reportes, cloud), tecnologías que usa (n8n, React, ASP.NET Core, PostgreSQL, Docker, OpenAI, Mistral: puedes explicarlas en una frase y decir cómo las aplica) y cómo contactarlo. Si te piden algo ajeno al portafolio que requiera más que una frase (tareas, noticias, consejos, código), dilo con amabilidad y ofrece algo del portafolio. Nunca inventes precios, clientes ni datos que no estén aquí. Usa ir_a solo cuando el visitante pida ir o ver una sección; si solo conversa, déjalo vacío. Responde solo con JSON: {\"mensaje\":\"texto\",\"ir_a\":\"pagina o vacío\"}. ir_a solo puede ser: inicio.html, portafolio.html, servicios.html, contacto.html, sobremi.html, stack.html, casos.html, clientes.html.";
const contexto = 'Fecha y hora del visitante: ' + (hora || 'desconocida') + '. Página donde está: ' + (pagina || 'desconocida') + '.';
const messages = [{ role: 'system', content: SYSTEM + ' ' + contexto }];
for (const m of historial) {
  const texto = String((m && m.texto) || '').slice(0, 200);
  if (texto) messages.push({ role: m.rol === 'usuario' ? 'user' : 'assistant', content: texto });
}
messages.push({ role: 'user', content: mensaje });

return [{ json: {
  bloqueado: false,
  payload: { model: 'gpt-4o-mini', temperature: 0.6, max_tokens: 150, response_format: { type: 'json_object' }, messages }
} }];
