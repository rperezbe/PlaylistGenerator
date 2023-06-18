function logout() {
    // Realizar una solicitud POST a la función /logout en el backend
    fetch('http://localhost:3000/users/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        // Borrar la información de la sesión en localStorage
        localStorage.removeItem('user');
        // Redireccionar a la página de inicio de sesión u otra página después del logout exitoso
        window.location.href = 'index.html';
      })
      .catch(error => {
        console.error('Error al realizar el logout:', error);
      });
  }
  
  function loadMenu() {
    const menuContainer = document.getElementById('menuContainer');
    const menuHTML = `
      <div class="menu">
        <ul>
          <li><a class="menu-link" href="home.html">Home</a></li>
          <li><a class="menu-link" href="perfilUsuario.html">Profile</a></li>
          <li><a class="menu-link" href="#" onclick="logout()">Logout</a></li>
        </ul>
      </div>
    `;
    menuContainer.innerHTML = menuHTML;
  }
  
  loadMenu();
  