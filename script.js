window.onload = function(){ //Setting game size after window has loaded, or else the unityContainer will be null.

  var gameWidth =  window.screen.width - 150;

  var gameHeight = window.screen.height * .75 ; //Setting game height to 70% of the users screen height.  I don't show the full amount so that they don't think it's true full screen and they know a website is below.

  var gameFrame = document.getElementById("gameIFrame");


  //dealing with scrollbar issues
  gameFrame.width = gameWidth + 25;
  gameFrame.height = gameHeight + 50; //The +50 seems to fix issue with their being a scroll bar for the game area.
  gameFrame.src += "?gameWidth=" + gameWidth + "&gameHeight=" + gameHeight;
}
