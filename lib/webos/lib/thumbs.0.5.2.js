(function(window) {

    /**
     * Do not use thumbs.js on touch-enabled devices
     * 
     * Thanks to Jesse MacFadyen (purplecabbage):
     * https://gist.github.com/850593#gistcomment-22484
     */
    try {
        document.createEvent('TouchEvent');
        return;
    }
    catch(e) {
    }

    /**
     * Map touch events to mouse events
     */
    var eventMap = {
        'mousedown': 'touchstart',
        'mouseup':   'touchend',
        'mousemove': 'touchmove'
    };

    /**
     * Fire touch events
     *
     * Monitor mouse events and fire a touch event on the
     * object broadcasting the mouse event. This approach
     * likely has poorer performance than hijacking addEventListener
     * but it is a little more browser friendly.
     */
    window.addEventListener('load', function() {
        for (var key in eventMap) {
            document.body.addEventListener(key, function(e) {
                // Supports:
                //   - addEventListener
                //   - setAttribute
                var event = createTouchEvent(eventMap[e.type], e);
                e.target.dispatchEvent(event);

                // Supports:
                //   - element.ontouchstart
                var fn = e.target['on' + eventMap[e.type]];
                if (typeof fn === 'function') fn(e);
            }, false);
        }
    }, false);

    /**
     * Utility function to create a touch event.
     *
     * @param  name  {String} of the event
     * @return event {Object}
     */
    var createTouchEvent = function(name, e) {
        var event = document.createEvent('MouseEvents');

        event.initMouseEvent(
            name,
            e.bubbles,
            e.cancelable,
            e.view,
            e.detail,
            e.screenX,
            e.screenY,
            e.clientX,
            e.clientY,
            e.ctrlKey,
            e.altKey,
            e.shiftKey,
            e.metaKey,
            e.button,
            e.relatedTarget
        );

        return event;
    };

})(window);
