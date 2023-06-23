const clientId = 'd7cdacc29b064ae5984e5ca69d5f42e9'; // ID de cliente
const clientSecret = '567a2ba4f0c843faad2fdb94b7d375e9'; // clave de cliente
const redirectUri = 'http://127.0.0.1:5502/src/public/callback.html'; // URL de redireccionamiento de nuestra aplicación
const accessTokenKey = 'spotify_access_token'; // constante para almacenar el access token en el almacenamiento local
const refreshTokenKey = 'spotify_refresh_token'; // constante para almacenar el refresh token en el almacenamiento local

// Mostrar los datos del usuario en la página
const user = JSON.parse(localStorage.getItem('user'));
const username = user.username;
const tracks = JSON.parse(localStorage.getItem('playlist_tracks'));

// Función para refrescar el token de acceso cuando expire
function refreshAccessToken(refreshToken) {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const encodedCredentials = btoa(clientId + ':' + clientSecret);

  const data = new URLSearchParams();
  data.append('grant_type', 'refresh_token');
  data.append('refresh_token', refreshToken);

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + encodedCredentials
  };

  return fetch(tokenUrl, {
    method: 'POST',
    headers: headers,
    body: data
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

// Función para obtener el ID de usuario
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

// Función para manejar la expiración del token
function handleTokenExpiration() {
  const accessToken = getAccessToken();
  console.log('Access token:', accessToken);
  const refreshToken = getRefreshToken();
  console.log('Refresh token:', refreshToken);

  if (refreshToken) {
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
            });
        }
      });
  } else {
    // Si no hay token de acceso, se redirige a la página de autorización de Spotify
    const authUrl = 'https://accounts.spotify.com/authorize';
    const scopes = 'playlist-modify-private playlist-modify-public';
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri
    });

    window.location.href = authUrl + '?' + authParams.toString();
  }
}

// Función para obtener el token de acceso del almacenamiento local
function getAccessToken() {
  return localStorage.getItem(accessTokenKey);
}

// Función para obtener el refresh token del almacenamiento local
function getRefreshToken() {
  return localStorage.getItem(refreshTokenKey);
}

// Función para crear una nueva playlist
function createPlaylist(userId, accessToken) {
  const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
  const headers = {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  };
  const data = JSON.stringify({
    name: 'Playlist personalizada para '+username,
    description: 'Playlist generada automáticamente con PlaylistGenerator',
    public: false
  });

  return fetch(url, {
    method: 'POST',
    headers: headers,
    body: data
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to create playlist');
      }
    })
    .then(data => data.id);
}

// Función para agregar canciones a la playlist
function addTracksToPlaylist(playlistId, tracks, accessToken) {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const headers = {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  };
  const uris = tracks.map(track => track.uri);
  const data = JSON.stringify({
    uris: uris
  });

  return fetch(url, {
    method: 'POST',
    headers: headers,
    body: data
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to add tracks to playlist');
      }
    });
}

// Función para mostrar la playlist en la página
function showPlaylist(playlistId) {
  const url = `https://open.spotify.com/embed/playlist/${playlistId}`;
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.width = '300';
  iframe.height = '380';
  iframe.frameborder = '0';
  iframe.allowtransparency = 'true';
  iframe.allow = 'encrypted-media';
  document.getElementById('playlist-container').appendChild(iframe);
}

// Función para generar las playlists
function generatePlaylists(userId) {
  const accessToken = getAccessToken();
  console.log('Access token:', accessToken);

  createPlaylist(userId, accessToken)
    .then(playlistId => {
      console.log('Playlist ID:', playlistId);
      return addTracksToPlaylist(playlistId, tracks, accessToken)
        .then(() => playlistId);
    })
    .then(playlistId => {
      console.log('Tracks added to playlist');
      showPlaylist(playlistId);
    })
    .catch(error => {
      console.error('Error generating playlists:', error);
    });
}

// Función para manejar el callback de autorización
function handleAuthorizationCallback() {
  const code = new URLSearchParams(window.location.search).get('code');
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const encodedCredentials = btoa(clientId + ':' + clientSecret);

  const data = new URLSearchParams();
  data.append('grant_type', 'authorization_code');
  data.append('code', code);
  data.append('redirect_uri', redirectUri);

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + encodedCredentials
  };

  fetch(tokenUrl, {
    method: 'POST',
    headers: headers,
    body: data
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to retrieve access token');
      }
    })
    .then(data => {
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      localStorage.setItem(accessTokenKey, accessToken);
      localStorage.setItem(refreshTokenKey, refreshToken);

      console.log('Access token:', accessToken);
      console.log('Refresh token:', refreshToken);

      getUserId(accessToken)
        .then(userId => {
          console.log('User ID:', userId);
          generatePlaylists(userId);
        })
        .catch(error => {
          console.error('Error getting user ID:', error);
        });
    })
    .catch(error => {
      console.error('Error handling authorization callback:', error);
    });
}

// Verificar si la página es el callback de autorización
if (window.location.href.startsWith(redirectUri)) {
  handleAuthorizationCallback();
} else {
  handleTokenExpiration();
}