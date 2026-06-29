/**
 * Single-category study page (grid, syllable rows, or word list).
 */
const CategoryStudy = (() => {
  const BASIC_CONSONANT_COUNT = 14;

  function buildCell(item, fromPage, cellClassName = 'category-page__cell') {
    const cell = document.createElement('div');
    cell.className = cellClassName;

    const char = document.createElement('span');
    char.className = 'category-page__char';
    char.textContent = item.char;

    const roman = document.createElement('span');
    roman.className = 'category-page__roman';
    roman.textContent = item.roman;

    const actions = document.createElement('div');
    actions.className = 'category-page__actions';

    const btnTts = document.createElement('button');
    btnTts.type = 'button';
    btnTts.className = 'category-page__icon-btn';
    btnTts.setAttribute('aria-label', `Listen ${item.char}`);
    btnTts.textContent = '\uD83D\uDD0A';
    btnTts.addEventListener('click', () => TTS.speakItem(item));

    const linkStroke = document.createElement('a');
    linkStroke.className = 'category-page__icon-btn';
    linkStroke.href = `stroke.html?char=${encodeURIComponent(item.char)}&from=${encodeURIComponent(fromPage)}`;
    linkStroke.setAttribute('aria-label', `Write ${item.char}`);
    linkStroke.textContent = '\u270F\uFE0F';

    actions.appendChild(btnTts);
    actions.appendChild(linkStroke);
    cell.appendChild(char);
    cell.appendChild(roman);
    cell.appendChild(actions);

    return cell;
  }

  function buildGrid(items, fromPage) {
    const grid = document.createElement('div');
    grid.className = 'category-page__grid';

    items.forEach((item) => {
      grid.appendChild(buildCell(item, fromPage));
    });

    return grid;
  }

  function buildSyllableRows(groups, fromPage) {
    const root = document.createElement('div');
    root.className = 'syllable-rows';

    groups.forEach((group) => {
      const row = document.createElement('div');
      row.className = 'syllable-rows__row';

      const label = document.createElement('div');
      label.className = 'syllable-rows__label';
      label.textContent = group.consonant.char;
      label.setAttribute('aria-hidden', 'true');

      const track = document.createElement('div');
      track.className = 'syllable-rows__track';
      track.setAttribute('role', 'list');
      track.setAttribute('aria-label', `${group.consonant.char} syllables`);

      group.items.forEach((item) => {
        track.appendChild(buildCell(item, fromPage, 'syllable-rows__cell'));
      });

      row.appendChild(label);
      row.appendChild(track);
      root.appendChild(row);
    });

    return root;
  }

  function renderWords(container, items) {
    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'category-page__list';

    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'category-page__word';

      const body = document.createElement('div');
      body.className = 'category-page__word-body';

      const char = document.createElement('div');
      char.className = 'category-page__word-char';
      char.textContent = item.char;

      const roman = document.createElement('div');
      roman.className = 'category-page__word-roman';
      roman.textContent = item.roman;

      const meaning = document.createElement('div');
      meaning.className = 'category-page__word-meaning';
      meaning.textContent = item.meaning || '';

      const btnTts = document.createElement('button');
      btnTts.type = 'button';
      btnTts.className = 'category-page__icon-btn';
      btnTts.setAttribute('aria-label', `Listen ${item.char}`);
      btnTts.textContent = '\uD83D\uDD0A';
      btnTts.addEventListener('click', () => TTS.speakItem(item));

      body.appendChild(char);
      body.appendChild(roman);
      body.appendChild(meaning);
      row.appendChild(body);
      row.appendChild(btnTts);
      list.appendChild(row);
    });

    container.appendChild(list);
  }

  async function init({ title, fromPage, mode, getItems, getGroups }) {
    document.getElementById('page-title').textContent = title;
    const container = document.getElementById('content');

    if (mode === 'words') {
      const items = typeof getItems === 'function' ? getItems() : getItems;
      renderWords(container, items);
    } else if (mode === 'syllable-rows') {
      const groups = typeof getGroups === 'function' ? getGroups() : getGroups;
      container.appendChild(buildSyllableRows(groups, fromPage));
    } else {
      const items = typeof getItems === 'function' ? getItems() : getItems;
      container.appendChild(buildGrid(items, fromPage));
    }

    await TTS.init();
  }

  return { init, BASIC_CONSONANT_COUNT };
})();
