

document.addEventListener('DOMContentLoaded',onLoad);

var AudioContext = window.AudioContext || window.webkitAudioContext;
var piano;
var padHitEventName = "mousedown";
var padReleaseEventName = "mouseup";

function onLoad() {

    try {
        document.createEvent("TouchEvent");
        padHitEventName = "touchstart";
        padReleaseEventName = "touchend";
    }
    catch(ex) {
        // alert('Touch is not supported in this browser');
    }

    if(!AudioContext) {
        window.alert("WebAudio is not supported");
    }
    else {
        piano = new TunedInstrument();
        piano.loadVoice("sounds/AccGuitar.wav",48);

        // var audioCtx = new AudioContext();
        // var oscillator = audioCtx.createOscillator();
        // oscillator.type = 'sine';
        // // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
        // oscillator.frequency.value = 2500; // value in hertz
        // // oscillator.start(0);

        // // var gainNode = audioCtx.createGain();

        // // oscillator.connect(gainNode);
        // // gainNode.connect(audioCtx.destination);

        var elems = document.querySelectorAll('.key');
        elems.forEach( function(elem){
            //console.log(elem.dataset.notenumber);

            elem.addEventListener(padHitEventName,onPianoKeyDown);
            if(padHitEventName !== 'mouseup') {
                elem.addEventListener(padReleaseEventName,onPianoKeyUp);
            }
        });
    }
}

function onPianoKeyDown(evt) {
    if(evt.type == "mousedown") {
        evt.currentTarget.addEventListener('mouseup',onPianoKeyUp);
    }
    piano.noteOn(parseInt(evt.currentTarget.dataset.notenumber) + 24);

}

function onPianoKeyUp(evt) {
    if(evt.type == "mouseup") {
        evt.currentTarget.removeEventListener('mouseup',onPianoKeyUp);
    }

    piano.noteOff(parseInt(evt.currentTarget.dataset.notenumber) + 24);
    //console.log(evt.currentTarget.dataset.notenumber);
}