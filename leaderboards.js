const featured = document.getElementById("featured-boards");
const additional = document.getElementById("additional-boards");
const hourNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const results = document.getElementById("rank-results");
const browse = document.getElementById("rank-browse");
const reset = document.getElementById("rank-reset");
const input = document.getElementById("rank-name");
const form = document.getElementById("rank-form");
const searchButton = form.querySelector("button");
const status = document.getElementById("rank-status");
const rankings = loadRankings();
let searchNumber = 0;
let browseStatus = "";

function addCell(row, tag, value, className) {
  const cell = document.createElement(tag);
  cell.textContent = value;
  if (tag === "th") cell.scope = "col";
  if (className) cell.className = className;
  row.append(cell);
  return cell;
}

function addBoard(container, boardId, headingText, rows, matchRank) {
  const board = rankBoards[boardId];
  const hasOwner = boardId === "pets";
  const hasParty = boardId === "pet-parties";
  const card = document.createElement("section");
  card.className = "site-panel rank-board";
  const heading = document.createElement("h2");
  heading.textContent = headingText;
  card.append(heading);

  if (board.art.length) {
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
  addCell(header, "th", board.score, "score");
  if (hasOwner) addCell(header, "th", "Owner");
  if (hasParty) addCell(header, "th", "Active Pets");

  const body = table.createTBody();
  for (const entry of rows) {
    const row = body.insertRow();
    if (entry.rank === matchRank) {
      row.className = "rank-match";
      row.setAttribute("aria-current", "true");
    }
    const rankCell = addCell(row, "td", "", "rank-number");
    const badge = document.createElement("span");
    badge.className = "rank-badge";
    if (entry.rank <= 3) badge.classList.add("rank-place-" + entry.rank);
    badge.textContent = "#" + rankNumber.format(entry.rank);
    rankCell.append(badge);
    addCell(row, "td", entry.name);
    const number = boardId === "hours-online" ? hourNumber : rankNumber;
    addCell(row, "td", number.format(entry.level), "score");
    if (hasOwner) addCell(row, "td", entry.owner);
    if (hasParty) addCell(row, "td", entry.party.join(", "));
  }
  if (!rows.length) {
    const cell = body.insertRow().insertCell();
    cell.colSpan = hasOwner || hasParty ? 4 : 3;
    cell.textContent = "No ranked entries yet.";
  }

  card.append(table);
  container.append(card);
}

rankings.then(snapshot => {
  for (const board of snapshot.boards) {
    const details = rankBoards[board.id];
    if (!details) continue;
    addBoard(details.featured ? featured : additional, board.id,
      details.title + " (" + rankNumber.format(board.total) + " ranked)", board.rows);
  }
  browseStatus = "Top 25 per board · Updated " + new Date(snapshot.generatedAt).toLocaleString();
  status.textContent = browseStatus;
  searchButton.disabled = false;
}).catch(() => {
  status.textContent = "Rankings are temporarily unavailable. Reload to try again.";
});

reset.addEventListener("click", () => {
  ++searchNumber;
  input.value = "";
  results.replaceChildren();
  results.hidden = true;
  browse.hidden = false;
  reset.hidden = true;
  status.textContent = browseStatus;
  input.focus();
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const username = input.value.trim();
  if (!username) return;

  const currentSearch = ++searchNumber;
  browse.hidden = true;
  results.replaceChildren();
  results.hidden = false;
  reset.hidden = false;
  status.textContent = "Searching rankings for " + username + "…";

  try {
    const query = new URLSearchParams({ username });
    const { matches } = await readRanks("leaderboards/search?" + query);
    if (currentSearch !== searchNumber) return;

    const windows = matches.filter(match => Object.hasOwn(rankBoards, match.board));
    status.textContent = windows.length ? "Standings for " + username : "No ranks found for " + username + ".";
    for (const match of windows) {
      addBoard(results, match.board, rankBoards[match.board].title + " · #" + rankNumber.format(match.rank), match.rows, match.rank);
    }
  } catch {
    if (currentSearch === searchNumber) status.textContent = "Search is temporarily unavailable. Try again.";
  }
});
