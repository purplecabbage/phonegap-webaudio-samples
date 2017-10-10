
var AudioCtx = window.AudioContext || window.webkitAudioContext;

var audioCtx;
var analyser1;
var analyser2;
var source;
var bufferLength;
var dataArray,dataArray2;
var canvas;
var canvasCtx;

document.addEventListener("DOMContentLoaded",function(){

   //return;
    canvas = document.getElementById("oscilloscope");
    canvasCtx = canvas.getContext("2d");
    audioCtx = new AudioCtx();

    source = audioCtx.createOscillator();
    source.type = "triangle";
    source.frequency.value = 3000;
    source.frequency.exponentialRampToValueAtTime(14000, audioCtx.currentTime + 2);
    source.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 4);

    // create our bar graph visualyser
    analyser1 = audioCtx.createAnalyser();
    analyser1.fftSize = 128;
    source.connect(analyser1);

    // create an ocilliscope visualyser
    analyser2 = audioCtx.createAnalyser();
    analyser2.fftSize = 128;
    analyser2.smoothingTimeConstant = 1;

    // make the connections
    analyser1.connect(analyser2);

    // do you want to hear it, or just watch it?
    //analyser2.connect(audioCtx.destination);

    source.start();
    source.stop(audioCtx.currentTime + 6);

    bufferLength = analyser1.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    dataArray2 = new Uint8Array(bufferLength);

    setInterval(draw,50);
});

function draw() {

  // drawVisual = requestAnimationFrame(draw);

  analyser2.getByteTimeDomainData(dataArray2);

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  //canvasCtx.lineWidth = 0.5;
  canvasCtx.strokeStyle = 'rgb(128, 255, 0)';
  canvasCtx.beginPath();

  var sliceWidth = canvas.width / dataArray2.length;
  var x = 0;
  canvasCtx.moveTo(x, canvas.height / 2);
  for (var i = 0; i < dataArray2.length; i++) {

    var v = dataArray2[i] / 128.0;
    var y = v * canvas.height / 2;
    canvasCtx.lineTo(x, y);
    //canvasCtx.fillRect(x-1,y-1,3,3);
    x += sliceWidth;
  }

  analyser1.getByteFrequencyData(dataArray);
  var WIDTH = canvas.width;
  var HEIGHT = canvas.height;
  var barWidth = (WIDTH / bufferLength);// * 2;
  var barHeight;
  x = 0;

  //console.log(dataArray[0]/2)
  for(var i = 0; i < bufferLength; i++) {
        var barHeight = dataArray[i]/2;
        canvasCtx.fillStyle = 'rgb(255,20,20)';
        canvasCtx.fillRect(x,HEIGHT - barHeight/2,barWidth,barHeight);

        x += barWidth + 1;
      }
  canvasCtx.stroke();
};

