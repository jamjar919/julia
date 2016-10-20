//globals
var MAXITERATION = 2500;
var BOUNDARY = 4;
var CANVASID = "juliaDraw";
var CANVAS = document.getElementById("juliaDraw");
var _CANVAS = document.getElementById("overlay");
var CONTEXT = document.getElementById("juliaDraw").getContext('2d');
var _CONTEXT = document.getElementById("overlay").getContext('2d');
var HEIGHT = 750;
var WIDTH = 750;
var mousePos;
var juliaImageData = CONTEXT.createImageData(WIDTH, HEIGHT);
var CURRENTHIGHESTITERATIONS = 0;
var CONVERGENCEITERCOUNT = 2500;
var ITERALGO;
var STARTPOS;
var RANGE;
_CANVAS.addEventListener('mousemove', function(evt) {
	mousePos = getMousePos(_CANVAS, evt);
}, false);

function printCoords() {
	document.getElementById("xyPos").innerHTML = dispComplex(coordsToComplex(mousePos));
	document.getElementById("xyCoords").innerHTML = mousePos.x + "," + mousePos.y;
}
setInterval(printCoords, 10);

function setState(state) {
	indicator = document.getElementById("status");
	switch (state) {
		case 0:
			indicator.innerHTML = 'Idle';
			indicator.style.color = 'grey';
			break;
		case 1:
			indicator.innerHTML = 'Calculating points...';
			indicator.style.color = 'orange';
			break;
		case 2:
			indicator.innerHTML = 'Drawing image...';
			indicator.style.color = 'orange';
			break;
		case 3:
			indicator.innerHTML = 'Finished!';
			indicator.style.color = 'green';
			break;
	}
}

function readInput(inputID) {
	return document.getElementById(inputID).value;
}

function drawPointOnCanvas(x, y, color) {
	CONTEXT.fillStyle = color;
	CONTEXT.fillRect(x, y, 1, 1);
}

function drawLine(context,startX, startY, endX, endY) {
	context.strokeStyle = "#FFF";
	context.beginPath();
	context.moveTo(startX, startY);
	context.lineTo(endX, endY);
	context.stroke();
	//console.log("Drawing from "+startX+", "+startY+" to "+endX+", "+endY);
}

function createArray(length) {
	var arr = new Array(length || 0),
		i = length;
	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		while (i--) arr[length - 1 - i] = createArray.apply(this, args);
	}
	return arr;
}

function squared(complexNum, c) {
	// z^2 + c
	return addComplex(multComplex(complexNum, complexNum), c);
}

function cubed(complexNum, c) {
	// z^3 + c
	return addComplex(multComplex(multComplex(complexNum, complexNum),complexNum), c);
}

function quadratic(complexNum, c) {
	// z^2 + cz + c
	return addComplex(addComplex(multComplex(complexNum, complexNum),multComplex(c, complexNum)), c);
}

function burningShip(complexNum, c) {
	// (|real(z)| + i*|imag(z)|)^2 + c
	var z = absComplex(complexNum);
	return addComplex(multComplex(z,z),c);
}

function doesPointEscape(c, complexNum) {
	var iterations = 0;
	var iterationsToEscape = -1;
	var escaped = false;
	while ((!escaped) && (iterations < MAXITERATION)) {
		if (getComplexModulus(complexNum) > BOUNDARY) {
			escaped = true;
			iterationsToEscape = iterations;
		}
		complexNum = ITERALGO(complexNum, c);
		iterations++;
	}
	return iterationsToEscape;
}

var drawSelectSquare = false;
var point1 = null;
var point2 = null;
var drawSelectSquareInterval = 0;
function drawBoundingBox() {
	if (drawSelectSquare) {
		_CONTEXT.clearRect(0, 0, WIDTH, HEIGHT);
		_CONTEXT.strokeStyle = "#FFF";
		var difference = 0;
		if (mousePos.x > mousePos.y) {
			difference = mousePos.x - point1.x;
		} else {
			difference = mousePos.y - point1.y;
		}
		document.getElementById("toSelection").innerHTML = dispComplex(coordsToComplex({x:point1.x+difference,y:point1.y+difference}));
		_CONTEXT.beginPath();
		_CONTEXT.rect(point1.x,point1.y,difference,difference);
		_CONTEXT.stroke();
	}
}
_CANVAS.addEventListener('contextmenu', function(ev) {
    	ev.preventDefault();
	document.getElementById('drawLines').checked = false;
	_CONTEXT.clearRect(0, 0, WIDTH, HEIGHT);
	if (drawSelectSquare) {
		clearInterval(drawSelectSquareInterval);
		if (mousePos.x > mousePos.y) {
			difference = mousePos.x - point1.x;
		} else {
			difference = mousePos.y - point1.y;
		}
		point2 = {
			x: point1.x + difference,
			y: point1.y + difference
		}
		STARTPOS = coordsToComplex(point1);
		RANGE = coordsToComplex(point2).real - coordsToComplex(point1).real;
		var c = new complexNum(readInput('realValue') * 1, readInput('imagValue') * 1);
		plotJuliaSet(CANVAS, c, point1);
		drawSelectSquare = false;
		document.getElementById("selectionInfo").style.display = "none";
	} else{
		point1 = mousePos;
		drawSelectSquare = true;
		drawSelectSquareInterval = setInterval(drawBoundingBox, 10);
		document.getElementById("selectionInfo").style.display = "block";
		document.getElementById("fromSelection").innerHTML = dispComplex(coordsToComplex(point1));
	}
   	console.log(mousePos);
  	return false;
}, false);

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function getColor(iterations) {
	//console.log("Iterations: "+getBaseLog(iterations+1,255));
	var color = "rgb("+Math.floor((8*iterations)%255)+",0,"+Math.floor(255-((8*iterations)%255))+")";
	//console.log(color);
	return color;
}

function plotJuliaSet(canvasID, c,o) {
	var complexNumberArray = createArray(WIDTH + 1, HEIGHT + 1);
	var doesPointEscapeArray = createArray(WIDTH + 1, HEIGHT + 1);
	console.log('====Drawing Set====');
	console.log('c = ' + dispComplex(c));
	setState(1);
	var value = document.querySelector('input[name=iterEq]:checked').value;
	switch(value) {
		case "1":
			ITERALGO = squared;
			break;
		case "2":
			ITERALGO = cubed;
			break;
		case "3": 
			ITERALGO = quadratic;
			break;
		case "4":
			ITERALGO = burningShip;
			break;
	}
	console.log("Starting at "+dispComplex(STARTPOS));
	console.log("Range: "+RANGE);
	document.getElementById("fromNum").innerHTML = dispComplex(coordsToComplex({x:0,y:0}));
	document.getElementById("toNum").innerHTML = dispComplex(coordsToComplex({x:WIDTH,y:HEIGHT}));
	for (var x = 0; x <= WIDTH; x++) {
		for (var y = 0; y <= HEIGHT; y++) {
			complexNumberArray[x][y] = new coordsToComplex({x:x,y:y});
			complexNumberArray[x][y] = complexNumberArray[x][y];
			doesPointEscapeArray[x][y] = doesPointEscape(c, complexNumberArray[x][y]);
			if (doesPointEscapeArray[x][y] >= 0) {
				drawPointOnCanvas(x, y, getColor(doesPointEscapeArray[x][y]));
			} else {
				drawPointOnCanvas(x, y, 'black');
			}
		}
	}
	setState(2);
	console.log('done');
	setState(3);
}

function coordsToComplex(coordinates) {
	return {
		real: ((coordinates.x/WIDTH)*RANGE +STARTPOS.real),
		imaginary: ((coordinates.y/HEIGHT)*-RANGE + STARTPOS.imaginary)
	};
}

function complexToCoords(c) {
	return {
		x: ((c.real - STARTPOS.real)/(RANGE))*WIDTH,
		y: ((c.imaginary - STARTPOS.imaginary)/-(RANGE))*HEIGHT
	};
}

function drawConvergence() {
	var box = document.getElementById('drawLines');
	if (box.checked) {
		_CONTEXT.clearRect(0, 0, _CANVAS.width, _CANVAS.height);
		//console.log("Coordinates: "+mousePos.x+", "+mousePos.y);
		//console.log("Decimal: "+decimal.x+", "+decimal.y);
		var positionArray = [];
		var z = new coordsToComplex(mousePos);
		var c = new complexNum(readInput('realValue') * 1, readInput('imagValue') * 1);
		for (var i = 0; i < CONVERGENCEITERCOUNT; i++) {
			positionArray.push(z);
			z = ITERALGO(z,c);
		}
		for (i = 0; i < CONVERGENCEITERCOUNT-1; i++) {
			z = positionArray[i];
			c = positionArray[i+1];
			var zCoords = complexToCoords(z);
			var nextCoords = complexToCoords(c);
			drawLine(_CONTEXT,zCoords.x,zCoords.y,nextCoords.x,nextCoords.y);
		}
	}
}

function handleConvergence() {
	// detect if checkbox is clicked 
	var box = document.getElementById('drawLines');
	var drawc;
	if (box.checked) {
		drawc = setInterval(drawConvergence, 10);
	} else {
		clearInterval(drawc);
	}
}

function defaultDraw() {
	CONTEXT.clearRect(0, 0, WIDTH, HEIGHT);
	var start = new complexNum(-2, 2);
	var c = new complexNum(0, 0);
	plotJuliaSet(CANVASID, c, 0);
}

function drawJulia() {
	setState(2);
	CONTEXT.clearRect(0, 0, WIDTH, HEIGHT);
	var start = new complexNum(-2, 2);
	var c = new complexNum(readInput('realValue') * 1, readInput('imagValue') * 1);
	STARTPOS = {real:-2,imaginary:2}
	RANGE = 4;
	plotJuliaSet(CANVASID, c,{x:0,y:0});
}