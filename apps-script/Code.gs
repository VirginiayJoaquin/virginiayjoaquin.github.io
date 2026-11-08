/**
 * Backend de la invitación (Google Apps Script vinculado a la planilla).
 *
 * - doGet  ?i=codigo  → devuelve el nombre y los lugares del invitado.
 * - doPost (JSON como text/plain) → guarda RSVP, bebidas o canciones.
 *
 * Se copia a mano en Extensiones → Apps Script. Ver README.md de esta carpeta.
 * Después de cambiar este código hay que publicar una NUEVA VERSIÓN de la implementación
 * (Implementar → Gestionar implementaciones → editar), si no el sitio sigue usando la vieja.
 */

const URL_INVITACION = 'https://joacoherrera.github.io/invitacion/';

// Tienen que coincidir con config.js (bebidas[].id, bebidasMaximo, alimentacion[].id y rsvp.lugaresSinCodigo).
const BEBIDAS_VALIDAS = ['cerveza', 'fernet', 'whisky', 'aperol', 'gin', 'sin-alcohol'];
const BEBIDAS_MAXIMO = 2;
const ALIMENTACION_VALIDA = ['vegetariano', 'vegano', 'celiaco'];
const LUGARES_SIN_CODIGO = 2;

const HOJAS = {
  invitados: { nombre: 'Invitados', columnas: ['Código', 'Nombre a mostrar', 'Integrantes', 'Lugares', 'Notas', 'Link'] },
  rsvp: {
    nombre: 'RSVP',
    columnas: ['Fecha', 'Código', 'Invitación', 'Nombre', 'Asiste', 'Alimentación', 'Otra indicación', 'Mensaje'],
  },
  bebidas: { nombre: 'Bebidas', columnas: ['Fecha', 'Código', 'Nombre', 'Bebidas'] },
  canciones: { nombre: 'Canciones', columnas: ['Fecha', 'Código', 'Nombre', 'Canción', 'Artista'] },
};

// Sin i, l, o, 0 ni 1 para que los códigos no se confundan al leerlos.
const LETRAS = 'abcdefghjkmnpqrstuvwxyz';
const ALFABETO = LETRAS + '23456789';
const LARGO_CODIGO = 6;

class ErrorValidacion extends Error {}

// ───────────────────────── Menú de la planilla ─────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Invitación')
    .addItem('Preparar planilla', 'prepararPlanilla')
    .addItem('Generar códigos y links', 'generarCodigos')
    .addToUi();
}

function prepararPlanilla() {
  const planilla = SpreadsheetApp.getActiveSpreadsheet();
  planilla.setSpreadsheetTimeZone('America/Montevideo');
  Object.values(HOJAS).forEach(obtenerHoja);
  planilla.toast('Listo: están las pestañas Invitados, RSVP, Bebidas y Canciones.', 'Invitación');
}

// Completa el código de cada invitado que no tenga uno y arma su link personal.
function generarCodigos() {
  const hoja = obtenerHoja(HOJAS.invitados);
  const ultimaFila = hoja.getLastRow();
  if (ultimaFila < 2) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Primero cargá invitados en la pestaña Invitados.', 'Invitación');
    return;
  }

  const rango = hoja.getRange(2, 1, ultimaFila - 1, HOJAS.invitados.columnas.length);
  const filas = rango.getValues();
  const usados = new Set(filas.map((f) => normalizarCodigo(f[0])).filter(Boolean));
  let nuevos = 0;

  filas.forEach((fila) => {
    if (!String(fila[1]).trim()) return; // fila sin nombre
    let codigo = normalizarCodigo(fila[0]);
    if (!codigo) {
      do codigo = codigoAleatorio(); while (usados.has(codigo));
      usados.add(codigo);
      fila[0] = codigo;
      nuevos++;
    }
    fila[5] = URL_INVITACION + '?i=' + codigo;
  });

  rango.setValues(filas);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Códigos nuevos: ${nuevos}. Links actualizados.`, 'Invitación');
}

// ───────────────────────── Web App ─────────────────────────

function doGet(e) {
  const parametros = (e && e.parameter) || {};
  if (!('i' in parametros)) return responder({ ok: true, mensaje: 'La invitación está conectada.' });

  const invitado = buscarInvitado(normalizarCodigo(parametros.i));
  if (!invitado) return responder({ ok: false, error: 'Código no encontrado' });
  return responder({
    ok: true,
    invitado: { nombre: invitado.nombre, lugares: invitado.lugares, integrantes: invitado.integrantes },
  });
}

function doPost(e) {
  let datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (error) {
    return responder({ ok: false, error: 'Datos inválidos' });
  }

  // El lock evita que dos envíos simultáneos con el mismo código pisen filas a la vez.
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    if (datos.tipo === 'rsvp') guardarRsvp(datos);
    else if (datos.tipo === 'bebidas') guardarBebidas(datos);
    else if (datos.tipo === 'cancion') guardarCancion(datos);
    else throw new ErrorValidacion('Tipo de envío desconocido');
    return responder({ ok: true });
  } catch (error) {
    if (!(error instanceof ErrorValidacion)) console.error(error);
    return responder({ ok: false, error: error instanceof ErrorValidacion ? error.message : 'No se pudo guardar' });
  } finally {
    lock.releaseLock();
  }
}

// ───────────────────────── Guardado ─────────────────────────

// Una fila por persona. Con código, la nueva respuesta reemplaza todas las filas anteriores
// de esa invitación (la última prevalece); sin código se agregan filas nuevas.
function guardarRsvp(datos) {
  const invitado = buscarInvitado(normalizarCodigo(datos.codigo));
  const codigo = invitado ? invitado.codigo : '';
  const personas = validarPersonas(datos.personas, invitado);

  const filas = personas.map((p, i) => {
    if (p.asiste !== 'si' && p.asiste !== 'no') throw new ErrorValidacion('Falta indicar si viene ' + p.nombre);
    const va = p.asiste === 'si';
    const alimentacion = va && Array.isArray(p.alimentacion) ? [...new Set(p.alimentacion.map(String))] : [];
    if (alimentacion.some((a) => !ALIMENTACION_VALIDA.includes(a))) throw new ErrorValidacion('Opción de alimentación desconocida');
    return [
      new Date(), codigo, invitado ? invitado.nombre : '', p.nombre, va ? 'Sí' : 'No',
      alimentacion.join(', '), va ? texto(p.otra, 120) : '', i === 0 ? texto(datos.mensaje, 500) : '',
    ];
  });

  const hoja = obtenerHoja(HOJAS.rsvp);
  if (codigo) borrarFilasDe(hoja, codigo);
  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
}

// Hasta BEBIDAS_MAXIMO bebidas por persona. Se reemplaza solo la elección de quien vuelve a enviar
// (mismo código y mismo nombre), así los integrantes de una familia no se pisan.
function guardarBebidas(datos) {
  const invitado = buscarInvitado(normalizarCodigo(datos.codigo));
  const codigo = invitado ? invitado.codigo : '';
  const personas = validarPersonas(datos.personas, invitado);
  const elecciones = personas.map((p) => {
    const bebidas = Array.isArray(p.bebidas) ? [...new Set(p.bebidas.map(String))] : [];
    if (!bebidas.length) throw new ErrorValidacion('Elegí al menos una bebida');
    if (bebidas.length > BEBIDAS_MAXIMO) throw new ErrorValidacion('Se pueden elegir hasta ' + BEBIDAS_MAXIMO + ' bebidas');
    if (bebidas.some((b) => !BEBIDAS_VALIDAS.includes(b))) throw new ErrorValidacion('Bebida desconocida');
    return { nombre: p.nombre, bebidas: bebidas };
  });

  elecciones.forEach((p) => {
    const persona = normalizarNombre(p.nombre);
    const esLaMisma = (fila) => normalizarCodigo(fila[1]) === codigo && normalizarNombre(fila[2]) === persona;
    guardarFila(HOJAS.bebidas, codigo && esLaMisma, [new Date(), codigo, p.nombre, p.bebidas.join(', ')]);
  });
}

// Lista de personas de un envío: entre 1 y los lugares de la invitación, todas con nombre.
function validarPersonas(personas, invitado) {
  const maximo = invitado ? invitado.lugares : LUGARES_SIN_CODIGO;
  if (!Array.isArray(personas) || !personas.length) throw new ErrorValidacion('Faltan los invitados');
  if (personas.length > maximo) throw new ErrorValidacion('La invitación es para ' + maximo + ' como máximo');
  return personas.map((p) => {
    const nombre = texto(p && p.nombre, 80);
    if (nombre.length < 2) throw new ErrorValidacion('Falta el nombre de un invitado');
    return Object.assign({}, p, { nombre: nombre });
  });
}

function borrarFilasDe(hoja, codigo) {
  if (hoja.getLastRow() < 2) return;
  const codigos = hoja.getRange(2, 2, hoja.getLastRow() - 1, 1).getValues();
  // De abajo hacia arriba para que borrar no corra los índices de las filas que faltan.
  for (let i = codigos.length - 1; i >= 0; i--) {
    if (normalizarCodigo(codigos[i][0]) === codigo) hoja.deleteRow(i + 2);
  }
}

function guardarCancion(datos) {
  const invitado = buscarInvitado(normalizarCodigo(datos.codigo));
  const codigo = invitado ? invitado.codigo : '';
  const cancion = texto(datos.cancion, 120);
  if (cancion.length < 2) throw new ErrorValidacion('Falta la canción');

  // Cada invitado puede sugerir varias canciones: siempre se agrega una fila nueva.
  obtenerHoja(HOJAS.canciones).appendRow([new Date(), codigo, texto(datos.nombre, 80), cancion, texto(datos.artista, 120)]);
}

// Si `esLaMisma` encuentra una fila anterior, la reemplaza (la última respuesta prevalece).
// Sin código no hay forma de saber quién es (esLaMisma vacío), así que se agrega una fila nueva.
function guardarFila(definicion, esLaMisma, fila) {
  const hoja = obtenerHoja(definicion);
  if (esLaMisma && hoja.getLastRow() > 1) {
    const filas = hoja.getRange(2, 1, hoja.getLastRow() - 1, fila.length).getValues();
    const indice = filas.findIndex(esLaMisma);
    if (indice !== -1) {
      hoja.getRange(indice + 2, 1, 1, fila.length).setValues([fila]);
      return;
    }
  }
  hoja.appendRow(fila);
}

// ───────────────────────── Utilidades ─────────────────────────

// Integrantes: nombres separados por coma. Lugares: opcional; si es mayor que la cantidad de
// integrantes, los lugares que sobran son acompañantes que completan su nombre en el sitio.
function buscarInvitado(codigo) {
  if (!codigo) return null;
  const hoja = obtenerHoja(HOJAS.invitados);
  if (hoja.getLastRow() < 2) return null;

  const filas = hoja.getRange(2, 1, hoja.getLastRow() - 1, 4).getValues();
  const fila = filas.find((f) => normalizarCodigo(f[0]) === codigo && String(f[1]).trim());
  if (!fila) return null;
  const integrantes = String(fila[2]).split(/[,;\n]/).map((n) => n.trim()).filter(Boolean);
  const lugares = Math.max(1, parseInt(fila[3], 10) || 0, integrantes.length);
  return { codigo, nombre: String(fila[1]).trim(), integrantes, lugares };
}

function obtenerHoja(definicion) {
  const planilla = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = planilla.getSheetByName(definicion.nombre);
  if (!hoja) hoja = planilla.insertSheet(definicion.nombre);
  if (hoja.getLastRow() === 0) {
    hoja.getRange(1, 1, 1, definicion.columnas.length).setValues([definicion.columnas]).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function normalizarCodigo(valor) {
  const codigo = String(valor == null ? '' : valor).trim().toLowerCase();
  return /^[a-z0-9_-]{4,40}$/.test(codigo) ? codigo : '';
}

// "José  Pérez" y "jose perez" cuentan como la misma persona.
function normalizarNombre(valor) {
  return String(valor == null ? '' : valor)
    .replace(/^'/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Empieza siempre con letra para que la planilla nunca lo convierta en número.
function codigoAleatorio() {
  let codigo = LETRAS[Math.floor(Math.random() * LETRAS.length)];
  while (codigo.length < LARGO_CODIGO) codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  return codigo;
}

// Recorta y neutraliza textos que la planilla interpretaría como fórmula (=, +, -, @).
function texto(valor, maximo) {
  const limpio = String(valor == null ? '' : valor).trim().slice(0, maximo);
  return /^[=+\-@]/.test(limpio) ? "'" + limpio : limpio;
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
