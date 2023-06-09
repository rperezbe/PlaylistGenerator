const Playlist = require('../models/playlist');

const createPlaylist = (req, res) => {
  const newPlaylist = new Playlist({
    title: req.body.title,
    songs: req.body.songs
  });

  newPlaylist.save()
    .then(() => {
      console.log('Playlist guardada en la base de datos');
      res.status(201).json({ message: 'Playlist creada correctamente' });
    })
    .catch((err) => {
      console.error('Error al guardar la playlist:', err);
      res.status(500).json({ error: 'Error al guardar la playlist' });
    });
};

module.exports = {
  createPlaylist
};
