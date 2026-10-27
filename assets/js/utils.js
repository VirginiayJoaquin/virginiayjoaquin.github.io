import { config } from './config.js';

// Escapa texto para interpolarlo en plantillas HTML.
export function esc(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Las fechas siempre se muestran en hora de Uruguay, esté donde esté quien mira la invitación.
function formatear(iso, opciones) {
  return new Intl.DateTimeFormat('es-UY', { timeZone: config.zonaHoraria, ...opciones }).format(new Date(iso));
}

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// "Sábado 13 de marzo de 2027"
export function fechaLarga(iso) {
  const dia = formatear(iso, { weekday: 'long' });
  return capitalizar(`${dia} ${formatear(iso, { day: 'numeric', month: 'long', year: 'numeric' })}`);
}

// "13 de marzo"
export function diaYMes(iso) {
  return formatear(iso, { day: 'numeric', month: 'long' });
}

// "13 · 03 · 2027"
export function fechaCorta(iso) {
  const partes = new Intl.DateTimeFormat('es-UY', {
    timeZone: config.zonaHoraria,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date(iso));
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  return `${valor('day')} · ${valor('month')} · ${valor('year')}`;
}

// "17:30 h"
export function hora(iso) {
  return `${formatear(iso, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })} h`;
}

export const nombresNovios = () => `${config.novios.nombre1} & ${config.novios.nombre2}`;
