

document.addEventListener('DOMContentLoaded',onLoad);

var AudioContext = window.AudioContext || window.webkitAudioContext;

function onLoad() {
    if(!AudioContext) {
        window.alert("WebAudio is not supported");
    }
    else {
        var audioCtx = new AudioContext();
        var oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
        oscillator.frequency.value = 2500; // value in hertz
        oscillator.start(0);

        // var gainNode = audioCtx.createGain();

        // oscillator.connect(gainNode);
        // gainNode.connect(audioCtx.destination);
    }
}