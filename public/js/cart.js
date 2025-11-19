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
        cartContainer.innerHTML = '<p class="text-center">Your cart is empty. <a href="/">Go shopping</a></p>';
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
                        <img src="${item.image_url || 'https://placehold.co/60x60'}" alt="${item.title}" class="cart-item-img">
                        <div>
                            <strong>${item.title}</strong>
                        </div>
                    </div>
                </td>
                <td>$${Number(item.price).toFixed(2)}</td>
                <td>
                    <input type="number" min="1" value="${item.qty}" onchange="updateQty(${item.id}, this.value)" class="qty-input" style="width: 60px">
                </td>
                <td>$${itemTotal.toFixed(2)}</td>
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
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        <div class="cart-summary">
            <div class="cart-total">Total: $${total.toFixed(2)}</div>
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
        updateCartCount(); // From app.js
    }
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('minishop_cart')) || [];
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('minishop_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount(); // From app.js
}

async function handleCheckout(e) {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem('minishop_cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    const formData = new FormData(e.target);
    const customer = Object.fromEntries(formData.entries());

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Processing...';
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
                    <h2 style="color: #27ae60; margin-bottom: 1rem;">Order Placed Successfully!</h2>
                    <p>Thank you for your order. Your order code is <strong>${result.code}</strong>.</p>
                    <p class="mt-1">We have sent a confirmation email to ${customer.email}.</p>
                    <a href="/" class="btn btn-primary mt-2">Continue Shopping</a>
                </div>
            `;
        } else {
            alert('Order failed: ' + (result.error || 'Unknown error'));
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        console.error(error);
        alert('Network error. Please try again.');
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Expose to window
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
