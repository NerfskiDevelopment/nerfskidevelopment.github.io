const featured = document.getElementById("featured-boards");
const results = document.getElementById("rank-results");
const form = document.getElementById("rank-form");
const searchButton = form.querySelector("button");
const status = document.getElementById("rank-status");
const rankings = loadRankings();
let usernameIndex;
let searchNumber = 0;

function addCell(row, tag, value, className) {
  const cell = document.createElement(tag);
  cell.textContent = value;
  if (tag === "th") cell.scope = "col";
  if (className) cell.className = className;
  row.append(cell);
}

function addBoard(container, boardId, headingText, rows, matchRank) {
  const board = rankBoards[boardId];
  const hasOwner = boardId === "pets";
  const card = document.createElement("section");
  card.className = "site-panel rank-board";
  const heading = document.createElement("h2");
  heading.textContent = headingText;
  card.append(heading);

  if (matchRank === undefined) {
    const art = document.createElement("div");
    art.className = "board-art";
    art.setAttribute("aria-hidden", "true");
    for (const imageName of board.art) {
      const image = document.createElement("img");
      image.src = "./images/leaderboards/" + imageName + ".png";
      image.alt = "";
      art.append(image);
    }
    card.append(art);
  }

  const table = document.createElement("table");
  table.setAttribute("aria-label", headingText);
  const header = table.createTHead().insertRow();
  addCell(header, "th", "Rank");
  addCell(header, "th", hasOwner ? "Pet Name" : "Username");
  addCell(header, "th", "Level", "score");
  if (hasOwner) addCell(header, "th", "Owner");

  const body = table.createTBody();
  for (const entry of rows) {
    const row = body.insertRow();
    if (entry.rank === matchRank) {
      row.className = "rank-match";
      row.setAttribute("aria-current", "true");
    }
    addCell(row, "td", "#" + rankNumber.format(entry.rank), "rank-number");
    addCell(row, "td", entry.name);
    addCell(row, "td", rankNumber.format(entry.level), "score");
    if (hasOwner) addCell(row, "td", entry.owner);
  }
  if (!rows.length) {
    const cell = body.insertRow().insertCell();
    cell.colSpan = hasOwner ? 4 : 3;
    cell.textContent = "No ranked entries yet.";
  }

  card.append(table);
  container.append(card);
}

rankings.then(snapshot => {
  for (const board of snapshot.boards) {
    addBoard(featured, board.id, rankBoards[board.id].title + " (" + rankNumber.format(board.total) + " ranked)", board.rows);
  }
  status.textContent = "Updated " + new Date(snapshot.generatedAt).toLocaleString();
  searchButton.disabled = false;
}).catch(() => {
  status.textContent = "Rankings are temporarily unavailable. Reload to try again.";
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const currentSearch = ++searchNumber;
  const username = document.getElementById("rank-name").value.trim();
  results.textContent = username ? "Searching rankings…" : "Enter a username.";
  if (!username) return;

  try {
    const snapshot = await rankings;
    const snapshotPath = "snapshots/" + snapshot.version + "/";
    usernameIndex ??= readRanks(snapshotPath + "lookup.json").catch(error => {
      usernameIndex = undefined;
      throw error;
    });
    const lookup = await usernameIndex;
    const key = username.toLowerCase();
    const matches = Object.hasOwn(lookup, key) ? lookup[key] : [];
    const pages = new Map();
    const windows = await Promise.all(matches.map(async match => {
      const board = snapshot.boards.find(entry => entry.id === match.board);
      const first = Math.max(1, match.rank - 5);
      const last = Math.min(board.total, match.rank + 5);
      const requests = [];
      for (let page = Math.ceil(first / snapshot.pageSize); page <= Math.ceil(last / snapshot.pageSize); page++) {
        const path = snapshotPath + match.board + "-" + page + ".json";
        if (!pages.has(path)) pages.set(path, readRanks(path));
        requests.push(pages.get(path));
      }
      const rows = (await Promise.all(requests)).flat().filter(row => row.rank >= first && row.rank <= last);
      return { ...match, rows };
    }));
    if (currentSearch !== searchNumber) return;

    results.textContent = "";
    const summary = document.createElement("p");
    summary.textContent = windows.length ? "Standings for " + username : "No ranks found for " + username + ".";
    results.append(summary);
    for (const match of windows) {
      addBoard(results, match.board, rankBoards[match.board].title + " · #" + rankNumber.format(match.rank), match.rows, match.rank);
    }
  } catch {
    if (currentSearch === searchNumber) results.textContent = "Search is temporarily unavailable. Try again.";
  }
});
