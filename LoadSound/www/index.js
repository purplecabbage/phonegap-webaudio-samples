

document.addEventListener('DOMContentLoaded',onLoad);

var AudioContext = window.AudioContext || window.webkitAudioContext;

function onLoad() {
    if(!AudioContext) {
        window.alert("WebAudio is not supported");
    }
    else {
        var audioCtx = new AudioContext();
        var oscillator = audioCtx.createOscillator();
        oscillator.type = 'triangle';
        // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
        oscillator.frequency.value = 880; // value in hertz

        var gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(0); // immediately

        gainNode.gain.setValueAtTime(0.0, audioCtx.currentTime + 2);
        gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime + 3);

        // oscillator.stop(audioCtx.currentTime + 2);
        // // once stopped, it is desroyed
        // oscillator.start(audioCtx.currentTime + 3);
    }
}
