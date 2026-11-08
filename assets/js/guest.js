import { obtenerInvitado } from './api.js';

// Filtro barato antes de consultar: evita pedidos con basura en la URL.
const CODIGO_VALIDO = /^[A-Za-z0-9_-]{4,40}$/;

// Devuelve { codigo, nombre, lugares, integrantes } o null. Sin código o con código inválido, la invitación queda genérica.
export async function initGuest() {
  const codigo = new URLSearchParams(location.search).get('i')?.trim();
  if (!codigo || !CODIGO_VALIDO.test(codigo)) return null;

  const datos = await obtenerInvitado(codigo);
  if (!datos?.nombre) return null;

  const integrantes = (Array.isArray(datos.integrantes) ? datos.integrantes : []).map(String).filter((n) => n.trim());
  const lugares = Math.max(1, Number(datos.lugares) || 1, integrantes.length);
  const invitado = { codigo, nombre: datos.nombre, lugares, integrantes };
  personalizar(invitado);
  return invitado;
}

function personalizar({ nombre, lugares }) {
  const seccion = document.getElementById('invitado');
  const individual = lugares === 1;

  seccion.querySelector('[data-invitado-saludo]').textContent = `¡Hola, ${nombre}!`;
  seccion.querySelector('[data-invitado-texto]').textContent = individual
    ? 'Nos encantaría que nos acompañes en este día tan especial.'
    : 'Nos encantaría que nos acompañen en este día tan especial.';

  const cupo = seccion.querySelector('[data-invitado-lugares]');
  cupo.textContent = individual ? 'Reservamos 1 lugar para vos' : `Reservamos ${lugares} lugares para ustedes`;
  cupo.hidden = false;
}
