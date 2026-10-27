import { config } from './config.js';
import { enviar, modoDemo } from './api.js';
import { esc } from './utils.js';
import { limpiarErrores, mostrarError, enfocarPrimerError, mostrarEstado, marcarEnviando } from './forms.js';

const trazo = (contenido) =>
  `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${contenido}</svg>`;

const ICONOS = {
  cerveza: trazo(
    '<path d="M6 8h9v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><path d="M6 8a2.5 2.5 0 0 1 2.5-3 3 3 0 0 1 5 0A2.5 2.5 0 0 1 15 8"/><path d="M9 12v5M12 12v5"/>',
  ),
  fernet: trazo('<path d="M7 4h10l-1.5 16h-7z"/><path d="M7.6 10h8.8"/><rect x="10" y="12.5" width="3" height="3" rx=".5"/>'),
  whisky: trazo(
    '<path d="M5 8h14l-1.5 11a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7z"/><path d="M5.6 12.5h12.8"/><rect x="9" y="14" width="3" height="3" rx=".5" transform="rotate(-12 10.5 15.5)"/>',
  ),
  aperol: trazo(
    '<path d="M7 3h10l-.4 5a4.6 4.6 0 0 1-9.2 0z"/><path d="M7.3 6.5h9.4"/><path d="M12 12.6V20M8.5 21h7"/><path d="M15.5 3a2.5 2.5 0 0 1 5 0z"/>',
  ),
  gin: trazo('<path d="M6.5 4h11c.8 4-1.5 8-5.5 8s-6.3-4-5.5-8z"/><path d="M6.8 7.5h10.4"/><path d="M12 12v8M8.5 21h7"/><circle cx="10.5" cy="9.3" r=".6"/><circle cx="13.5" cy="10" r=".6"/>'),
};
const ICONO_GENERICO = trazo('<path d="M7 3h10l-1 6a4 4 0 0 1-8 0z"/><path d="M12 13v7M8.5 21h7"/>');

export function initBebidas(promesaInvitado) {
  const form = document.querySelector('[data-bebidas]');
  const opciones = config.bebidas ?? [];
  if (!opciones.length) {
    document.getElementById('bebidas').hidden = true;
    return;
  }

  form.querySelector('[data-bebidas-opciones]').innerHTML = opciones
    .map(
      (b) => `
      <label class="bebida">
        <input class="bebida__input" type="checkbox" name="bebidas" value="${esc(b.id)}">
        <span class="bebida__icono">${ICONOS[b.icono ?? b.id] ?? ICONO_GENERICO}</span>
        <span class="bebida__nombre">${esc(b.nombre)}</span>
      </label>`,
    )
    .join('');

  let invitado = null;
  promesaInvitado.then((datos) => {
    if (!datos) return;
    invitado = datos;
    if (!form.elements.nombre.value) form.elements.nombre.value = datos.nombre;
  });

  const idsValidos = new Set(opciones.map((b) => b.id));

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limpiarErrores(form);
    const nombre = form.elements.nombre.value.trim();
    const bebidas = [...form.querySelectorAll('[name="bebidas"]:checked')]
      .map((input) => input.value)
      .filter((id) => idsValidos.has(id));

    if (nombre.length < 2) mostrarError(form, 'nombre', 'Contanos quién sos.');
    if (!bebidas.length) mostrarError(form, 'bebidas', 'Elegí al menos una bebida.');
    if (nombre.length < 2 || !bebidas.length) {
      enfocarPrimerError(form);
      return;
    }

    marcarEnviando(form, true);
    try {
      await enviar('bebidas', { codigo: invitado?.codigo ?? '', nombre, bebidas });
      mostrarEstado(
        form,
        `¡Gracias! Anotamos tus bebidas.${modoDemo() ? ' (Modo demo: no se guardó.)' : ''} Si cambiás de idea, podés volver a enviar.`,
        'ok',
      );
    } catch (error) {
      console.error(error);
      mostrarEstado(form, 'No pudimos enviar tu elección. Revisá tu conexión y probá de nuevo.', 'error');
    } finally {
      marcarEnviando(form, false);
    }
  });
}
