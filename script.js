const preview = document.getElementById("preview-ranks");
const previewStatus = document.getElementById("preview-description");

loadRankings().then(snapshot => {
  const levels = snapshot.boards.find(board => board.id === "levels");
  for (const player of levels.rows.slice(0, 3)) {
    const row = preview.insertRow();
    row.insertCell().textContent = "#" + player.rank;
    row.insertCell().textContent = player.name;
    row.insertCell().textContent = rankNumber.format(player.level);
  }
  previewStatus.textContent = levels.total ? "Player Levels" : "No ranked players yet.";
}).catch(() => {
  previewStatus.textContent = "Rankings are temporarily unavailable.";
});

document.getElementById("play-button").addEventListener("click", play);

function play() {
  const gamePanel = document.getElementById("play_game2");
  if (!gamePanel.hidden) return;

  const gameFrame = document.createElement("iframe");
  gameFrame.id = "gameIFrame";
  gameFrame.title = "Ghoul Valley game";
  gameFrame.allowFullscreen = true;

  document.getElementById("play_game1").hidden = true;
  document.querySelector(".site-header").before(gamePanel);
  gamePanel.hidden = false;
  gamePanel.append(gameFrame);

  const gameUrl = new URL("https://ghoulvalley.com/Game/index.html");
  gameUrl.searchParams.set("gameWidth", gameFrame.clientWidth);
  gameUrl.searchParams.set("gameHeight", gameFrame.clientHeight);
  gameFrame.src = gameUrl.href;
  window.scrollTo(0, 0);
  gameFrame.focus();
}
