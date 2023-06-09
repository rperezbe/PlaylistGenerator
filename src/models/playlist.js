const mongoose = require('mongoose');

// Define el esquema para la colección 'playlistdb'
const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  songs: {
    type: [String],
    required: true
  }
});

// Crea el modelo 'Playlist' a partir del esquema
const Playlist = mongoose.model('Playlist', playlistSchema);

// Exporta el modelo para su uso en otros archivos
module.exports = Playlist;
