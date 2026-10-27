// Todos los datos editables del casamiento. Cambiar algo acá no debería requerir tocar HTML ni lógica.
// Los datos actuales son DE EJEMPLO: reemplazalos por los reales antes de publicar.
//
// Fechas: ISO 8601 con offset -03:00 (Uruguay no tiene horario de verano desde 2015,
// así que el offset es fijo todo el año).

export const config = {
  novios: {
    nombre1: 'Lucía',
    nombre2: 'Tomás',
  },

  // Fecha y hora a la que apunta la cuenta regresiva (normalmente, el inicio de la ceremonia).
  fecha: '2027-03-13T17:30:00-03:00',
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
      inicio: '2027-03-13T17:30:00-03:00',
      fin: '2027-03-13T18:30:00-03:00',
      lugar: 'Capilla del Olivar',
      direccion: 'Camino de los Olivos 1234, Canelones',
      descripcion: 'Te pedimos llegar 15 minutos antes.',
      mapas: {
        google: 'https://www.google.com/maps/search/?api=1&query=Camino+de+los+Olivos+1234+Canelones+Uruguay',
        waze: 'https://waze.com/ul?q=Camino%20de%20los%20Olivos%201234%20Canelones&navigate=yes',
      },
    },
    {
      id: 'fiesta',
      titulo: 'Fiesta',
      inicio: '2027-03-13T20:00:00-03:00',
      fin: '2027-03-14T05:00:00-03:00',
      lugar: 'Estancia Las Higueras',
      direccion: 'Ruta 8 km 32, Pando, Canelones',
      descripcion: 'Cena, brindis y baile hasta que salga el sol.',
      mapas: {
        google: 'https://www.google.com/maps/search/?api=1&query=Ruta+8+km+32+Pando+Canelones+Uruguay',
        waze: 'https://waze.com/ul?q=Ruta%208%20km%2032%20Pando&navigate=yes',
      },
    },
  ],

  // URL del Web App de Apps Script. Vacía = modo demo (nada se envía ni se guarda).
  appsScriptUrl: '',

  rsvp: {
    fechaLimite: '2027-02-13T23:59:00-03:00',
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
    tipo: 'Elegante sport',
    descripcion: 'Vení cómodo y elegante: la fiesta es al aire libre y sobre césped.',
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
      titulo: 'Alojamiento',
      texto: 'Hay hoteles y cabañas en Pando y Atlántida, a 15 minutos de la estancia. Escribinos si querés recomendaciones.',
    },
    {
      titulo: 'Estacionamiento',
      texto: 'La estancia tiene estacionamiento propio y gratuito, con personal de seguridad toda la noche.',
    },
    {
      titulo: 'Traslado',
      texto: 'Va a haber un ómnibus de vuelta a Montevideo a las 3:00 y a las 5:00. Si brindás, no manejes.',
    },
    {
      titulo: 'Calzado',
      texto: 'La fiesta es sobre césped: los tacos finos pueden ser un desafío. Pensá en taco ancho o plataforma.',
    },
  ],

  regalos: {
    texto: 'Lo más importante es que nos acompañes. Si además querés hacernos un regalo, te dejamos nuestros datos.',
    cuentas: [
      {
        banco: 'BROU',
        moneda: 'Pesos uruguayos',
        tipo: 'Caja de ahorro',
        titular: 'Lucía Fernández',
        numero: '001234567-00001',
      },
      {
        banco: 'BROU',
        moneda: 'Dólares',
        tipo: 'Caja de ahorro',
        titular: 'Lucía Fernández',
        numero: '001234567-00002',
      },
    ],
  },

  redes: {
    hashtag: '#LuciayTomás2027',
    texto: 'Compartí tus fotos y videos de la noche con nuestro hashtag.',
    instagram: {
      usuario: '@luciaytomas',
      url: 'https://www.instagram.com/',
    },
  },
};
