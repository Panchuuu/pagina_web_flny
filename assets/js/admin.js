// assets/js/admin.js (Versión Final - Carga todo al inicio)

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadUsers();
    loadAllOrders();
    loadCoupons();

    // Listener para el formulario de crear cupón (este se queda)
    const createCouponForm = document.getElementById('createCouponForm');
    if(createCouponForm) {
        createCouponForm.addEventListener('submit', handleCreateCoupon);
    }
});

// FUNCIÓN PARA CARGAR LAS ESTADÍSTICAS
async function loadDashboardStats() {
    const token = localStorage.getItem('sessionToken');
    try {
        const response = await fetch('https://localhost:3002/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error((await response.json()).message);
        
        const stats = await response.json();

        document.getElementById('stats-total-users').textContent = stats.totalUsers;
        document.getElementById('stats-total-orders').textContent = stats.totalOrders;
        document.getElementById('stats-total-revenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
        
    } catch (error) {
        console.error("Error cargando estadísticas:", error);
        // No mostramos notificación de error aquí para no saturar si algo falla
    }
}


// FUNCIÓN PARA CARGAR LOS USUARIOS
async function loadUsers() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    const token = localStorage.getItem('sessionToken');
    if (!token) return;

    try {
        const response = await fetch('https://localhost:3002/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'No tienes permiso para ver esta información.');
        }

        const users = await response.json();
        tableBody.innerHTML = '';

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron usuarios.</td></tr>';
        } else {
            users.forEach(user => {
                const isAdmin = user.role === 'admin';
                tableBody.innerHTML += `
                    <tr>
                        <td>${user.id}</td>
                        <td><img src="${user.avatar}" alt="avatar" class="rounded-circle" width="30"></td>
                        <td>${user.username}</td>
                        <td>${user.discord_id}</td>
                        <td><span class="badge ${isAdmin ? 'bg-danger' : 'bg-secondary'}">${user.role}</span></td>
                        <td>
                            <button class="btn btn-sm ${isAdmin ? 'btn-outline-warning' : 'btn-outline-success'}" 
                                    onclick="changeUserRole(${user.id}, '${isAdmin ? 'user' : 'admin'}')">
                                ${isAdmin ? 'Degradar a Usuario' : 'Ascender a Admin'}
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        showNotification(error.message, 'danger');
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${error.message}</td></tr>`;
    }
}

async function changeUserRole(userId, newRole) {
    if (!confirm(`¿Estás seguro de que quieres cambiar el rol de este usuario a "${newRole}"?`)) {
        return;
    }
    const token = localStorage.getItem('sessionToken');
    try {
        const response = await fetch('https://localhost:3002/admin/users/set-role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, newRole })
        });
        const data = await response.json();
        if (response.ok) {
            showNotification(data.message, 'success');
            loadUsers();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showNotification(error.message, 'danger');
    }
}

// FUNCIÓN PARA CARGAR TODAS LAS ÓRDENES
async function loadAllOrders() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;
    const token = localStorage.getItem('sessionToken');
    try {
        const response = await fetch('https://localhost:3002/admin/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error((await response.json()).message);

        const orders = await response.json();
        tableBody.innerHTML = '';

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No se han realizado compras todavía.</td></tr>';
        } else {
            orders.forEach(order => {
                const purchaseDate = new Date(order.purchase_date).toLocaleString('es-CL');
                const recipient = order.recipient_username || '---';
                tableBody.innerHTML += `
                    <tr>
                        <td>${order.id}</td>
                        <td>${order.username}</td>
                        <td>${recipient}</td>
                        <td>${order.product_name}</td>
                        <td>${order.quantity}</td>
                        <td>$${order.total_paid_usd.toFixed(2)}</td>
                        <td>${purchaseDate}</td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${error.message}</td></tr>`;
    }
}

// FUNCIONES PARA GESTIONAR CUPONES
async function loadCoupons() {
    const tableBody = document.getElementById('coupons-table-body');
    if (!tableBody) return;
    const token = localStorage.getItem('sessionToken');
    try {
        const response = await fetch('https://localhost:3002/admin/coupons', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error((await response.json()).message);

        const coupons = await response.json();
        tableBody.innerHTML = '';

        if (coupons.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay cupones creados.</td></tr>';
        } else {
            coupons.forEach(coupon => {
                const isActive = coupon.is_active === 1;
                const expiryText = coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'Nunca';
                tableBody.innerHTML += `
                    <tr>
                        <td><strong>${coupon.code}</strong></td>
                        <td>${coupon.type}</td>
                        <td>${coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value.toLocaleString('es-CL')}`}</td>
                        <td>${expiryText}</td>
                        <td><span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">${isActive ? 'Activo' : 'Inactivo'}</span></td>
                        <td>
                            <button class="btn btn-sm ${isActive ? 'btn-outline-warning' : 'btn-outline-success'}" onclick="toggleCouponStatus(${coupon.id}, ${coupon.is_active})">${isActive ? 'Desactivar' : 'Activar'}</button>
                            <button class="btn btn-sm btn-danger ms-2" onclick="deleteCoupon(${coupon.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${error.message}</td></tr>`;
    }
}

async function handleCreateCoupon(event) {
    event.preventDefault();
    const token = localStorage.getItem('sessionToken');
    const form = event.target;
    const payload = {
        code: form.querySelector('#couponCode').value,
        type: form.querySelector('#couponType').value,
        value: parseInt(form.querySelector('#couponValue').value),
        expiry_date: form.querySelector('#couponExpiry').value || null
    };
    try {
        const response = await fetch('https://localhost:3002/admin/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        showNotification(data.message, 'success');
        form.reset();
        loadCoupons();
    } catch (error) {
        showNotification(error.message, 'danger');
    }
}

async function toggleCouponStatus(id, currentStatus) {
    if (!confirm('¿Estás seguro de que quieres cambiar el estado de este cupón?')) return;
    const token = localStorage.getItem('sessionToken');
    try {
        const response = await fetch('https://localhost:3002/admin/coupons/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ id, currentStatus })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        showNotification(data.message, 'success');
        loadCoupons();
    } catch (error) {
        showNotification(error.message, 'danger');
    }
}

async function deleteCoupon(id) {
    if (!confirm('¿Estás seguro de que quieres ELIMINAR este cupón permanentemente? Esta acción no se puede deshacer.')) {
        return;
    }
    const token = localStorage.getItem('sessionToken');
    try {
        const response = await fetch(`https://localhost:3002/admin/coupons/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        showNotification(data.message, 'success');
        loadCoupons();
    } catch (error) {
        showNotification(error.message, 'danger');
    }
}