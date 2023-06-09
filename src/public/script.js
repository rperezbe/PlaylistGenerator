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
    const email = 'fjuan@campus.eug.es'; 
    const age = 23; 
    const musicPreferences = ["rock", "pop", "indie"];
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
  })
  .catch(error => {
    // Manejar el error en caso de que ocurra
    console.error(error);
  });

  }
  