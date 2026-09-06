// chara_filter.js

let items = [];
let currentPage = 1;
const PER_PAGE = 20;

// キャラクター名長さに応じたクラス付与
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

// 【重要】Moreボタン押下時の処理
window.loadMore = () => {
    currentPage++;
    window.updateVisibility();
};

window.searchCharacters = () => {
    currentPage = 1;
    window.updateVisibility();
};

window.sortAndRender = () => {
    const sortVal = document.getElementById('sort-select').value;
    const listContainer = document.querySelector('.character-list');

    items.sort((a, b) => {
        if (sortVal === 'id-desc') return Number(b.dataset.id) - Number(a.dataset.id);
        if (sortVal === 'id-asc') return Number(a.dataset.id) - Number(b.dataset.id);
        return 0;
    });

    items.forEach(item => listContainer.appendChild(item));
    window.updateVisibility();
};

window.filterCharacters = (value, type) => {
    items.forEach(item => {
        let isMatch = (value === 'all');
        if (type === 'genre') isMatch = (item.dataset.genre === value);
        if (type === 'role') isMatch = (item.dataset.role === value);
        if (type === 'work' || type === 'year') {
            const list = (item.getAttribute(`data-${type}s`) || '').split(',');
            isMatch = list.includes(String(value));
        }

        item.setAttribute('data-filter-match', isMatch);
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === String(value) || (value === 'all' && btn.textContent === 'すべて表示'));
    });

    currentPage = 1;
    window.updateVisibility();
};

// サイドバー開閉
window.toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isActive = sidebar.classList.toggle('active');
    if (overlay) overlay.style.display = isActive ? 'block' : 'none';
};

// 初期化処理（DOM読み込み完了時）
document.addEventListener('DOMContentLoaded', () => {
    items = Array.from(document.querySelectorAll('.character-item'));
    adjustNameLength();

    // フィルター動的生成
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

    // 初期ソート＆表示
    window.sortAndRender();

    // URLパラメータ処理
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