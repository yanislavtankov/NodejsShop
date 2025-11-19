document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});

function renderCart() {
    const cartContainer = document.getElementById('cart-items-wrapper');
    const cart = JSON.parse(localStorage.getItem('minishop_cart')) || [];
    const checkoutSection = document.getElementById('checkout-section');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-center">Количката е празна. <a href="/">Към пазаруване</a></p>';
        if (checkoutSection) checkoutSection.style.display = 'none';
        return;
    }

    if (checkoutSection) checkoutSection.style.display = 'block';

    let total = 0;
    const itemsHtml = cart.map(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        return `
            <tr>
                <td>
                    <div class="cart-item-info">
                        <img src="${item.image_url ? '/images/' + item.image_url : 'https://placehold.co/60x60'}" alt="${item.title}" class="cart-item-img">
                        <div>
                            <strong>${item.title}</strong>
                        </div>
                    </div>
                </td>
                <td>${Number(item.price).toFixed(2)} лв.</td>
                <td>
                    <input type="number" min="1" value="${item.qty}" onchange="updateQty(${item.id}, this.value)" class="qty-input" style="width: 60px">
                </td>
                <td>${itemTotal.toFixed(2)} лв.</td>
                <td>
                    <button onclick="removeFromCart(${item.id})" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">&times;</button>
                </td>
            </tr>
        `;
    }).join('');

    cartContainer.innerHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Продукт</th>
                    <th>Цена</th>
                    <th>Количество</th>
                    <th>Общо</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        <div class="cart-summary">
            <div class="cart-total">Общо: ${total.toFixed(2)} лв.</div>
        </div>
    `;
}

function updateQty(id, newQty) {
    const cart = JSON.parse(localStorage.getItem('minishop_cart')) || [];
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty = parseInt(newQty);
        if (item.qty <= 0) {
            removeFromCart(id);
            return;
        }
        localStorage.setItem('minishop_cart', JSON.stringify(cart));
        renderCart();
        updateCartCount(); // от app.js
    }
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('minishop_cart')) || [];
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('minishop_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount(); // от app.js
}

async function handleCheckout(e) {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem('minishop_cart')) || [];
    if (cart.length === 0) {
        alert('Количката е празна');
        return;
    }

    const formData = new FormData(e.target);
    const customer = Object.fromEntries(formData.entries());

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Обработва се...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                customer: customer
            })
        });

        const result = await res.json();

        if (res.ok) {
            localStorage.removeItem('minishop_cart');
            updateCartCount();
            document.querySelector('main').innerHTML = `
                <div class="container text-center" style="padding: 4rem 0;">
                    <h2 style="color: #27ae60; margin-bottom: 1rem;">Поръчката е успешно направена!</h2>
                    <p>Благодарим Ви за поръчката. Вашият код за поръчка е <strong>${result.code}</strong>.</p>
                    <p class="mt-1">Изпратихме имейл с потвърждение на ${customer.email}.</p>
                    <a href="/" class="btn btn-primary mt-2">Продължи пазаруването</a>
                </div>
            `;
        } else {
            alert('Грешка при поръчката: ' + (result.error || 'Неизвестна грешка'));
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        console.error(error);
        alert('Мрежова грешка. Опитайте отново.');
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Глобална експозиция
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
