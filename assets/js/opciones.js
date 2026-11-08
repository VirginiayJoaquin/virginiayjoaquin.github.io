import { esc } from './utils.js';

// Ícono de línea fina (24×24) a partir de su contenido SVG.
export const trazo = (contenido) =>
  `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${contenido}</svg>`;

// Tarjetas seleccionables con ícono (bebidas, alimentación). El input queda oculto visualmente:
// la tarjeta entera es el control. tipo: 'checkbox' (varias) o 'radio' (una sola).
export function tarjetasOpcion({ tipo, name, opciones, iconos, iconoGenerico }) {
  return opciones
    .map(
      (o) => `
      <label class="eleccion">
        <input class="eleccion__input" type="${tipo}" name="${esc(name)}" value="${esc(o.id)}">
        <span class="eleccion__icono">${iconos[o.icono ?? o.id] ?? iconoGenerico}</span>
        <span class="eleccion__nombre">${esc(o.nombre)}</span>
      </label>`,
    )
    .join('');
}
