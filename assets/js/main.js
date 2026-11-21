import { renderContenido, mostrarEventos } from './content.js';
import { eventosDe } from './utils.js';
import { initIntro } from './intro.js';
import { initCountdown } from './countdown.js';
import { initGuest } from './guest.js';
import { initRsvp } from './rsvp.js';
import { initBebidas } from './bebidas.js';
import { initSongs } from './songs.js';
import { initGifts } from './gifts.js';

document.documentElement.classList.add('js');

renderContenido();
initIntro();
const cuenta = initCountdown();
initGifts();

// La consulta del invitado no bloquea el resto: los formularios se completan cuando llega.
const promesaInvitado = initGuest();
initRsvp(promesaInvitado);
initBebidas(promesaInvitado);
initSongs(promesaInvitado);

// Invitados solo a la fiesta: ven ese evento y la cuenta regresiva va hasta su horario.
promesaInvitado.then((invitado) => {
  if (invitado?.tipo !== 'fiesta') return;
  mostrarEventos('fiesta');
  const [primero] = eventosDe('fiesta');
  if (primero) cuenta.apuntarA(primero.inicio);
});

initRevelar();

// Aparición suave de los bloques al hacer scroll.
function initRevelar() {
  const elementos = document.querySelectorAll('.revelar');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elementos.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('is-visible');
        observador.unobserve(entrada.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  elementos.forEach((el) => observador.observe(el));
}
