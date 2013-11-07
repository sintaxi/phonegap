document.addEventListener('deviceready', onDeviceReady, false);

// Values read from the accelerometer
var valueX;
var valueY;
var valueZ;
    		
// Game variables
var x_speed=0;
var y_speed=0;
var y=250;
var x=250;
var left=false;
var right=false;
var up=false;
var down=false;
var friction = 0.95;
var context;
 
// Bind vars & start acquisition

function onDeviceReady() {
	
	valueX = document.getElementById('valueX');
	valueY = document.getElementById('valueY');
	valueZ = document.getElementById('valueZ');

	left = document.getElementById('valueL');
	right = document.getElementById('valueR');
	up = document.getElementById('valueU');
	down = document.getElementById('valueD');
		    		
	startWatch();
}
    		
function startWatch() {

	var options = { frequency: 50 }; 
		    		
	// Start machinery
	navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
}
			
		
// Got sample
		
function onSuccess(acceleration) {
			
	valueX.innerHTML = 'X: ' + acceleration.x;
	valueY.innerHTML = 'Y: ' + acceleration.y;
	valueZ.innerHTML = 'Z: ' + acceleration.z;
			
	if (acceleration.x < -0.2) {
		right = false;
		left = true;
	}
		
	else if (acceleration.x > 0.2) {
		right = true;
		left = false;
	}
			
	else if (acceleration.x < 0.2 && acceleration.x > -0.2) {
		left = true;
		right = true;
	}
				
	if (acceleration.y < -0.2) {
		up = false;
		down = true;
	}
			
	else if (acceleration.y > 0.2) {
		up = true;
		down = false;
	}
			
	else if(acceleration.y < 0.2 && acceleration.y > -0.2) {
		up = true;
		down = true;
	}
				
	valueR.innerHTML = 'Right :' + right;
	valueL.innerHTML = 'Left :' + left;
	valueU.innerHTML = 'Up :' + up;
	valueD.innerHTML = 'Down :' + down;
}

// Trouble acquiring samples
function onError() {
	alert('Error!');
}

function on_enter_frame() {

    if (left) {
        x_speed--;
    }

    if (right) {
        x_speed++;
    }

    if (up) {
        y_speed--;
    }

    if (down) {
        y_speed++;
    }

    context.clearRect(0, 0, 500, 500); // Redraw
    context.beginPath();
    context.fillStyle = '#000000';
    context.arc(x, y, 30, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();

    x += (x_speed / 3); // Compute new X for ball 

    // X clipping
    if (x > (game_area.width - 30)) {
        x = game_area.width - 30;
    }
  
    if (x < 30) {
        x = 30;
    }

    y += (y_speed / 3); // Compute new Y for ball

    // Y clipping
    if (y > (game_area.height - 30)) {
        y = game_area.height - 30;
    }
 
    if (y < 30) {
        y = 30;
    }

    // Reduce speed as a way to simulate friction
    x_speed *= friction;
    y_speed *= friction;
}	

			
window.onload = function()
{	
	var game_area = document.getElementById('game_area'); // Get access to the canvas
    
    if (!game_area) {
        alert("Can't connect to canvas!");
        return;
    }	
        	
    context = game_area.getContext('2d'); // Get canvas context

	if (!context) {
		alert("Can't get canvas context!");
		return;
	}
			
	setInterval(on_enter_frame, 20); // Frame interval
}	

