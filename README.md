# NexoWiFi

Panel web en español para diagnosticar y optimizar una red Wi‑Fi: muestra la salud de la conexión, latencia, escaneo de redes cercanas, congestión por canal y actividad reciente.

## Ejecutar en Windows

Requiere Node.js 18 o superior. El servidor debe ejecutarse en el mismo computador cuyo Wi‑Fi quieres revisar.

```bash
npm start
```

Abre `http://localhost:4173` en el navegador. Si el puerto está ocupado, el servidor prueba automáticamente el siguiente puerto y lo imprime en la terminal.

También puedes fijar uno manualmente:

```bash
PORT=8080 npm start
```

## Funciones reales en Windows

Cuando `server.js` se ejecuta en Windows, utiliza comandos locales del sistema:

- **Escanear mi red**: `netsh wlan show networks mode=bssid` para detectar SSID, señal, banda y canal de las redes cercanas.
- **Estado de conexión**: `netsh wlan show interfaces`, `ipconfig` y un ping a Cloudflare DNS para obtener adaptador, SSID, canal, gateway y latencia.
- **Reparación inteligente**: vacía el DNS con `ipconfig /flushdns` y renueva la dirección IP con `ipconfig /renew`. Esto actúa sobre el computador local y puede tardar unos segundos.
- **Panorama de canales**: calcula la congestión a partir del escaneo real.

En Linux, macOS o el preview remoto se mantiene el modo demo porque esos comandos y permisos son diferentes.

## Sobre cambiar el canal

El **canal del punto de acceso lo controla el router**, no el adaptador Wi‑Fi de Windows. Por seguridad no existe un comando universal que pueda cambiarlo en cualquier marca de router. NexoWiFi detecta automáticamente el gateway y la MAC del router mediante `ipconfig` y `arp`, y muestra un enlace para abrir su panel de administración.

Para automatizar también esa parte hace falta conocer la marca/modelo del router y conectar una API autenticada específica, por ejemplo TP-Link, ASUS, MikroTik, UniFi o la API del operador. No se deben enviar credenciales del router a un endpoint genérico.

## API

- `GET /api/status`
- `POST /api/scan`
- `POST /api/repair`
- `POST /api/channel`

## Ecualizador de música

La nueva página `equalizer.html` añade un ecualizador de 10 bandas usando Web Audio API:

- Carga archivos locales MP3, WAV, OGG o M4A.
- Presets Plano, Rock, Pop, Jazz y Voz.
- Ganancia independiente de 31 Hz a 16 kHz.
- Bypass, volumen, progreso, visualizador y reproducción local.
- Ningún archivo de audio se sube al servidor.

Con el servidor activo, abre `http://localhost:4173/equalizer.html` (o el puerto que indique `npm start`). También puedes entrar desde **Ecualizador** en la barra lateral del panel.

### Música online

- Para una radio o archivo de audio directo, pega su URL en el campo de URL. El servidor remoto debe permitir CORS.
- Para YouTube, Spotify Web y cualquier pestaña del navegador, carga la extensión local de Chrome/Edge desde la carpeta `extension/`: abre `chrome://extensions`, activa **Modo desarrollador**, pulsa **Cargar descomprimida** y selecciona esa carpeta. Después abre la pestaña de música, pulsa el icono de NexoWiFi y selecciona **Activar en esta pestaña**.
- La extensión procesa el audio renderizado de la pestaña y no lo graba. Algunas páginas con DRM pueden impedir la captura.
- Para ecualizar absolutamente todo el audio de Windows, incluidas aplicaciones de escritorio, hace falta un dispositivo de audio virtual o un driver de sistema; una web no puede interceptar ese audio por sus permisos de seguridad.
