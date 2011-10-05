function Application() {
	
};

/*
 * Tell webOS to activate the current page of your app, bringing it into focus.
 * Example:
 * 		navigator.application.activate();
 */	
Application.prototype.activate = function() {
	PalmSystem.activate();
};

/*
 * Tell webOS to deactivate your app.
 * Example:
 *		navigator.application.deactivate();
 */	
Application.prototype.deactivate = function() {
	PalmSystem.deactivate();
};

/*
 * Returns the identifier of the current running application (e.g. com.yourdomain.yourapp).
 * Example:
 *		navigator.application.getIdentifier();
 */
Application.prototype.getIdentifier = function() {
	return PalmSystem.identifier;
};

if (typeof navigator.application == "undefined") navigator.application = new Application();

