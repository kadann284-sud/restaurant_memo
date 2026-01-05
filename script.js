let data = {};

// JSON読み込み
fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    populateItemSelect();
  });

// 項目セレクトに追加
function populateItemSelect() {
  const select = document.getElementById('itemSelect');
  Object.keys(data).forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

// 項目選択時にカテゴリを更新
document.getElementById('itemSelect').addEventListener('change', e => {
  const categorySelect = document.getElementById('categorySelect');
  const selectedItem = e.target.value;

  categorySelect.innerHTML = '';

  if (selectedItem && typeof data[selectedItem] === 'object' && !Array.isArray(data[selectedItem])) {
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

// 検索・表示
document.getElementById('searchBtn').addEventListener('click', () => {
  const keyword = document.getElementById('searchInput').value.trim();
  const container = document.getElementById('result');
  container.innerHTML = '';

  if (!keyword) {
    container.textContent = '検索ワードを入力してください';
    return;
  }

  const results = [];

  Object.entries(data).forEach(([itemName, itemValue]) => {

    // 配列（値段など）
    if (Array.isArray(itemValue)) {
      itemValue.forEach(d => {
        if (d.メニュー.includes(keyword) || d.内容.includes(keyword)) {
          results.push({ item: itemName, category: '', ...d });
        }
      });
    }

    // オブジェクト（セット・弁当・ステーキなど）
    else {
      Object.entries(itemValue).forEach(([categoryName, list]) => {
        list.forEach(d => {
          if (d.メニュー.includes(keyword) || d.内容.includes(keyword)) {
            results.push({ item: itemName, category: categoryName, ...d });
          }
        });
      });
    }
  });

  displayAllResults(results);
});


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
    let html = `<strong>${d.メニュー}</strong>: ${d.内容}`;
    if (d.画像) html += `<br><img src="${d.画像}" alt="${d.メニュー}" class="menu-img">`;
    div.innerHTML = html;
    container.appendChild(div);
  });
}
