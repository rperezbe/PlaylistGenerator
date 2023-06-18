function showRegister() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('registro').style.display = 'block';
  }

  function showLogin() {
    document.getElementById('registro').style.display = 'none';
    document.getElementById('login').style.display = 'block';
  }

  function login() {
    const username = document.getElementById('username').value; // Obtener el valor del campo de nombre de usuario
    const password = document.getElementById('password').value; // Obtener el valor del campo de contraseña
  
    // Crear el objeto con los datos del usuario
    const user = {
      username,
      password
    };
  
    // Realizar la solicitud POST al backend para iniciar sesión
    axios.post('http://localhost:3000/users/login', user)
      .then(response => {
        //console.log(response.data.user);
        //obtener los datos del usuario almacenados en la variable de sesión
        const user = response.data.user;
        //guardar los datos del usuario en el localStorage
        localStorage.setItem('user', JSON.stringify(user));
        //redireccionar a la página home.html
        window.location.href = 'home.html';
      })
      .catch(error => {
        // Manejar el error en caso de que ocurra
        console.error(error);
      });
  }
  
  function register() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const email = document.getElementById('email').value; // Obtener el valor del campo de correo electrónico
    const age = document.getElementById('age').value; // Obtener el valor del campo de edad
    const musicPreferences = Array.from(document.querySelectorAll('input[name="musicPreferences"]:checked')).map(input => input.value);
    // Crear el objeto con los datos del usuario
    const newUser = {
      username,
      password,
      email,
      age,
      musicPreferences
    };
  
  // Realizar la solicitud POST al backend para crear un usuario
  axios.post('http://localhost:3000/users', newUser)
  .then(response => {
    // Manejar la respuesta del backend
    console.log(response.data);
    // Redireccionar o realizar otras acciones después del registro
    window.location.href = 'home.html';
  })
  .catch(error => {
    // Manejar el error en caso de que ocurra
    console.error(error);
  });

  }

  function togglePasswordFields() {
    const passwordFields = document.getElementById("password-fields");
    const toggleBtn = document.getElementById("toggle-password-btn");

    if (passwordFields.style.display === "none") {
      passwordFields.style.display = "block";
      toggleBtn.textContent = "No cambiar contraseña";
    } else {
      passwordFields.style.display = "none";
      toggleBtn.textContent = "Cambiar contraseña";
    }
  }

  function update() {
    const newUsername = document.getElementById("new-username").value;
    const email = document.getElementById("email").value;
    const age = document.getElementById("age").value;
    const toggleBtn = document.getElementById("toggle-password-btn");
    const newPassword = toggleBtn.textContent === "No cambiar contraseña" ? document.getElementById("new-password").value : '';
    const confirmPassword = toggleBtn.textContent === "No cambiar contraseña" ? document.getElementById("confirm-password").value : '';
  
    // Verificar que las contraseñas coincidan si se van a cambiar
    if (newPassword && newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.");
      return;
    }
  
    // Obtener las preferencias musicales seleccionadas
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const musicPreferences = Array.from(checkboxes).map((checkbox) => checkbox.value);
  
    // Crear el objeto de datos a enviar al backend
    const userData = {
      username: newUsername,
      email: email,
      age: age,
      musicPreferences: musicPreferences
    };
  
    // Agregar contraseñas solo si se van a cambiar
    if (newPassword) {
      userData.password = newPassword;
    }

    //obtenemos el userId del usuario actual desde localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user._id;

    // Realizar la solicitud POST al backend utilizando Axios
    axios.put('http://localhost:3000/users/' + userId, userData)
      .then(response => {
        // La solicitud se completó con éxito, realizar las acciones necesarias
        alert("Los datos se han actualizado correctamente.");
        // Actualizar el usuario en el localStorage
        const updatedUser = response.data.user;
        //console.log(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        //window.location.href = 'home.html'; 
      })
      .catch(error => {
        // Ocurrió un error durante la solicitud, manejarlo adecuadamente
        console.error(error);
        alert("Ocurrió un error al actualizar los datos. Por favor, inténtalo de nuevo más tarde.");
      });
  }
  