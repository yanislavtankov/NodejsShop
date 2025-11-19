let categories = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.ok) {
                document.getElementById('login-overlay').style.display = 'none';
                document.getElementById('admin-app').style.display = 'block';
                loadDashboard();
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error logging in');
        }
    });

    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
});

async function checkAuth() {
    // Simple check by trying to fetch orders (protected route)
    try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('admin-app').style.display = 'block';
            loadDashboard();
        }
    } catch (e) {
        // Not authenticated, show login
    }
}

async function loadDashboard() {
    await loadCategories();
    await loadProducts();
    await loadOrders();
}

async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
}

function showTab(tabName) {
    document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    document.getElementById('view-products').style.display = 'none';
    document.getElementById('view-categories').style.display = 'none';
    document.getElementById('view-orders').style.display = 'none';

    document.getElementById(`view-${tabName}`).style.display = 'block';
}

// --- Products ---

async function loadProducts() {
    const res = await fetch('/api/products?limit=100'); // Get all for admin
    const products = await res.json();
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><img src="${p.image_url || ''}" style="width: 40px; height: 40px; object-fit: cover;"></td>
            <td>${p.title}</td>
            <td>$${p.price}</td>
            <td>${p.stock}</td>
            <td>
                <button onclick="editProduct(${p.id})" class="btn btn-sm btn-secondary">Edit</button>
                <button onclick="deleteProduct(${p.id})" class="btn btn-sm" style="background: #e74c3c; color: white;">Del</button>
            </td>
        </tr>
    `).join('');
}

async function editProduct(id) {
    const res = await fetch(`/api/products/${id}`); // Use public endpoint to get by ID if slug not handy, or filter from list
    // Actually public endpoint is by slug. Let's fetch list again or find in memory if we had it.
    // For simplicity, let's assume we can find it in the table or fetch all.
    // Better: create GET /api/products/:id or just use the list we loaded.
    // Let's just re-fetch all for now and find.
    const allRes = await fetch('/api/products?limit=100');
    const all = await allRes.json();
    const product = all.find(p => p.id === id);

    if (product) {
        document.getElementById('prod-id').value = product.id;
        document.getElementById('prod-title').value = product.title;
        document.getElementById('prod-slug').value = product.slug;
        document.getElementById('prod-desc').value = product.description;
        document.getElementById('prod-price').value = product.price;
        document.getElementById('prod-stock').value = product.stock;
        document.getElementById('prod-category').value = product.category_id;
        document.getElementById('prod-image').value = product.image_url;
        document.getElementById('prod-featured').checked = product.is_featured;

        document.getElementById('product-modal-title').innerText = 'Edit Product';
        document.getElementById('product-modal').style.display = 'flex';
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) loadProducts();
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.is_featured = document.getElementById('prod-featured').checked;

    const id = data.id;
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `/api/admin/products/${id}` : '/api/admin/products';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        closeModal('product-modal');
        loadProducts();
    } else {
        alert('Error saving product');
    }
}

function openProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('product-modal-title').innerText = 'Add Product';
    document.getElementById('product-modal').style.display = 'flex';
}

// --- Categories ---

async function loadCategories() {
    const res = await fetch('/api/categories');
    categories = await res.json();

    // Populate table
    const tbody = document.querySelector('#categories-table tbody');
    tbody.innerHTML = categories.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.slug}</td>
            <td>${c.parent_id || '-'}</td>
        </tr>
    `).join('');

    // Populate selects
    const prodSelect = document.getElementById('prod-category');
    const catParentSelect = document.getElementById('cat-parent');

    const options = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    prodSelect.innerHTML = '<option value="">Select Category</option>' + options;
    catParentSelect.innerHTML = '<option value="">None</option>' + options;
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        closeModal('category-modal');
        loadCategories();
    } else {
        alert('Error saving category');
    }
}

function openCategoryModal() {
    document.getElementById('category-form').reset();
    document.getElementById('category-modal').style.display = 'flex';
}

// --- Orders ---

async function loadOrders() {
    const res = await fetch('/api/admin/orders');
    const orders = await res.json();
    const tbody = document.querySelector('#orders-table tbody');

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.id}</td>
            <td>${o.code}</td>
            <td>${o.customer_email}</td>
            <td>$${o.total}</td>
            <td><span class="status-badge status-${o.status}">${o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td>
                <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding: 4px;">
                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

async function updateOrderStatus(id, status) {
    await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    loadOrders();
}

// --- Utils ---

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}
