import { config } from './config.js';
import { urlGoogleCalendar, descargarIcs } from './calendar.js';
import { esc, fechaLarga, fechaCorta, diaYMes, hora, nombresNovios } from './utils.js';

// Textos sueltos: cualquier elemento con data-texto="clave" recibe el valor correspondiente.
function renderTextos() {
  const { novios, textos, fecha, rsvp } = config;
  const valores = {
    novio1: novios.nombre1,
    novio2: novios.nombre2,
    nombres: nombresNovios(),
    iniciales: `${novios.nombre1[0]} & ${novios.nombre2[0]}`,
    fechaLarga: fechaLarga(fecha),
    fechaCorta: fechaCorta(fecha),
    rsvpLimite: diaYMes(rsvp.fechaLimite),
    ...textos,
  };
  document.querySelectorAll('[data-texto]').forEach((el) => {
    const valor = valores[el.dataset.texto];
    if (valor !== undefined) el.textContent = valor;
  });
  document.querySelectorAll('time[data-texto^="fecha"]').forEach((el) => el.setAttribute('datetime', fecha));
  document.title = `${nombresNovios()} · Nos casamos`;
}

function renderEventos() {
  const contenedor = document.querySelector('[data-eventos]');
  contenedor.innerHTML = config.eventos
    .map(
      (evento) => `
      <article class="evento tarjeta revelar">
        <h3 class="evento__titulo">${esc(evento.titulo)}</h3>
        <p class="evento__hora"><time datetime="${esc(evento.inicio)}">${hora(evento.inicio)}</time></p>
        <p class="evento__lugar">${esc(evento.lugar)}</p>
        <p class="evento__direccion">${esc(evento.direccion)}</p>
        ${evento.descripcion ? `<p class="evento__descripcion">${esc(evento.descripcion)}</p>` : ''}
        <div class="evento__acciones">
          <details class="desplegable">
            <summary class="boton boton--secundario">Agendar</summary>
            <div class="desplegable__menu">
              <a class="desplegable__opcion" href="${esc(urlGoogleCalendar(evento))}" target="_blank" rel="noopener">Google Calendar</a>
              <button class="desplegable__opcion" type="button" data-ics="${esc(evento.id)}">Apple / Outlook (.ics)</button>
            </div>
          </details>
          <details class="desplegable">
            <summary class="boton">Cómo llegar</summary>
            <div class="desplegable__menu">
              <a class="desplegable__opcion" href="${esc(evento.mapas.google)}" target="_blank" rel="noopener">Google Maps</a>
              <a class="desplegable__opcion" href="${esc(evento.mapas.waze)}" target="_blank" rel="noopener">Waze</a>
            </div>
          </details>
        </div>
      </article>`,
    )
    .join('');

  contenedor.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-ics]');
    if (boton) descargarIcs(config.eventos.find((e) => e.id === boton.dataset.ics));
  });
}

// Menús <details>: solo uno abierto a la vez; se cierran al tocar afuera, al elegir una opción o con Escape.
function initDesplegables() {
  const abiertos = () => document.querySelectorAll('details.desplegable[open]');

  document.addEventListener('click', (evento) => {
    const opcion = evento.target.closest('.desplegable__opcion');
    abiertos().forEach((details) => {
      if (!details.contains(evento.target) || opcion) details.open = false;
    });
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    abiertos().forEach((details) => {
      details.open = false;
      details.querySelector('summary').focus();
    });
  });
}

function renderDressCode() {
  const { mostrar, tipo, descripcion, nota, colores } = config.dressCode;
  if (mostrar === false) {
    document.getElementById('dresscode').hidden = true;
    return;
  }
  document.querySelector('[data-dresscode]').innerHTML = `
    <p class="dresscode__tipo">${esc(tipo)}</p>
    ${descripcion ? `<p class="dresscode__descripcion">${esc(descripcion)}</p>` : ''}
    ${
      colores?.length
        ? `<ul class="dresscode__colores" aria-label="Paleta sugerida">
            ${colores
              .map(
                (c) => `<li class="dresscode__color" style="--muestra: ${esc(c.valor)}" title="${esc(c.nombre)}">
                  <span class="visualmente-oculto">${esc(c.nombre)}</span></li>`,
              )
              .join('')}
          </ul>`
        : ''
    }
    ${nota ? `<p class="dresscode__nota">${esc(nota)}</p>` : ''}`;
}

export function renderContenido() {
  renderTextos();
  renderEventos();
  initDesplegables();
  renderDressCode();
}
