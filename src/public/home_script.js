const clientId = 'd7cdacc29b064ae5984e5ca69d5f42e9'; // ID de cliente
const clientSecret = '567a2ba4f0c843faad2fdb94b7d375e9'; // clave de cliente
const redirectUri = 'http://127.0.0.1:3000/PlaylistGenerator/src/public/callback.html'; // URL de redireccionamiento de nuestra aplicacion
const accessTokenKey = 'spotify_access_token'; // constante para almacenar el access token en el almacenamiento local
const refreshTokenKey = 'spotify_refresh_token'; // constante para almacenar el refresh token en el almacenamiento local
//const username = 'Robin'; // nombre usuario (lo obtendremos por sesion)
//const genreSeeds = ['rock', 'pop', 'hip-hop', 'metal', 'jazz', 'reggaeton']; //prefencias musicales del usuario (lo obtendremos por sesion)



 //mostrar los datos del usuario en la página
 const user = JSON.parse(localStorage.getItem('user'));
 //console.log(user);
 const username = user.username;
 const genreSeeds = user.musicPreferences;
 document.getElementById('saludo').innerHTML = `Hola ${username}!`;
// Funcion para refrescar el token de acceso cuando expire
function refreshAccessToken(refreshToken) {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const encodedCredentials = btoa(clientId + ':' + clientSecret);

  const data = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken
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
        throw new Error('Failed to refresh access token');
      }
    })
    .then(data => {
      const newAccessToken = data.access_token;
      localStorage.setItem(accessTokenKey, newAccessToken);
      return newAccessToken;
    });
}

// Funcion para obtener id de usuario
function getUserId(accessToken) {
  const url = 'https://api.spotify.com/v1/me';
  const headers = {
    'Authorization': 'Bearer ' + accessToken
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

// Funcion para manejar la expiracion del token
function handleTokenExpiration() {
  const accessToken = getAccessToken();
  console.log('Access token:', accessToken);
  const refreshToken = getRefreshToken();
  console.log('Refresh token:', refreshToken);

  if (accessToken) {
    getUserId(accessToken)
      .then(userId => {
        console.log('User ID:', userId);
        generatePlaylists(userId);
      })
      .catch(error => {
        console.error('Error getting user ID:', error);
        if (error.message === 'Failed to get user ID') {
          refreshAccessToken(refreshToken)
            .then(newAccessToken => {
              console.log('Access token refreshed:', newAccessToken);
              generatePlaylists(userId);
            })
            .catch(error => {
              console.error('Error refreshing access token:', error);
              //añade un texto para indicar que el token ha expirado, que hay que recargarlo
              const main = document.getElementById('playlists');
              main.innerHTML = '<p>El token de acceso ha expirado. Pulsa el botón para obtener un nuevo token.</p>';
            });
        }
      });
  } else {
    //si no hay token de acceso, se redirige a la pagina de autorizacion de spotify
    console.error('Access token or refresh token not found');
    const scopes = 'user-read-private user-read-email playlist-modify-private playlist-modify-public user-top-read';
    window.location.href = 'https://accounts.spotify.com/authorize?client_id=' + clientId + '&response_type=code&redirect_uri=' + redirectUri + '&scope=' + encodeURIComponent(scopes);
  }
}

// Funcion para generar playlists
function generatePlaylists(userId) {
  createPlaylist(userId)
    .then(playlistId => {
      const songPromises = genreSeeds.map(genre => getSongsByGenre(genre));
      Promise.all(songPromises)
        .then(songsByGenre => {
          const tracks = songsByGenre.flatMap(songs => songs.slice(0, 2));
          addTracksToPlaylist(playlistId, tracks)
            .then(() => {
              console.log('Playlist created and songs added');
              showPlaylist(playlistId);
            })
            .catch(error => {
              console.error('Error adding songs to the playlist:', error);
            });
        })
        .catch(error => {
          console.error('Error getting songs by genre:', error);
        });
    })
    .catch(error => {
      console.error('Error creating the playlist:', error);
    });
}

// crea la playlist en el perfil del usuario
function createPlaylist(userId) {
  const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
  const headers = {
    'Authorization': 'Bearer ' + getAccessToken(),
    'Content-Type': 'application/json'
  };

  const playlistName = 'Playlist personalizada para ' + username;
  const playlistDescription = 'Playlist creada segun las preferencias musicales de ' + username;

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
      console.log('Playlist created');
      return data.id;
    });
}

// Funcion para obtener 2 canciones por genero
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

// Funcion para agregar canciones a la playlist
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

// Funcion para mostrar la playlist
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

// Recibe el access token de local storage
function getAccessToken() {
  return localStorage.getItem(accessTokenKey);
}

// Recibe el refresh token de local storage
function getRefreshToken() {
  return localStorage.getItem(refreshTokenKey);
}

// Funcion que maneja la autorizacion de callback.html
function handleAuthorizationCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    getAccessTokenFromCode(code)
      .then(accessToken => {
        console.log('Access token:', accessToken);
        const refreshToken = urlParams.get('refresh_token');
        console.log('Refresh token:', refreshToken);

        localStorage.setItem(accessTokenKey, accessToken);
        localStorage.setItem(refreshTokenKey, refreshToken);
        window.location.href = redirectUri.replace('callback.html', 'home.html');
      })
      .catch(error => {
        console.error('Error getting access token from code:', error);
      });
  } else {
    console.error('Authorization code not found');
  }
}

// Function to get the access token from the authorization code
function getAccessTokenFromCode(code) {
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
        throw new Error('Failed to get access token from code');
      }
    })
    .then(data => data.access_token);
}

// Si se pulsa el boton de refrescar token -> manejar la expiracion del token
const refreshButton = document.getElementById('refresh_button');
refreshButton.addEventListener('click', () => {
  const refreshToken = getRefreshToken();
  console.log('Refresh token:', refreshToken);

  if (refreshToken) {
    refreshAccessToken(refreshToken)
      .then(newAccessToken => {
        console.log('Access token refreshed:', newAccessToken);
        handleTokenExpiration();
      })
      .catch(error => {
        console.error('Error refreshing access token:', error);
      });
  } else {
    console.error('Refresh token not found');
  }
});

// verifica si estamos en el callback si no lo estamos verifica si el token expiro
if (window.location.href.includes('callback.html')) {
  handleAuthorizationCallback();
} else {
  handleTokenExpiration();
}
