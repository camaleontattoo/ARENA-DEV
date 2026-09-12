import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const root = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(root, 'public');
const port = Number(process.env.PORT || 4173);
const isWindows = process.platform === 'win32';

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

function cleanText(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function commandValue(output, labels) {
  const accepted = labels.map(cleanText);
  const line = output.split(/\r?\n/).find(item => {
    const normalized = cleanText(item.trimStart());
    return accepted.some(label => normalized.startsWith(`${label} :`));
  });
  return line ? line.slice(line.indexOf(':') + 1).trim() : '';
}

function numberValue(value) {
  const match = String(value || '').match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : null;
}

function windowsCommand(command) {
  if (!isWindows) return command;
  const systemRoot = process.env.SystemRoot || process.env.WINDIR || 'C:\\Windows';
  return join(systemRoot, 'System32', `${command}.exe`);
}

async function runLocalCommand(command, args, timeout = 15000) {
  const executable = windowsCommand(command);
  try {
    const result = await execFile(executable, args, { windowsHide: true, timeout, maxBuffer: 1024 * 1024 });
    return result.stdout || '';
  } catch (error) {
    error.command = `${executable} ${args.join(' ')}`;
    throw error;
  }
}

async function getWindowsInterface() {
  const output = await runLocalCommand('netsh', ['wlan', 'show', 'interfaces']);
  const stateValue = commandValue(output, ['State', 'Estado']);
  const signal = numberValue(commandValue(output, ['Signal', 'Señal']));
  const channel = numberValue(commandValue(output, ['Channel', 'Canal']));
  return {
    name: commandValue(output, ['Name', 'Nombre']),
    description: commandValue(output, ['Description', 'Descripción']),
    state: stateValue,
    connected: ['connected', 'conectado'].includes(cleanText(stateValue)),
    ssid: commandValue(output, ['SSID']),
    bssid: commandValue(output, ['BSSID']),
    channel,
    signal,
    radio: commandValue(output, ['Radio type', 'Tipo de radio']),
    receiveRate: numberValue(commandValue(output, ['Receive rate (Mbps)', 'Velocidad de recepción (Mbps)'])),
    transmitRate: numberValue(commandValue(output, ['Transmit rate (Mbps)', 'Velocidad de transmisión (Mbps)']))
  };
}

async function getGateway() {
  try {
    const output = await runLocalCommand('ipconfig', [], 8000);
    const match = output.match(/(?:Default Gateway|Puerta de enlace predeterminada)[^:]*:\s*([0-9.]+)/i);
    return match?.[1] || null;
  } catch { return null; }
}

async function getRouterMac(gateway) {
  if (!gateway) return null;
  try {
    const output = await runLocalCommand('arp', ['-a', gateway], 8000);
    const match = output.match(/([0-9a-f]{2}(?:[-:][0-9a-f]{2}){5})/i);
    return match?.[1] || null;
  } catch { return null; }
}

async function getPing() {
  try {
    const output = await runLocalCommand('ping', ['-n', '1', '-w', '1200', '1.1.1.1'], 5000);
    const match = output.match(/(?:time|tiempo)[=<]\s*(\d+)\s*ms/i);
    return match ? Number(match[1]) : null;
  } catch { return null; }
}

async function getWindowsStatus() {
  const [wifi, ping, gateway] = await Promise.all([getWindowsInterface(), getPing(), getGateway()]);
  const routerMac = await getRouterMac(gateway);
  const health = wifi.connected ? Math.min(99, Math.max(45, Math.round((wifi.signal || 50) * 0.55 + (ping ? Math.max(0, 45 - ping / 3) : 20)))) : 18;
  const band = wifi.channel && wifi.channel <= 14 ? '2.4 GHz' : '5 GHz';
  state.mode = 'local';
  state.network = {
    ...state.network,
    name: wifi.ssid || 'Sin conexión Wi-Fi',
    router: gateway ? `Router detectado en ${gateway}` : (wifi.description || 'Adaptador Wi-Fi'),
    channel: wifi.channel || state.network.channel,
    band,
    health,
    ping: ping || 0,
    security: 'Detectada localmente',
    gateway,
    adminUrl: gateway ? `http://${gateway}` : null,
    routerMac,
    bssid: wifi.bssid,
    adapter: wifi.name,
    signal: wifi.signal,
    lastScan: new Date().toISOString()
  };
  return { wifi, ping, gateway, network: state.network };
}

async function scanWindowsNetworks() {
  const output = await runLocalCommand('netsh', ['wlan', 'show', 'networks', 'mode=bssid'], 20000);
  const networks = [];
  let current = null;
  for (const line of output.split(/\r?\n/)) {
    const ssid = line.match(/^\s*SSID\s+\d+\s*:\s*(.*)$/i);
    if (ssid) {
      if (current?.ssid) networks.push(current);
      current = { ssid: ssid[1].trim() || '(red oculta)', signal: null, channel: null, security: null };
      continue;
    }
    if (!current) continue;
    const signal = line.match(/^\s*(?:Signal|Señal)\s*:\s*(\d+)%/i);
    const channel = line.match(/^\s*(?:Channel|Canal)\s*:\s*(\d+)/i);
    const security = line.match(/^\s*(?:Authentication|Autenticación)\s*:\s*(.*)$/i);
    if (signal) current.signal = Number(signal[1]);
    if (channel) current.channel = Number(channel[1]);
    if (security) current.security = security[1].trim();
  }
  if (current?.ssid) networks.push(current);
  return networks.map(item => ({ ...item, band: item.channel && item.channel <= 14 ? '2.4 GHz' : '5 GHz' }));
}

async function getLocalStatus() {
  if (!isWindows) return null;
  try { return await getWindowsStatus(); } catch (error) {
    return { error: `No se pudo leer el adaptador Wi-Fi: ${error.message}` };
  }
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
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

function channelsFromScan(networks, currentChannel) {
  const counts = new Map();
  networks.forEach(network => {
    if (network.channel) counts.set(network.channel, (counts.get(network.channel) || 0) + 1);
  });
  const knownChannels = [...new Set([...channels.map(item => item.channel), ...counts.keys(), currentChannel].filter(Boolean))];
  return knownChannels.map(channel => ({
    channel,
    band: channel <= 14 ? '2.4 GHz' : '5 GHz',
    networks: counts.get(channel) || 0,
    load: Math.min(96, (counts.get(channel) || 0) * 18 + (channel === currentChannel ? 10 : 0)),
    mine: channel === currentChannel
  }));
}

async function routeApi(request, response, pathname) {
  if (request.method === 'GET' && pathname === '/api/status') {
    const local = await getLocalStatus();
    if (local?.network) state.network = local.network;
    return json(response, 200, {
      ...state,
      devices: isWindows ? [] : devices,
      channels: state.channels || channels,
      local: local || null,
      platform: process.platform,
      real: Boolean(local?.network)
    });
  }

  if (request.method === 'POST' && pathname === '/api/scan') {
    if (isWindows) {
      try {
        const networks = await scanWindowsNetworks();
        const local = await getLocalStatus();
        if (local?.network) state.network = local.network;
        state.network.lastScan = new Date().toISOString();
        const scannedChannels = channelsFromScan(networks, state.network.channel);
        state.channels = scannedChannels;
        addActivity('success', 'Escaneo Wi-Fi local', `${networks.length} redes cercanas detectadas`);
        return json(response, 200, {
          ok: true,
          real: true,
          message: 'Escaneo Wi-Fi local completado',
          scannedAt: state.network.lastScan,
          networksFound: networks.length,
          networks,
          health: state.network.health,
          ping: state.network.ping,
          channels: scannedChannels
        });
      } catch (error) {
        console.error(`[scan] ${error.command || 'netsh'}\n${error.stack || error.message}`);
        return json(response, 500, { ok: false, real: true, error: `Windows no pudo escanear el Wi-Fi: ${error.message}` });
      }
    }

    state.network.lastScan = new Date().toISOString();
    state.network.health = 94;
    state.network.ping = 22;
    addActivity('success', 'Escaneo completado', 'No se encontraron interferencias críticas');
    return json(response, 200, {
      ok: true,
      real: false,
      message: 'Escaneo de demostración completado',
      scannedAt: state.network.lastScan,
      networksFound: 8,
      networks: [],
      health: state.network.health,
      ping: state.network.ping,
      channels
    });
  }

  if (request.method === 'POST' && pathname === '/api/repair') {
    return body(request).then(async payload => {
      const action = payload.action || 'smart';
      const messages = {
        smart: ['Conexión reparada', 'Se vació el DNS y se renovó la dirección IP'],
        dns: ['DNS renovado', 'La resolución de nombres vuelve a responder correctamente'],
        restart: ['Conexión comprobada', 'El adaptador Wi-Fi fue revisado'],
        interference: ['Interferencias analizadas', 'El escaneo local quedó actualizado']
      };
      const [title, detail] = messages[action] || messages.smart;

      if (isWindows) {
        // Estas acciones actúan sobre el equipo local. No cambian la configuración del router.
        const warnings = [];
        try {
          await runLocalCommand('ipconfig', ['flushdns'], 10000);
        } catch (error) {
          warnings.push(`No se pudo vaciar el DNS: ${error.stderr?.trim() || error.message}`);
        }

        if (action === 'smart') {
          let adapterName = '';
          try { adapterName = (await getWindowsInterface()).name; } catch { /* Se intentará el comando general. */ }
          try {
            await runLocalCommand('ipconfig', adapterName ? ['renew', adapterName] : ['renew'], 20000);
          } catch (error) {
            warnings.push(`Windows no pudo renovar la IP${adapterName ? ` de ${adapterName}` : ''}: ${error.stderr?.trim() || error.message}`);
          }
        }

        const local = await getLocalStatus();
        if (local?.network) state.network = local.network;
        const warning = warnings.join(' ');
        const finalDetail = warning ? `${detail}. Aviso: ${warning}` : detail;
        addActivity(warning ? 'info' : 'success', title, finalDetail);
        return json(response, 200, { ok: true, real: true, title, detail: finalDetail, warning: warning || null, health: state.network.health, ping: state.network.ping });
      }

      state.network.health = Math.min(99, state.network.health + 4);
      state.network.ping = Math.max(14, state.network.ping - 3);
      addActivity('success', title, detail);
      return json(response, 200, { ok: true, real: false, title, detail, health: state.network.health, ping: state.network.ping });
    }).catch(error => json(response, 400, { ok: false, error: error.message }));
  }

  if (request.method === 'POST' && pathname === '/api/channel') {
    return body(request).then(async payload => {
      const channel = Number(payload.channel);
      const candidate = (state.channels || channels).find(item => item.channel === channel);
      if (!candidate || candidate.band !== '5 GHz') return json(response, 400, { ok: false, error: 'Canal no disponible' });
      if (isWindows) {
        const gateway = await getGateway();
        const routerMac = await getRouterMac(gateway);
        return json(response, 409, {
          ok: false,
          real: true,
          code: 'ROUTER_CONTROL_REQUIRED',
          gateway,
          routerMac,
          adminUrl: gateway ? `http://${gateway}` : null,
          error: 'El canal lo controla el router. Windows puede analizar tu Wi-Fi, pero no cambiar el canal del punto de acceso sin la API y las credenciales del router.'
        });
      }
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
  if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    response.end();
    return;
  }
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
