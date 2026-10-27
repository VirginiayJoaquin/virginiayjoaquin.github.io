import { config } from './config.js';

const pad = (n) => String(n).padStart(2, '0');

export function initCountdown() {
  const reloj = document.querySelector('[data-countdown]');
  const final = document.querySelector('[data-countdown-final]');
  const unidad = (nombre) => reloj.querySelector(`[data-unidad="${nombre}"]`);
  const elementos = { dias: unidad('dias'), horas: unidad('horas'), minutos: unidad('minutos'), segundos: unidad('segundos') };
  const objetivo = new Date(config.fecha).getTime();
  let intervalo;

  function actualizar() {
    const restante = objetivo - Date.now();
    if (restante <= 0) {
      clearInterval(intervalo);
      reloj.hidden = true;
      final.textContent = config.textos.cuentaFinal;
      final.hidden = false;
      return;
    }
    const s = Math.floor(restante / 1000);
    elementos.dias.textContent = Math.floor(s / 86400);
    elementos.horas.textContent = pad(Math.floor((s % 86400) / 3600));
    elementos.minutos.textContent = pad(Math.floor((s % 3600) / 60));
    elementos.segundos.textContent = pad(s % 60);
  }

  actualizar();
  intervalo = setInterval(actualizar, 1000);
}
