import { config } from './config.js';
import { esc } from './utils.js';

const UMBRAL_DESLIZAR = 50; // px

export function initGallery() {
  const fotos = config.galeria;
  const seccion = document.getElementById('galeria');
  if (!fotos.length) {
    seccion.hidden = true;
    return;
  }

  const grilla = seccion.querySelector('[data-galeria]');
  grilla.innerHTML = fotos
    .map(
      (foto, i) => `
      <li class="galeria__item">
        <button class="galeria__boton" type="button" data-indice="${i}">
          <span class="visualmente-oculto">Ampliar foto:</span>
          <img class="galeria__img" src="${esc(foto.src)}" alt="${esc(foto.alt)}" loading="lazy" decoding="async">
        </button>
      </li>`,
    )
    .join('');

  const visor = document.querySelector('[data-visor]');
  const imagen = visor.querySelector('[data-visor-img]');
  const pie = visor.querySelector('[data-visor-pie]');
  let actual = 0;

  const mostrar = (indice) => {
    actual = (indice + fotos.length) % fotos.length;
    imagen.src = fotos[actual].src;
    imagen.alt = fotos[actual].alt;
    pie.textContent = `${actual + 1} / ${fotos.length}`;
  };

  grilla.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-indice]');
    if (!boton) return;
    mostrar(Number(boton.dataset.indice));
    visor.showModal();
  });

  visor.querySelector('[data-visor-anterior]').addEventListener('click', () => mostrar(actual - 1));
  visor.querySelector('[data-visor-siguiente]').addEventListener('click', () => mostrar(actual + 1));
  visor.querySelector('[data-visor-cerrar]').addEventListener('click', () => visor.close());

  // Tocar fuera de la foto cierra el visor.
  visor.addEventListener('click', (evento) => {
    if (!evento.target.closest('img, button')) visor.close();
  });

  visor.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') mostrar(actual - 1);
    if (evento.key === 'ArrowRight') mostrar(actual + 1);
  });

  let inicioX = null;
  visor.addEventListener('touchstart', (evento) => (inicioX = evento.touches[0].clientX), { passive: true });
  visor.addEventListener('touchend', (evento) => {
    if (inicioX === null) return;
    const delta = evento.changedTouches[0].clientX - inicioX;
    inicioX = null;
    if (Math.abs(delta) > UMBRAL_DESLIZAR) mostrar(actual + (delta < 0 ? 1 : -1));
  });
}
