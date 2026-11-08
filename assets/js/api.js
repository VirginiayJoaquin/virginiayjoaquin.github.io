import { config } from './config.js';

// Invitados ficticios para probar la personalización sin backend (?i=demo-k7p2q, ?i=demo-r5t8w, ?i=demo-x9wfa o ?i=demo-p3m8c).
// Solo se usan mientras appsScriptUrl esté vacía; la lista real vive en Google Sheets.
const INVITADOS_DEMO = {
  'demo-k7p2q': { nombre: 'Familia Rodríguez', lugares: 4, integrantes: ['Martín Rodríguez', 'Laura Gómez', 'Sofi Rodríguez', 'Tomi Rodríguez'] },
  'demo-x9wfa': { nombre: 'Sofía', lugares: 1, integrantes: ['Sofía Pereira'] },
  'demo-r5t8w': { nombre: 'Familia Martínez', lugares: 3, integrantes: ['Diego Martínez', 'Carolina Suárez', 'Valentina Martínez'] },
  'demo-p3m8c': { nombre: 'Juan y acompañante', lugares: 2, integrantes: ['Juan Silva'] },
};

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export const modoDemo = () => !config.appsScriptUrl;

// Devuelve { nombre, lugares, integrantes } o null. Nunca lanza: ante cualquier problema, la invitación queda genérica.
export async function obtenerInvitado(codigo) {
  if (modoDemo()) {
    await esperar(200);
    return INVITADOS_DEMO[codigo] ?? null;
  }
  try {
    const url = new URL(config.appsScriptUrl);
    url.searchParams.set('i', codigo);
    const respuesta = await fetch(url);
    if (!respuesta.ok) return null;
    const datos = await respuesta.json();
    return datos?.ok ? datos.invitado : null;
  } catch {
    return null;
  }
}

// tipo: 'rsvp' | 'bebidas' | 'cancion'. Lanza un Error si el envío falla.
export async function enviar(tipo, datos) {
  if (modoDemo()) {
    await esperar(700);
    console.info(`[modo demo] No se envió "${tipo}" porque appsScriptUrl está vacía.`, datos);
    return { ok: true, demo: true };
  }
  // text/plain evita el preflight CORS, que Apps Script no soporta.
  const respuesta = await fetch(config.appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ tipo, ...datos }),
  });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  const resultado = await respuesta.json();
  if (!resultado.ok) throw new Error(resultado.error || 'Error desconocido');
  return resultado;
}
