

document.addEventListener('DOMContentLoaded',onLoad);

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx;
var oscNode;
var osc2;
var gainNode;
var padHitEventName = "mousedown";
var padReleaseEventName = "mouseup";
var NumNotes = 128; // 128 midi notes from 0-127
var notes = [];
var tempo = 140; // EDM!

var downKeys = [];

window.requestAnimFrame = window.requestAnimationFrame ||
                          window.webkitRequestAnimationFrame ||
                          window.oRequestAnimationFrame ||
                          window.mozRequestAnimationFrame ||
                          window.msRequestAnimationFrame ||
                          function( cb ) {
                              window.setTimeout(cb, 1000 / 60);
                          };

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

        for (var i = 0; i < NumNotes; i++) {
            // A4 = MIDI key 69
            notes[i] = {
                pitch:440 * Math.pow(2, (i - 69)/12.0)
            };
            //console.log(i + ":" + notes[i].pitch);
        }

        audioCtx = new AudioContext();
        oscNode = audioCtx.createOscillator();
        oscNode.type = 'sine';

        osc2 = audioCtx.createOscillator();
        osc2.type = 'square';

        // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
        oscNode.frequency.value = 440; // value in hertz

        gainNode = audioCtx.createGain();
        oscNode.connect(gainNode);
        osc2.connect(gainNode);
        osc2.detune.value = 10;

        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0;
        oscNode.start(0);
        osc2.start(0);

        var elems = document.querySelectorAll('.key');
        elems.forEach( function(elem){
            if(elem.dataset.notenumber) {
                elem.addEventListener(padHitEventName,onPianoKeyDown);
            }
        });

        redraw();
    }
}

var lastIndexDrawn = -1;
var lastTimeDrawn = -1;
function redraw() {

    if(downKeys.length > 0) {
        var secondsPerBeat = 60.0 / tempo; // locked on 16ths
        var currentTime = audioCtx.currentTime;
        var dT = currentTime - lastTimeDrawn;
        if(dT > secondsPerBeat ) {
            lastTimeDrawn = currentTime;
            lastIndexDrawn++;
            lastIndexDrawn =  lastIndexDrawn % downKeys.length;

            var transposedNote = downKeys[lastIndexDrawn];
            oscNode.frequency.value = notes[transposedNote].pitch;

            osc2.frequency.value = notes[transposedNote-24].pitch;
            gainNode.gain.value = 0.8;

        }
    }
    else {
        gainNode.gain.value = 0;
    }

    // set up to draw again
    requestAnimFrame(redraw);
}

function onPianoKeyDown(evt) {

    var transposedNote = parseInt(evt.currentTarget.dataset.notenumber) + 36;

    var noteIndex = downKeys.indexOf(transposedNote);
    if(noteIndex > -1) {
        downKeys.splice(noteIndex,1);
        var className =  evt.currentTarget.className;
        className = className.split(' hit').join("");
        evt.currentTarget.className = className;
    }
    else {
        downKeys.push(transposedNote);
        evt.currentTarget.className = evt.currentTarget.className + '  hit';
    }


}