let audioContext;
let stream;
let source;
let gainNode;
let filters = [];
let currentGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const frequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

async function attachStream(streamId) {
  stopAudio();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContextClass();
  stream = await navigator.mediaDevices.getUserMedia({
    audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } },
    video: false
  });
  source = audioContext.createMediaStreamSource(stream);
  gainNode = audioContext.createGain();
  filters = frequencies.map((frequency, index) => {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = frequency;
    filter.Q.value = .9;
    filter.gain.value = currentGains[index];
    return filter;
  });
  let node = source;
  filters.forEach(filter => { node.connect(filter); node = filter; });
  node.connect(gainNode);
  gainNode.connect(audioContext.destination);
  await audioContext.resume();
}

function stopAudio() {
  stream?.getTracks().forEach(track => track.stop());
  source?.disconnect();
  filters.forEach(filter => filter.disconnect());
  gainNode?.disconnect();
  audioContext?.close();
  stream = null;
  source = null;
  filters = [];
  audioContext = null;
}

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'ATTACH_STREAM') attachStream(message.streamId).catch(console.error);
  if (message.type === 'STOP_CAPTURE') stopAudio();
  if (message.type === 'SET_GAINS') {
    currentGains = message.gains || currentGains;
    filters.forEach((filter, index) => { filter.gain.value = message.bypass ? 0 : currentGains[index]; });
  }
  if (message.type === 'SET_BYPASS') filters.forEach((filter, index) => { filter.gain.value = message.bypass ? 0 : currentGains[index]; });
});
