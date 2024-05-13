window.onload = function(){ //Setting game size after window has loaded, or else the unityContainer will be null.

  var gameWidth =  window.screen.width - 50;

  var gameHeight = window.screen.height * .8; //Setting game height to 80% of the users screen height.  I don't show the full amount so that they don't think it's true full screen and they know a website is below.

  //shrinking the window a little bit
  gameFrame.width -= 80;
  gameFrame.height -= 100;
  
  var gameFrame = document.getElementById("gameIFrame");
  gameFrame.width = gameWidth + 25;
  gameFrame.height = gameHeight + 40; //The +40 seems to fix issue with their being a scroll bar for the game area.
  gameFrame.src += "?gameWidth=" + gameWidth + "&gameHeight=" + gameHeight;
}
