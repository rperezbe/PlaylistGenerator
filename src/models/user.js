const mongoose = require('mongoose');

// Define el esquema para la colección 'user'
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  musicPreferences: {
    type: [String],
    required: true
  }
});

// Crea el modelo 'Playlist' a partir del esquema
const User = mongoose.model('User', userSchema);

// Exporta el modelo para su uso en otros archivos
module.exports = User;
