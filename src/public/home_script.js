const clientId = 'd7cdacc29b064ae5984e5ca69d5f42e9'; // ID de cliente de tu aplicación
const clientSecret = '567a2ba4f0c843faad2fdb94b7d375e9'; // Clave secreta de tu aplicación
const redirectUri = 'http://127.0.0.1:5500/PlaylistGenerator/src/public/callback.html'; // URL de redireccionamiento de tu aplicación
const accessTokenKey = 'spotify_access_token'; // Clave para almacenar el token de acceso en el almacenamiento local
const username = 'Robin'; // Nombre de usuario de Spotify

// Función para generar el URL de autorización de Spotify
function generateAuthorizationUrl() {
  const scopes = ['playlist-modify-private']; // Lista de los permisos que necesita tu aplicación
  const state = generateRandomString(16); // Genera un estado aleatorio para prevenir ataques CSRF

  const url = 'https://accounts.spotify.com/authorize?' +
    'response_type=code' +
    '&client_id=' + encodeURIComponent(clientId) +
    '&scope=' + encodeURIComponent(scopes.join(' ')) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&state=' + encodeURIComponent(state);

  return url;
}

// Función para intercambiar el código de autorización por un token de acceso
function exchangeAuthorizationCode(code) {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const encodedCredentials = btoa(clientId + ':' + clientSecret);

  const data = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + encodedCredentials
  };

  return fetch(tokenUrl, {
    method: 'POST',
    headers: headers,
    body: new URLSearchParams(data)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to exchange authorization code for access token');
      }
    })
    .then(data => data.access_token);
}

// Genera una cadena aleatoria de longitud especificada
function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Lógica para manejar el callback de autorización
function handleAuthorizationCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  if (code && state) {
    exchangeAuthorizationCode(code)
      .then(accessToken => {
        localStorage.setItem(accessTokenKey, accessToken);

        // Elimina los parámetros de la URL para evitar que se ejecute el callback nuevamente
        window.history.replaceState({}, document.title, redirectUri);

        // Llama a las funciones necesarias una vez que se obtenga el token de acceso
        // Para obtener un nuevo token de acceso con mayor grado de autorización, simplemente llama a exchangeAuthorizationCode nuevamente con el nuevo código
        generatePlaylists();
      })
      .catch(error => {
        console.error('Error al intercambiar el código de autorización:', error);
      });
  } else {
    console.error('El código de autorización o el estado no están presentes en la URL');
  }
}

// Función para obtener el token de acceso almacenado en el almacenamiento local
function getAccessToken() {
  return localStorage.getItem(accessTokenKey);
}

// Función para iniciar el proceso de autorización
function authorize() {
  const accessToken = getAccessToken();

  if (accessToken) {
    // Si ya se ha obtenido el token de acceso, se puede llamar directamente a la función generatePlaylists()
    generatePlaylists();
  } else {
    const authorizationUrl = generateAuthorizationUrl();
    window.location.href = authorizationUrl;
  }
}

// Llama a la función handleAuthorizationCallback() si la página actual es la de callback.html
if (window.location.pathname.includes('callback.html')) {
  handleAuthorizationCallback();
} else {
  // Aquí puedes agregar un botón o un evento que inicie el proceso de autorización
  authorize();
}

const genreSeeds = ['rock', 'pop', 'hip-hop'];

function getUserId() {
  const url = 'https://api.spotify.com/v1/me';
  const headers = {
    'Authorization': 'Bearer ' + getAccessToken()
  };

  return fetch(url, {
    headers: headers
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to get user ID');
      }
    })
    .then(data => data.id);
}


function generatePlaylists() {
  getUserId()
    .then(userId => {
      createPlaylist(userId)
        .then(playlistId => {
          const songPromises = genreSeeds.map(genre => getSongsByGenre(genre));
          Promise.all(songPromises)
            .then(songsByGenre => {
              const tracks = songsByGenre.flatMap(songs => songs.slice(0, 2));
              addTracksToPlaylist(playlistId, tracks)
                .then(() => {
                  console.log('Playlist creada y canciones añadidas');
                  showPlaylist(playlistId);
                })
                .catch(error => {
                  console.error('Error al añadir canciones a la playlist:', error);
                });
            })
            .catch(error => {
              console.error('Error al obtener canciones por género:', error);
            });
        })
        .catch(error => {
          console.error('Error al crear la playlist:', error);
        });
    })
    .catch(error => {
      console.error('Error al obtener el ID de usuario:', error);
    });
}

function createPlaylist(userId) {
  const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
  const headers = {
    'Authorization': 'Bearer ' + getAccessToken(),
    'Content-Type': 'application/json'
  };
  const playlistName = 'Playlist personalizada de ' + username;
  const playlistDescription = 'Playlist creada para las preferencias musicales de ' + username;

  const data = {
    name: playlistName,
    description: playlistDescription,
    public: false
  };

  return fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to create playlist');
      }
    })
    .then(data => {
      console.log('Playlist creada');
      return data.id;
    });
}

function getSongsByGenre(genre) {
  const url = `https://api.spotify.com/v1/recommendations?limit=2&seed_genres=${genre}`;
  const headers = {
    'Authorization': 'Bearer ' + getAccessToken()
  };

  return fetch(url, {
    headers: headers
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to get songs by genre');
      }
    })
    .then(data => data.tracks.map(track => track.uri));
}

function addTracksToPlaylist(playlistId, tracks) {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const headers = {
    'Authorization': 'Bearer ' + getAccessToken(),
    'Content-Type': 'application/json'
  };

  const data = {
    uris: tracks
  };

  return fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to add tracks to playlist');
      }
    });
}
function showPlaylist(playlistId) {
  const playlistsContainer = document.getElementById('playlists');

  const playlistElement = document.createElement('div');
  playlistElement.className = 'playlist-item';

  const iframeElement = document.createElement('iframe');
  iframeElement.src = `https://open.spotify.com/embed/playlist/${playlistId}`;
  iframeElement.width = '300';
  iframeElement.height = '380';
  iframeElement.frameborder = '0';
  iframeElement.allowtransparency = 'true';
  iframeElement.allow = 'encrypted-media';

  playlistElement.appendChild(iframeElement);
  playlistsContainer.appendChild(playlistElement);
}
