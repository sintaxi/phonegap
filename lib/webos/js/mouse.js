function Mouse() {
	
};

/*
 * Possibly useful for automated testing, this call to PalmSystem triggers a mouse click (i.e. touch event). 
 * x coordinate & y coordinate of where the screen was touched and also a true/false flag to tell WebOS if it should simulate the mouse click
 * @param {Number} x
 * @param {Number} y
 * @param {Boolean} state
 * Example:
 *		navigator.mouse.simulateMouseClick(10, 10, true);
 */	
Mouse.prototype.simulateMouseClick = function(x, y, state) {
	PalmSystem.simulateMouseClick(x, y, state || true);
};

if (typeof navigator.mouse == "undefined") navigator.mouse = new Mouse();

