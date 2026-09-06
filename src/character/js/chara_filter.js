// chara_filter.js

let items = [];
let currentPage = 1;
const PER_PAGE = 20;

// JSONデータから1つ分の .character-item 要素を生成する関数
function createCharacterItemElement(c) {
    const item = document.createElement('div');
    item.className = 'character-item';

    // データ属性の設定（数値も文字列化して格納）
    item.dataset.id = String(c.id ?? 0);
    if (c.genre) item.dataset.genre = String(c.genre);
    if (c.role) item.dataset.role = String(c.role);

    // works, years が配列の場合もカンマ区切りの文字列にしてセット
    const worksArr = Array.isArray(c.works) ? c.works : (c.works ? [c.works] : []);
    const yearsArr = Array.isArray(c.years) ? c.years : (c.years ? [c.years] : []);

    if (worksArr.length > 0) item.dataset.works = worksArr.map(String).join(',');
    if (yearsArr.length > 0) item.dataset.years = yearsArr.map(String).join(',');

    // 内部HTML（お使いのテンプレートに合わせてクラス名等を調整してください）
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

// 表示・非表示の統合制御
window.updateVisibility = () => {
    const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';

    const visibleItems = items.filter(item => {
        const isFilterMatch = item.getAttribute('data-filter-match') !== 'false';
        const charName = item.querySelector('.character-name')?.textContent.toLowerCase() || '';
        const isSearchMatch = charName.includes(searchQuery);

        return isFilterMatch && isSearchMatch;
    });

    items.forEach(item => item.style.display = 'none');
    visibleItems.forEach((item, index) => {
        if (index < currentPage * PER_PAGE) {
            item.style.display = 'block';
        }
    });

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = (currentPage * PER_PAGE >= visibleItems.length) ? 'none' : 'block';
    }
};

window.loadMore = () => {
    currentPage++;
    window.updateVisibility();
};

window.searchCharacters = () => {
    currentPage = 1;
    window.updateVisibility();
};

window.sortAndRender = () => {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;
    const sortVal = sortSelect.value;
    const listContainer = document.querySelector('.character-list');

    items.sort((a, b) => {
        if (sortVal === 'id-desc') return Number(b.dataset.id) - Number(a.dataset.id);
        if (sortVal === 'id-asc') return Number(a.dataset.id) - Number(a.dataset.id);
        return 0;
    });

    items.forEach(item => listContainer.appendChild(item));
    window.updateVisibility();
};

window.filterCharacters = (value, type) => {
    const targetVal = String(value);

    items.forEach(item => {
        let isMatch = (targetVal === 'all');

        if (type === 'genre') isMatch = (item.dataset.genre === targetVal);
        if (type === 'role') isMatch = (item.dataset.role === targetVal);

        if (type === 'work' || type === 'year') {
            const attrName = type === 'work' ? 'data-works' : 'data-years';
            const list = (item.getAttribute(attrName) || '').split(',').map(s => s.trim());
            isMatch = list.includes(targetVal);
        }

        item.setAttribute('data-filter-match', isMatch ? 'true' : 'false');
    });

    // ボタンのactive表示切り替え
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === targetVal || (targetVal === 'all' && btn.textContent === 'すべて表示'));
    });

    currentPage = 1;
    window.updateVisibility();
};

window.toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isActive = sidebar.classList.toggle('active');
    if (overlay) overlay.style.display = isActive ? 'block' : 'none';
};

// 初期化処理
document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.querySelector('.character-list');
    if (!listContainer) return;

    try {
        // 1. JSON の取得
        const response = await fetch('./characters.json');
        const characterDataList = await response.json();

        // 既存のコンテナ要素をクリア
        listContainer.innerHTML = '';

        // 2. カードの生成＆描画
        characterDataList.forEach(data => {
            const itemEl = createCharacterItemElement(data);
            listContainer.appendChild(itemEl);
        });

        // 3. 生成された全要素を取得して items 配列を更新
        items = Array.from(document.querySelectorAll('.character-item'));
        adjustNameLength();

        // 4. フィルターボタン等の動的生成
        const genres = new Set();
        const works = new Set();
        const years = new Set();

        items.forEach(item => {
            if (item.dataset.genre) genres.add(item.dataset.genre);
            if (item.dataset.works) item.dataset.works.split(',').forEach(w => w && works.add(w.trim()));
            if (item.dataset.years) item.dataset.years.split(',').forEach(y => y && years.add(y.trim()));
        });

        const createButtons = (set, targetId, type) => {
            const container = document.getElementById(targetId);
            if (!container) return;
            container.innerHTML = ''; // クリア

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
            // 既存のデフォルトoptionを残してクリアしたい場合は調整
            Array.from(set).sort((a, b) => Number(b) - Number(a)).forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val + "年";
                select.appendChild(option);
            });
            select.onchange = (e) => filterCharacters(e.target.value, 'year');
        };

        createButtons(genres, 'genre-filters', 'genre');
        createButtons(works, 'work-filters', 'work');
        createSelectOptions(years, 'year-select-filter');

        // 5. 初期表示（ソートと表示更新）
        window.sortAndRender();

        // 6. URLパラメータの判定
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
        console.error('characters.json の読み込みまたは描画に失敗しました:', error);
    }
});

// 外側クリックで閉じる処理
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.querySelector('.open-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && openBtn && !openBtn.contains(e.target)) {
            sidebar.classList.remove('active');
            if (overlay) overlay.style.display = 'none';
        }
    }
});