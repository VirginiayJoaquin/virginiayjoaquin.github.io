# Invitación de casamiento

Sitio estático (HTML, CSS y JS vanilla, sin build). Ver `CLAUDE.md` para el contexto completo.

## Probar en local

Los ES modules no funcionan abriendo `index.html` con doble clic (`file://`): hace falta un servidor local.
Cualquiera sirve, por ejemplo:

```sh
python -m http.server 8000
```

y abrir <http://localhost:8000>.

## Editar los datos

Todo el contenido (nombres, fechas, lugares, regalos, tips, etc.) está en `assets/js/config.js`.

## Modo demo

Mientras `appsScriptUrl` esté vacía en `config.js`, el sitio funciona en modo demo:
los formularios simulan el envío (no se guarda nada) y hay dos códigos de invitado ficticios
para probar la personalización:

- `?i=demo-k7p2q` → Familia Rodríguez, 4 integrantes (pestañas)
- `?i=demo-r5t8w` → Familia Martínez, 3 integrantes (pestañas)
- `?i=demo-p3m8c` → Juan y acompañante (1 integrante + 1 acompañante sin nombre)
- `?i=demo-x9wfa` → Sofía, 1 lugar

## Pendiente

- Conectar el backend: seguir `apps-script/README.md` y poner la URL en `appsScriptUrl`.
- PWA (manifest, service worker, íconos).
- Fotos reales (WebP) en `assets/img/galeria/` y música en `assets/audio/cancion.mp3`.
