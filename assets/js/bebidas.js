import { config } from './config.js';
import { enviar, modoDemo } from './api.js';
import { trazo, tarjetasOpcion } from './opciones.js';
import { crearPestanas, personasDeInvitado, segun } from './personas.js';
import { limpiarErrores, mostrarError, mostrarEstado, marcarEnviando } from './forms.js';

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
  'sin-alcohol': trazo(
    '<path d="M7 7h10l-1.3 13a1 1 0 0 1-1 .9H9.3a1 1 0 0 1-1-.9z"/><path d="m13 7 2-4h2.5"/><circle cx="11" cy="12" r=".7"/><circle cx="13.2" cy="14.8" r=".7"/><circle cx="10.6" cy="17.2" r=".7"/>',
  ),
};
const ICONO_GENERICO = trazo('<path d="M7 3h10l-1 6a4 4 0 0 1-8 0z"/><path d="M12 13v7M8.5 21h7"/>');

export function initBebidas(promesaInvitado) {
  const form = document.querySelector('[data-bebidas]');
  const opciones = config.bebidas ?? [];
  if (!opciones.length) {
    document.getElementById('bebidas').hidden = true;
    return;
  }
  const idsValidos = new Set(opciones.map((b) => b.id));
  let invitado = null;

  // Cada persona de la invitación elige una sola bebida, en su pestaña.
  const pestanas = crearPestanas(form.querySelector('[data-bebidas-personas]'), {
    prefijo: 'bebidas',
    renderPanel: (p) => `
      <fieldset class="campo">
        <legend class="campo__label">${segun(p, '¿Qué te gustaría tomar?', (n) => `¿Qué le gustaría tomar a ${n}?`)}</legend>
        <p class="campo__ayuda">Elegí una.</p>
        <div class="elecciones">
          ${tarjetasOpcion({ tipo: 'radio', name: `bebida-${p.uid}`, opciones, iconos: ICONOS, iconoGenerico: ICONO_GENERICO })}
        </div>
      </fieldset>`,
    estaCompleta: (panel) => {
      const nombre = panel.querySelector('[data-persona-nombre]');
      return Boolean(panel.querySelector('[name^="bebida-"]:checked')) && (!nombre || nombre.value.trim().length >= 2);
    },
  });

  pestanas.establecer(personasDeInvitado(null));
  promesaInvitado.then((datos) => {
    if (!datos) return;
    invitado = datos;
    pestanas.establecer(personasDeInvitado(datos));
  });

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limpiarErrores(form);

    // Quien no eligió nada simplemente no se envía (puede que no venga).
    const elegidas = pestanas
      .personas()
      .map((p) => ({ ...p, bebida: form.elements[`bebida-${p.uid}`].value }))
      .filter((p) => idsValidos.has(p.bebida));

    if (!elegidas.length) {
      mostrarEstado(form, 'Elegí al menos una bebida.', 'error');
      return;
    }
    const sinNombre = elegidas.filter((p) => !p.fijo && p.nombre.length < 2);
    if (sinNombre.length) {
      sinNombre.forEach((p) =>
        mostrarError(form, `nombre-${p.uid}`, p.vos ? 'Contanos quién sos.' : 'Contanos cómo se llama.'),
      );
      pestanas.activar(sinNombre[0].uid);
      sinNombre[0].panel.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    marcarEnviando(form, true);
    try {
      await enviar('bebidas', {
        codigo: invitado?.codigo ?? '',
        personas: elegidas.map(({ nombre, bebida }) => ({ nombre, bebida })),
      });
      const demo = modoDemo() ? ' (Modo demo: no se guardó.)' : '';
      const una = pestanas.personas().length === 1;
      mostrarEstado(
        form,
        una
          ? `¡Gracias! Anotamos tu bebida.${demo} Si cambiás de idea, podés volver a enviar.`
          : `¡Gracias! Anotamos las bebidas.${demo} Si alguien cambia de idea, pueden volver a enviar.`,
        'ok',
      );
    } catch (error) {
      console.error(error);
      mostrarEstado(form, 'No pudimos enviar la elección. Revisá tu conexión y probá de nuevo.', 'error');
    } finally {
      marcarEnviando(form, false);
    }
  });
}
