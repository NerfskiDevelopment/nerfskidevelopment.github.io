function play(){
  document.getElementById("play_game1").style.display = "none";
  document.getElementById("play_game2").style.display = "block";
  document.getElementById("play_game2").innerHTML = '      <iframe src="https://ghoulvalley.com/Game/index.html" width="1050" height="700" frameborder="0" id="gameIFrame" style="padding-left: 0px; padding-right: 0px; margin:0; padding:0px; overflow:hidden;" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" scrolling="no"></iframe>';

  var gameWidth =  window.screen.width - 17;

  var gameHeight = window.screen.height * .75 ; //Setting game height to 70% of the users screen height.  I don't show the full amount so that they don't think it's true full screen and they know a website is below.

  var gameFrame = document.getElementById("gameIFrame");


  //dealing with scrollbar issues
  gameFrame.width = gameWidth;
  gameFrame.height = gameHeight + 50; //The +50 seems to fix issue with their being a scroll bar for the game area.
  gameFrame.src += "?gameWidth=" + gameWidth + "&gameHeight=" + gameHeight;
}