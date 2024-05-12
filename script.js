window.onload = function(){ //Setting game size after window has loaded, or else the unityContainer will be null.

  var gameWidth =  window.screen.width - 50;

  var gameHeight = window.screen.height * .8; //Setting game height to 80% of the users screen height.  I don't show the full amount so that they don't think it's true full screen and they know a website is below.


  var gameFrame = document.getElementById("gameIFrame");
  gameFrame.width = gameWidth + 5;
  gameFrame.height = gameHeight + 15; //The +5 seems to fix issue with their being a scroll bar for the game area.
  gameFrame.src += "?gameWidth=" + gameWidth + "&gameHeight=" + gameHeight;
}
