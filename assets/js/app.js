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
    loadProfileData();
})