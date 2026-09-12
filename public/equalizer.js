const frequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const labels = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
const presets = {
  flat: { name: 'Ganancia plana', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  rock: { name: 'Rock', values: [4, 3, 2, -1, -2, 1, 3, 4, 4, 3] },
  pop: { name: 'Pop', values: [-1, 1, 3, 4, 2, 0, -1, 2, 3, 3] },
  jazz: { name: 'Jazz', values: [3, 2, 1, 2, -1, -1, 0, 2, 3, 4] },
  voice: { name: 'Voz', values: [-3, -2, -1, 2, 4, 4, 3, 1, -1, -2] }
};

const audio = document.querySelector('#audio');
const fileInput = document.querySelector('#file-input');
const dropZone = document.querySelector('#drop-zone');
const playButton = document.querySelector('#play-button');
const playIcon = document.querySelector('#play-icon');
const progress = document.querySelector('#progress');
const currentTime = document.querySelector('#current-time');
const duration = document.querySelector('#duration');
const trackTitle = document.querySelector('#track-title');
const trackSubtitle = document.querySelector('#track-subtitle');
const trackStatus = document.querySelector('#track-status');
const sliders = document.querySelector('#sliders');
const gainReadout = document.querySelector('#gain-readout');
const eqCanvas = document.querySelector('#eq-canvas');
const visualizer = document.querySelector('#visualizer');
const volume = document.querySelector('#volume');
const volumeValue = document.querySelector('#volume-value');
const bypass = document.querySelector('#bypass');
const peakValue = document.querySelector('#peak-value');
const visualizerMessage = document.querySelector('#visualizer-message');

let gains = [...presets.flat.values];
let currentPreset = 'flat';
let objectUrl = '';
let audioContext;
let sourceNode;
let analyser;
let volumeNode;
let filters = [];
let animationFrame;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function dbText(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function renderSliders() {
  sliders.innerHTML = frequencies.map((frequency, index) => `<label class="band-control"><em id="gain-${index}">${dbText(gains[index])} dB</em><input class="band-range" type="range" min="-12" max="12" step="1" value="${gains[index]}" data-index="${index}" aria-label="${frequency} Hz" /><strong>${labels[index]} Hz</strong></label>`).join('');
  sliders.querySelectorAll('input').forEach(input => input.addEventListener('input', event => {
    const index = Number(event.target.dataset.index);
    gains[index] = Number(event.target.value);
    currentPreset = '';
    updateFilter(index);
    updatePresetButtons();
    renderCurve();
    updateReadout();
  }));
}

function setupAudioGraph() {
  if (audioContext) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    showStatus('Este navegador no soporta Web Audio API');
    return;
  }
  audioContext = new AudioContextClass();
  sourceNode = audioContext.createMediaElementSource(audio);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = .82;
  volumeNode = audioContext.createGain();
  volumeNode.gain.value = Number(volume.value) / 100;
  filters = frequencies.map((frequency, index) => {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = frequency;
    filter.Q.value = .9;
    filter.gain.value = gains[index];
    return filter;
  });
  let node = sourceNode;
  filters.forEach(filter => { node.connect(filter); node = filter; });
  node.connect(analyser);
  analyser.connect(volumeNode);
  volumeNode.connect(audioContext.destination);
  drawVisualizer();
}

function updateFilter(index) {
  if (filters[index]) filters[index].gain.value = bypass.checked ? 0 : gains[index];
}

function updateAllFilters() {
  filters.forEach((_, index) => updateFilter(index));
}

function updatePresetButtons() {
  document.querySelectorAll('.preset').forEach(button => button.classList.toggle('active', button.dataset.preset === currentPreset));
}

function updateReadout() {
  const total = gains.reduce((sum, value) => sum + value, 0);
  const average = Math.round((total / gains.length) * 10) / 10;
  gainReadout.textContent = `${currentPreset ? presets[currentPreset].name : 'Personalizado'} · ${dbText(average)} dB medio`;
  gains.forEach((value, index) => {
    const readout = document.querySelector(`#gain-${index}`);
    if (readout) readout.textContent = `${dbText(value)} dB`;
  });
}

function setPreset(name) {
  const preset = presets[name];
  if (!preset) return;
  currentPreset = name;
  gains = [...preset.values];
  renderSliders();
  updateAllFilters();
  updatePresetButtons();
  updateReadout();
  renderCurve();
}

function resizeCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  return { width, height, ratio };
}

function renderCurve() {
  const { width, height } = resizeCanvas(eqCanvas);
  const context = eqCanvas.getContext('2d');
  context.clearRect(0, 0, width, height);
  const pad = 4;
  const points = gains.map((gain, index) => ({ x: pad + index / (gains.length - 1) * (width - pad * 2), y: height / 2 - (gain / 12) * (height / 2 - pad) }));
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(78,224,209,.32)');
  gradient.addColorStop(1, 'rgba(78,224,209,0)');
  context.beginPath();
  context.moveTo(points[0].x, height / 2);
  points.forEach(point => context.lineTo(point.x, point.y));
  context.lineTo(points[points.length - 1].x, height / 2);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();
  context.beginPath();
  points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
  context.strokeStyle = '#4ee0d1';
  context.lineWidth = 2 * (window.devicePixelRatio || 1);
  context.shadowColor = 'rgba(78,224,209,.45)';
  context.shadowBlur = 7 * (window.devicePixelRatio || 1);
  context.stroke();
  context.shadowBlur = 0;
  points.forEach(point => { context.beginPath(); context.arc(point.x, point.y, 2.5 * (window.devicePixelRatio || 1), 0, Math.PI * 2); context.fillStyle = '#9cfff3'; context.fill(); });
}

function drawVisualizer() {
  animationFrame = requestAnimationFrame(drawVisualizer);
  const { width, height, ratio } = resizeCanvas(visualizer);
  const context = visualizer.getContext('2d');
  context.clearRect(0, 0, width, height);
  const bars = 64;
  const values = new Uint8Array(analyser ? analyser.frequencyBinCount : bars);
  if (analyser) analyser.getByteFrequencyData(values);
  const gap = 3 * ratio;
  const barWidth = Math.max(2 * ratio, (width - gap * (bars - 1)) / bars);
  for (let index = 0; index < bars; index += 1) {
    const source = values[index] || 0;
    const idle = 5 + Math.abs(Math.sin(Date.now() / 650 + index * .42)) * 4;
    const barHeight = Math.max(3 * ratio, (source ? source / 255 * height * .9 : idle * ratio));
    const x = index * (barWidth + gap);
    const y = height - barHeight;
    const gradient = context.createLinearGradient(0, y, 0, height);
    gradient.addColorStop(0, '#8ef9eb');
    gradient.addColorStop(1, 'rgba(78,224,209,.2)');
    context.fillStyle = gradient;
    context.fillRect(x, y, barWidth, barHeight);
  }
  if (analyser) {
    const peak = Math.max(...values);
    peakValue.textContent = `Pico ${Math.round(peak / 255 * 100)}%`;
  }
}

function showStatus(message) {
  trackStatus.innerHTML = `<i></i> ${message}`;
}

function loadFile(file) {
  if (!file || !file.type.startsWith('audio/')) { showStatus('Selecciona un archivo de audio válido'); return; }
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  audio.src = objectUrl;
  audio.load();
  trackTitle.textContent = file.name.replace(/\.[^/.]+$/, '');
  trackSubtitle.textContent = `${file.type.split('/')[1]?.toUpperCase() || 'AUDIO'} · archivo local`;
  playButton.disabled = false;
  visualizerMessage.textContent = 'Pulsa reproducir para activar el visualizador';
  showStatus('Canción cargada · lista para reproducir');
  document.querySelector('#album-art').classList.add('has-track');
}

async function togglePlay() {
  if (!audio.src) return;
  setupAudioGraph();
  if (!audioContext) return;
  await audioContext.resume();
  if (audio.paused) await audio.play(); else audio.pause();
}

function updatePlayState() {
  const playing = !audio.paused;
  playIcon.textContent = playing ? 'Ⅱ' : '▶';
  playButton.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
  showStatus(playing ? 'Reproduciendo · EQ activo' : 'En pausa · listo para continuar');
  visualizerMessage.textContent = playing ? 'Señal de audio procesada en vivo' : 'Pulsa reproducir para activar el visualizador';
}

fileInput.addEventListener('change', event => loadFile(event.target.files[0]));
dropZone.addEventListener('dragover', event => { event.preventDefault(); dropZone.classList.add('dragging'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', event => { event.preventDefault(); dropZone.classList.remove('dragging'); loadFile(event.dataTransfer.files[0]); });
playButton.addEventListener('click', togglePlay);
document.querySelector('#previous').addEventListener('click', () => { audio.currentTime = 0; if (audio.paused) updatePlayState(); });
document.querySelector('#next').addEventListener('click', () => { audio.currentTime = audio.duration || 0; audio.pause(); updatePlayState(); });
document.querySelector('#mute-button').addEventListener('click', event => { audio.muted = !audio.muted; event.currentTarget.textContent = audio.muted ? '◖ Silenciado' : '◖ Volumen'; });
progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = Number(progress.value) / 100 * audio.duration; });
volume.addEventListener('input', () => { const value = Number(volume.value); volumeValue.textContent = `${value}%`; if (volumeNode) volumeNode.gain.value = value / 100; });
bypass.addEventListener('change', updateAllFilters);
document.querySelectorAll('.preset').forEach(button => button.addEventListener('click', () => setPreset(button.dataset.preset)));
document.querySelector('#reset-eq').addEventListener('click', () => setPreset('flat'));
document.querySelector('#reset-all').addEventListener('click', () => { setPreset('flat'); volume.value = 80; volume.dispatchEvent(new Event('input')); bypass.checked = false; updateAllFilters(); });
audio.addEventListener('loadedmetadata', () => { duration.textContent = formatTime(audio.duration); });
audio.addEventListener('timeupdate', () => { currentTime.textContent = formatTime(audio.currentTime); progress.value = audio.duration ? audio.currentTime / audio.duration * 100 : 0; });
audio.addEventListener('play', updatePlayState);
audio.addEventListener('pause', updatePlayState);
audio.addEventListener('ended', () => { audio.currentTime = 0; updatePlayState(); });
window.addEventListener('resize', renderCurve);

renderSliders();
updateReadout();
renderCurve();
drawVisualizer();
