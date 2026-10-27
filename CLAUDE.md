# Invitación de casamiento web

Invitación de casamiento web de uso personal, inspirada en el modelo
[Olivos de Fixdate](https://www.fixdate.io/uy/modelo-invitacion/olivos).
Es inspiración visual y de estructura: no copiar textos, imágenes ni código de ese sitio.

## Contexto y restricciones

- **Público:** máximo ~300 invitados, uso durante ~5 meses. Después queda archivada.
- **Mantenimiento mínimo:** nada que haya que actualizar, renovar ni monitorear.
- **Costo cero:** sin hosting pago, sin base de datos paga, sin servicios con plan de pago.
- **Stack:** HTML, CSS y JavaScript vanilla. **Sin frameworks, sin librerías de UI, sin build step, sin npm.**
  Lo que se edita es lo que se publica.
- **Backend:** Google Sheets + Google Apps Script (publicado como Web App) para RSVP,
  elección de bebidas, sugerencia de canciones y datos de invitados.
- **Deploy:** GitHub Pages (sitio estático).
- **PWA:** instalable en el celular (manifest + service worker).
- **Mobile first:** se diseña para celular (~360–430 px) y se escala hacia arriba.
- **Idioma:** español rioplatense (Uruguay). Textos en voseo.

## Secciones (en orden de aparición)

1. **Portada:** nombres de los novios y fecha.
2. **Botón "Ingresar con música":** pantalla de entrada; al tocarlo arranca la música y se revela la invitación.
   (Los navegadores bloquean el autoplay con sonido: la música solo puede arrancar tras un gesto del usuario.)
   Debe haber un control para pausar/reanudar la música visible en todo momento.
3. **Cuenta regresiva** a la fecha del casamiento.
4. **Invitado personalizado por link** (`?i=codigo`): saludo con el nombre del invitado/familia
   y cantidad de lugares asignados. Sin código o con código inválido → invitación genérica, nunca un error.
5. **Ceremonia y fiesta:** lugar, hora, dirección, botón **Agendar** (Google Calendar + archivo `.ics`)
   y botón **Cómo llegar** (link a Google Maps / Waze).
6. **Confirmar asistencia (RSVP):** formulario que envía a Google Sheets vía Apps Script.
7. **Elegí tus bebidas:** multiselección de bebidas (opciones en `config.js`) que envía a Google Sheets vía Apps Script.
8. **Galería** de fotos.
9. **Sugerir canción:** formulario que envía a Google Sheets vía Apps Script.
10. **Dress code** (oculto por ahora: `dressCode.mostrar = false` en `config.js`).
11. **Tips** (alojamiento, estacionamiento, horarios, etc.).
12. **Regalos** (datos bancarios / lista; botón para copiar al portapapeles).

No hay sección de redes ni hashtag (se decidió quitarla).

## Decisiones técnicas

- **Todo el contenido editable vive en `assets/js/config.js`:** nombres, fecha/hora (con zona horaria
  `America/Montevideo`), lugares, direcciones, links de mapas, URL del Apps Script, datos de regalos,
  redes, textos de tips y dress code. Cambiar datos no debería requerir tocar HTML ni lógica.
- **JS con ES modules nativos** (`<script type="module">`), un módulo por funcionalidad.
- **Rutas relativas siempre** (`./assets/...`), porque GitHub Pages sirve el sitio bajo
  `/<nombre-repo>/`. Esto aplica también al `manifest` y al service worker.
- **Apps Script y CORS:** enviar con `fetch` usando `POST` y `Content-Type: text/plain`
  (cuerpo JSON como string) para evitar el preflight CORS, que Apps Script no soporta.
  Para leer datos (invitado por código) usar `GET` con query params.
- **Lista de invitados:** no publicar la lista completa en el repo (GitHub Pages es público).
  El nombre del invitado se obtiene del Apps Script por código (`GET ?i=codigo`).
  Los códigos deben ser no adivinables (no correlativos).
- **RSVP:** validar en cliente y también en Apps Script. Asociar la respuesta al código del invitado
  cuando exista. Prever reenvíos (la última respuesta por código prevalece).
- **Service worker:** cache-first para assets estáticos, network-only para llamadas al Apps Script.
  Versionar el nombre del cache (`CACHE_VERSION`) y subirlo en cada deploy que cambie assets.
  El `sw.js` va en la raíz para que su scope cubra todo el sitio.
- **Rendimiento:** imágenes en WebP/AVIF con tamaños adecuados, `loading="lazy"` en la galería,
  audio comprimido (MP3/AAC ~128 kbps), fuentes locales con `font-display: swap`.
- **Accesibilidad:** HTML semántico, `alt` en imágenes, contraste suficiente,
  respetar `prefers-reduced-motion`, foco visible, formularios con `<label>`.
- **Sin analytics ni cookies de terceros.**

## Convenciones

- CSS con custom properties (colores, tipografías, espaciados) definidas en `tokens.css`.
  Media queries `min-width` (mobile first).
- Nombres de clases en kebab-case, estilo BEM liviano (`seccion__elemento--modificador`).
- Código y comentarios en español; nombres de variables/funciones pueden ir en español o inglés,
  pero de forma consistente dentro de cada archivo.
- Comentarios solo donde aportan (el porqué, no el qué).

## Estructura de carpetas

```
/
├── index.html               # Página única con todas las secciones
├── manifest.webmanifest     # Manifest de la PWA
├── sw.js                    # Service worker (en la raíz por el scope)
├── CLAUDE.md
├── README.md                # Cómo configurar, desplegar y generar links de invitados
│
├── assets/
│   ├── css/
│   │   ├── tokens.css       # Variables: colores, tipografías, espaciados
│   │   ├── base.css         # Reset, tipografía, layout general
│   │   ├── components.css   # Botones, tarjetas, formularios, modal, reproductor
│   │   └── sections.css     # Estilos específicos de cada sección
│   │
│   ├── js/
│   │   ├── config.js        # TODOS los datos editables del casamiento
│   │   ├── main.js          # Punto de entrada: inicializa los módulos
│   │   ├── api.js           # Comunicación con Apps Script (GET/POST)
│   │   ├── intro.js         # Pantalla "Ingresar con música" + control de audio
│   │   ├── countdown.js     # Cuenta regresiva
│   │   ├── guest.js         # Lectura de ?i=codigo y personalización
│   │   ├── calendar.js      # Links de Google Calendar / descarga .ics
│   │   ├── rsvp.js          # Formulario de confirmación
│   │   ├── bebidas.js       # Formulario de elección de bebidas
│   │   ├── songs.js         # Formulario de sugerencia de canción
│   │   ├── gallery.js       # Galería / visor de fotos
│   │   ├── gifts.js         # Copiar datos de regalos al portapapeles
│   │   └── pwa.js           # Registro del service worker
│   │
│   ├── img/
│   │   ├── portada/         # Imagen(es) de la portada
│   │   ├── galeria/         # Fotos de la galería (WebP)
│   │   ├── decor/           # Ornamentos, ilustraciones, íconos SVG
│   │   └── icons/           # Íconos de la PWA (192, 512, maskable, apple-touch)
│   │
│   ├── audio/
│   │   └── cancion.mp3      # Música de fondo
│   │
│   ├── fonts/               # Tipografías locales (woff2)
│   │
│   └── calendar/
│       ├── ceremonia.ics
│       └── fiesta.ics
│
└── apps-script/             # Backend: se copia manualmente al editor de Apps Script
    ├── Code.gs              # doGet (invitado por código) y doPost (RSVP, bebidas, canciones)
    └── README.md            # Estructura de la planilla y pasos de publicación
```

## Google Sheets (pestañas previstas)

- `Invitados`: código, nombre a mostrar, lugares asignados, notas.
- `RSVP`: fecha, código, nombre, asiste (sí/no), cantidad, restricciones alimentarias, mensaje.
- `Bebidas`: fecha, código, nombre, bebidas (ids separados por coma, p. ej. `cerveza, gin`).
  Payload: `{ tipo: 'bebidas', codigo, nombre, bebidas: ['cerveza', 'gin'] }`.
  Validar en Apps Script que cada bebida sea una opción conocida. Con reenvíos, la última respuesta por código prevalece.
- `Canciones`: fecha, código, nombre, canción, artista.

## Deploy

- Rama `main` publicada con GitHub Pages desde la raíz.
- Antes de publicar: subir `CACHE_VERSION` en `sw.js` si cambiaron assets, y probar en celular real
  (instalación PWA, audio, formularios, links de mapas y calendario).
