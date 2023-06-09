function showRegister() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('registro').style.display = 'block';
  }

  function showLogin() {
    document.getElementById('registro').style.display = 'none';
    document.getElementById('login').style.display = 'block';
  }

  function login() {}
  
  function register() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const email = ''; 
    const age = 0; 
    const musicPreferences = [];
  
    // Crear el objeto con los datos del usuario
    const newUser = {
      username,
      password,
      email,
      age,
      musicPreferences
    };
  
    // Realizar la solicitud POST al backend para crear un usuario
    axios.post('/users', newUser)
      .then(response => {
        // Manejar la respuesta del backend
        console.log(response.data);
        // SI SE REGISTRA BIEN VAMOS AL INDEX NO??
      })
      .catch(error => {
        // Manejar el error en caso de que ocurra
        console.error(error);
      });
  }
  