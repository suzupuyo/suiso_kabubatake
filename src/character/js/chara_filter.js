// chara_filter.js

let items = [];
let currentPage = 1;
const PER_PAGE = 20;

// JSONデータから1つ分の .character-item 要素を生成する関数
function createCharacterItemElement(c) {
    const item = document.createElement('div');
    item.className = 'character-item';

    // データ属性の設定（既存のフィルターロジックと完全互換）
    item.dataset.id = c.id;
    if (c.genre) item.dataset.genre = c.genre;
    if (c.role) item.dataset.role = c.role;

    // works, years が配列の場合はカンマ区切り文字列にしてセット
    const worksStr = Array.isArray(c.works) ? c.works.join(',') : (c.works || '');
    const yearsStr = Array.isArray(c.years) ? c.years.join(',') : (c.years || '');
    if (worksStr) item.dataset.works = worksStr;
    if (yearsStr) item.dataset.years = yearsStr;

    // 内部HTMLの組み立て（デザインに合わせて調整してください）
    item.innerHTML = `
        <a href="${c.file_name}" class="character-card">
            <div class="character-icon">
                <img src="${c.icon || 'default-icon.png'}" alt="${c.name}">
            </div>
            <div class="character-name">${c.name}</div>
        </a>
    `;

    return item;
}

function adjustNameLength() {
    const names = document.querySelectorAll('.character-name');
    names.forEach(name => {
        const length = name.innerText.length;
        if (length > 15) {
            name.classList.add('is-extra-small');
        } else if (length > 10) {
            name.classList.add('is-small');
        }
    });
}

/* --- ここから下の関数（updateVisibility, loadMore, searchCharacters, sortAndRender, filterCharacters, toggleSidebar）はそのまま変更不要 --- */

window.updateVisibility = () => { /* 変更なし */ };
window.loadMore = () => { /* 変更なし */ };
window.searchCharacters = () => { /* 変更なし */ };
window.sortAndRender = () => { /* 変更なし */ };
window.filterCharacters = (value, type) => { /* 変更なし */ };
window.toggleSidebar = () => { /* 変更なし */ };


// 初期化処理（JSONの非同期取得を組み込み）
document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.querySelector('.character-list');
    if (!listContainer) return;

    try {
        // 1. characters.json を取得
        const response = await fetch('characters.json');
        const characterDataList = await response.json();

        // 2. DOM要素を作成して描画
        characterDataList.forEach(data => {
            const itemEl = createCharacterItemElement(data);
            listContainer.appendChild(itemEl);
        });

        // 3. 生成された要素を items 配列に格納
        items = Array.from(document.querySelectorAll('.character-item'));
        adjustNameLength();

        // 4. フィルターボタン・選択肢の動的生成（既存ロジック）
        const genres = new Set();
        const works = new Set();
        const years = new Set();

        items.forEach(item => {
            if (item.dataset.genre) genres.add(item.dataset.genre);
            if (item.dataset.works) item.dataset.works.split(',').forEach(w => w && works.add(w));
            if (item.dataset.years) item.dataset.years.split(',').forEach(y => y && years.add(y));
        });

        const createButtons = (set, targetId, type) => {
            const container = document.getElementById(targetId);
            if (!container) return;
            Array.from(set).sort().forEach(val => {
                const btn = document.createElement('button');
                btn.textContent = val;
                btn.className = 'filter-btn';
                btn.onclick = () => filterCharacters(val, type);
                container.appendChild(btn);
            });
        };

        const createSelectOptions = (set, targetId) => {
            const select = document.getElementById(targetId);
            if (!select) return;
            Array.from(set).sort((a, b) => b - a).forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val + "年";
                select.appendChild(option);
            });
        };

        createButtons(genres, 'genre-filters', 'genre');
        createButtons(works, 'work-filters', 'work');
        createSelectOptions(years, 'year-select-filter');

        // 5. 初期ソート＆表示
        window.sortAndRender();

        // 6. URLパラメータ処理
        const params = new URLSearchParams(window.location.search);
        const workParam = params.get('work');
        const yearParam = params.get('year');

        if (workParam) {
            filterCharacters(workParam, 'work');
        } else if (yearParam) {
            const yearSelect = document.getElementById('year-select-filter');
            if (yearSelect) yearSelect.value = yearParam;
            filterCharacters(yearParam, 'year');
        }

    } catch (error) {
        console.error('Failed to load characters.json:', error);
    }
});

// 外側クリックで閉じる処理（変更なし）
document.addEventListener('click', (e) => { /* 変更なし */ });