// Spotify API credentials
const clientId = 'd7cdacc29b064ae5984e5ca69d5f42e9'; // Client ID
const clientSecret = '567a2ba4f0c843faad2fdb94b7d375e9'; // Client Secret

// User session data
const user = JSON.parse(localStorage.getItem('user'));
const username = user.username;
const genres = user.musicPreferences;
let tracks_list = [];
// Saludo al usuario
document.getElementById('saludo').innerHTML = `Hola ${username}!`;

// Access token y refresh token actuales
let accessToken = localStorage.getItem('spotify_access_token');
console.log('Access token:', accessToken);
let refreshToken = localStorage.getItem('spotify_refresh_token');
console.log('Refresh token:', refreshToken);

// Genera recomendaciones de cantidad limit
function getTrackRecommendations(limit) {
  const headers = {
    'Authorization': 'Bearer ' + accessToken
  };

  const tracksPromises = [];
  // Un bucle de tamaño limit que obtiene un género aleatorio y lo agrega a la URL
  for (let i = 0; i < limit; i++) {
    const randomGenre = Math.floor(Math.random() * genres.length);
    const genre = genres[randomGenre];
    const url = `https://api.spotify.com/v1/recommendations?limit=1&seed_genres=${genre}`;

    const trackPromise = fetch(url, { headers })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error getting track recommendation');
        }
      })
      .then(data => data.tracks[0])
      .catch(error => {
        console.error('Error getting track recommendation:', error);
        throw error;
      });

    tracksPromises.push(trackPromise);
  }

  return Promise.all(tracksPromises);
}

// Obtiene los divs del html donde se mostrarán las recomendaciones y la paginación
const gridContainer = document.getElementById('recommendations-grid');
const paginationContainer = document.getElementById('paginationContainer');
// Obtiene el input de la cantidad de recomendaciones
const numSongsInput = document.getElementById('num-songs');
//Pagina actual de recomendaciones por defecto sera 0
let currentPage = 0;
//Cantidad de recomendaciones por página
const pageSize = 8;

// Muestra las recomendaciones de canciones
function displayRecommendations(tracks) {
  localStorage.setItem('playlist_tracks', JSON.stringify(tracks));
  //Se borra el contenido de los divs de recomendaciones y paginación
  gridContainer.innerHTML = '';
  paginationContainer.innerHTML = '';
//se calcula la cantidad de páginas que se necesitan para mostrar todas las recomendaciones
  const numPages = Math.ceil(tracks.length / pageSize);
//Si hay más de una página, se muestran los botones de anterior y siguiente
  if (numPages > 1) {
    const previousButton = document.createElement('button');
    previousButton.textContent = 'Anterior';
    previousButton.id = 'previous-button';
    previousButton.addEventListener('click', showPreviousPage);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Siguiente';
    previousButton.id = 'next-button';
    nextButton.addEventListener('click', showNextPage);
  
    paginationContainer.appendChild(previousButton);
    paginationContainer.appendChild(nextButton);


  }

  const start = currentPage * pageSize;
  const end = start + pageSize;
  const pageTracks = tracks.slice(start, end);

  const grid = document.createElement('div');
  grid.className = 'grid-page';

  pageTracks.forEach(track => {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';

    const iframe = document.createElement('iframe');
    iframe.src = `https://open.spotify.com/embed/track/${track.id}`;
    iframe.frameborder = '0';
    iframe.allowtransparency = 'true';
    iframe.allow = 'encrypted-media';

    const trackName = document.createElement('p');
    trackName.className = 'track-name';
    trackName.textContent = track.name;

    gridItem.appendChild(iframe);
    gridItem.appendChild(trackName);
    grid.appendChild(gridItem);
  });

  gridContainer.appendChild(grid);
}
//muestra la página anterior de recomendaciones
function showPreviousPage() {
  if (currentPage > 0) {
    currentPage--;
    displayRecommendations(JSON.parse(localStorage.getItem('playlist_tracks')));
  }
}
//muestra la siguiente página de recomendaciones
function showNextPage() {
  const tracks = JSON.parse(localStorage.getItem('playlist_tracks'));
  const numPages = Math.ceil(tracks.length / pageSize);

  if (currentPage < numPages - 1) {
    currentPage++;
    displayRecommendations(tracks);
  }
}
// Listener para el input de la cantidad de canciones
numSongsInput.addEventListener('change', () => {
  const numSongs = parseInt(numSongsInput.value, 10);
  if (numSongs > 0 && numSongs <= 100) {
    getTrackRecommendations(numSongs)
      .then(tracks => {
        displayRecommendations(tracks);
      })
      .catch(error => {
        console.error('Error getting track recommendations:', error);
        refreshAccessToken();
      });
  }
});

// Obtiene un token de acceso nuevo
function fetchAccessToken() {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const encodedCredentials = btoa(clientId + ':' + clientSecret);

  const data = new URLSearchParams();
  data.append('grant_type', 'client_credentials');

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
        throw new Error('Failed to fetch access token');
      }
    })
    .then(data => {
      accessToken = data.access_token;
      localStorage.setItem('spotify_access_token', accessToken);
      console.log('Access token:', accessToken);
    })
    .catch(error => {
      console.error('Error fetching access token:', error);
      throw error;
    });
}

// Refresca el token de acceso si hay un refresh token
function refreshAccessToken() {
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
      accessToken = data.access_token;
      localStorage.setItem('spotify_access_token', accessToken);
      console.log('Access token:', accessToken);
    })
    .catch(error => {
      console.error('Error refreshing access token:', error);
      throw error;
    });
}

// Envía las recomendaciones a la página de playlist
function saveRecommendationsToPlaylist() {
  window.location.href = `playlist.html`;
}

// Listener para el botón de guardar a playlist
const saveButton = document.querySelector('.save-button');
saveButton.addEventListener('click', saveRecommendationsToPlaylist);

// Comprueba si hay tokens funcionando
function checkTokens() {
  accessToken = localStorage.getItem('spotify_access_token');
  refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!accessToken || !refreshToken) {
    fetchAccessToken()
      .then(() => {
        getTrackRecommendations(numSongsInput.value)
          .then(tracks => {
            displayRecommendations(tracks);
          })
          .catch(error => {
            console.error('Error getting track recommendations:', error);
            refreshAccessToken();
          });
      })
      .catch(error => {
        console.error('Error fetching access token:', error);
      });
  } else {
    getTrackRecommendations(numSongsInput.value)
      .then(tracks => {
        displayRecommendations(tracks);
      })
      .catch(error => {
        console.error('Error getting track recommendations:', error);
        refreshAccessToken();
      });
  }
}

// Comprueba los tokens
checkTokens();