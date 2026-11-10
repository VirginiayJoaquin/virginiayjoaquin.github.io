// Todos los datos editables del casamiento. Cambiar algo acá no debería requerir tocar HTML ni lógica.
// Los datos actuales son DE EJEMPLO: reemplazalos por los reales antes de publicar.
//
// Fechas: ISO 8601 con offset -03:00 (Uruguay no tiene horario de verano desde 2015,
// así que el offset es fijo todo el año).

export const config = {
  novios: {
    nombre1: 'Virginia',
    nombre2: 'Joaquín',
  },

  // Fecha y hora a la que apunta la cuenta regresiva (normalmente, el inicio de la ceremonia).
  fecha: '2027-02-13T19:00:00-03:00',
  zonaHoraria: 'America/Montevideo',

  // Cada invitado elige con qué música entra (o sin música). Un botón por opción, en este orden.
  // Si falta el archivo, la invitación funciona igual y el botón de pausa no aparece.
  musica: {
    pregunta: '¿Con qué música entrás?',
    opciones: [
      { nombre: 'Joaquín', src: './assets/audio/joaquin.mp3' },
      { nombre: 'Virginia', src: './assets/audio/virginia.mp3' },
    ],
  },

  textos: {
    portadaAntetitulo: '¡Nos casamos!',
    portadaFrase: 'y queremos celebrarlo con vos',
    cuentaFinal: '¡Llegó el gran día!',
    // Saludo cuando no hay código de invitado (o el código no es válido).
    saludoGenerico: '¡Queremos que estés!',
    textoGenerico: 'Nos encantaría compartir este día tan especial con vos.',
    pie: 'Gracias por ser parte de nuestra historia',
  },

  // Un solo evento: todos están invitados a la ceremonia y a la fiesta, en el mismo lugar.
  eventos: [
    {
      id: 'casamiento',
      titulo: 'Ceremonia & Fiesta',
      inicio: '2027-02-13T19:00:00-03:00',
      fin: '2027-02-14T05:00:00-03:00',
      lugar: 'AVA Experiencia Gourmet',
      direccion: 'Rbla. Pdte. Wilson 2180, 11300 Montevideo',
      descripcion: 'Te esperamos a las 19:00h. La ceremonia dará comienzo puntualmente a las 19:20h, al aire libre. Luego, continuaremos la fiesta en el salón.',
      mapas: {
        google: 'https://www.google.com/maps/search/?api=1&query=AVA+Experiencia+Gourmet+Rambla+Presidente+Wilson+2180+Montevideo',
        waze: 'https://waze.com/ul?q=Rambla%20Presidente%20Wilson%202180%20Montevideo&navigate=yes',
      },
    },
  ],

  // URL del Web App de Apps Script. Vacía = modo demo (nada se envía ni se guarda).
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbzQPJIrQXF_ktb0ePAYak7ZRCbgFWYIURG2Krbr0To33ujwwZ2dx6S2cTC1khxB6B6s/exec',

  rsvp: {
    fechaLimite: '2027-01-13T23:59:00-03:00',
    // Cupo máximo cuando la persona entra sin código de invitado (ella + acompañantes).
    lugaresSinCodigo: 2,
  },

  // Opciones de alimentación del RSVP (se pueden marcar varias). `id` es lo que se guarda en la planilla;
  // tienen que coincidir con ALIMENTACION_VALIDA en apps-script/Code.gs.
  alimentacion: [
    { id: 'vegetariano', nombre: 'Vegetariano/a' },
    { id: 'vegano', nombre: 'Vegano/a' },
    { id: 'celiaco', nombre: 'Celíaco/a' },
  ],

  // Cada persona elige hasta `bebidasMaximo`. `id` es lo que se guarda en la planilla (coincide con BEBIDAS_VALIDAS en Code.gs);
  // `icono` es opcional (si falta, se usa el id;
  // si no hay ícono con ese nombre en bebidas.js, se muestra una copa genérica).
  bebidasMaximo: 2,
  bebidas: [
    { id: 'cerveza', nombre: 'Cerveza' },
    { id: 'fernet', nombre: 'Fernet' },
    { id: 'whisky', nombre: 'Whisky' },
    { id: 'aperol', nombre: 'Aperol' },
    { id: 'gin', nombre: 'Gin' },
    { id: 'sin-alcohol', nombre: 'Sin alcohol' },
  ],

  // Por ahora solo se informa el tipo de vestimenta. `descripcion`, `nota` y `colores` son opcionales
  // (colores: [{ nombre: 'Verde oliva', valor: '#6b7240' }, ...] muestra una paleta sugerida).
  dressCode: {
    mostrar: true,
    tipo: 'Formal',
    descripcion: '',
    nota: '',
    colores: [],
  },

  regalos: {
    texto: 'Nuestro mejor regalo es compartir este día tan especial con vos. Pero si además querés hacernos un presente, te dejamos nuestros datos.',
    cuentas: [
      {
        banco: 'Itaú',
        moneda: 'Dólares (USD)',
        tipo: 'Caja de ahorro',
        titular: 'Virginia Cabral Liard',
        numero: '2615037',
      },
    ],
  },
};
