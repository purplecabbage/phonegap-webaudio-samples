

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
var tempo = 100;
var drumBuffer;
var topWaveForm = "sine";
var bottomWaveForm = "square";

var downKeys = [];
var noteQueue = [];

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

    btnPanic.addEventListener("click",function(e){
        downKeys = [];
        noteQueue = [];
        document.querySelectorAll('.hit').forEach(function(elem){
            var className = elem.className.split(' hit').join("");
            elem.className = className;
        });
    });

    cbUse2Osc.addEventListener('change',function(evt){
        useOsc2 = evt.currentTarget.checked;
    });

    rngTempo.addEventListener('change',function(evt) {
        tempo = evt.currentTarget.value;
    });

    arpMode.addEventListener('change',(evt)=>{
        recalcNoteQueue();
    })

    if(!AudioContext) {
        window.alert("WebAudio is not supported");
    }
    else {
        for (var i = 0; i < NumNotes; i++) {
            // A4 = MIDI key 69
            notes[i] = {
                pitch:440 * Math.pow(2, (i - 69)/12.0)
            };
        }

        audioCtx = new AudioContext();

        var elems = document.querySelectorAll('.key');
        elems.forEach( function(elem){
            if(elem.dataset.notenumber) {
                elem.addEventListener(padHitEventName,onPianoKeyDown);
            }
        });

        osc1Wave.addEventListener('change',()=>{
            topWaveForm = event.target.value;
        });

        osc2Wave.addEventListener('change',()=>{
            bottomWaveForm = event.target.value;
        });


        tempoSelect.addEventListener('change',function(e){
            console.log(e.target.value);
            rngTempo.value = parseInt(e.target.value);
            tempo = parseInt(e.target.value);
        });

        redraw();
    }

    // load a bassdrum
    var request = new XMLHttpRequest();
    request.open('GET','../../Sounds/BTAA0DA.WAV', true);
    request.responseType = 'arraybuffer';
    // Decode is done asynchronously
    request.onload = function() {
        audioCtx.decodeAudioData(request.response,
        function(buffer) {
            drumBuffer = buffer;
        },function(err){
            console.log("Error :: " + err);
        });
    };
    request.send();
}

var lastIndexDrawn = -1;
var lastTimeDrawn = -1;
var beatCounter = -1;

function redraw() {

    if(noteQueue.length > 0) {
        console.log(noteQueue);
        var hitsPerBeat = 60.0 / tempo / 4; // locked on 16ths
        var currentTime = audioCtx.currentTime;
        var dT = currentTime - lastTimeDrawn;
        if(dT > hitsPerBeat ) {
            lastTimeDrawn = currentTime;
            lastIndexDrawn++;
            lastIndexDrawn =  lastIndexDrawn % noteQueue.length;

            playNote(noteQueue[lastIndexDrawn]);
            beatCounter++
            if(beatCounter % 4 == 0) {
                beatCounter = 0;
                // 4 on the floor
                var source = audioCtx.createBufferSource();
                source.buffer = drumBuffer;
                source.connect(audioCtx.destination);
                source.start(0);
            }
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
        beatCounter = -1;
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

    oscNode.type = topWaveForm;

    if(useOsc2) {
        osc2 = audioCtx.createOscillator();
        osc2.type = bottomWaveForm;
    }

    // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
    oscNode.frequency.value = notes[transposedNote].pitch; // value in hertz

    gainNode = audioCtx.createGain();
    oscNode.connect(gainNode);

    if(useOsc2) {
        var gainNode2 = audioCtx.createGain();
        osc2.connect(gainNode2);
        osc2.detune.value = 10;
        osc2.frequency.value = notes[transposedNote-12].pitch;
        gainNode2.gain.value = 0.7;
        gainNode2.connect(audioCtx.destination);
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
    recalcNoteQueue();
}

function recalcNoteQueue() {
    switch (arpMode.value) {
        case '0' : // as played
            // just copy the keys
            noteQueue = downKeys.slice();
            break;
        case '1' : // up
            noteQueue = downKeys.slice().sort();
            break;
        case '2' : // down
            noteQueue = downKeys.slice().sort().reverse();
            break;
        case '3' : // up+down
            noteQueue = downKeys.slice().sort();
            var reversedNotes = noteQueue.slice().reverse();
            reversedNotes.shift(); // the last note is not repeated
            reversedNotes.pop(); // the first note is not repeated
            noteQueue = noteQueue.concat(reversedNotes);
            break;

    }

}