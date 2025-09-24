function login(){
  var email = document.getElementById('email').value.trim();
  var contra = document.getElementById('contrasena').value.trim();

  if (email === '') {
    alert('Ingrese su correo');
    return;
  }
  
  var emailOk = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
  if (!emailOk) {
    alert('Correo inválido. Ejemplo válido: nombre@dominio.cl');
    return;
  }
  
  if (contra === '') {
    alert('Ingrese su contraseña');
    return;
  }

  
  alert('Sesión correcta. ¡Bienvenido, cliente!');
  window.location.href = 'index.html';
}