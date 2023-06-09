const User = require('../models/user');

const createUser = (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    age: req.body.age,
    musicPreferences: req.body.musicPreferences
  });

  newUser.save()
    .then(() => {
      console.log('Usuario guardado en la base de datos');
      res.status(201).json({ message: 'Usuario creado correctamente' });
    })
    .catch((err) => {
      console.error('Error al guardar el usuario:', err);
      res.status(500).json({ error: 'Error al guardar el usuario' });
    });
};

const getUserById = (req, res) => {
  const userId = req.params.id;

  User.findById(userId)
    .then((user) => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    })
    .catch((err) => {
      console.error('Error al obtener el usuario:', err);
      res.status(500).json({ error: 'Error al obtener el usuario' });
    });
};

module.exports = {
  createUser,
  getUserById
};