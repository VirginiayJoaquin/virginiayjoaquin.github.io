import { config } from './config.js';
import { enviar, modoDemo } from './api.js';
import { diaYMes } from './utils.js';
import { trazo, tarjetasOpcion } from './opciones.js';
import { crearPestanas, personasDeInvitado, segun } from './personas.js';
import { limpiarErrores, mostrarError, mostrarEstado, marcarEnviando } from './forms.js';

const ICONOS = {
  vegetariano: trazo('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="m5 19 8-8"/>'),
  vegano: trazo('<path d="M12 21v-9"/><path d="M12 12C12 8 9.5 6 5 6c0 4 2.5 6 7 6z"/><path d="M12 15c0-4 2.5-6 7-6 0 4-2.5 6-7 6z"/>'),
  celiaco: trazo(
    '<path d="M12 21V8"/><path d="M12 8c-2-1-3-3-3-5 2 1 3 3 3 5zm0 0c2-1 3-3 3-5-2 1-3 3-3 5z"/><path d="M12 14c-2-1-3-3-3-5 2 1 3 3 3 5zm0 0c2-1 3-3 3-5-2 1-3 3-3 5z"/><path d="m4 4 16 16"/>',
  ),
  'sin-lactosa': trazo('<path d="M8 8.5 9.5 4h5L16 8.5V20H8z"/><path d="M8 8.5h8"/><path d="m4 4 16 16"/>'),
  diabetico: trazo('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 14.5A2.5 2.5 0 0 0 12 17"/>'),
};
const ICONO_GENERICO = trazo('<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3"/><path d="M17 21V3c-2 1.5-3 4-3 7v3h3"/>');

const listar = (nombres) => new Intl.ListFormat('es', { type: 'conjunction' }).format(nombres);

export function initRsvp(promesaInvitado) {
  const form = document.querySelector('[data-rsvp]');
  const gracias = document.querySelector('[data-rsvp-gracias]');
  const idsAlimentacion = new Set(config.alimentacion.map((a) => a.id));
  let invitado = null;

  const pestanas = crearPestanas(form.querySelector('[data-rsvp-personas]'), {
    prefijo: 'rsvp',
    renderPanel: (p) => `
      <fieldset class="campo" aria-describedby="rsvp-asiste-${p.uid}-error">
        <legend class="campo__label">${segun(p, '¿Vas a venir?', (n) => `¿Viene ${n}?`)}</legend>
        <div class="opciones">
          <label class="opcion"><input type="radio" name="asiste-${p.uid}" value="si"><span>${segun(p, '¡Sí, voy!', () => '¡Sí, viene!')}</span></label>
          <label class="opcion"><input type="radio" name="asiste-${p.uid}" value="no"><span>${segun(p, 'No voy a poder', () => 'No va a poder')}</span></label>
        </div>
        <p class="campo__error" id="rsvp-asiste-${p.uid}-error" data-error-de="asiste-${p.uid}" hidden></p>
      </fieldset>
      <div class="formulario__grupo" data-si hidden>
        <fieldset class="campo" aria-describedby="rsvp-alimentacion-${p.uid}-ayuda">
          <legend class="campo__label">Alimentación <span class="campo__opcional">(opcional)</span></legend>
          <p class="campo__ayuda" id="rsvp-alimentacion-${p.uid}-ayuda">Marcá lo que corresponda, podés elegir más de una.</p>
          <div class="elecciones">
            ${tarjetasOpcion({ tipo: 'checkbox', name: `alimentacion-${p.uid}`, opciones: config.alimentacion, iconos: ICONOS, iconoGenerico: ICONO_GENERICO })}
          </div>
        </fieldset>
        <div class="campo">
          <label class="campo__label" for="rsvp-otra-${p.uid}">¿Alguna alergia u otra indicación? <span class="campo__opcional">(opcional)</span></label>
          <input class="campo__input" id="rsvp-otra-${p.uid}" name="otra-${p.uid}" type="text" maxlength="120">
        </div>
      </div>`,
    estaCompleta: (panel) => {
      const nombre = panel.querySelector('[data-persona-nombre]');
      return Boolean(panel.querySelector('[name^="asiste-"]:checked')) && (!nombre || nombre.value.trim().length >= 2);
    },
  });

  pestanas.establecer(personasDeInvitado(null));
  promesaInvitado.then((datos) => {
    if (!datos) return;
    invitado = datos;
    pestanas.establecer(personasDeInvitado(datos));
  });

  form.addEventListener('change', (evento) => {
    if (!evento.target.name?.startsWith('asiste-')) return;
    evento.target.closest('.pestanas__panel').querySelector('[data-si]').hidden = evento.target.value !== 'si';
  });

  const leer = () => {
    const f = form.elements;
    const personas = pestanas.personas().map((p) => {
      const asiste = f[`asiste-${p.uid}`].value;
      const va = asiste === 'si';
      return {
        ...p,
        asiste,
        alimentacion: va
          ? [...p.panel.querySelectorAll(`[name="alimentacion-${p.uid}"]:checked`)].map((i) => i.value).filter((id) => idsAlimentacion.has(id))
          : [],
        otra: va ? f[`otra-${p.uid}`].value.trim() : '',
      };
    });
    return { personas, mensaje: f.mensaje.value.trim() };
  };

  // Marca los errores y devuelve el primer campo con problemas (o null si está todo bien).
  const validar = ({ personas, mensaje }) => {
    let primero = null;
    personas.forEach((p) => {
      if (!p.fijo && p.nombre.length < 2) {
        mostrarError(form, `nombre-${p.uid}`, p.vos ? 'Contanos quién sos.' : 'Contanos cómo se llama.');
      }
      if (!['si', 'no'].includes(p.asiste)) mostrarError(form, `asiste-${p.uid}`, 'Elegí una opción.');
      if (!primero && p.panel.querySelector('[aria-invalid="true"]')) primero = p;
    });
    if (mensaje.length > 500) mostrarError(form, 'mensaje', 'El mensaje puede tener hasta 500 caracteres.');
    if (primero) {
      pestanas.activar(primero.uid);
      return primero.panel.querySelector('[aria-invalid="true"]');
    }
    return form.querySelector('[aria-invalid="true"]');
  };

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limpiarErrores(form);
    const datos = leer();
    const conError = validar(datos);
    if (conError) {
      conError.focus();
      return;
    }

    marcarEnviando(form, true);
    try {
      await enviar('rsvp', {
        codigo: invitado?.codigo ?? '',
        personas: datos.personas.map(({ nombre, asiste, alimentacion, otra }) => ({ nombre, asiste, alimentacion, otra })),
        mensaje: datos.mensaje,
      });
      mostrarGracias(datos.personas);
    } catch (error) {
      console.error(error);
      mostrarEstado(form, 'No pudimos enviar la confirmación. Revisá tu conexión y probá de nuevo.', 'error');
    } finally {
      marcarEnviando(form, false);
    }
  });

  function mostrarGracias(personas) {
    const van = personas.filter((p) => p.asiste === 'si').map((p) => p.nombre.split(' ')[0]);
    const noVan = personas.filter((p) => p.asiste === 'no').map((p) => p.nombre.split(' ')[0]);
    const nosVemos = `¡Nos vemos el ${diaYMes(config.fecha)}!`;
    let titulo;
    let texto;

    if (personas.length === 1) {
      titulo = van.length ? `¡Gracias, ${van[0]}!` : '¡Gracias por avisarnos!';
      texto = van.length
        ? `Ya tenemos tu confirmación. ${nosVemos}`
        : 'Te vamos a extrañar. Si algo cambia, podés modificar tu respuesta.';
    } else if (van.length) {
      titulo = '¡Gracias!';
      texto = `Confirmaste a ${listar(van)}.`;
      if (noVan.length) texto += ` ${listar(noVan)} no ${noVan.length > 1 ? 'van' : 'va'}.`;
      texto += ` ${nosVemos}`;
    } else {
      titulo = '¡Gracias por avisarnos!';
      texto = 'Los vamos a extrañar. Si algo cambia, podés modificar la respuesta.';
    }

    gracias.querySelector('[data-rsvp-gracias-titulo]').textContent = titulo;
    gracias.querySelector('[data-rsvp-gracias-texto]').textContent =
      texto + (modoDemo() ? ' (Modo demo: la respuesta no se guardó.)' : '');
    form.hidden = true;
    gracias.hidden = false;
    gracias.focus();
  }

  gracias.querySelector('[data-rsvp-editar]').addEventListener('click', () => {
    gracias.hidden = true;
    form.hidden = false;
    form.querySelector('[role="tab"][aria-selected="true"], [type="radio"]')?.focus();
  });
}
