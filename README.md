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
