import { config } from './config.js';
import { enviar, modoDemo } from './api.js';
import { diaYMes } from './utils.js';
import { limpiarErrores, mostrarError, enfocarPrimerError, mostrarEstado, marcarEnviando } from './forms.js';

export function initRsvp(promesaInvitado) {
  const form = document.querySelector('[data-rsvp]');
  const bloqueSi = form.querySelector('[data-rsvp-si]');
  const bloqueQuienes = form.querySelector('[data-rsvp-quienes]');
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

  // Si la invitación es para varios y no van todos, se pide quiénes van.
  const necesitaQuienes = () =>
    form.elements.asiste.value === 'si' && invitado?.lugares > 1 && Number(cantidad.value) < invitado.lugares;

  const actualizarQuienes = () => {
    const visible = necesitaQuienes();
    bloqueQuienes.hidden = !visible;
    if (!visible) return;
    const n = Number(cantidad.value);
    bloqueQuienes.querySelector('[data-rsvp-quienes-ayuda]').textContent =
      n === 1 ? 'Nombre de la persona que va.' : `Nombres de las ${n} personas que van.`;
  };

  promesaInvitado.then((datos) => {
    if (!datos) return;
    invitado = datos;
    // "Familia Pérez" no es el nombre de quien responde: solo se precarga si es para una persona.
    if (datos.lugares === 1 && !form.elements.nombre.value) form.elements.nombre.value = datos.nombre;
    llenarCantidad(datos.lugares);
    actualizarQuienes();
  });

  form.addEventListener('change', (evento) => {
    if (evento.target.name === 'asiste') bloqueSi.hidden = evento.target.value !== 'si';
    if (evento.target.name === 'asiste' || evento.target.name === 'cantidad') actualizarQuienes();
  });

  const leer = () => {
    const f = form.elements;
    const asiste = f.asiste.value;
    return {
      nombre: f.nombre.value.trim(),
      asiste,
      cantidad: asiste === 'si' ? Number(f.cantidad.value) : 0,
      quienes: necesitaQuienes() ? f.quienes.value.trim() : '',
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
    if (necesitaQuienes() && datos.quienes.length < 2) errores.push(['quienes', 'Contanos quiénes van.']);
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
