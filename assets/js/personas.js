import { config } from './config.js';
import { esc } from './utils.js';

// Pestañas por invitado (como las del navegador): una por persona de la invitación.
// Lo usan el RSVP y las bebidas, que se responden persona por persona.

let siguienteUid = 0;

// Arma la lista de personas a partir del invitado (o null si entró sin código).
// - fijo: el nombre viene de la planilla y no se edita.
// - vos: el panel le habla a quien completa ("¿Vas a venir?") en vez de en tercera persona.
export function personasDeInvitado(invitado) {
  if (!invitado) {
    return { personas: [{ nombre: '', fijo: false, vos: true }], maximo: config.rsvp.lugaresSinCodigo };
  }
  const nombres = invitado.integrantes?.length ? invitado.integrantes : [invitado.nombre];
  const personas = nombres.map((nombre) => ({ nombre, fijo: true, vos: false }));
  // Lugares de más sin nombre en la planilla: acompañantes que completan su nombre.
  while (personas.length < invitado.lugares) personas.push({ nombre: '', fijo: false, vos: false });
  if (personas.length === 1) personas[0].vos = true;
  return { personas, maximo: personas.length };
}

// contenedor: elemento vacío dentro del <form>.
// renderPanel(persona) → HTML del contenido de cada pestaña (persona.uid sirve para nombres únicos).
// estaCompleta(panel) → true si esa persona ya respondió lo necesario (muestra un tilde en la pestaña).
export function crearPestanas(contenedor, { prefijo, renderPanel, estaCompleta = () => false }) {
  let items = [];
  let maximo = 1;

  contenedor.classList.add('pestanas');
  contenedor.innerHTML = `
    <div class="pestanas__barra">
      <div class="pestanas__lista" role="tablist" aria-label="Invitados"></div>
      <button class="pestanas__sumar" type="button">+ Acompañante</button>
    </div>
    <div class="pestanas__paneles"></div>`;
  const barra = contenedor.querySelector('.pestanas__barra');
  const lista = contenedor.querySelector('.pestanas__lista');
  const paneles = contenedor.querySelector('.pestanas__paneles');
  const botonSumar = contenedor.querySelector('.pestanas__sumar');

  const nombreDe = (item) =>
    item.fijo ? item.nombre : (item.panel.querySelector('[data-persona-nombre]')?.value.trim() ?? '');

  // En la pestaña va solo el primer nombre, para que entren varias en el celular.
  const etiquetaDe = (item) => nombreDe(item).split(' ')[0] || (item.vos ? 'Vos' : 'Acompañante');

  function agregar(persona) {
    const uid = ++siguienteUid;
    const item = { ...persona, uid };

    item.tab = document.createElement('button');
    item.tab.type = 'button';
    item.tab.className = 'pestana';
    item.tab.id = `${prefijo}-tab-${uid}`;
    item.tab.setAttribute('role', 'tab');
    item.tab.setAttribute('aria-controls', `${prefijo}-panel-${uid}`);
    item.tab.innerHTML = '<span class="pestana__nombre"></span>';

    item.panel = document.createElement('div');
    item.panel.className = 'pestanas__panel';
    item.panel.id = `${prefijo}-panel-${uid}`;
    item.panel.setAttribute('role', 'tabpanel');
    item.panel.setAttribute('aria-labelledby', item.tab.id);
    item.panel.dataset.uid = uid;
    item.panel.innerHTML = `
      ${
        item.fijo
          ? ''
          : `<div class="campo">
              <label class="campo__label" for="${prefijo}-nombre-${uid}">${item.vos ? 'Tu nombre y apellido' : 'Nombre y apellido de tu acompañante'}</label>
              <input class="campo__input" id="${prefijo}-nombre-${uid}" name="nombre-${uid}" type="text" maxlength="80"
                autocomplete="${item.vos ? 'name' : 'off'}" data-persona-nombre aria-describedby="${prefijo}-nombre-${uid}-error">
              <p class="campo__error" id="${prefijo}-nombre-${uid}-error" data-error-de="nombre-${uid}" hidden></p>
            </div>`
      }
      ${renderPanel(item)}
      ${item.agregada ? '<button class="pestanas__quitar" type="button" data-quitar>Quitar acompañante</button>' : ''}`;

    lista.append(item.tab);
    paneles.append(item.panel);
    items.push(item);
    return item;
  }

  function activar(uid, enfocar = false) {
    items.forEach((item) => {
      const activa = item.uid === uid;
      item.tab.setAttribute('aria-selected', String(activa));
      item.tab.tabIndex = activa ? 0 : -1;
      item.panel.hidden = !activa;
      if (activa && enfocar) item.tab.focus();
    });
  }

  function sincronizar() {
    items.forEach((item) => {
      item.tab.querySelector('.pestana__nombre').textContent = etiquetaDe(item);
      item.tab.toggleAttribute('data-completa', estaCompleta(item.panel));
    });
    const puedeSumar = items.length < maximo && items.every((i) => !i.fijo);
    botonSumar.hidden = !puedeSumar;
    // Una sola persona con nombre conocido: no hace falta mostrar pestañas.
    barra.hidden = items.length === 1 && !puedeSumar;
  }

  botonSumar.addEventListener('click', () => {
    const item = agregar({ nombre: '', fijo: false, vos: false, agregada: true });
    activar(item.uid);
    sincronizar();
    item.panel.querySelector('[data-persona-nombre]').focus();
  });

  paneles.addEventListener('click', (evento) => {
    if (!evento.target.closest('[data-quitar]')) return;
    const panel = evento.target.closest('.pestanas__panel');
    const indice = items.findIndex((i) => i.panel === panel);
    items[indice].tab.remove();
    panel.remove();
    items.splice(indice, 1);
    activar(items[Math.max(0, indice - 1)].uid, true);
    sincronizar();
  });

  lista.addEventListener('click', (evento) => {
    const tab = evento.target.closest('[role="tab"]');
    if (tab) activar(items.find((i) => i.tab === tab).uid);
  });

  lista.addEventListener('keydown', (evento) => {
    const actual = items.findIndex((i) => i.tab === document.activeElement);
    if (actual === -1) return;
    const destino = { ArrowRight: actual + 1, ArrowLeft: actual - 1, Home: 0, End: items.length - 1 }[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    activar(items[(destino + items.length) % items.length].uid, true);
  });

  contenedor.addEventListener('input', sincronizar);
  contenedor.addEventListener('change', sincronizar);

  return {
    // Reemplaza las personas (p. ej. cuando llega el invitado del Apps Script).
    establecer({ personas, maximo: max }) {
      items = [];
      lista.innerHTML = '';
      paneles.innerHTML = '';
      maximo = max;
      personas.forEach(agregar);
      activar(items[0].uid);
      sincronizar();
    },
    personas: () => items.map((item) => ({ uid: item.uid, panel: item.panel, nombre: nombreDe(item), vos: item.vos, fijo: item.fijo })),
    activar,
    sincronizar,
  };
}

// Texto según a quién le habla el panel: a quien completa o a otra persona de la invitación.
export const segun = (persona, paraVos, paraOtro) =>
  persona.vos ? paraVos : paraOtro(persona.fijo ? esc(persona.nombre) : 'tu acompañante');
