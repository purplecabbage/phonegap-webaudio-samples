

document.addEventListener('DOMContentLoaded',onLoad);

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;
// this is where we will store audio buffer data
var myBuffer;

function onLoad() {
    if(!AudioContext) {
        window.alert("WebAudio is not supported");
    }
    else {
        audioContext = new AudioContext();
        btnLoadSound.onclick = function() {
            dvStatusOut.innerText = "Loading ... ";
            // Prime the Pump! ( I invented that term, really! )
            var request = new XMLHttpRequest();
            request.open('GET','../../Sounds/Shamisen-C4.wav', true);
            request.responseType = 'arraybuffer';
            // Decode is done asynchronously
            request.onload = function() {
                audioContext.decodeAudioData(request.response,
                function(buffer) {
                    myBuffer = buffer;
                    dvStatusOut.innerText = "Ready";
                },function(err){
                    console.log("Error :: " + err);
                });
            };
            request.send();
        }

        btnPlaySound.onclick = function() {
            dvStatusOut.innerText = "Playing ... ";
            var source = audioContext.createBufferSource();
            source.buffer = myBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            // or wait a second
            //source.start(audioContext.currentTime + 1.0);
            // or start at an offset, with a duration
            //source.start(0,0.5,2);
            source.addEventListener('ended',function() {
                dvStatusOut.innerText = "Ready";
            })
        }
    }
}
