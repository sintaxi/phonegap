/*
 * Example usage of the plugin:
 *
 *   window.plugins.example.echo(
 *       // argument passed to the native plugin
 *       'Hello PhoneGap',
 *
 *       // success callback
 *       function(response) {
 *           alert(response);
 *       },
 *
 *       // error callback
 *       function(error) {
 *           alert('error: ' + error);
 *       }
 *   );
 */
(function() {
    var Example = function() {
        return {
            echo: function(message, successCallback, errorCallback) {
                PhoneGap.exec(successCallback, errorCallback, 'Example', 'echo', [ message ]);
            }
        }
    };

    PhoneGap.addConstructor(function() {
        // add plugin to window.plugins
        PhoneGap.addPlugin('example', new Example());

        // register plugin on native side
        phonegap.PluginManager.addPlugin('Example', 'com.phonegap.plugins.Example');
    });
})();