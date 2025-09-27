// VERSIÓN FINAL: CONECTADA AL BACKEND

// La URL base de tu API. Asegúrate de que tu servidor esté corriendo en este puerto.
const API_URL = 'http://localhost:3000';

// --- MANEJADORES DE EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
    }
    if (document.getElementById('registerForm')) {
        document.getElementById('registerForm').addEventListener('submit', handleRegister);
    }
    checkLoginState();
});


// --- FUNCIONES PRINCIPALES ---

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageEl = document.getElementById('auth-message');

    if (password !== confirmPassword) {
        messageEl.textContent = 'Las contraseñas no coinciden.';
        messageEl.className = 'mt-3 small text-center text-danger';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) { // response.ok es true si el status es 200-299
            messageEl.textContent = data.message + ' Redirigiendo...';
            messageEl.className = 'mt-3 small text-center text-success';
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        } else {
            // Muestra el mensaje de error que viene del backend
            messageEl.textContent = data.message;
            messageEl.className = 'mt-3 small text-center text-danger';
        }
    } catch (error) {
        messageEl.textContent = 'No se pudo conectar con el servidor.';
        messageEl.className = 'mt-3 small text-center text-danger';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('auth-message');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Si el login es exitoso, guardamos el estado de la sesión en localStorage
            localStorage.setItem('currentUser', data.username);
            
            messageEl.textContent = data.message + ' Redirigiendo...';
            messageEl.className = 'mt-3 small text-center text-success';
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        } else {
            messageEl.textContent = data.message;
            messageEl.className = 'mt-3 small text-center text-danger';
        }
    } catch (error) {
        messageEl.textContent = 'No se pudo conectar con el servidor.';
        messageEl.className = 'mt-3 small text-center text-danger';
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    if(typeof showNotification === "function") {
      showNotification('Has cerrado sesión.', 'info');
    }
    setTimeout(() => { window.location.reload(); }, 1000);
}


// --- GESTIÓN DE LA INTERFAZ ---

function checkLoginState() {
    const currentUser = localStorage.getItem('currentUser');
    const userContainer = document.getElementById('user-container');
    const guestContainer = document.getElementById('guest-container');
    const usernameSpan = document.getElementById('username-span');

    if (currentUser && userContainer && guestContainer) {
        guestContainer.style.display = 'none';
        userContainer.style.display = 'flex';
        usernameSpan.textContent = currentUser;
    } else if(userContainer && guestContainer) {
        guestContainer.style.display = 'flex';
        userContainer.style.display = 'none';
    }
}