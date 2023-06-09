const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

// Ruta para crear una nueva playlist
router.post('/', playlistController.createPlaylist);

// Ruta para obtener una playlist específica
router.get('/:id', playlistController.getPlaylistById);

// Otras rutas relacionadas con playlists...

module.exports = router;
