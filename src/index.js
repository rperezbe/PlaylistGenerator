//iniciamos conexión
const express = require('express');
const app = express();
const playlistRoutes = require('./routes/playlistRoutes');
require('./database');

app.use(express.json());
//middlewares¿?¿?¿?
app.use('/playlists', playlistRoutes);

app. listen(3000);
console.log('server on port 3000', 3000);