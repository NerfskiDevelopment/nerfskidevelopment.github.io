// All rows and links are generated at release time. No game API requests.
const wikiTable = document.querySelector('.wiki-table');
const wikiCount = document.getElementById('wiki-count');

if (wikiTable) {
  const body = wikiTable.tBodies[0];
  const rows = Array.from(body.rows);
  const name = document.getElementById('wiki-name');
  const equipmentClass = document.getElementById('wiki-class');
  const hands = document.getElementById('wiki-hands');

  function filterRows() {
    const query = name.value.trim().toLowerCase();
    let count = 0;
    for (const row of rows) {
      row.hidden = !row.dataset.name.includes(query) ||
        (equipmentClass && equipmentClass.value !== 'all' && row.dataset.class !== equipmentClass.value && row.dataset.class !== 'All classes') ||
        (hands && hands.value !== 'all' && row.dataset.hands !== hands.value);
      if (!row.hidden) count++;
    }
    wikiCount.textContent = count + ' of ' + rows.length + ' entries';
    document.getElementById('wiki-empty').hidden = count !== 0;
  }
  name.addEventListener('input', filterRows);
  if (equipmentClass) equipmentClass.addEventListener('change', filterRows);
  if (hands) hands.addEventListener('change', filterRows);

  for (const button of wikiTable.querySelectorAll('[data-sort]')) {
    button.addEventListener('click', () => {
      const header = button.closest('th');
      const ascending = header.getAttribute('aria-sort') !== 'ascending';
      const column = header.cellIndex;
      const numeric = !['name', 'class', 'bonus'].includes(button.dataset.sort);
      const sorted = rows.slice().sort((a, b) => {
        const left = a.cells[column].dataset.value;
        const right = b.cells[column].dataset.value;
        const compare = numeric ? Number(left === 'true' ? 1 : left === 'false' ? 0 : left) - Number(right === 'true' ? 1 : right === 'false' ? 0 : right) : left.localeCompare(right);
        return compare * (ascending ? 1 : -1) || a.dataset.name.localeCompare(b.dataset.name);
      });
      for (const row of sorted) body.appendChild(row);
      for (const other of wikiTable.querySelectorAll('th')) {
        other.setAttribute('aria-sort', other === header ? (ascending ? 'ascending' : 'descending') : 'none');
        other.querySelector('span').textContent = other === header ? (ascending ? '▴' : '▾') : '↕';
      }
    });
  }
}

const wikiSearch = document.getElementById('wiki-search');
if (wikiSearch) {
  const results = document.getElementById('wiki-search-results');
  const entries = Array.from(results.querySelectorAll('[data-search]'));
  wikiSearch.addEventListener('input', () => {
    const query = wikiSearch.value.trim().toLowerCase();
    let count = 0;
    for (const entry of entries) {
      entry.hidden = !entry.dataset.search.includes(query);
      if (!entry.hidden) count++;
    }
    results.hidden = !query;
    document.getElementById('wiki-categories').hidden = !!query;
    wikiCount.textContent = count ? count + ' matching entries' : 'No entries match your search.';
  });
}
