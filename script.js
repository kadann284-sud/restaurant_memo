let data = {};

// =======================
// JSON読み込み
// =======================
fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    populateItemSelect();
  });

// =======================
// 項目セレクト初期化
// =======================
function populateItemSelect() {
  const select = document.getElementById('itemSelect');
  select.innerHTML = '<option value="">-- 選択してください --</option>';

  Object.keys(data).forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

// =======================
// 項目選択 → カテゴリ更新
// =======================
document.getElementById('itemSelect').addEventListener('change', e => {
  const categorySelect = document.getElementById('categorySelect');
  const selectedItem = e.target.value;

  categorySelect.innerHTML = '';

  if (
    selectedItem &&
    typeof data[selectedItem] === 'object' &&
    !Array.isArray(data[selectedItem])
  ) {
    categorySelect.disabled = false;
    categorySelect.appendChild(new Option('-- カテゴリを選択 --', ''));
    Object.keys(data[selectedItem]).forEach(cat => {
      categorySelect.appendChild(new Option(cat, cat));
    });
  } else {
    categorySelect.disabled = true;
    categorySelect.appendChild(new Option('-- カテゴリなし --', ''));
  }
});

// =======================
// 検索 / 一覧表示
// =======================
document.getElementById('searchBtn').addEventListener('click', () => {
  const selectedItem = document.getElementById('itemSelect').value;
  const selectedCategory = document.getElementById('categorySelect').value;
  const keyword = document.getElementById('searchInput').value.trim();
  const container = document.getElementById('result');

  container.innerHTML = '';

  const results = [];

  // =======================
  // 検索モード
  // =======================
  if (keyword) {

    // ▼ 項目未選択 → 全項目横断検索
    if (!selectedItem) {
      Object.entries(data).forEach(([itemName, itemValue]) => {
        collectMatches(itemName, '', itemValue, keyword, results);
      });
    }

    // ▼ 項目のみ選択 → その項目すべて検索
    else if (selectedItem && !selectedCategory) {
      collectMatches(selectedItem, '', data[selectedItem], keyword, results);
    }

    // ▼ 項目＋カテゴリ選択 → そのカテゴリのみ検索
    else {
      data[selectedItem][selectedCategory].forEach(d => {
        if (d.メニュー.includes(keyword) || d.内容.includes(keyword)) {
          results.push({ item: selectedItem, category: selectedCategory, ...d });
        }
      });
    }

    displayResults(results);
    return;
  }

  // =======================
  // 一覧表示モード（検索なし）
  // =======================

  // ▼ 項目のみ選択 → 全カテゴリ一覧
  if (selectedItem && !selectedCategory) {
    collectAll(selectedItem, data[selectedItem], results);
  }

  // ▼ 項目＋カテゴリ選択 → カテゴリ一覧
  else if (selectedItem && selectedCategory) {
    data[selectedItem][selectedCategory].forEach(d => {
      results.push({ item: selectedItem, category: selectedCategory, ...d });
    });
  }

  displayResults(results);
});

// =======================
// 検索用 共通関数
// =======================
function collectMatches(itemName, categoryName, value, keyword, results) {

  // 配列（値段など）
  if (Array.isArray(value)) {
    value.forEach(d => {
      if (d.メニュー.includes(keyword) || d.内容.includes(keyword)) {
        results.push({ item: itemName, category: categoryName, ...d });
      }
    });
  }

  // オブジェクト（カテゴリあり）
  else {
    Object.entries(value).forEach(([cat, list]) => {
      list.forEach(d => {
        if (d.メニュー.includes(keyword) || d.内容.includes(keyword)) {
          results.push({ item: itemName, category: cat, ...d });
        }
      });
    });
  }
}

// =======================
// 一覧表示用 共通関数
// =======================
function collectAll(itemName, value, results) {
  if (Array.isArray(value)) {
    value.forEach(d => {
      results.push({ item: itemName, category: '', ...d });
    });
  } else {
    Object.entries(value).forEach(([cat, list]) => {
      list.forEach(d => {
        results.push({ item: itemName, category: cat, ...d });
      });
    });
  }
}

// =======================
// 表示処理
// =======================
function displayResults(results) {
  const container = document.getElementById('result');
  container.innerHTML = '';

  if (!results || results.length === 0) {
    container.textContent = '該当なし';
    return;
  }

  results.forEach(d => {
    const div = document.createElement('div');
    div.className = 'menu-item';

    let html = `
      <strong>${d.メニュー}</strong><br>
      ${d.内容}<br>
      <small>【${d.item}${d.category ? ' / ' + d.category : ''}】</small>
    `;

    if (d.画像) {
      html += `<br><img src="${d.画像}" class="menu-img">`;
    }

    div.innerHTML = html;
    container.appendChild(div);
  });
}
