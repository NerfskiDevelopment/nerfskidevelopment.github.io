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

const playButton = document.getElementById("play-button");
const playStatus = document.getElementById("play-status");
playButton.addEventListener("click", play);

async function play() {
  const gamePanel = document.getElementById("play_game2");
  if (!gamePanel.hidden || playButton.disabled) return;

  playButton.disabled = true;
  playStatus.hidden = false;
  playStatus.textContent = "Checking game version…";
  let clientBuild;
  try {
    const response = await fetch("https://server.ghoulvalley.com:4505/api/game/version", {
      cache: "no-store",
      signal: AbortSignal.timeout(6000)
    });
    if (response.status === 503) {
      playStatus.textContent = "The game is temporarily unavailable. Try again shortly.";
      return;
    }
    if (!response.ok) throw new Error("Version check failed");
    clientBuild = (await response.text()).trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(clientBuild)) {
      throw new Error("Invalid game version");
    }
  } catch {
    playStatus.textContent = "Can’t reach the game server. Try again.";
    return;
  } finally {
    playButton.disabled = false;
  }
  playStatus.hidden = true;

  const gameFrame = document.createElement("iframe");
  gameFrame.id = "gameIFrame";
  gameFrame.title = "Ghoul Valley game";
  gameFrame.allowFullscreen = true;

  document.getElementById("play_game1").hidden = true;
  document.querySelector(".site-header").before(gamePanel);
  gamePanel.hidden = false;
  gamePanel.append(gameFrame);

  const gameUrl = new URL("./Game/" + clientBuild + "/index.html", window.location.href);
  gameUrl.searchParams.set("gameWidth", gameFrame.clientWidth);
  gameUrl.searchParams.set("gameHeight", gameFrame.clientHeight);
  gameFrame.src = gameUrl.href;
  window.scrollTo(0, 0);
  gameFrame.focus();
}
