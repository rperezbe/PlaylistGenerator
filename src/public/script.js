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