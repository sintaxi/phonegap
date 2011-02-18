App = new Object();


/**********************************************************************/
/**********************************************************************/
/** BOOTSTRAP                                                        **/
/**********************************************************************/
/**********************************************************************/


/**
 * Bootstrap the framework, App and everything else
 */
document.addEventListener("deviceready", function() {
  App.jQT = new $.jQTouch({
    icon: 'img/chapeau_48.png',
    //useFastTouch: false,
    //useAnimations: false,
  });
  
  App.init();
}, false);


App.init = function() {
  $('#takePicture').click(function() {
    navigator.camera.getPicture(App.successHandler, App.failureHandler, {quality: 50});
  });
};

App.successHandler = function() {
  alert("Success!");
}

App.failureHandler = function() {
  alert("Failure..");
}

