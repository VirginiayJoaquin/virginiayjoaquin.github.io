import { enviar, modoDemo } from './api.js';
import { limpiarErrores, mostrarError, enfocarPrimerError, mostrarEstado, marcarEnviando } from './forms.js';

export function initSongs(promesaInvitado) {
  const form = document.querySelector('[data-canciones]');
  let invitado = null;

  promesaInvitado.then((datos) => {
    invitado = datos;
  });

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limpiarErrores(form);
    const f = form.elements;
    // El nombre sale del link personal; sin código queda vacío.
    const datos = { nombre: invitado?.nombre ?? '', cancion: f.cancion.value.trim(), artista: f.artista.value.trim() };

    if (datos.cancion.length < 2) {
      mostrarError(form, 'cancion', '¿Qué canción no puede faltar?');
      enfocarPrimerError(form);
      return;
    }

    marcarEnviando(form, true);
    try {
      await enviar('cancion', { codigo: invitado?.codigo ?? '', ...datos });
      f.cancion.value = '';
      f.artista.value = '';
      mostrarEstado(
        form,
        `¡Gracias! La sumamos a la lista.${modoDemo() ? ' (Modo demo: no se guardó.)' : ''} ¿Otra?`,
        'ok',
      );
    } catch (error) {
      console.error(error);
      mostrarEstado(form, 'No pudimos enviar la canción. Revisá tu conexión y probá de nuevo.', 'error');
    } finally {
      marcarEnviando(form, false);
    }
  });
}
