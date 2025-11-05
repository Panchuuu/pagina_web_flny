// assets/js/app.js (Versión Completa y Corregida)

async function updateServerStatus() {
    const statusTextElement = document.getElementById('server-status-text');
    const playersTextElement = document.getElementById('server-players-text');
    if (!statusTextElement || !playersTextElement) { return; }

    try {
        const response = await fetch('http://localhost:3002/server-status'); // Usando el puerto 3002
        const data = await response.json();
        if (data.online) {
            statusTextElement.textContent = 'Online';
            statusTextElement.className = 'status-online';
            playersTextElement.textContent = `${data.players} / ${data.maxPlayers}`;
        } else {
            statusTextElement.textContent = 'Offline';
            statusTextElement.className = 'status-offline';
            playersTextElement.textContent = '0 / 0';
        }
    } catch (error) {
        statusTextElement.textContent = 'Error';
        statusTextElement.className = 'status-offline';
        playersTextElement.textContent = 'N/A';
    }
}

const ROLE_ID_TO_NAME = {
    ['1383142605411324040']: "VIP Bronce", // Necesitarás tus IDs aquí
    ['1383142605411324041']: "VIP Plata",
    ['1383142605411324042']: "VIP Oro"
};

async function fetchNotifications() {
    const token = localStorage.getItem('sessionToken');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:3002/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const notifications = await response.json();
            updateNotificationUI(notifications);
        }
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
    }
}

function updateNotificationUI(notifications) {
    const bellContainer = document.getElementById('notification-bell-container');
    const dot = document.getElementById('notification-dot');
    const list = document.getElementById('notifications-list');

    if (!bellContainer || !dot || !list) return;

    // Mostrar el contenedor de la campana si el usuario está logueado
    bellContainer.style.display = 'block';
    
    list.innerHTML = ''; // Limpiar la lista

    const unreadNotifications = notifications.filter(n => n.is_read === 0);

    if (unreadNotifications.length > 0) {
        dot.style.display = 'block'; // Mostrar el punto rojo
    } else {
        dot.style.display = 'none'; // Ocultar el punto rojo
    }

    if (notifications.length === 0) {
        list.innerHTML = '<li><p class="dropdown-item-text text-muted text-center small my-2">No tienes notificaciones.</p></li>';
    } else {
        notifications.forEach(n => {
            const isUnread = n.is_read === 0 ? 'fw-bold' : 'text-muted';
            const date = new Date(n.created_at).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            
            list.innerHTML += `
                <li>
                    <div class="dropdown-item-text text-white p-2" style="white-space: normal;">
                        <p class="mb-1 small ${isUnread}">${n.message}</p>
                        <small class="text-muted">${date}</small>
                    </div>
                </li>
            `;
        });
    }
}

async function markNotificationsAsRead() {
    const dot = document.getElementById('notification-dot');
    // Solo enviar la petición si hay notificaciones sin leer
    if (dot && dot.style.display === 'block') {
        const token = localStorage.getItem('sessionToken');
        if (!token) return;

        try {
            await fetch('http://localhost:3002/api/notifications/mark-read', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dot.style.display = 'none'; // Ocultar el punto inmediatamente
        } catch (error) {
            console.error('Error al marcar notificaciones como leídas:', error);
        }
    }
}

async function loadProfileData() {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return; // Salir si no estamos en la página de perfil

    const token = localStorage.getItem('sessionToken');
    if (!token) { window.location.href = 'login.html'; return; }

    try {
        const response = await fetch('http://localhost:3002/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error((await response.json()).message);
        
        const data = await response.json();

        // Rellenar tarjeta de usuario
        document.getElementById('profile-avatar').src = data.userDetails.avatar;
        document.getElementById('profile-username').textContent = data.userDetails.username;
        document.getElementById('profile-discord-id').textContent = data.userDetails.discord_id;
        document.getElementById('profile-fivem-license').textContent = data.userDetails.fivem_license || 'No vinculada';

        // Rellenar roles activos
        const rolesContainer = document.getElementById('active-roles-container');
        rolesContainer.innerHTML = '';
        const vipRoles = Object.keys(ROLE_ID_TO_NAME);
        let hasRoles = false;
        data.activeDiscordRoles.forEach(roleId => {
            if (vipRoles.includes(roleId)) {
                hasRoles = true;
                rolesContainer.innerHTML += `<span class="badge bg-success p-2">${ROLE_ID_TO_NAME[roleId]}</span>`;
            }
        });
        if (!hasRoles) {
            rolesContainer.innerHTML = '<p class="text-muted">No tienes roles VIP activos.</p>';
        }

        // Rellenar historial de compras
        const historyContainer = document.getElementById('purchase-history-container');
        historyContainer.innerHTML = '';
        if (data.purchaseHistory.length === 0) {
            historyContainer.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No has realizado ninguna compra.</td></tr>';
        } else {
            data.purchaseHistory.forEach(order => {
                historyContainer.innerHTML += `<tr><td>${order.product_name}</td><td>${order.quantity}</td><td>$${order.total_paid_usd.toFixed(2)} USD</td><td>${new Date(order.purchase_date).toLocaleString('es-CL')}</td></tr>`;
            });
        }
        
        document.getElementById('loading-spinner').style.display = 'none';
        profileContent.classList.remove('d-none');

    } catch (error) {
        console.error("Error al cargar datos del perfil:", error);
        document.getElementById('loading-spinner').innerHTML = `<p class="text-danger">${error.message}</p>`;
    }
}


// Listener principal que llama a las funciones necesarias
document.addEventListener('DOMContentLoaded', () => {
    updateServerStatus();
})