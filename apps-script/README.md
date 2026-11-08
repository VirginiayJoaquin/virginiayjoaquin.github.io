# Backend en Google Apps Script

La invitación guarda las respuestas en una planilla de Google Sheets. Un script pegado
dentro de esa planilla (`Code.gs`) funciona como "servidor": el sitio le pide el nombre
del invitado por código y le manda los formularios (RSVP, bebidas y canciones).

Es gratis, no vence y no hay que mantener nada. Hacelo todo con tu **cuenta personal de Google**.

## Pestañas de la planilla

Las crea el script (menú **Invitación → Preparar planilla**):

| Pestaña     | Columnas                                                          | Quién la llena |
|-------------|-------------------------------------------------------------------|----------------|
| `Invitados` | Código · Nombre a mostrar · Integrantes · Lugares · Notas · Link | Vos |
| `RSVP`      | Fecha · Código · Invitación · Nombre · Asiste · Alimentación · Otra indicación · Mensaje | El sitio |
| `Bebidas`   | Fecha · Código · Nombre · Bebidas | El sitio |
| `Canciones` | Fecha · Código · Nombre · Canción · Artista                       | El sitio       |

- En el sitio, las invitaciones para varias personas muestran **una pestaña por integrante**.
- **RSVP:** una fila por persona (si viene o no y su alimentación). Si vuelven a confirmar con
  el mismo link, se **reemplazan** todas las filas de esa invitación. El mensaje queda en la
  fila de la primera persona.
- **Bebidas:** hasta 2 bebidas por persona (p. ej. `cerveza, gin`). Se reemplaza solo si vuelve a enviar la misma persona
  (mismo link y mismo nombre, sin importar mayúsculas ni tildes).
- Sin código (alguien que entró sin link personal) siempre se agrega una fila nueva.
- En Canciones siempre se agrega una fila (cada uno puede sugerir varias).
- No cambies el orden de las columnas ni los nombres de las pestañas.

## Paso a paso (una sola vez)

### 1. Crear la planilla

1. Entrá a <https://sheets.new> con tu cuenta personal.
2. Arriba a la izquierda, ponele un nombre, por ejemplo *Casamiento Vicka y Joaco*.

### 2. Pegar el script

1. En la planilla: **Extensiones → Apps Script**. Se abre el editor en otra pestaña.
2. Arriba a la izquierda, cambiá "Proyecto sin título" por *Invitación*.
3. Vas a ver un archivo `Código.gs` con un `function myFunction() {}`. Borrá todo su contenido.
4. Copiá **todo** el contenido de `apps-script/Code.gs` de este repo y pegalo ahí.
5. Guardá con **Ctrl + S** (o el ícono del disquete).

### 3. Preparar la planilla y dar permisos

1. Volvé a la pestaña de la planilla y **recargá la página** (F5). Después de unos segundos
   aparece un menú nuevo arriba: **Invitación**.
2. **Invitación → Preparar planilla**.
3. La primera vez Google pide permiso:
   - "Se requiere autorización" → **Aceptar** → elegí tu cuenta.
   - Aparece **"Google no verificó esta app"**. Es normal: la app es tuya y nadie más la revisó.
     Tocá **Configuración avanzada** (abajo a la izquierda) → **Ir a Invitación (no seguro)** → **Permitir**.
4. Si después de autorizar no pasó nada, volvé a tocar **Invitación → Preparar planilla**.
   Tienen que aparecer las pestañas `Invitados`, `RSVP`, `Bebidas` y `Canciones`.
   La `Hoja 1` que venía por defecto la podés borrar.

### 4. Cargar invitados

En la pestaña `Invitados`, una fila por invitación (persona o familia):

- **Código:** dejalo vacío, lo genera el script.
- **Nombre a mostrar:** como querés que aparezca el saludo, p. ej. *Familia Pérez* o *Sofi*.
- **Integrantes:** el nombre de cada persona, separados por coma, p. ej.
  *Martín Pérez, Laura Gómez, Sofi Pérez*. Cada uno va a tener su pestaña en el sitio.
  Si la invitación es para una sola persona, podés dejarlo vacío y se usa el nombre a mostrar.
- **Lugares:** opcional. Dejalo vacío y se cuentan los integrantes. Ponelo solo si hay
  acompañantes sin nombre: p. ej. Integrantes *Juan Silva* y Lugares *2* → pestañas
  "Juan Silva" y "Acompañante", donde completan el nombre.
- **Notas:** lo que quieras, el sitio no lo muestra.

Después: **Invitación → Generar códigos y links**. Se completan el código y el link
personal de cada uno (p. ej. `https://virginiayjoaquin.github.io/?i=rak76k`).
Ese link es el que le mandás a cada invitado.

Podés agregar invitados en cualquier momento y volver a tocar **Generar códigos y links**:
no cambia los códigos que ya existen. **No hace falta volver a implementar** para esto.

### 5. Publicar el script como Web App

1. En el editor de Apps Script, arriba a la derecha: **Implementar → Nueva implementación**.
2. Al lado de "Seleccionar tipo", tocá el engranaje ⚙ → **Aplicación web**.
3. Completá:
   - **Descripción:** *v1*
   - **Ejecutar como:** *Yo (tu mail)*
   - **Quién tiene acceso:** *Cualquier persona* (no "Cualquier persona con cuenta de Google",
     porque los invitados no tienen que iniciar sesión).
4. **Implementar**. Si pide autorizar de nuevo, repetí lo del paso 3.
5. Copiá la **URL de la aplicación web** (termina en `/exec`).

### 6. Probar

1. Pegá la URL en el navegador. Tiene que mostrar:
   `{"ok":true,"mensaje":"La invitación está conectada."}`
2. Agregale `?i=` y un código de la pestaña Invitados, p. ej. `.../exec?i=rak76k`.
   Tiene que mostrar el nombre, los lugares y los integrantes de ese invitado.

### 7. Conectar el sitio

Poné la URL en `appsScriptUrl` dentro de `assets/js/config.js` y subí el cambio.
Desde ese momento el sitio sale del modo demo y guarda las respuestas de verdad.

## Si cambiás `Code.gs` más adelante

Guardar no alcanza: el sitio sigue usando la versión publicada. Para publicar el cambio:

**Implementar → Gestionar implementaciones →** lápiz ✏ **→ Versión: Nueva versión → Implementar.**

Así la URL sigue siendo la misma. **No uses "Nueva implementación"**: crea una URL distinta
y habría que cambiarla en `config.js`.

Si cambiás las bebidas, el máximo de bebidas o las opciones de alimentación en `config.js`,
actualizá también `BEBIDAS_VALIDAS`, `BEBIDAS_MAXIMO` o `ALIMENTACION_VALIDA` en `Code.gs` (y publicá una nueva versión);
si no, el script rechaza las opciones nuevas.

## Sobre la privacidad

- Con "Cualquier persona" cualquiera que tenga la URL puede usar el script, pero lo único
  que devuelve es el nombre y los integrantes de un código, y los códigos no se pueden adivinar.
- La planilla en sí sigue siendo privada: solo la ven vos y quien compartas.
- El script corre con tu cuenta, pero solo toca esta planilla.
