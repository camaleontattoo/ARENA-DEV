const iconPaths = {
  grid: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/>',
  radar: '<circle cx="12" cy="12" r="8.5"/><path d="M12 12l6-6M12 5v2M5 12h2M12 19v-2M19 12h-2"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h10M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
  music: '<path d="M9 18V5l10-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3ZM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z"/>',
  devices: '<rect x="3" y="4" width="12" height="9" rx="1.5"/><path d="M7 17h4M9 13v4M18 8h3v10h-3M19.5 15.5h.01"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  settings: '<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .1.1-1.7 2.9-.2-.1a2.1 2.1 0 0 0-2.1 0l-.3.2a2.1 2.1 0 0 0-1 1.8v.2H10.8v-.2a2.1 2.1 0 0 0-1-1.8l-.3-.2a2.1 2.1 0 0 0-2.1 0l-.2.1-1.7-2.9.1-.1a2.1 2.1 0 0 0 1-1.8v-.4a2.1 2.1 0 0 0-1-1.8l-.1-.1 1.7-2.9.2.1a2.1 2.1 0 0 0 2.1 0l.3-.2a2.1 2.1 0 0 0 1-1.8v-.2h3.4v.2a2.1 2.1 0 0 0 1 1.8l.3.2a2.1 2.1 0 0 0 2.1 0l.2-.1 1.7 2.9-.1.1a2.1 2.1 0 0 0-1 1.8v.4a2.1 2.1 0 0 0 1 1.8Z"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.7-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14.7 4L20 15m0 5v-5h-5"/>',
  shield: '<path d="M12 3 19 6v5c0 4.7-3 8-7 10-4-2-7-5.3-7-10V6l7-3Z"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/>',
  activity: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16"/>',
  spark: '<path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z"/>',
  wand: '<path d="m15 4 5 5M4 20l9.5-9.5M12 6l1 2.5L15.5 10 13 11l-1 2.5-1-2.5-2.5-1L11 8.5 12 6ZM19 14l.6 1.4L21 16l-1.4.6L19 18l-.6-1.4L17 16l1.4-.6L19 14Z"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2"/>',
  router: '<path d="M4 9h16v9H4zM7 9l2-4h6l2 4M8 13h.01M12 13h.01M16 13h.01M8 16h8"/>',
  lightbulb: '<path d="M9 18h6M10 22h4M8 14.5a6 6 0 1 1 8 0c-.8.7-1 1.2-1 2.5H9c0-1.3-.2-1.8-1-2.5Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  laptop: '<rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M2 19h20M9 19l1-3h4l1 3"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4M11 18.5h2"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="m8 21 2-4h4l2 4M7 21h10"/>',
  speaker: '<path d="M5 9h3l4-4v14l-4-4H5V9Z"/><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
};

const fallbackState = {
  network: { name: 'Casa de Willian', channel: 44, band: '5 GHz', health: 92, ping: 24 },
  devices: [
    { name: 'MacBook Pro de Willian', type: 'Portátil', ip: '192.168.1.12', signal: 94, band: '5 GHz', status: 'Excelente' },
    { name: 'iPhone de Willian', type: 'Móvil', ip: '192.168.1.18', signal: 88, band: '5 GHz', status: 'Excelente' },
    { name: 'TV Salón', type: 'Televisor', ip: '192.168.1.24', signal: 62, band: '2.4 GHz', status: 'Estable' },
    { name: 'Altavoz Nest', type: 'Altavoz', ip: '192.168.1.31', signal: 45, band: '2.4 GHz', status: 'Débil' }
  ],
  channels: [36, 40, 44, 48, 149, 153, 1, 6, 11].map((channel, index) => ({ channel, load: [24, 38, 18, 31, 56, 68, 72, 48, 59][index], networks: 2, band: index < 6 ? '5 GHz' : '2.4 GHz', mine: channel === 44 })),
  activity: []
};

let state = fallbackState;
let activeBand = '5 GHz';
let toastTimer;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function svgIcon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.info}</svg>`;
}

function hydrateIcons() {
  $$('[data-icon]').forEach(node => {
    const name = node.dataset.icon;
    node.innerHTML = svgIcon(name);
  });
}

function esc(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function deviceIcon(type) {
  if (type === 'Portátil') return 'laptop';
  if (type === 'Móvil') return 'phone';
  if (type === 'Televisor') return 'tv';
  return 'speaker';
}

function renderHealth() {
  const health = Number(state.network.health || 92);
  const ping = Number(state.network.ping || 24);
  $('#health-value').textContent = health;
  $('#ring-value').textContent = health;
  $('#health-title').textContent = health >= 80 ? 'Tu red está estable' : health >= 50 ? 'Tu red necesita revisión' : 'Tu red necesita atención';
  $('#health-description').textContent = health >= 80 ? 'La conexión funciona bien y no hemos encontrado problemas importantes.' : 'Hemos detectado una señal o conexión débil. Ejecuta la reparación para revisar tu equipo.';
  $('#health-label').textContent = health >= 80 ? 'Excelente' : health >= 50 ? 'Revisar' : 'Débil';
  $('#health-bar').style.width = `${health}%`;
  $('.health-ring').style.background = `conic-gradient(var(--cyan) 0deg ${health * 3.6}deg, #18313f ${health * 3.6}deg 360deg)`;
  $('#ping-value').textContent = ping;
  $('#network-name').textContent = state.network.name || 'Sin conexión Wi-Fi';
  $('#network-type').textContent = state.network.gateway ? `${state.network.routerVendor || 'Router'} · ${state.network.gateway}` : 'Red doméstica';
  $('#current-channel').textContent = state.network.channel;
  $('#footer-time').textContent = state.network.lastScan ? formatLastScan(state.network.lastScan) : 'hace 2 min';
}

function formatLastScan(iso) {
  const then = new Date(iso);
  const minutes = Math.max(1, Math.round((Date.now() - then.getTime()) / 60000));
  return minutes < 2 ? 'ahora mismo' : `hace ${minutes} min`;
}

function renderChannels() {
  const items = state.channels.filter(item => item.band === activeBand);
  const max = Math.max(...items.map(item => item.load), 100);
  $('.bars').innerHTML = items.map(item => {
    const level = item.load >= 60 ? 'high' : item.load >= 35 ? 'mid' : 'low';
    const selected = item.channel === state.network.channel;
    return `<div class="bar-item ${selected ? 'selected' : ''}" title="Canal ${item.channel}: ${item.load}% de uso"><div class="bar-fill ${level}" style="height:${Math.max(8, item.load / max * 88)}%"></div><span class="bar-label">${item.channel}</span></div>`;
  }).join('');
}

function renderDevices() {
  if (!state.devices?.length) {
    $('#device-list').innerHTML = '<div class="empty-state"><span data-icon="info"></span><div><strong>Dispositivos no expuestos por Windows</strong><small>El escaneo local se centra en redes y señal Wi-Fi.</small></div></div>';
    const icon = $('#device-list [data-icon]');
    if (icon) icon.innerHTML = svgIcon('info');
    return;
  }
  $('#device-list').innerHTML = state.devices.map(device => `<div class="device-row">
    <div class="device-avatar">${svgIcon(deviceIcon(device.type))}</div>
    <div class="device-name"><strong>${esc(device.name)}</strong><span>${esc(device.ip)}</span></div>
    <span class="device-band">${esc(device.band)}</span>
    <span class="device-status ${device.status === 'Débil' ? 'weak' : ''}"><i></i>${esc(device.status)}</span>
  </div>`).join('');
}

function renderActivity() {
  const activities = state.activity?.length ? state.activity : [
    { type: 'success', title: 'Red analizada', detail: 'Sin problemas críticos', time: 'Hace 4 min' },
    { type: 'info', title: 'Canal optimizado', detail: 'Cambio a canal 44 aplicado', time: 'Ayer, 18:42' },
    { type: 'success', title: 'Firmware comprobado', detail: 'Tu router está actualizado', time: 'Ayer, 18:40' }
  ];
  $('#activity-list').innerHTML = activities.slice(0, 3).map(item => `<div class="activity-item"><div class="activity-mark ${item.type === 'info' ? 'info' : ''}">${svgIcon(item.type === 'info' ? 'radio' : 'check')}</div><div class="activity-copy"><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></div><time class="activity-time">${esc(item.time)}</time></div>`).join('');
}

function render() {
  renderHealth();
  renderChannels();
  renderDevices();
  renderActivity();
}

function apiBases() {
  // Live Server suele usar 5500. Permitimos usarlo como frontend, pero las API
  // siempre se resuelven contra el backend de npm start.
  if (window.location.port === '5500') return ['http://localhost:4173', 'http://localhost:4174'];
  return [''];
}

async function api(path, options = {}) {
  // También soporta abrir public/index.html directamente como archivo estático.
  if (window.location.protocol === 'file:') return localApi(path, options);
  let lastError;
  let demoFallback;
  const bases = apiBases();
  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.error || `El servidor respondió con HTTP ${response.status}`);
        error.details = data;
        error.status = response.status;
        // Si encontramos otro servidor en 4173/4174, probamos el siguiente.
        if ((response.status === 404 || response.status === 405) && base !== bases.at(-1)) {
          lastError = error;
          continue;
        }
        throw error;
      }
      // Si 4173 responde con una demo antigua y 4174 tiene el agente local,
      // preferimos el resultado real. Si 4174 no existe, conservamos la demo.
      if (data.real === false && base !== bases.at(-1)) {
        demoFallback = data;
        continue;
      }
      return data;
    } catch (error) {
      lastError = error;
      if (error.details && error.status !== 404 && error.status !== 405) throw error;
    }
  }
  if (demoFallback) return demoFallback;
  throw lastError || new Error(`No se pudo conectar con NexoWiFi. Comprueba que npm start siga ejecutándose.`);
}

async function localApi(path, options = {}) {
  await new Promise(resolve => setTimeout(resolve, 280));
  const payload = options.body ? JSON.parse(options.body) : {};
  if (path === '/api/status') return { ...state, mode: 'local', activity: state.activity || [], devices: state.devices, channels: state.channels };
  if (path === '/api/scan') {
    state.network.health = 94;
    state.network.ping = 22;
    state.network.lastScan = new Date().toISOString();
    state.activity = [{ type: 'success', title: 'Escaneo completado', detail: 'No se encontraron interferencias críticas', time: 'Ahora' }, ...(state.activity || [])].slice(0, 5);
    return { ok: true, message: 'Escaneo completado', scannedAt: state.network.lastScan, networksFound: 8, health: state.network.health, ping: state.network.ping, channels: state.channels };
  }
  if (path === '/api/repair') {
    state.network.health = Math.min(99, state.network.health + 4);
    state.network.ping = Math.max(14, state.network.ping - 3);
    state.activity = [{ type: 'success', title: 'Diagnóstico terminado', detail: 'Se optimizó el canal y se renovó la conexión', time: 'Ahora' }, ...(state.activity || [])].slice(0, 5);
    return { ok: true, title: 'Diagnóstico terminado', detail: 'Se optimizó el canal y se renovó la conexión', health: state.network.health, ping: state.network.ping };
  }
  if (path === '/api/channel') {
    const channel = Number(payload.channel);
    state.network.channel = channel;
    state.network.health = Math.min(99, state.network.health + 2);
    state.activity = [{ type: 'info', title: 'Canal optimizado', detail: `Cambio a canal ${channel} aplicado`, time: 'Ahora' }, ...(state.activity || [])].slice(0, 5);
    return { ok: true, channel, health: state.network.health };
  }
  throw new Error('Ruta no encontrada');
}

function renderScanResults(networks = [], real = false) {
  const summary = $('#scan-summary');
  const list = $('#scan-results');
  $('#scan-mode').textContent = real ? 'Escaneo directo del adaptador Wi-Fi' : 'Modo demostración';
  $('#scan-count').textContent = networks.length;
  if (!networks.length) {
    list.innerHTML = '<div class="scan-empty"><span data-icon="info"></span><strong>No se encontraron redes cercanas</strong><small>Comprueba que el Wi-Fi esté activado en Windows y vuelve a intentarlo.</small></div>';
    list.querySelector('[data-icon]').innerHTML = svgIcon('info');
  } else {
    list.innerHTML = networks.map(network => `<div class="scan-row"><div class="scan-network-icon">${svgIcon('radio')}</div><div class="scan-network-copy"><strong>${esc(network.ssid || '(red oculta)')}</strong><small>${esc(network.security || 'Seguridad no indicada')} · ${esc(network.band || 'banda desconocida')}</small></div><span class="scan-channel">Canal ${esc(network.channel ?? '—')}</span><div class="scan-signal"><span class="signal-meter"><i style="width:${Math.max(8, Number(network.signal || 0))}%"></i></span><small>${esc(network.signal ?? '—')}%</small></div></div>`).join('');
  }
  summary.hidden = false;
}

function showToast(message) {
  $('#toast-message').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3600);
}

function setLoading(button, loading, label) {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.classList.add('is-spinning');
    button.disabled = true;
    button.innerHTML = `${svgIcon('refresh')} ${label || 'Trabajando…'}`;
  } else {
    button.classList.remove('is-spinning');
    button.disabled = false;
    if (button.dataset.originalText) button.innerHTML = button.dataset.originalText;
  }
}

function openModal(id) {
  $('#modal-backdrop').hidden = false;
  $(`#${id}`).hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModals() {
  $('#modal-backdrop').hidden = true;
  $$('.modal').forEach(modal => { modal.hidden = true; });
  document.body.style.overflow = '';
}

function openRepair() {
  closeModals();
  $$('.repair-step').forEach((step, index) => { step.classList.toggle('active', index === 0); step.classList.remove('done'); });
  $('#repair-result').hidden = true;
  const button = $('#run-repair');
  button.disabled = false;
  button.innerHTML = `${svgIcon('spark')} Iniciar reparación`;
  openModal('repair-modal');
}

async function runRepair() {
  const button = $('#run-repair');
  button.disabled = true;
  button.innerHTML = `${svgIcon('refresh')} Analizando…`;
  const steps = $$('.repair-step');
  steps.forEach(step => step.classList.remove('active', 'done'));
  for (let index = 0; index < steps.length; index += 1) {
    steps[index].classList.add('active');
    await new Promise(resolve => setTimeout(resolve, index === 0 ? 850 : 1050));
    steps[index].classList.remove('active');
    steps[index].classList.add('done');
  }
  try {
    const result = await api('/api/repair', { method: 'POST', body: JSON.stringify({ action: 'smart' }) });
    state.network.health = result.health;
    state.network.ping = result.ping;
    const status = await api('/api/status');
    state.activity = status.activity;
    render();
    $('#repair-result-title').textContent = result.warning ? 'Reparación parcial' : '¡Tu red está optimizada!';
    $('#repair-result-detail').textContent = result.warning || 'Hemos reducido la latencia y elegido una ruta más estable.';
    $('#repair-result').hidden = false;
    showToast(result.warning ? 'Reparación parcial: revisa el aviso' : (result.real ? 'Conexión local reparada' : 'Reparación de demostración completada'));
  } catch (error) {
    $('#repair-result').hidden = true;
    showToast(error.message);
  }
  button.disabled = false;
  button.innerHTML = `${svgIcon('check')} Listo`;
}

function renderRouterDiscovery(info = state.network) {
  const detail = $('#router-discovery-detail');
  const link = $('#router-admin-link');
  const title = $('#router-discovery strong');
  if (!detail || !link || !title) return;
  if (info?.gateway) {
    title.textContent = info.routerVendor ? `${info.routerVendor} detectado` : 'Router detectado';
    detail.textContent = `Gateway ${info.gateway}${info.routerMac ? ` · MAC ${info.routerMac}` : ''}`;
    link.href = info.adminUrl || `http://${info.gateway}`;
    link.hidden = false;
  } else {
    title.textContent = 'No se encontró el gateway';
    detail.textContent = 'Comprueba que el equipo esté conectado a una red Wi-Fi.';
    link.hidden = true;
  }
}

function openChannelModal() {
  closeModals();
  renderRouterDiscovery();
  const options = state.channels.filter(item => item.band === '5 GHz').sort((a, b) => a.load - b.load).slice(0, 3);
  $('#channel-options').innerHTML = options.map((item, index) => `<label class="channel-option ${index === 0 ? 'recommended' : ''}"><input type="radio" name="channel" value="${item.channel}" ${item.channel === state.network.channel || (index === 0 && !options.some(option => option.channel === state.network.channel)) ? 'checked' : ''} /><span class="radio-ui"></span><span><strong>Canal ${item.channel}</strong><small>${index === 0 ? 'Muy despejado · recomendado' : item.load < 40 ? 'Despejado' : 'Estable'}</small></span><em>${item.load}% uso</em>${index === 0 ? '<b>MEJOR</b>' : ''}</label>`).join('');
  openModal('channel-modal');
}

async function applyChannel() {
  const selected = Number(document.querySelector('input[name="channel"]:checked')?.value);
  const button = $('#apply-channel');
  setLoading(button, true, 'Aplicando…');
  try {
    const result = await api('/api/channel', { method: 'POST', body: JSON.stringify({ channel: selected }) });
    state.network.channel = result.channel;
    state.network.health = result.health;
    const status = await api('/api/status');
    state.activity = status.activity;
    render();
    closeModals();
    showToast(`Canal ${selected} aplicado correctamente`);
  } catch (error) {
    if (error.details?.code === 'ROUTER_CONTROL_REQUIRED') {
      renderRouterDiscovery({ gateway: error.details.gateway, routerMac: error.details.routerMac, routerVendor: error.details.routerVendor, adminUrl: error.details.adminUrl });
      const gateway = error.details.gateway ? ` Router detectado en ${error.details.gateway}.` : '';
      showToast(`El canal se cambia en el router, no en Windows.${gateway}`);
    } else {
      showToast(error.message);
    }
  } finally { setLoading(button, false); }
}

async function scanNetwork(button) {
  setLoading(button, true, 'Escaneando…');
  try {
    const result = await api('/api/scan', { method: 'POST' });
    state.network.health = result.health;
    state.network.ping = result.ping;
    state.network.lastScan = result.scannedAt;
    state.channels = result.channels;
    const status = await api('/api/status');
    state.activity = status.activity;
    render();
    if (result.real) {
      renderScanResults(result.networks, true);
      openModal('scan-modal');
    } else {
      showToast(`Escaneo de demostración: ${result.networksFound} redes`);
    }
  } catch (error) {
    showToast(error.message);
  } finally { setLoading(button, false); }
}

function setActiveView(view) {
  $$('.nav-item[data-view]').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  const title = view === 'overview' ? 'Resumen' : view === 'scan' ? 'Escanear red' : view === 'optimize' ? 'Optimizar' : view === 'devices' ? 'Dispositivos' : 'Historial';
  $('.breadcrumb strong').textContent = title;
  if (view !== 'overview') showToast(`${title}: usa las acciones rápidas para continuar`);
  $('#sidebar').classList.remove('open');
}

async function init() {
  hydrateIcons();
  try { state = await api('/api/status'); } catch { /* La interfaz sigue funcionando con datos de demostración. */ }
  render();

  $$('[data-action="repair"]').forEach(button => button.addEventListener('click', openRepair));
  $$('[data-action="channel"]').forEach(button => button.addEventListener('click', openChannelModal));
  $$('[data-action="scan"]').forEach(button => button.addEventListener('click', () => scanNetwork(button)));
  $('#run-repair').addEventListener('click', runRepair);
  $('#apply-channel').addEventListener('click', applyChannel);
  $$('[data-close-modal]').forEach(button => button.addEventListener('click', closeModals));
  $('#modal-backdrop').addEventListener('click', closeModals);
  $('.tip-box button').addEventListener('click', event => event.currentTarget.closest('.tip-box').remove());

  $$('.segment').forEach(button => button.addEventListener('click', () => {
    $$('.segment').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    activeBand = button.dataset.band;
    renderChannels();
  }));
  $$('.nav-item[data-view]').forEach(button => button.addEventListener('click', () => setActiveView(button.dataset.view)));
  $$('[data-view-target]').forEach(button => button.addEventListener('click', () => setActiveView(button.dataset.viewTarget)));
  $('.mobile-menu').addEventListener('click', () => {
    const sidebar = $('#sidebar');
    const open = sidebar.classList.toggle('open');
    $('.mobile-menu').setAttribute('aria-expanded', String(open));
  });
  $('.notification-button').addEventListener('click', () => showToast('No tienes notificaciones nuevas'));
  $$('[data-action="settings"]').forEach(button => button.addEventListener('click', () => showToast('La configuración estará disponible pronto')));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModals(); });
}

init();
