// VERSIÓN FINAL: CON LÓGICA DE REGALOS Y CUPONES DESDE EL BACKEND

function addToCart(id, name, price, image, quantity, recipient = null) {
    let cart = JSON.parse(localStorage.getItem('flaitesNYCart')) || [];
    if (recipient) {
        cart.push({ id, name, price, image, quantity, recipient });
    } else {
        const existingProductIndex = cart.findIndex(item => item.id === id && !item.recipient);
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += quantity;
        } else {
            cart.push({ id, name, price, image, quantity, recipient });
        }
    }
    localStorage.setItem('flaitesNYCart', JSON.stringify(cart));
    const message = recipient ? `Regalo para "${recipient}" añadido al carro.` : `${quantity} x "${name}" añadido(s) al carro.`;
    showNotification(message, 'success');
    updateCartCounter();
}

function loadCart() {
    const cartRow = document.getElementById('cart-row');
    const emptyCartContainer = document.getElementById('empty-cart-container');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    let cart = JSON.parse(localStorage.getItem('flaitesNYCart')) || [];
    let appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));

    if (!cartRow) return;

    if (cart.length === 0) {
        cartRow.classList.add('d-none');
        emptyCartContainer.classList.remove('d-none');
    } else {
        cartRow.classList.remove('d-none');
        emptyCartContainer.classList.add('d-none');
        
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const giftText = item.recipient ? `<p class="mb-0 text-warning small">🎁 Para: ${item.recipient}</p>` : '';
            cartItemsContainer.innerHTML += `<div class="card bg-dark-secondary border-secondary mb-3"><div class="card-body p-3"><div class="d-flex justify-content-between align-items-center"><div class="d-flex align-items-center"><img src="${item.image}" alt="${item.name}" class="cart-item-img me-3"><div><h6 class="mb-0 text-white">${item.name}</h6>${giftText}</div></div><div class="d-flex align-items-center"><input type="number" class="form-control form-control-sm bg-dark text-white border-secondary me-3" value="${item.quantity}" min="1" max="10" onchange="updateQuantity(${index}, this.value)" style="width: 70px;"><div class="text-end"><p class="fs-5 fw-bold mb-1 text-white">$${itemTotal.toLocaleString('es-CL')}</p><button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button></div></div></div></div></div>`;
        });

        let discountAmount = 0;
        let discountText = '';
        if (appliedCoupon && appliedCoupon.code) {
            const coupon = appliedCoupon;
            if (coupon.type === 'percent') {
                discountAmount = (subtotal * coupon.value) / 100;
            } else if (coupon.type === 'fixed') {
                discountAmount = coupon.value;
            }
            if (discountAmount > subtotal) { discountAmount = subtotal; }
            discountText = `<div class="d-flex justify-content-between text-success"><p>Descuento (${coupon.code}) <button class="btn btn-link btn-sm text-danger p-0" onclick="removeCoupon()">Quitar</button></p><p>-$${discountAmount.toLocaleString('es-CL')}</p></div>`;
        }
        const total = subtotal - discountAmount;
        cartSummary.innerHTML = `<div class="d-flex justify-content-between text-muted"><p>Subtotal</p><p>$${subtotal.toLocaleString('es-CL')}</p></div>${discountText}<hr class="border-secondary"><div class="d-flex justify-content-between fs-4 fw-bold text-white"><p>TOTAL</p><p class="text-warning">$${total.toLocaleString('es-CL')}</p></div><span id="cart-total-value" class="d-none">${total}</span>`;
    }
    updateCartCounter();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('flaitesNYCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('flaitesNYCart', JSON.stringify(cart));
    loadCart();
}

function updateQuantity(index, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('flaitesNYCart')) || [];
    const quantity = parseInt(newQuantity);
    if (quantity > 0) {
        cart[index].quantity = quantity;
    } else {
        cart.splice(index, 1);
    }
    localStorage.setItem('flaitesNYCart', JSON.stringify(cart));
    loadCart();
}

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('flaitesNYCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterElement = document.getElementById('cart-counter');
    if (counterElement) {
        if (totalItems > 0) {
            counterElement.textContent = totalItems;
            counterElement.style.display = 'flex';
        } else {
            counterElement.style.display = 'none';
        }
    }
}

async function applyCoupon() {
    const couponInput = document.getElementById('coupon-input');
    const couponMessage = document.getElementById('coupon-message');
    const code = couponInput.value;
    try {
        const response = await fetch('http://localhost:3002/validate-coupon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('appliedCoupon', JSON.stringify(data));
            couponMessage.textContent = `¡Cupón "${data.code}" aplicado!`;
            couponMessage.className = 'mt-2 small text-success';
        } else {
            localStorage.removeItem('appliedCoupon');
            couponMessage.textContent = data.message;
            couponMessage.className = 'mt-2 small text-danger';
        }
    } catch (error) {
        couponMessage.textContent = 'No se pudo conectar con el servidor.';
        couponMessage.className = 'mt-2 small text-danger';
    }
    loadCart();
}

function removeCoupon() {
    localStorage.removeItem('appliedCoupon');
    const couponMessage = document.getElementById('coupon-message');
    couponMessage.textContent = 'Cupón eliminado.';
    couponMessage.className = 'mt-2 small text-muted';
    loadCart();
}

function clearCartAfterPayment() {
    localStorage.removeItem('flaitesNYCart');
    localStorage.removeItem('appliedCoupon');
    window.location.reload();
}

async function handleTestPurchase() {
    const token = localStorage.getItem('sessionToken');
    if (!token) { return showNotification('Debes iniciar sesión para comprar.', 'danger'); }
    const payload = JSON.parse(atob(token.split('.')[1])); 
    const currentUser = payload.username;
    const cart = JSON.parse(localStorage.getItem('flaitesNYCart')) || [];
    if (cart.length === 0) { return showNotification('Tu carro está vacío.', 'info'); }
    if (!confirm('¿Estás seguro de que quieres simular esta compra?')) { return; }
    try {
        const response = await fetch('http://localhost:3002/create-test-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart, currentUser })
        });
        const data = await response.json();
        if (response.ok) {
            showNotification('¡Compra de prueba registrada con éxito!', 'success');
            clearCartAfterPayment();
        } else {
            showNotification(data.message || 'Error al procesar la compra.', 'danger');
        }
    } catch (error) {
        showNotification('No se pudo conectar con el servidor de prueba.', 'danger');
    }
}