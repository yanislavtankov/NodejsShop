// Състояние
const state = {
    products: [],
    cart: JSON.parse(localStorage.getItem('minishop_cart')) || []
};

// DOM елементи
const cartCountEl = document.getElementById('cart-count');
const productsContainer = document.getElementById('products-container');
const productDetailsContainer = document.getElementById('product-details');
const headerSearchBtn = document.getElementById('header-search-btn');
const headerSearchInput = document.getElementById('header-search-input');
const headerCategorySelect = document.getElementById('header-category-select');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    fetchCategories();
    setupSearchListeners();

    // Специфично за началната страница
    if (productsContainer && window.location.pathname === '/') {
        fetchProducts({ featured: true });
    }
});

// Настройване на слушатели за търсене
function setupSearchListeners() {
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', handleSearch);
    }
    if (headerSearchInput) {
        headerSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    const headerResetBtn = document.getElementById('header-reset-btn');

    // Показване или скриване на бутона за нулиране
    function toggleHeaderResetButton() {
        if (headerResetBtn && headerSearchInput && headerCategorySelect) {
            const hasSearchValue = headerSearchInput.value.trim() !== '';
            const hasCategoryValue = headerCategorySelect.value !== '';
            headerResetBtn.style.display = (hasSearchValue || hasCategoryValue) ? 'inline-block' : 'none';
        }
    }

    if (headerSearchInput) {
        headerSearchInput.addEventListener('input', toggleHeaderResetButton);
    }
    if (headerCategorySelect) {
        headerCategorySelect.addEventListener('change', toggleHeaderResetButton);
    }

    if (headerResetBtn) {
        headerResetBtn.addEventListener('click', () => {
            if (headerSearchInput) headerSearchInput.value = '';
            if (headerCategorySelect) headerCategorySelect.value = '';

            headerResetBtn.style.display = 'none';

            if (window.location.pathname === '/search.html') {
                const newParams = new URLSearchParams(window.location.search);
                newParams.delete('q');
                newParams.delete('category');

                window.location.href = `/search.html?${newParams.toString()}`;
            }
        });
    }

    setTimeout(toggleHeaderResetButton, 100);
}

function handleSearch() {
    const q = headerSearchInput.value.trim();
    const category = headerCategorySelect.value;

    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category) params.append('category', category);

    window.location.href = `/search.html?${params.toString()}`;
}

// Зареждане на категории
async function fetchCategories() {
    try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const categories = await res.json();

        if (headerCategorySelect) {
            const currentVal = headerCategorySelect.value;
            headerCategorySelect.innerHTML = '<option value="">Всички категории</option>' +
                categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
            if (currentVal) headerCategorySelect.value = currentVal;
        }
    } catch (error) {
        console.error('Грешка при зареждане на категории', error);
    }
}

// Зареждане на продукти
async function fetchProducts(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const res = await fetch(`/api/products?${queryString}`);
        if (!res.ok) throw new Error('Грешка при зареждане на продукти');
        state.products = await res.json();
        renderProducts(state.products);
    } catch (error) {
        console.error(error);
        if (productsContainer) {
            productsContainer.innerHTML = '<p class="text-center">Грешка при зареждане на продуктите.</p>';
        }
    }
}

// Рендиране на списък с продукти
function renderProducts(products) {
    if (!productsContainer) return;

    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="text-center">Няма намерени продукти.</p>';
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <a href="/product.html?slug=${product.slug}" class="product-image-container">
                <img src="${product.image_url ? '/images/' + product.image_url : 'https://placehold.co/400x300?text=Без+снимка'}" alt="${product.title}" class="product-image">
            </a>
            <div class="product-info">
                <div class="product-category">${product.category_name || 'Общи'}</div>
                <h3 class="product-title"><a href="/product.html?slug=${product.slug}">${product.title}</a></h3>
                <div class="product-price">${Number(product.price).toFixed(2)} лв.</div>
                <button onclick="addToCart(${product.id})" class="btn btn-primary btn-block">Добави в количката</button>
            </div>
        </div>
    `).join('');
}

// Логика на страницата за търсене
async function initSearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q') || '';
    const category = urlParams.get('category') || '';
    const minPrice = urlParams.get('min_price') || '';
    const maxPrice = urlParams.get('max_price') || '';

    if (headerSearchInput) headerSearchInput.value = q;

    await fetchCategories();
    if (headerCategorySelect && category) {
        headerCategorySelect.value = category;
    }

    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    if (minPriceInput) minPriceInput.value = minPrice;
    if (maxPriceInput) maxPriceInput.value = maxPrice;

    const searchTitle = document.getElementById('search-title');
    if (searchTitle) {
        if (q) searchTitle.innerText = `Резултати за търсене: "${q}"`;
        else if (category) searchTitle.innerText = `Категория: ${category}`;
        else searchTitle.innerText = 'Всички продукти';
    }

    const fetchParams = {};
    if (q) fetchParams.q = q;
    if (category) fetchParams.category = category;
    if (minPrice) fetchParams.min_price = minPrice;
    if (maxPrice) fetchParams.max_price = maxPrice;

    await fetchProducts(fetchParams);

    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(filterForm);
            const newParams = new URLSearchParams(window.location.search);

            const min = formData.get('min_price');
            const max = formData.get('max_price');

            if (min) newParams.set('min_price', min); else newParams.delete('min_price');
            if (max) newParams.set('max_price', max); else newParams.delete('max_price');

            window.location.href = `/search.html?${newParams.toString()}`;
        });
    }

    const resetPriceBtn = document.getElementById('reset-price-btn');

    function toggleResetButton() {
        if (resetPriceBtn && minPriceInput && maxPriceInput) {
            const hasMinValue = minPriceInput.value.trim() !== '';
            const hasMaxValue = maxPriceInput.value.trim() !== '';
            resetPriceBtn.style.display = (hasMinValue || hasMaxValue) ? 'inline-block' : 'none';
        }
    }

    if (minPriceInput) minPriceInput.addEventListener('input', toggleResetButton);
    if (maxPriceInput) maxPriceInput.addEventListener('input', toggleResetButton);

    if (resetPriceBtn) {
        resetPriceBtn.addEventListener('click', () => {
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';

            resetPriceBtn.style.display = 'none';

            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('min_price');
            newParams.delete('max_price');

            window.location.href = `/search.html?${newParams.toString()}`;
        });
    }

    toggleResetButton();

    setTimeout(() => {
        const headerResetBtn = document.getElementById('header-reset-btn');
        if (headerResetBtn && headerSearchInput && headerCategorySelect) {
            const hasSearchValue = headerSearchInput.value.trim() !== '';
            const hasCategoryValue = headerCategorySelect.value !== '';
            headerResetBtn.style.display = (hasSearchValue || hasCategoryValue) ? 'inline-block' : 'none';
        }
    }, 150);
}

// Зареждане на продукт по slug
async function loadProductDetails(slug) {
    try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error('Продуктът не е намерен');
        const product = await res.json();
        window.currentProduct = product;
        renderProductDetails(product);
    } catch (error) {
        console.error(error);
        if (productDetailsContainer) {
            productDetailsContainer.innerHTML = '<p class="text-center">Продуктът не е намерен.</p>';
        }
    }
}

// Рендиране на детайли за продукт
function renderProductDetails(product) {
    if (!productDetailsContainer) return;
    productDetailsContainer.innerHTML = `
        <div class="product-gallery">
            <img src="${product.image_url ? '/images/' + product.image_url : 'https://placehold.co/600x400?text=Без+снимка'}" alt="${product.title}">
        </div>
        <div class="product-meta">
            <h1>${product.title}</h1>
            <div class="price">${Number(product.price).toFixed(2)} лв.</div>
            <p class="description">${product.description || 'Няма налично описание.'}</p>
            
            <div class="actions">
                <input type="number" id="qty-${product.id}" value="1" min="1" class="qty-input">
                <button onclick="addToCart(${product.id}, true)" class="btn btn-primary">Добави в количката</button>
            </div>
            
            <div class="mt-2">
                <small>Наличност: ${product.stock} бр.</small>
            </div>
        </div>
    `;
}

// Функции за количката
function addToCart(productId, fromDetails = false) {
    let qty = 1;
    if (fromDetails) {
        const qtyInput = document.getElementById(`qty-${productId}`);
        if (qtyInput) qty = parseInt(qtyInput.value);
    }

    let product = state.products.find(p => p.id === productId);

    if (window.currentProduct && window.currentProduct.id === productId) {
        product = window.currentProduct;
    }

    if (!product) {
        alert('Грешка при добавяне в количката: липсват данни за продукта');
        return;
    }

    const existingItem = state.cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        state.cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image_url: product.image_url,
            qty: qty
        });
    }

    saveCart();
    updateCartCount();

    const btn = event.target;
    if (btn) {
        const originalText = btn.innerText;
        btn.innerText = 'Добавен!';
        btn.style.background = '#27ae60';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
        }, 1000);
    }
}

function saveCart() {
    localStorage.setItem('minishop_cart', JSON.stringify(state.cart));
}

function updateCartCount() {
    const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) cartCountEl.innerText = count;
}

// Излагане на глобалния обхват
window.addToCart = addToCart;
window.initSearchPage = initSearchPage;
window.loadProductDetails = loadProductDetails;
