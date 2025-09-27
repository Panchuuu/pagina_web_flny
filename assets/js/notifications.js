/**
 * Muestra una notificación toast de Bootstrap.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de notificación ('success', 'danger', 'info').
 */
function showNotification(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;

    let bgColor = 'bg-secondary'; // Color por defecto
    if (type === 'success') {
        bgColor = 'bg-success';
    } else if (type === 'danger') {
        bgColor = 'bg-danger';
    }

    // Crear el elemento toast dinámicamente
    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-white ${bgColor} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    // Añadirlo al contenedor
    toastContainer.appendChild(toastElement);

    // Inicializar y mostrar el toast
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 }); // Desaparece en 3 segundos
    toast.show();

    // Limpiar el elemento del DOM después de que se oculte
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}