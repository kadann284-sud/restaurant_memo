let data = {};

// =======================
// JSON読み込み
// =======================
fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    initItemSelect();
  });

// =======================
// セレクト取得
// =======================
const itemSelect = document.getElementById('itemSelect');
const categorySelect = document.getElementById('categorySelect');
const typeSelect = document.getElementById('typeSelect');
const type2Select = document.getElementById('type2Select');

// =======================
// 項目 初期化
// =======================
function initItemSelect() {
  Object.keys(data).forEach(item => {
    itemSelect.appendChild(new Option(item, item));
  });
}

// =======================
// 項目 → カテゴリ
// =======================
itemSelect.addEventListener('change', () => {
  resetSelect(categorySelect);
  resetSelect(typeSelect);
  resetSelect(type2Select);

  disableSelect(categorySelect);
  disableSelect(typeSelect);
  disableSelect(type2Select);

  const item = itemSelect.value;
  if (!item) return;

  const value = data[item];

  // 次がオブジェクトでなければ終了
  if (!value || Array.isArray(value)) return;

  enableSelect(categorySelect);
  Object.keys(value).forEach(cat => {
    categorySelect.appendChild(new Option(cat, cat));
  });
});

// =======================
// カテゴリ → 種類
// =======================
categorySelect.addEventListener('change', () => {
  resetSelect(typeSelect);
  resetSelect(type2Select);

  disableSelect(typeSelect);
  disableSelect(type2Select);

  const item = itemSelect.value;
  const category = categorySelect.value;
  if (!item || !category) return;

  const value = data[item][category];

  if (!value || Array.isArray(value)) return;

  enableSelect(typeSelect);
  Object.keys(value).forEach(type => {
    typeSelect.appendChild(new Option(type, type));
  });
});

// =======================
// 種類 → 種類2
// =======================
typeSelect.addEventListener('change', () => {
  resetSelect(type2Select);
  disableSelect(type2Select);

  const item = itemSelect.value;
  const category = categorySelect.value;
  const type = typeSelect.value;
  if (!item || !category || !type) return;

  const value = data[item][category][type];

  if (!value || Array.isArray(value)) return;

  enableSelect(type2Select);
  Object.keys(value).forEach(t2 => {
    type2Select.appendChild(new Option(t2, t2));
  });
});

// =======================
// 検索
// =======================
document.getElementById('searchBtn').addEventListener('click', search);

function search() {
  const item = itemSelect.value;
  const category = categorySelect.value;
  const type = typeSelect.value;
  const type2 = type2Select.value;
  const keyword = document.getElementById('searchInput').value.trim();

  const results = [];

  traverse(data, (obj, path) => {
    if (item && path.item !== item) return;
    if (category && path.category !== category) return;
    if (type && path.type !== type) return;
    if (type2 && path.type2 !== type2) return;

    if (!keyword || obj.メニュー.includes(keyword) || obj.内容.includes(keyword)) {
      results.push({ ...path, ...obj });
    }
  });

  render(results);
}

// =======================
// 再帰探索
// =======================
function traverse(node, callback, path = {}) {
  if (Array.isArray(node)) {
    node.forEach(obj => callback(obj, path));
    return;
  }

  Object.entries(node).forEach(([key, value]) => {
    const nextPath = { ...path };

    if (!path.item) nextPath.item = key;
    else if (!path.category) nextPath.category = key;
    else if (!path.type) nextPath.type = key;
    else if (!path.type2) nextPath.type2 = key;

    traverse(value, callback, nextPath);
  });
}

// =======================
// 表示
// =======================
function render(results) {
  const container = document.getElementById('result');
  container.innerHTML = '';

  if (results.length === 0) {
    container.textContent = '該当なし';
    return;
  }

  results.forEach(d => {
    const div = document.createElement('div');
    div.className = 'menu-item';

    div.innerHTML = `
      <strong>${d.メニュー}</strong><br>
      ${d.内容}<br>
      <small>【${[d.item, d.category, d.type, d.type2].filter(Boolean).join(' / ')}】</small>
      ${d.画像 ? `<br><img src="${d.画像}" class="menu-img">` : ''}
    `;

    container.appendChild(div);
  });
}

// =======================
// 共通関数
// =======================
function resetSelect(select) {
  select.innerHTML = '<option value="">すべて</option>';
}

function disableSelect(select) {
  select.disabled = true;
}

function enableSelect(select) {
  select.disabled = false;
}
