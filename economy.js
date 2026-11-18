(() => {
  const url = "https://server.ghoulvalley.com:4505/api/economy";
  const charts = document.getElementById("economy-charts");
  const status = document.getElementById("economy-status");
  const refresh = document.getElementById("refresh");
  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
  const definitions = [
    { title: "Peak concurrent players", keys: ["peakConcurrent"], labels: ["Players"] },
    { title: "Total money in game", keys: ["money"], labels: ["Coins"] },
    { title: "Total shards in game", keys: ["shards"], labels: ["Shards"] },
    { title: "New accounts per day", keys: ["newAccounts"], labels: ["Accounts"] },
    { title: "Daily active players", keys: ["dailyActive"], labels: ["Players"] },
    { title: "Money earned and spent", keys: ["moneyEarned", "moneySpent"], labels: ["Earned", "Spent"] },
    { title: "Average daily playtime", keys: ["averagePlaytimeMinutes"], labels: ["Minutes"] }
  ];
  const colors = ["#167bb5", "#b35326"];
  let data;
  let range = "30";
  let rendered = [];
  function text(tag, value, className) {
    const element = document.createElement(tag);
    element.textContent = value;
    if (className) element.className = className;
    return element;
  }
  function valid(value) {
    return typeof value === "number" && Number.isFinite(value) ||
      typeof value === "string" && /^-?\d+$/.test(value) && Number.isFinite(Number(value));
  }
  function format(value) {
    if (!valid(value)) return "No data";
    return number.format(typeof value === "string" ? BigInt(value) : value);
  }
  function dateLabel(value) {
    return new Date(value + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }
  function draw(chart, selected = -1) {
    const { canvas, rows, definition } = chart;
    const width = canvas.getBoundingClientRect().width;
    if (!width) return;
    const height = 220;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = height * ratio;
    const context = canvas.getContext("2d");
    context.scale(ratio, ratio);
    const left = 50, top = 12, right = width - 12, bottom = 186;
    const values = rows.flatMap(row => definition.keys.map(key => row[key])).filter(valid).map(Number);
    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);
    const x = index => left + (rows.length <= 1 ? (right - left) / 2 : index * (right - left) / (rows.length - 1));
    const y = value => bottom - (value - min) / (max - min) * (bottom - top);
    context.font = "11px Arial";
    context.lineWidth = 1;
    for (let tick = 0; tick <= 4; tick++) {
      const value = min + (max - min) * tick / 4;
      const position = y(value);
      context.strokeStyle = "#e0ebf4";
      context.beginPath(); context.moveTo(left, position); context.lineTo(right, position); context.stroke();
      context.fillStyle = "#52677c";
      context.textAlign = "right";
      context.fillText(compact.format(value), left - 8, position + 4);
    }
    context.textAlign = "center";
    const ticks = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
    for (const index of ticks) {
      if (index >= 0 && rows[index]) context.fillText(dateLabel(rows[index].date), x(index), 210);
    }
    definition.keys.forEach((key, series) => {
      context.strokeStyle = colors[series];
      context.fillStyle = colors[series];
      context.lineWidth = 2.5;
      context.setLineDash(series ? [5, 3] : []);
      context.beginPath();
      let previous = false;
      rows.forEach((row, index) => {
        if (!valid(row[key])) { previous = false; return; }
        if (previous) context.lineTo(x(index), y(row[key]));
        else context.moveTo(x(index), y(row[key]));
        previous = true;
      });
      context.stroke();
      context.setLineDash([]);
      rows.forEach((row, index) => {
        if (!valid(row[key])) return;
        if (rows.length > 90 && index !== selected) return;
        context.beginPath(); context.arc(x(index), y(row[key]), index === selected ? 4 : 2, 0, Math.PI * 2); context.fill();
      });
    });
    if (!values.length) {
      context.fillStyle = "#52677c";
      context.textAlign = "center";
      context.font = "14px Arial";
      context.fillText("No data in this range", (left + right) / 2, 95);
    }
  }
  function inspect(chart, index) {
    if (!chart.rows.length) return;
    index = Math.max(0, Math.min(chart.rows.length - 1, index));
    chart.selected = index;
    const row = chart.rows[index];
    chart.readout.textContent = row.date + " | " + chart.definition.keys.map((key, series) =>
      chart.definition.labels[series] + " " + format(row[key])).join(" | ");
    draw(chart, index);
  }
  function render() {
    charts.replaceChildren();
    rendered = [];
    let rows = data.days;
    if (range !== "all" && rows.length) {
      const cutoff = new Date(rows[rows.length - 1].date + "T12:00:00Z");
      cutoff.setUTCDate(cutoff.getUTCDate() - Number(range) + 1);
      rows = rows.filter(row => row.date >= cutoff.toISOString().slice(0, 10));
    }
    for (const definition of definitions) {
      const card = text("section", "", "economy-card");
      card.append(text("h2", definition.title));
      const latest = [...rows].reverse().find(row => definition.keys.some(key => valid(row[key])));
      const value = latest ? definition.keys.map((key, series) =>
        (definition.keys.length > 1 ? definition.labels[series] + " " : "") + format(latest[key])).join(" / ") : "No data";
      card.append(text("p", value, "economy-value"));
      const legend = text("div", "", "economy-legend");
      definition.labels.forEach((label, index) => {
        const item = text("span", label);
        item.style.setProperty("--series-color", colors[index]);
        legend.append(item);
      });
      const canvas = document.createElement("canvas");
      canvas.tabIndex = 0;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", definition.title + ". Use left and right arrow keys to inspect days, or expand daily values.");
      const readout = text("p", latest ? latest.date : "No data yet.", "economy-readout");
      readout.setAttribute("aria-live", "polite");
      const chart = { canvas, rows, definition, readout, selected: rows.length - 1 };
      canvas.addEventListener("pointermove", event => {
        const bounds = canvas.getBoundingClientRect();
        inspect(chart, Math.round((event.clientX - bounds.left - 50) / Math.max(1, bounds.width - 62) * (rows.length - 1)));
      });
      canvas.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        inspect(chart, event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : chart.selected + (event.key === "ArrowLeft" ? -1 : 1));
      });
      const details = document.createElement("details");
      details.append(text("summary", "View daily values"));
      details.addEventListener("toggle", () => {
        if (!details.open || details.children.length > 1) return;
        const scroll = text("div", "", "economy-table-scroll");
        const table = document.createElement("table");
        const head = table.createTHead().insertRow();
        for (const label of ["Day", ...definition.labels]) {
          const cell = text("th", label); cell.scope = "col"; head.append(cell);
        }
        const body = table.createTBody();
        for (const row of [...rows].reverse()) {
          const line = body.insertRow();
          line.append(text("td", row.date));
          for (const key of definition.keys) line.append(text("td", format(row[key])));
        }
        scroll.append(table); details.append(scroll);
      });
      card.append(legend, canvas, readout, details);
      charts.append(card);
      rendered.push(chart);
      draw(chart);
    }
  }
  async function load() {
    refresh.disabled = true;
    status.hidden = false;
    status.textContent = "Loading...";
    try {
      const response = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error("Statistics unavailable");
      const result = await response.json();
      if (!Array.isArray(result.days)) throw new Error("Invalid statistics");
      data = result;
      render();
      status.textContent = "";
      status.hidden = true;
    } catch {
      status.textContent = data ? "Refresh failed. Showing previous data." :
        "Statistics unavailable. Try Refresh.";
    } finally { refresh.disabled = false; }
  }
  document.getElementById("ranges").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    range = button.value;
    for (const option of document.querySelectorAll("#ranges button")) option.setAttribute("aria-pressed", String(option === button));
    if (data) render();
  });
  refresh.addEventListener("click", load);
  let resize;
  window.addEventListener("resize", () => { clearTimeout(resize); resize = setTimeout(() => rendered.forEach(chart => draw(chart)), 100); });
  load();
})();
