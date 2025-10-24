// VERSIÓN FINAL: CON ROLES Y JWT

const API_URL = 'http://localhost:3002';

// --- MANEJADORES DE EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
    handleAuthRedirect(); 
    initializeAuth();
});

// --- LÓGICA DE SESIÓN CON TOKEN (JWT) ---

function handleAuthRedirect() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
        localStorage.setItem('sessionToken', token);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

async function initializeAuth() {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
        checkLoginState(null);
        if (window.location.pathname.includes('perfil.html')) {
            window.location.href = 'login.html';
        }
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const userData = await response.json();
            checkLoginState(userData);
            if (typeof loadProfileData === 'function') {
                loadProfileData();
            }
        } else {
            handleLogout();
        }
    } catch (error) {
        console.error('Error de conexión al verificar token:', error);
        checkLoginState(null);
    }
}

function checkLoginState(userData) {
    const userContainer = document.getElementById('user-container');
    const guestContainer = document.getElementById('guest-container');
    const usernameSpan = document.getElementById('username-span');
    const adminLink = document.getElementById('admin-link');

    if (userData) { 
        guestContainer.style.display = 'none';
        userContainer.style.display = 'flex';
        usernameSpan.textContent = userData.username;

        if (userData.role === 'admin' && adminLink) {
            adminLink.style.display = 'block';
        }

    } else { 
        guestContainer.style.display = 'flex';
        userContainer.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

function handleLogout() {
    localStorage.removeItem('sessionToken');
    if(typeof showNotification === "function") { showNotification('Has cerrado sesión.', 'info'); }
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

// --- LÓGICA DE REGISTRO/VINCULACIÓN ---

async function handleCompleteRegistration(event) {
    event.preventDefault();
    const messageEl = document.getElementById('auth-message');
    const payload = {
        discordId: document.getElementById('discordId').value,
        username: document.getElementById('username').value,
        avatar: document.getElementById('avatar').value,
        fivemLicense: document.getElementById('fivemLicense').value
    };

    try {
        const response = await fetch(`${API_URL}/complete-registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('sessionToken', data.token);
            messageEl.textContent = '¡Cuenta vinculada! Redirigiendo a la tienda...';
            messageEl.className = 'mt-3 small text-center text-success';
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        } else {
            messageEl.textContent = data.message;
            messageEl.className = 'mt-3 small text-center text-danger';
        }
    } catch(error) {
        messageEl.textContent = 'No se pudo conectar con el servidor.';
        messageEl.className = 'mt-3 small text-center text-danger';
    }
}