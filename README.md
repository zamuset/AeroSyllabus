# AeroSyllabus

Prototipo de web app PWA privada para el programa de adiestramiento de pilotos. Sirve para recorrer el flujo de tres meses —syllabus, biblioteca, evaluaciones y liberación— antes de conectar un servidor.

## Qué es

AeroSyllabus es una aplicación web privada para capitanes, copilotos e instructores. No se publica en App Store ni en Play Store: se abre con una dirección que se comparte solo con el grupo de adiestramiento y, si se quiere, se instala desde el navegador en la pantalla de inicio. Cada persona entra con su rol, ve la ruta que le corresponde y puede consultar los temarios del programa aunque no haya red.

En este demo no hay backend. El acceso es simulado, los temarios viajan dentro del sitio y el avance se guarda en el propio iPad, teléfono o computadora. Cuando más adelante exista un servidor, esa misma información local es la que se enviaría al reconectar.

Los cinco PDF (AA 210, AA 260, AA 301, AA 302 y AA 310) son temarios de ejemplo para la biblioteca. No son manuales operativos de una aeronave.

## Qué se puede hacer hoy

- Entrar como capitán, copiloto o instructor.
- Recorrer un syllabus de tres meses y cuatro etapas. Capitán y copiloto ven rutas distintas; el instructor ve las dos.
- Abrir los PDF dentro de la app, sin salir a otra aplicación.
- Ver espacios reservados para video y diagramas.
- Marcar lecturas y sesiones. El instructor registra evaluaciones y, si hace falta, asigna repaso.
- Consultar o actualizar el estatus de liberación a línea.
- Simular un corte de red. Lo que se registre queda pendiente y, al “reconectar”, pasa a sincronizado. Ese envío es una simulación: no sale del dispositivo.

## Cómo abrirlo

El demo publicado está en [https://zamuset.github.io/AeroSyllabus/](https://zamuset.github.io/AeroSyllabus/). Cualquiera con ese enlace puede abrirlo. En el iPad o el teléfono se instala desde el navegador, con Compartir y luego Agregar a pantalla de inicio.

Para trabajar en local hace falta Node.js 22 o superior. En esta máquina puedes usar `nvm use` dentro de la carpeta del proyecto.

```bash
cd /Users/samuelchavez/Projects/AeroSyllabus
nvm use
npm install
npm start
```

`npm start` abre el sitio en el navegador, en `http://localhost:8081`. Esa sesión de desarrollo no instala la PWA: el service worker se genera al construir.

Para probarla como app instalable, con caché y sin la barra del navegador:

```bash
npm run build:web
npm run preview:pwa
```

El segundo comando sirve la carpeta `dist` en la raíz del equipo. El sitio público vive en `/AeroSyllabus`, así que la prueba fiel es la dirección de GitHub Pages.

Para volver a publicar después de un cambio:

```bash
npm run deploy
```

Eso construye `dist` y lo sube a la rama `gh-pages`. GitHub Pages sirve esa rama. En iPhone o iPad: Compartir y luego Agregar a pantalla de inicio, dejando activa la opción de abrir como app web. No hace falta cuenta de Apple ni de Google.

La interfaz está pensada primero para tablet y también se puede usar en teléfono o en una ventana ancha de escritorio. En el iPad conviene probar en horizontal y en vertical.

### Cuentas de demostración

La contraseña de las tres es `demo123`.

| Rol | Correo | Nombre en el demo |
| --- | --- | --- |
| Capitán | capitan@aerosyllabus.dev | Cap. Andrés Molina |
| Copiloto | copiloto@aerosyllabus.dev | C.P. Laura Vidal |
| Instructor | instructor@aerosyllabus.dev | Instr. Helena Ruiz |

Para ver la cola de sincronización: entra, pulsa “Simular corte de red”, marca una lectura o guarda una evaluación, y después pulsa “Simular reconexión”.

## Dónde agregar imágenes

El demo ya trae ilustraciones de ejemplo en cada hueco. Para sustituir una:

1. Reemplaza el archivo de la tabla, con ese mismo nombre.
2. Deja activo el `require(...)` de esa ruta en `src/data/images.ts`.

Metro solo incluye una imagen si ese `require` existe y la ruta es literal. Si quitas el `require`, el recuadro vuelve a decir “Imagen pendiente”.

| Archivo | Dónde se ve |
| --- | --- |
| `assets/images/marca/logo.png` | Acceso y barra lateral |
| `assets/images/login/cabina.jpg` | Panel de acceso |
| `assets/images/syllabus/etapa-induccion.jpg` | Etapa 1 del syllabus |
| `assets/images/syllabus/etapa-vuelo.jpg` | Etapa 2 del syllabus |
| `assets/images/syllabus/etapa-debrief.jpg` | Etapa 3 del syllabus |
| `assets/images/syllabus/etapa-assessment.jpg` | Etapa 4 del syllabus |
| `assets/images/biblioteca/video-inspeccion-prevuelo.jpg` | Video de inspección pre-vuelo |
| `assets/images/biblioteca/video-aproximacion.jpg` | Video de aproximación |
| `assets/images/biblioteca/esquema-cabina.jpg` | Diagrama de cabina |
| `assets/images/biblioteca/panel-instrumentos.jpg` | Panel de instrumentos |
| `assets/icon.png` | Icono de la app en el dispositivo |
| `assets/splash-icon.png` | Imagen de arranque |
| `assets/android-icon-foreground.png` | Icono adaptable de Android |

Los videos en sí no se reproducen todavía. Esas tarjetas son el lugar donde después irá el archivo, junto con su imagen de portada.

## Cómo está armado

Es una web app de una sola página, hecha con Expo para web. El navegador es el destino de esta rama. El manifiesto en `public/manifest.json` la declara instalable (`display: standalone`) y `public/robots.txt` pide a los buscadores que no la indexen. `npm run build:web` exporta el sitio a `dist` y Workbox escribe `dist/sw.js`, que guarda en caché las pantallas, las imágenes, los PDF y la base local para abrirlos sin red.

```text
src/app/                Pantallas. Cada archivo es una ruta.
  login.tsx             Acceso simulado
  (main)/inicio.tsx     Inicio según el rol
  (main)/syllabus/      Programa de tres meses y detalle de sesión
  (main)/biblioteca/    PDF, videos y diagramas
  (main)/evaluaciones/  Lista y registro del instructor
  (main)/liberacion.tsx Estatus de liberación
src/components/         Barra de navegación, tarjetas y visor PDF
src/data/               Temario, usuarios, textos y el mapa de imágenes
src/db/                 SQLite: tablas, lecturas y escrituras
src/state/              Sesión, conectividad simulada y datos en memoria de pantalla
src/theme/              Color y ancho a partir del cual la pantalla se trata como tablet
assets/manuales/        PDF de ejemplo que viajan dentro de la app
assets/images/          Carpetas listas para las fotos
assets/vendor/          PDF.js, el visor que dibuja los PDF dentro de la app
```

El grupo `(main)` no aparece en la dirección de la pantalla. Solo agrupa las vistas que ya exigen una sesión.

El temario no está en la base de datos. Vive en `src/data/catalog.ts`, porque en este prototipo no cambia. En SQLite solo se guarda lo que la persona hace: sesión activa, lecturas, evaluaciones, liberación y la cola de pendientes.

### Datos en el dispositivo

La base se llama `aerosyllabus.db` y la abre `expo-sqlite` dentro del navegador (SQLite compilado a WebAssembly, guardado en el almacenamiento del sitio). Al arrancar, la app pide al navegador que marque ese almacenamiento como persistente. Permanece al cerrar la pestaña o la app instalada, salvo que la persona borre los datos del sitio.

- `meta`: quién inició sesión y si la simulación está en línea o sin conexión.
- `session_progress`: pendiente, en progreso, completada o repaso asignado.
- `reading_progress`: si un material ya se consultó.
- `evaluations`: maniobra, resultado, notas y si se pidió repaso.
- `release_status`: en adiestramiento, en revisión o liberado a línea.
- `sync_queue`: cada cambio hecho sin conexión.

Si la simulación está en línea, el registro se guarda ya como sincronizado. Si está sin conexión, queda pendiente. Al volver a “en línea”, esos pendientes se marcan enviados. No hay red real ni servidor: el interruptor existe para enseñar el flujo que después hará la sincronización de verdad.

Los PDF se leen del propio sitio, así que también abren sin red una vez que el service worker los guardó. El visor usa PDF.js (licencia Apache 2.0, nota en `assets/vendor/PDFJS-LICENCIA.txt`).

### Roles

- El capitán ve su ruta, que incluye la lectura de alta velocidad y la de trayectorias, y consulta la liberación de los dos pilotos.
- El copiloto ve su ruta, con la lectura de baja velocidad, y solo su propio estatus de liberación.
- El instructor ve todo el programa, escribe evaluaciones y cambia la liberación.

Una evaluación “dominada” completa la sesión de ese piloto. “A reforzar” la deja en progreso. “No aprobada” o la casilla de repaso la dejan como repaso asignado.

## Qué todavía no está

- No hay API, usuarios reales ni recuperación de contraseña.
- No está en las tiendas. Se instala desde el navegador, en una dirección privada.
- El video no se reproduce. Los diagramas esperan las imágenes.
- El calendario son semanas del programa (semana 1 a semana 12), no fechas de un simulador real.

## Ramas

`main` y `feature/mvp-prototipo` conservan el prototipo móvil con Expo Go. `feature/pwa-privada` es esta web app instalable.
