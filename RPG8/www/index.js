

document.addEventListener('DOMContentLoaded',onLoad);

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx;
var oscNode;
var osc2;
var useOsc2 = false;
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

    // document.addEventListener("touchmove", function(e) {
    //     e.preventDefault();
    // });

    cbUse2Osc.addEventListener('change',function(evt){
        //window.alert(evt.currentTarget.checked);
        useOsc2 = evt.currentTarget.checked;
    });

    rngTempo.addEventListener('change',function(evt) {
        var val = evt.currentTarget.value;
        tempo = val;
    });

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
        var secondsPerBeat = 60.0 / tempo / 4; // locked on 16ths
        var currentTime = audioCtx.currentTime;
        var dT = currentTime - lastTimeDrawn;
        if(dT > secondsPerBeat ) {
            lastTimeDrawn = currentTime;
            lastIndexDrawn++;
            lastIndexDrawn =  lastIndexDrawn % downKeys.length;

            var transposedNote = downKeys[lastIndexDrawn];
            playNote(transposedNote);
        }
    }
    else {
        if(oscNode) {
            oscNode.stop(0);
            oscNode = null;
        }
        if(osc2) {
            osc2.stop(0);
            osc2 = null;
        }
    }
    // set up to draw again
    requestAnimFrame(redraw);
}

function playNote(transposedNote) {
    if(oscNode) {
        oscNode.stop(0);
    }
    if(osc2) {
        osc2.stop(0);
    }

    oscNode = audioCtx.createOscillator();
    oscNode.type = 'sine';

    if(useOsc2) {
        osc2 = audioCtx.createOscillator();
        osc2.type = 'square';
    }

    // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
    oscNode.frequency.value = notes[transposedNote].pitch; // value in hertz

    gainNode = audioCtx.createGain();
    oscNode.connect(gainNode);

    if(useOsc2) {
        osc2.connect(gainNode);
        osc2.detune.value = 10;
        osc2.frequency.value = notes[transposedNote-24].pitch;
    }

    gainNode.connect(audioCtx.destination);

    oscNode.start(0);
    if(useOsc2) {
        osc2.start(0);
    }

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