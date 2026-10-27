// Todos los datos editables del casamiento. Cambiar algo acá no debería requerir tocar HTML ni lógica.
// Los datos actuales son DE EJEMPLO: reemplazalos por los reales antes de publicar.
//
// Fechas: ISO 8601 con offset -03:00 (Uruguay no tiene horario de verano desde 2015,
// así que el offset es fijo todo el año).

export const config = {
  novios: {
    nombre1: 'Vicka',
    nombre2: 'Joaco',
  },

  // Fecha y hora a la que apunta la cuenta regresiva (normalmente, el inicio de la ceremonia).
  fecha: '2027-02-13T17:30:00-03:00',
  zonaHoraria: 'America/Montevideo',

  musica: {
    src: './assets/audio/cancion.mp3',
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

  eventos: [
    {
      id: 'ceremonia',
      titulo: 'Ceremonia',
      inicio: '2027-02-13T17:30:00-03:00',
      fin: '2027-02-13T18:30:00-03:00',
      lugar: 'AVA Experiencia Gourmet',
      direccion: 'Rbla. Pdte. Wilson 2180, 11300 Montevideo',
      descripcion: 'Al aire libre.',
      mapas: {
        google: 'https://www.google.com/maps/search/?api=1&query=AVA+Experiencia+Gourmet+Rambla+Presidente+Wilson+2180+Montevideo',
        waze: 'https://waze.com/ul?q=Rambla%20Presidente%20Wilson%202180%20Montevideo&navigate=yes',
      },
    },
    {
      id: 'fiesta',
      titulo: 'Fiesta',
      inicio: '2027-02-13T20:00:00-03:00',
      fin: '2027-02-14T05:00:00-03:00',
      lugar: 'AVA Experiencia Gourmet',
      direccion: 'Rbla. Pdte. Wilson 2180, 11300 Montevideo',
      descripcion: 'En el salón, a continuación de la ceremonia.',
      mapas: {
        google: 'https://www.google.com/maps/search/?api=1&query=AVA+Experiencia+Gourmet+Rambla+Presidente+Wilson+2180+Montevideo',
        waze: 'https://waze.com/ul?q=Rambla%20Presidente%20Wilson%202180%20Montevideo&navigate=yes',
      },
    },
  ],

  // URL del Web App de Apps Script. Vacía = modo demo (nada se envía ni se guarda).
  appsScriptUrl: '',

  rsvp: {
    fechaLimite: '2027-01-13T23:59:00-03:00',
    // Cupo máximo que se ofrece cuando la persona entra sin código de invitado.
    lugaresSinCodigo: 2,
  },

  galeria: [
    { src: './assets/img/galeria/foto-1.svg', alt: 'Foto de ejemplo 1' },
    { src: './assets/img/galeria/foto-2.svg', alt: 'Foto de ejemplo 2' },
    { src: './assets/img/galeria/foto-3.svg', alt: 'Foto de ejemplo 3' },
    { src: './assets/img/galeria/foto-4.svg', alt: 'Foto de ejemplo 4' },
    { src: './assets/img/galeria/foto-5.svg', alt: 'Foto de ejemplo 5' },
    { src: './assets/img/galeria/foto-6.svg', alt: 'Foto de ejemplo 6' },
  ],

  dressCode: {
    // false = la sección no se muestra (los datos quedan guardados para cuando se defina).
    mostrar: false,
    tipo: 'Elegante sport',
    descripcion: 'Vení cómodo y elegante.',
    nota: 'Te sugerimos tonos tierra y verdes. El blanco, para la novia.',
    colores: [
      { nombre: 'Verde oliva', valor: '#6b7240' },
      { nombre: 'Salvia', valor: '#b7bd98' },
      { nombre: 'Arena', valor: '#d9c7a3' },
      { nombre: 'Terracota', valor: '#b0694a' },
      { nombre: 'Marrón', valor: '#6d5240' },
    ],
  },

  tips: [
    {
      titulo: 'Ceremonia al aire libre',
      texto: 'La ceremonia es afuera, frente a la rambla: traé algo liviano por si se levanta viento. Después seguimos en el salón.',
    },
    {
      titulo: 'Alojamiento',
      texto: 'Si venís de afuera de Montevideo, escribinos y te pasamos recomendaciones de hoteles cerca.',
    },
    {
      titulo: 'Traslado',
      texto: 'Si brindás, no manejes: coordiná con alguien o pedí un taxi para la vuelta.',
    },
  ],

  regalos: {
    texto: 'Lo más importante es que nos acompañes. Si además querés hacernos un regalo, te dejamos nuestros datos.',
    cuentas: [
      {
        banco: 'BROU',
        moneda: 'Pesos uruguayos',
        tipo: 'Caja de ahorro',
        titular: 'Nombre del titular',
        numero: '001234567-00001',
      },
      {
        banco: 'BROU',
        moneda: 'Dólares',
        tipo: 'Caja de ahorro',
        titular: 'Nombre del titular',
        numero: '001234567-00002',
      },
    ],
  },
};
