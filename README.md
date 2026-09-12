# NexoWiFi

Panel web en español para diagnosticar y optimizar una red Wi‑Fi: muestra la salud de la conexión, latencia, dispositivos, congestión por canal y actividad reciente.

## Ejecutar

Requiere Node.js 18 o superior.

```bash
npm start
```

Abre `http://localhost:4173` en el navegador. Para usar otro puerto:

```bash
PORT=8080 npm start
```

## Qué se puede probar

- **Escanear mi red**: simula un escaneo y actualiza latencia, salud y actividad.
- **Reparación inteligente**: ejecuta un diagnóstico por pasos y aplica una optimización simulada.
- **Cambiar canal Wi‑Fi**: permite seleccionar un canal de 5 GHz y registra el cambio.
- **Panorama de canales**: alterna entre 5 GHz y 2.4 GHz.
- **Dispositivos e historial**: muestra los equipos conectados y los últimos cambios.

## Importante: conexión con hardware real

La interfaz y la API funcionan en modo demo seguro dentro de este repositorio. Una web abierta en el navegador **no puede cambiar directamente el canal del router ni reparar el adaptador Wi‑Fi**: el navegador no tiene esos permisos y, en el entorno de preview, el servidor tampoco está dentro de la red doméstica del usuario.

Para llevarlo a producción hay que conectar los endpoints de `server.js` a un agente local o a la API del router, por ejemplo:

1. Un agente firmado en la misma máquina del usuario que use `nmcli`/NetworkManager, `netsh` en Windows o `airport`/`networksetup` en macOS.
2. La API autenticada del router (cambio de canal, reinicio, firmware), nunca comandos recibidos directamente desde el navegador.
3. Permisos explícitos, validación de canales, confirmación antes de desconectar dispositivos y registro de auditoría.

Los endpoints ya están separados para esa integración: `GET /api/status`, `POST /api/scan`, `POST /api/repair` y `POST /api/channel`.
