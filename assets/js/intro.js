import { config } from './config.js';

const reducirMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initIntro() {
  const intro = document.getElementById('intro');
  const contenido = document.getElementById('contenido');
  const audio = document.getElementById('musica');
  const toggle = document.getElementById('musica-toggle');

  audio.src = config.musica.src;
  contenido.inert = true;
  document.body.classList.add('is-bloqueado');

  const actualizarToggle = () => {
    const sonando = !audio.paused;
    toggle.classList.toggle('musica--sonando', sonando);
    toggle.setAttribute('aria-label', sonando ? 'Pausar música' : 'Reproducir música');
  };

  // Los navegadores bloquean el autoplay con sonido: play() solo funciona tras un gesto del usuario.
  const reproducir = () => audio.play().catch(actualizarToggle);

  audio.addEventListener('play', actualizarToggle);
  audio.addEventListener('pause', actualizarToggle);
  audio.addEventListener('error', () => {
    // Sin archivo de audio no tiene sentido mostrar el control.
    toggle.hidden = true;
    console.warn(`No se pudo cargar la música (${config.musica.src}).`);
  });

  toggle.addEventListener('click', () => (audio.paused ? reproducir() : audio.pause()));

  // Pausar al salir de la pestaña y retomar al volver, solo si estaba sonando.
  let pausadaPorOcultar = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audio.paused) {
      pausadaPorOcultar = true;
      audio.pause();
    } else if (!document.hidden && pausadaPorOcultar) {
      pausadaPorOcultar = false;
      reproducir();
    }
  });

  const entrar = (conMusica) => {
    if (conMusica) reproducir();
    toggle.hidden = false;
    contenido.inert = false;
    document.body.classList.remove('is-bloqueado');
    intro.classList.add('intro--saliendo');

    const ocultar = () => {
      intro.hidden = true;
    };
    if (reducirMovimiento()) {
      ocultar();
    } else {
      intro.addEventListener('transitionend', ocultar, { once: true });
      setTimeout(ocultar, 1200);
    }
    document.getElementById('inicio').focus({ preventScroll: true });
  };

  intro.querySelector('[data-intro-musica]').addEventListener('click', () => entrar(true));
  intro.querySelector('[data-intro-silencio]').addEventListener('click', () => entrar(false));
  intro.querySelector('[data-intro-musica]').focus();
}
