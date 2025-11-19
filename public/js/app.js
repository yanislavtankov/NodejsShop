// State
const state = {
    products: [],
    cart: JSON.parse(localStorage.getItem('minishop_cart')) || []
};

// DOM Elements
const cartCountEl = document.getElementById('cart-count');
const productsContainer = document.getElementById('products-container');
const productDetailsContainer = document.getElementById('product-details');
const headerSearchBtn = document.getElementById('header-search-btn');
const headerSearchInput = document.getElementById('header-search-input');
const headerCategorySelect = document.getElementById('header-category-select');

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    fetchCategories();
    setupSearchListeners();

    // Home page specific
    if (productsContainer && window.location.pathname === '/') {
        fetchProducts({ featured: true });
    }
});

// Setup Search Listeners
function setupSearchListeners() {
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', handleSearch);
    }
    if (headerSearchInput) {
        headerSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    // Setup header reset button
    const headerResetBtn = document.getElementById('header-reset-btn');

    // Function to toggle header reset button visibility
    function toggleHeaderResetButton() {
        if (headerResetBtn && headerSearchInput && headerCategorySelect) {
            const hasSearchValue = headerSearchInput.value.trim() !== '';
            const hasCategoryValue = headerCategorySelect.value !== '';
            headerResetBtn.style.display = (hasSearchValue || hasCategoryValue) ? 'inline-block' : 'none';
        }
    }

    // Add input listeners
    if (headerSearchInput) {
        headerSearchInput.addEventListener('input', toggleHeaderResetButton);
    }
    if (headerCategorySelect) {
        headerCategorySelect.addEventListener('change', toggleHeaderResetButton);
    }

    // Handle reset button click
    if (headerResetBtn) {
        headerResetBtn.addEventListener('click', () => {
            // Clear search and category
            if (headerSearchInput) headerSearchInput.value = '';
            if (headerCategorySelect) headerCategorySelect.value = '';

            // Hide the reset button
            headerResetBtn.style.display = 'none';

            // If on search page, reload without search/category filters
            if (window.location.pathname === '/search.html') {
                const newParams = new URLSearchParams(window.location.search);
                newParams.delete('q');
                newParams.delete('category');

                window.location.href = `/search.html?${newParams.toString()}`;
            }
        });
    }

    // Initial toggle
    setTimeout(toggleHeaderResetButton, 100); // Delay to ensure categories are loaded
}

function handleSearch() {
    const q = headerSearchInput.value.trim();
    const category = headerCategorySelect.value;

    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category) params.append('category', category);

    window.location.href = `/search.html?${params.toString()}`;
}

// Fetch Categories
async function fetchCategories() {
    try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const categories = await res.json();

        if (headerCategorySelect) {
            const currentVal = headerCategorySelect.value; // Preserve if set (e.g. by initSearchPage)
            headerCategorySelect.innerHTML = '<option value="">All Categories</option>' +
                categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
            if (currentVal) headerCategorySelect.value = currentVal;
        }
    } catch (error) {
        console.error('Failed to fetch categories', error);
    }
}

// Fetch Products (General)
async function fetchProducts(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const res = await fetch(`/api/products?${queryString}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        state.products = await res.json();
        renderProducts(state.products);
    } catch (error) {
        console.error(error);
        if (productsContainer) {
            productsContainer.innerHTML = '<p class="text-center">Failed to load products.</p>';
        }
    }
}

// Render Products Grid
function renderProducts(products) {
    if (!productsContainer) return;

    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="text-center">No products found.</p>';
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <a href="/product.html?slug=${product.slug}" class="product-image-container">
                <img src="${product.image_url || 'https://placehold.co/400x300?text=No+Image'}" alt="${product.title}" class="product-image">
            </a>
            <div class="product-info">
                <div class="product-category">${product.category_name || 'General'}</div>
                <h3 class="product-title"><a href="/product.html?slug=${product.slug}">${product.title}</a></h3>
                <div class="product-price">$${Number(product.price).toFixed(2)}</div>
                <button onclick="addToCart(${product.id})" class="btn btn-primary btn-block">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Search Page Logic
async function initSearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q') || '';
    const category = urlParams.get('category') || '';
    const minPrice = urlParams.get('min_price') || '';
    const maxPrice = urlParams.get('max_price') || '';

    // Pre-fill search input
    if (headerSearchInput) headerSearchInput.value = q;

    // Wait for categories to load first, then set the category value
    await fetchCategories();
    if (headerCategorySelect && category) {
        headerCategorySelect.value = category;
    }

    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    if (minPriceInput) minPriceInput.value = minPrice;
    if (maxPriceInput) maxPriceInput.value = maxPrice;

    // Update Title
    const searchTitle = document.getElementById('search-title');
    if (searchTitle) {
        if (q) searchTitle.innerText = `Search Results for "${q}"`;
        else if (category) searchTitle.innerText = `Category: ${category}`;
        else searchTitle.innerText = 'All Products';
    }

    // Fetch
    const fetchParams = {};
    if (q) fetchParams.q = q;
    if (category) fetchParams.category = category;
    if (minPrice) fetchParams.min_price = minPrice;
    if (maxPrice) fetchParams.max_price = maxPrice;

    await fetchProducts(fetchParams);

    // Handle Filter Form
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

    // Handle Reset Price Button
    const resetPriceBtn = document.getElementById('reset-price-btn');

    // Function to toggle reset button visibility
    function toggleResetButton() {
        if (resetPriceBtn && minPriceInput && maxPriceInput) {
            const hasMinValue = minPriceInput.value.trim() !== '';
            const hasMaxValue = maxPriceInput.value.trim() !== '';
            resetPriceBtn.style.display = (hasMinValue || hasMaxValue) ? 'inline-block' : 'none';
        }
    }

    // Add input listeners to price fields
    if (minPriceInput) {
        minPriceInput.addEventListener('input', toggleResetButton);
    }
    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', toggleResetButton);
    }

    // Handle reset button click
    if (resetPriceBtn) {
        resetPriceBtn.addEventListener('click', () => {
            // Clear price inputs
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';

            // Hide the reset button
            resetPriceBtn.style.display = 'none';

            // Remove price filters from URL and reload
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('min_price');
            newParams.delete('max_price');

            window.location.href = `/search.html?${newParams.toString()}`;
        });
    }

    // Initial toggle on page load
    toggleResetButton();

    // Trigger header reset button visibility check after setting values
    setTimeout(() => {
        const headerResetBtn = document.getElementById('header-reset-btn');
        if (headerResetBtn && headerSearchInput && headerCategorySelect) {
            const hasSearchValue = headerSearchInput.value.trim() !== '';
            const hasCategoryValue = headerCategorySelect.value !== '';
            headerResetBtn.style.display = (hasSearchValue || hasCategoryValue) ? 'inline-block' : 'none';
        }
    }, 150);
}

// Load Product Details
async function loadProductDetails(slug) {
    try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error('Product not found');
        const product = await res.json();
        window.currentProduct = product; // Store for cart
        renderProductDetails(product);
    } catch (error) {
        console.error(error);
        if (productDetailsContainer) {
            productDetailsContainer.innerHTML = '<p class="text-center">Product not found.</p>';
        }
    }
}

// Render Single Product
function renderProductDetails(product) {
    if (!productDetailsContainer) return;
    productDetailsContainer.innerHTML = `
        <div class="product-gallery">
            <img src="${product.image_url || 'https://placehold.co/600x400?text=No+Image'}" alt="${product.title}">
        </div>
        <div class="product-meta">
            <h1>${product.title}</h1>
            <div class="price">$${Number(product.price).toFixed(2)}</div>
            <p class="description">${product.description || 'No description available.'}</p>
            
            <div class="actions">
                <input type="number" id="qty-${product.id}" value="1" min="1" class="qty-input">
                <button onclick="addToCart(${product.id}, true)" class="btn btn-primary">Add to Cart</button>
            </div>
            
            <div class="mt-2">
                <small>Stock: ${product.stock} units available</small>
            </div>
        </div>
    `;
}

// Cart Functions
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

    if (!product && state.products.length > 0) {
        product = state.products.find(p => p.id === productId);
    }

    if (!product) {
        alert('Error adding to cart: Product data missing');
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

    // Visual feedback
    const btn = event.target;
    if (btn) {
        const originalText = btn.innerText;
        btn.innerText = 'Added!';
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

// Expose to window
window.addToCart = addToCart;
window.initSearchPage = initSearchPage;
window.loadProductDetails = loadProductDetails;
