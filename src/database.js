//aquí tendremos la conexion a la base de datos con mongoose
const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo/playlistdb').
    then(db => console.log('DB is connected to', db.connection.host))
    .catch(err => console.error(err));
