import { nombresNovios } from './utils.js';

// 2027-03-13T17:30:00-03:00 → 20270313T203000Z (formato que piden Google Calendar e iCalendar)
const aUtcCompacto = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const tituloEvento = (evento) => `${evento.titulo} · ${nombresNovios()}`;

export function urlGoogleCalendar(evento) {
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', tituloEvento(evento));
  url.searchParams.set('dates', `${aUtcCompacto(evento.inicio)}/${aUtcCompacto(evento.fin)}`);
  url.searchParams.set('location', `${evento.lugar}, ${evento.direccion}`);
  url.searchParams.set('details', evento.descripcion ?? '');
  return url.toString();
}

const escaparIcs = (texto) =>
  String(texto ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

// Se genera en el momento a partir de config.js, así no hay .ics estáticos que mantener sincronizados.
export function descargarIcs(evento) {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invitacion casamiento//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${evento.id}-${aUtcCompacto(evento.inicio)}@invitacion`,
    `DTSTAMP:${aUtcCompacto(new Date().toISOString())}`,
    `DTSTART:${aUtcCompacto(evento.inicio)}`,
    `DTEND:${aUtcCompacto(evento.fin)}`,
    `SUMMARY:${escaparIcs(tituloEvento(evento))}`,
    `LOCATION:${escaparIcs(`${evento.lugar}, ${evento.direccion}`)}`,
    `DESCRIPTION:${escaparIcs(evento.descripcion)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const archivo = new Blob([lineas.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${evento.id}.ics`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
