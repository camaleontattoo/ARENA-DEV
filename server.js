import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(root, 'public');
const port = Number(process.env.PORT || 4173);

const state = {
  mode: 'demo',
  network: {
    name: 'Casa de Willian',
    router: 'NexoHub AX3000',
    channel: 44,
    band: '5 GHz',
    security: 'WPA3',
    health: 92,
    ping: 24,
    download: 286,
    upload: 74,
    lastScan: new Date().toISOString()
  },
  activity: [
    { type: 'success', title: 'Red analizada', detail: 'Sin problemas críticos', time: 'Hace 4 min' },
    { type: 'info', title: 'Canal optimizado', detail: 'Cambio a canal 44 aplicado', time: 'Ayer, 18:42' },
    { type: 'success', title: 'Firmware comprobado', detail: 'Tu router está actualizado', time: 'Ayer, 18:40' }
  ]
};

const devices = [
  { name: 'MacBook Pro de Willian', type: 'Portátil', ip: '192.168.1.12', signal: 94, band: '5 GHz', status: 'Excelente' },
  { name: 'iPhone de Willian', type: 'Móvil', ip: '192.168.1.18', signal: 88, band: '5 GHz', status: 'Excelente' },
  { name: 'TV Salón', type: 'Televisor', ip: '192.168.1.24', signal: 62, band: '2.4 GHz', status: 'Estable' },
  { name: 'Altavoz Nest', type: 'Altavoz', ip: '192.168.1.31', signal: 45, band: '2.4 GHz', status: 'Débil' }
];

const channels = [
  { channel: 36, load: 24, networks: 2, band: '5 GHz' },
  { channel: 40, load: 38, networks: 3, band: '5 GHz' },
  { channel: 44, load: 18, networks: 1, band: '5 GHz', mine: true },
  { channel: 48, load: 31, networks: 2, band: '5 GHz' },
  { channel: 149, load: 56, networks: 4, band: '5 GHz' },
  { channel: 153, load: 68, networks: 5, band: '5 GHz' },
  { channel: 1, load: 72, networks: 6, band: '2.4 GHz' },
  { channel: 6, load: 48, networks: 4, band: '2.4 GHz' },
  { channel: 11, load: 59, networks: 5, band: '2.4 GHz' }
];

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function body(request) {
  return new Promise((resolve, reject) => {
    let data = '';
    request.on('data', chunk => { data += chunk; });
    request.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('JSON inválido')); }
    });
    request.on('error', reject);
  });
}

function addActivity(type, title, detail) {
  state.activity.unshift({ type, title, detail, time: 'Ahora' });
  state.activity = state.activity.slice(0, 5);
}

function routeApi(request, response, pathname) {
  if (request.method === 'GET' && pathname === '/api/status') {
    return json(response, 200, { ...state, devices, channels });
  }

  if (request.method === 'POST' && pathname === '/api/scan') {
    state.network.lastScan = new Date().toISOString();
    state.network.health = 94;
    state.network.ping = 22;
    addActivity('success', 'Escaneo completado', 'No se encontraron interferencias críticas');
    return json(response, 200, {
      ok: true,
      message: 'Escaneo completado',
      scannedAt: state.network.lastScan,
      networksFound: 8,
      health: state.network.health,
      ping: state.network.ping,
      channels
    });
  }

  if (request.method === 'POST' && pathname === '/api/repair') {
    return body(request).then(payload => {
      const action = payload.action || 'smart';
      const messages = {
        smart: ['Diagnóstico terminado', 'Se optimizó el canal y se renovó la conexión'],
        dns: ['DNS renovado', 'La resolución de nombres vuelve a responder correctamente'],
        restart: ['Conexión reiniciada', 'El adaptador ya está conectado de nuevo'],
        interference: ['Interferencias reducidas', 'Se eligió el canal menos congestionado']
      };
      const [title, detail] = messages[action] || messages.smart;
      state.network.health = Math.min(99, state.network.health + 4);
      state.network.ping = Math.max(14, state.network.ping - 3);
      addActivity('success', title, detail);
      return json(response, 200, { ok: true, title, detail, health: state.network.health, ping: state.network.ping });
    }).catch(error => json(response, 400, { ok: false, error: error.message }));
  }

  if (request.method === 'POST' && pathname === '/api/channel') {
    return body(request).then(payload => {
      const channel = Number(payload.channel);
      const candidate = channels.find(item => item.channel === channel);
      if (!candidate || candidate.band !== '5 GHz') return json(response, 400, { ok: false, error: 'Canal no disponible' });
      state.network.channel = channel;
      state.network.health = Math.min(99, state.network.health + 2);
      addActivity('info', 'Canal optimizado', `Cambio a canal ${channel} aplicado`);
      return json(response, 200, { ok: true, channel, health: state.network.health });
    }).catch(error => json(response, 400, { ok: false, error: error.message }));
  }

  return json(response, 404, { error: 'Ruta no encontrada' });
}

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };

async function serveStatic(request, response, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = normalize(join(publicDir, safePath));
  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) return json(response, 404, { error: 'Archivo no encontrado' });
  try {
    const file = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream' });
    response.end(file);
  } catch { json(response, 500, { error: 'No se pudo leer el archivo' }); }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) return routeApi(request, response, url.pathname);
  return serveStatic(request, response, url.pathname);
});

function startServer(listenPort) {
  const onError = error => {
    if (error.code === 'EADDRINUSE' && !process.env.PORT && listenPort < 65000) {
      server.removeListener('error', onError);
      console.warn(`El puerto ${listenPort} está ocupado. Probando el puerto ${listenPort + 1}...`);
      startServer(listenPort + 1);
      return;
    }

    if (error.code === 'EADDRINUSE') {
      console.error(`El puerto ${listenPort} ya está en uso. Cierra el proceso que lo ocupa o inicia con PORT=4174 npm start.`);
    } else {
      console.error(error);
    }
    process.exit(1);
  };

  server.once('error', onError);
  server.listen(listenPort, '0.0.0.0', () => {
    console.log(`NexoWiFi listo en http://localhost:${listenPort}`);
    console.log('Modo demo: las acciones se simulan de forma segura en este entorno.');
  });
}

startServer(port);
