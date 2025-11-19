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
                alert('Неуспешен вход');
            }
        } catch (error) {
            console.error(error);
            alert('Грешка при вход.');
        }
    });

    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);

    // Преглед на изображението преди качване
    const imageFileInput = document.getElementById('prod-image-file');
    if (imageFileInput) {
        imageFileInput.addEventListener('change', handleImagePreview);
    }
});

async function checkAuth() {
    // Елементарна проверка чрез опит за извличане на поръчки (защитен маршрут)
    try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('admin-app').style.display = 'block';
            loadDashboard();
        }
    } catch (e) {
        // Няма автентикация – показваме формата за вход
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

// --- Продукти ---

async function loadProducts() {
    const res = await fetch('/api/products?limit=100'); // Вземаме всички за администратора
    const products = await res.json();
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>
                <img src="${p.image_url ? '/images/' + p.image_url : 'https://placehold.co/40'}"
                     style="width: 40px; height: 40px; object-fit: cover;">
            </td>
            <td>${p.title}</td>
            <td>${p.price} лв.</td>
            <td>${p.stock}</td>
            <td>
                <button onclick="editProduct(${p.id})" class="btn btn-sm btn-secondary">Редакция</button>
                <button onclick="deleteProduct(${p.id})" class="btn btn-sm" style="background: #e74c3c; color: white;">
                    Изтриване
                </button>
            </td>
        </tr>
    `).join('');
}

async function editProduct(id) {
    // Публичният endpoint е по slug, затова за простота презареждаме списъка и търсим по id
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

        // Показване на текущото изображение, ако има такова
        if (product.image_url) {
            const preview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            if (preview && previewImg) {
                previewImg.src = '/images/' + product.image_url;
                preview.style.display = 'block';
            }
        }

        document.getElementById('product-modal-title').innerText = 'Редакция на продукт';
        document.getElementById('product-modal').style.display = 'flex';
    }
}

async function deleteProduct(id) {
    if (!confirm('Сигурни ли сте, че искате да изтриете този продукт?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) loadProducts();
}

async function handleProductSubmit(e) {
    e.preventDefault();

    // Ако има избран файл, първо го качваме
    const fileInput = document.getElementById('prod-image-file');
    if (fileInput && fileInput.files.length > 0) {
        try {
            const filename = await uploadImage(fileInput.files[0]);
            document.getElementById('prod-image').value = filename;
        } catch (error) {
            alert('Грешка при качване на изображението: ' + error.message);
            return;
        }
    }

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
        alert('Грешка при запазване на продукта.');
    }
}

function openProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-image').value = ''; // Изчистваме скритото поле за изображение
    document.getElementById('product-modal-title').innerText = 'Добавяне на продукт';

    // Изчистване на file input
    const fileInput = document.getElementById('prod-image-file');
    if (fileInput) fileInput.value = '';

    // Скриване на прегледа на изображението
    const preview = document.getElementById('image-preview');
    if (preview) preview.style.display = 'none';

    document.getElementById('product-modal').style.display = 'flex';
}

// --- Категории ---

async function loadCategories() {
    const res = await fetch('/api/categories');
    categories = await res.json();

    // Попълване на таблицата
    const tbody = document.querySelector('#categories-table tbody');
    tbody.innerHTML = categories.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.slug}</td>
            <td>${c.parent_id || '-'}</td>
        </tr>
    `).join('');

    // Попълване на падащите списъци
    const prodSelect = document.getElementById('prod-category');
    const catParentSelect = document.getElementById('cat-parent');

    const options = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    prodSelect.innerHTML = '<option value="">Изберете категория</option>' + options;
    catParentSelect.innerHTML = '<option value="">Няма</option>' + options;
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
        alert('Грешка при запазване на категорията.');
    }
}

function openCategoryModal() {
    document.getElementById('category-form').reset();
    document.getElementById('category-modal').style.display = 'flex';
}

// --- Поръчки ---

function statusLabel(status) {
    switch (status) {
        case 'pending':
            return 'В изчакване';
        case 'shipped':
            return 'Изпратена';
        case 'cancelled':
            return 'Отменена';
        default:
            return status;
    }
}

async function loadOrders() {
    const res = await fetch('/api/admin/orders');
    const orders = await res.json();
    const tbody = document.querySelector('#orders-table tbody');

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.id}</td>
            <td>${o.code}</td>
            <td>${o.customer_email}</td>
            <td>${o.total} лв.</td>
            <td>
                <span class="status-badge status-${o.status}">
                    ${statusLabel(o.status)}
                </span>
            </td>
            <td>${new Date(o.created_at).toLocaleDateString('bg-BG')}</td>
            <td>
                <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding: 4px;">
                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>В изчакване</option>
                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Изпратена</option>
                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Отменена</option>
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

// --- Помощни функции ---

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Качване на изображение
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Качването е неуспешно');
    }

    const result = await res.json();
    return result.filename;
}

// Преглед на изображението при избор на файл
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const preview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            if (preview && previewImg) {
                previewImg.src = event.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}
