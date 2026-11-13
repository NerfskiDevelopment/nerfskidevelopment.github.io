const featured = document.getElementById("featured-boards");
const additional = document.getElementById("additional-boards");
const hourNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const results = document.getElementById("rank-results");
const browse = document.getElementById("rank-browse");
const filters = document.getElementById("rank-filters");
const reset = document.getElementById("rank-reset");
const input = document.getElementById("rank-name");
const form = document.getElementById("rank-form");
const searchButton = form.querySelector("button");
const status = document.getElementById("rank-status");
const rankings = loadRankings();
let searchNumber = 0;
let browseStatus = "";
let selectedFilter = "all";
const boardGroups = {
  levels: "players", coins: "players", shards: "players", fame: "players", pets: "pets", "pet-parties": "pets",
  "weekly-xp": "activity", "monster-hunters": "activity", "hours-online": "activity", "peak-damage": "activity"
};

function applyFilter() {
  const container = browse.hidden ? results : browse;
  const cards = container.querySelectorAll("[data-board-group]");
  let visible = 0;
  for (const card of cards) {
    card.hidden = selectedFilter !== "all" && card.dataset.boardGroup !== selectedFilter;
    if (!card.hidden) visible++;
  }
  const empty = document.getElementById("rank-filter-empty");
  empty.hidden = cards.length === 0 || visible > 0;
}

filters.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  selectedFilter = button.value;
  for (const option of filters.querySelectorAll("button")) {
    option.setAttribute("aria-pressed", String(option === button));
  }
  applyFilter();
});

function nextWeeklyReset(now) {
  const daysToMonday = (8 - now.getUTCDay()) % 7 || 7;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysToMonday));
}

function updateCountdown() {
  const now = new Date();
  const next = nextWeeklyReset(now);
  const minutes = Math.ceil((next - now) / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor(minutes / 60) % 24;
  const resetText = next.toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short"
  });
  for (const timer of document.querySelectorAll(".weekly-reset")) {
    timer.dateTime = next.toISOString();
    timer.textContent = "Resets in " + days + "d " + hours + "h " + minutes % 60 + "m (" + resetText + ")";
  }
}

setInterval(updateCountdown, 15000);

function addCell(row, tag, value, className) {
  const cell = document.createElement(tag);
  cell.textContent = value;
  if (tag === "th") cell.scope = "col";
  if (className) cell.className = className;
  row.append(cell);
  return cell;
}

function groupSearchResults(matches, pageSize) {
  const petPages = new Map();
  const groups = [];
  for (const match of matches) {
    if (!Object.hasOwn(rankBoards, match.board)) continue;
    if (match.board !== "pets") {
      groups.push({ board: match.board, ranks: new Set([match.rank]), rows: match.rows });
      continue;
    }
    const page = Math.floor((match.rank - 1) / pageSize) + 1;
    if (!petPages.has(page)) petPages.set(page, { ranks: new Set(), rows: new Map() });
    const group = petPages.get(page);
    group.ranks.add(match.rank);
    for (const row of match.rows) group.rows.set(row.rank, row);
  }
  for (const [page, group] of [...petPages].sort(([a], [b]) => a - b)) {
    groups.push({ board: "pets", page, ranks: group.ranks,
      rows: [...group.rows.values()].sort((a, b) => a.rank - b.rank) });
  }
  return groups;
}

function addBoard(container, boardId, headingText, rows, matchRanks) {
  const board = rankBoards[boardId];
  const hasOwner = boardId === "pets";
  const card = document.createElement("section");
  card.className = "site-panel rank-board";
  card.dataset.boardGroup = boardGroups[boardId];
  const heading = document.createElement("h2");
  heading.textContent = headingText;
  card.append(heading);

  if (!matchRanks && board.art.length) {
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

  const body = table.createTBody();
  let previousRank;
  for (const entry of rows) {
    if (previousRank !== undefined && entry.rank > previousRank + 1) {
      const gap = body.insertRow().insertCell();
      gap.colSpan = hasOwner ? 4 : 3;
      gap.className = "rank-gap";
      gap.textContent = "Ranks " + rankNumber.format(previousRank + 1) + "–" + rankNumber.format(entry.rank - 1) + " omitted";
    }
    previousRank = entry.rank;
    const row = body.insertRow();
    if (matchRanks?.has(entry.rank)) {
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
  }
  if (!rows.length) {
    const cell = body.insertRow().insertCell();
    cell.colSpan = hasOwner ? 4 : 3;
    cell.textContent = "No ranked entries yet.";
  }

  card.append(table);
  if (boardId === "weekly-xp") {
    const timer = document.createElement("time");
    timer.className = "weekly-reset";
    card.insertBefore(timer, table);
  }
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
  applyFilter();
  updateCountdown();
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
  applyFilter();
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
  applyFilter();
  status.textContent = "Searching rankings for " + username + "…";

  try {
    const query = new URLSearchParams({ username });
    const { matches, pageSize = 100 } = await readRanks("leaderboards/search?" + query);
    if (currentSearch !== searchNumber) return;

    const windows = groupSearchResults(matches, pageSize);
    status.textContent = windows.length ? "Standings for " + username : "No ranks found for " + username + ".";
    for (const match of windows) {
      const detail = match.page === undefined
        ? "#" + rankNumber.format(match.ranks.values().next().value)
        : "Page " + rankNumber.format(match.page) + " · " + match.ranks.size + (match.ranks.size === 1 ? " match" : " matches");
      addBoard(results, match.board, rankBoards[match.board].title + " · " + detail, match.rows, match.ranks);
    }
    applyFilter();
    updateCountdown();
  } catch {
    if (currentSearch === searchNumber) status.textContent = "Search is temporarily unavailable. Try again.";
  }
});
