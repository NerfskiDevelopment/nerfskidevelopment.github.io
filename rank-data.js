const leaderboardUrl = new URL("./leaderboard-data/", document.baseURI);
const rankBoards = {
  levels: { title: "Player Levels", art: ["star", "coin"] },
  pets: { title: "Pet Levels", art: ["dino", "dawg"] }
};
const rankNumber = new Intl.NumberFormat("en-US");

async function readRanks(path, cache = "default") {
  const response = await fetch(new URL(path, leaderboardUrl), { cache });
  if (!response.ok) throw new Error("Rankings unavailable");
  return response.json();
}

function loadRankings() {
  return readRanks("boards.json", "no-cache");
}
