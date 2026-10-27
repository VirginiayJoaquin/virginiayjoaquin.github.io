import { config } from './config.js';
import { esc } from './utils.js';

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Respaldo para navegadores viejos o contextos sin permiso de portapapeles.
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

let temporizadorAviso;
function avisar(mensaje) {
  const aviso = document.querySelector('[data-aviso]');
  aviso.textContent = mensaje;
  aviso.classList.add('aviso--visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove('aviso--visible'), 2500);
}

function renderRegalos() {
  const { texto, cuentas } = config.regalos;
  document.querySelector('[data-regalos-texto]').textContent = texto;
  document.querySelector('[data-regalos-cuentas]').innerHTML = cuentas
    .map((c) => {
      const todo = `${c.banco} · ${c.tipo} en ${c.moneda}\nTitular: ${c.titular}\nCuenta: ${c.numero}`;
      return `
      <article class="cuenta-bancaria tarjeta">
        <h3 class="cuenta-bancaria__titulo">${esc(c.banco)} · ${esc(c.moneda)}</h3>
        <dl class="datos">
          <div class="datos__fila"><dt>Tipo</dt><dd>${esc(c.tipo)}</dd></div>
          <div class="datos__fila"><dt>Titular</dt><dd>${esc(c.titular)}</dd></div>
          <div class="datos__fila"><dt>Cuenta</dt><dd>${esc(c.numero)}</dd></div>
        </dl>
        <div class="cuenta-bancaria__acciones">
          <button class="boton boton--chico" type="button" data-copiar="${esc(c.numero)}" data-copiar-aviso="Número de cuenta copiado">Copiar número</button>
          <button class="boton boton--chico boton--secundario" type="button" data-copiar="${esc(todo)}" data-copiar-aviso="Datos copiados">Copiar todo</button>
        </div>
      </article>`;
    })
    .join('');

  const toggle = document.querySelector('[data-regalos-toggle]');
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));
  toggle.addEventListener('click', () => {
    const abrir = panel.hidden;
    panel.hidden = !abrir;
    toggle.setAttribute('aria-expanded', String(abrir));
    toggle.textContent = abrir ? 'Ocultar datos bancarios' : 'Ver datos bancarios';
  });
}

export function initGifts() {
  renderRegalos();

  // Cualquier botón con data-copiar en la página (regalos, hashtag) copia su valor.
  document.addEventListener('click', async (evento) => {
    const boton = evento.target.closest('[data-copiar]');
    if (!boton) return;
    const ok = await copiar(boton.dataset.copiar);
    avisar(ok ? boton.dataset.copiarAviso || 'Copiado' : 'No se pudo copiar. Seleccioná el texto a mano.');
  });
}
