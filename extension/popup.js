const bands = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const labels = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
const presets = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  rock: [4, 3, 2, -1, -2, 1, 3, 4, 4, 3],
  pop: [-1, 1, 3, 4, 2, 0, -1, 2, 3, 3],
  voice: [-3, -2, -1, 2, 4, 4, 3, 1, -1, -2]
};
let gains = [...presets.flat];
let active = false;

const status = document.querySelector('#status');
const capture = document.querySelector('#capture');
const liveDot = document.querySelector('#live-dot');
const bandsEl = document.querySelector('#bands');
const bypass = document.querySelector('#bypass');

function send(message) { chrome.runtime.sendMessage(message); }
function db(value) { return value > 0 ? `+${value}` : value; }
function render() {
  bandsEl.innerHTML = bands.map((frequency, index) => `<label class="band"><output id="value-${index}">${db(gains[index])}</output><input type="range" min="-12" max="12" value="${gains[index]}" data-index="${index}" aria-label="${frequency} Hz"><small>${labels[index]}</small></label>`).join('');
  bandsEl.querySelectorAll('input').forEach(input => input.addEventListener('input', event => {
    const index = Number(event.target.dataset.index);
    gains[index] = Number(event.target.value);
    document.querySelector(`#value-${index}`).textContent = db(gains[index]);
    send({ type: 'SET_GAINS', gains, bypass: bypass.checked });
    document.querySelectorAll('.preset').forEach(button => button.classList.remove('active'));
  }));
}

async function startCapture() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const result = await chrome.runtime.sendMessage({ type: 'START_CAPTURE', tabId: tab.id });
  if (!result?.ok) { status.textContent = result?.error || 'No se pudo capturar esta pestaña.'; return; }
  active = true;
  capture.textContent = 'Desactivar ecualizador';
  capture.classList.add('active');
  liveDot.classList.add('on');
  status.textContent = 'Ecualizador activo en la pestaña actual.';
}

function stopCapture() {
  send({ type: 'STOP_CAPTURE' });
  active = false;
  capture.textContent = 'Activar en esta pestaña';
  capture.classList.remove('active');
  liveDot.classList.remove('on');
  status.textContent = 'Ecualizador detenido.';
}

capture.addEventListener('click', () => { if (active) stopCapture(); else startCapture(); });
bypass.addEventListener('change', () => send({ type: 'SET_BYPASS', bypass: bypass.checked }));
document.querySelectorAll('.preset').forEach(button => button.addEventListener('click', () => {
  gains = [...presets[button.dataset.preset]];
  render();
  document.querySelectorAll('.preset').forEach(item => item.classList.toggle('active', item === button));
  send({ type: 'SET_GAINS', gains, bypass: bypass.checked });
}));
render();
