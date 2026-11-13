const leaderboardUrl = new URL("https://server.ghoulvalley.com:4505/api/");
const rankBoards = {
  levels: { title: "Player Levels", score: "Level", art: ["star", "coin"], featured: true },
  pets: { title: "Pet Levels", score: "Level", art: ["dino", "dawg"], featured: true },
  "pet-parties": { title: "Pet Parties", score: "Total Level", art: ["dawg", "dino"] },
  "weekly-xp": { title: "Weekly XP Gain", score: "XP", art: ["star"] },
  "monster-hunters": { title: "Monster Hunters", score: "Lifetime Kills", art: ["flame-wand", "thorn"] },
  "hours-online": { title: "Hours Online", score: "Hours", art: ["log"] },
  coins: { title: "Coins", score: "Balance", art: ["coin"] }
};
const rankNumber = new Intl.NumberFormat("en-US");

async function readRanks(path, cache = "default") {
  const response = await fetch(new URL(path, leaderboardUrl), { cache });
  if (!response.ok) throw new Error("Rankings unavailable");
  return response.json();
}

function loadRankings() {
  return readRanks("leaderboards");
}
