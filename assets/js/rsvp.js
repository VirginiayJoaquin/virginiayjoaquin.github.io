import { config } from './config.js';
import { enviar, modoDemo } from './api.js';
import { diaYMes } from './utils.js';
import { limpiarErrores, mostrarError, enfocarPrimerError, mostrarEstado, marcarEnviando } from './forms.js';

export function initRsvp(promesaInvitado) {
  const form = document.querySelector('[data-rsvp]');
  const bloqueSi = form.querySelector('[data-rsvp-si]');
  const gracias = document.querySelector('[data-rsvp-gracias]');
  const { cantidad } = form.elements;
  let invitado = null;
  let maxLugares = config.rsvp.lugaresSinCodigo;

  const llenarCantidad = (max) => {
    maxLugares = max;
    cantidad.innerHTML = Array.from({ length: max }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    cantidad.value = String(max);
  };
  llenarCantidad(maxLugares);

  promesaInvitado.then((datos) => {
    if (!datos) return;
    invitado = datos;
    if (!form.elements.nombre.value) form.elements.nombre.value = datos.nombre;
    llenarCantidad(datos.lugares);
  });

  form.addEventListener('change', (evento) => {
    if (evento.target.name === 'asiste') bloqueSi.hidden = evento.target.value !== 'si';
  });

  const leer = () => {
    const f = form.elements;
    const asiste = f.asiste.value;
    return {
      nombre: f.nombre.value.trim(),
      asiste,
      cantidad: asiste === 'si' ? Number(f.cantidad.value) : 0,
      restricciones: asiste === 'si' ? f.restricciones.value.trim() : '',
      mensaje: f.mensaje.value.trim(),
    };
  };

  const validar = (datos) => {
    const errores = [];
    if (datos.nombre.length < 2) errores.push(['nombre', 'Contanos quién sos.']);
    if (!['si', 'no'].includes(datos.asiste)) errores.push(['asiste', 'Elegí una opción.']);
    if (datos.asiste === 'si' && !(datos.cantidad >= 1 && datos.cantidad <= maxLugares)) {
      errores.push(['cantidad', `Elegí entre 1 y ${maxLugares}.`]);
    }
    if (datos.mensaje.length > 500) errores.push(['mensaje', 'El mensaje puede tener hasta 500 caracteres.']);
    return errores;
  };

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limpiarErrores(form);
    const datos = leer();
    const errores = validar(datos);
    if (errores.length) {
      errores.forEach(([campo, mensaje]) => mostrarError(form, campo, mensaje));
      enfocarPrimerError(form);
      return;
    }

    marcarEnviando(form, true);
    try {
      await enviar('rsvp', { codigo: invitado?.codigo ?? '', ...datos });
      mostrarGracias(datos);
    } catch (error) {
      console.error(error);
      mostrarEstado(form, 'No pudimos enviar tu respuesta. Revisá tu conexión y probá de nuevo.', 'error');
    } finally {
      marcarEnviando(form, false);
    }
  });

  function mostrarGracias({ nombre, asiste }) {
    const primerNombre = nombre.split(' ')[0];
    gracias.querySelector('[data-rsvp-gracias-titulo]').textContent =
      asiste === 'si' ? `¡Gracias, ${primerNombre}!` : '¡Gracias por avisarnos!';
    gracias.querySelector('[data-rsvp-gracias-texto]').textContent =
      (asiste === 'si'
        ? `Ya tenemos tu confirmación. ¡Nos vemos el ${diaYMes(config.fecha)}!`
        : 'Te vamos a extrañar. Si algo cambia, podés modificar tu respuesta.') +
      (modoDemo() ? ' (Modo demo: la respuesta no se guardó.)' : '');
    form.hidden = true;
    gracias.hidden = false;
    gracias.focus();
  }

  gracias.querySelector('[data-rsvp-editar]').addEventListener('click', () => {
    gracias.hidden = true;
    form.hidden = false;
    form.elements.nombre.focus();
  });
}
