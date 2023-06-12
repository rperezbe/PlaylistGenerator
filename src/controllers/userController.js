const bcrypt = require('bcryptjs');
const User = require('../models/user');

const createUser = (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    age: req.body.age,
    musicPreferences: req.body.musicPreferences
  });

  //verificar que el usuario no existe
  User.findOne({ username: newUser.username })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }
      //verificar que el correo electrónico no existe
      User.findOne({ email: newUser.email })
        .then((existingEmail) => {
          if (existingEmail) {
            return res.status(400).json({ error: 'El correo electrónico ya existe' });
          }
          // Encriptar la contraseña
          bcrypt.hash(newUser.password, 10)
            .then((hash) => {
              newUser.password = hash;
              // Guardar el usuario en la base de datos
              newUser.save()
                .then(() => {
                  console.log('Usuario guardado en la base de datos');
                  res.status(201).json({ message: 'Usuario creado correctamente' });
                })
                .catch((err) => {
                  console.error('Error al guardar el usuario:', err);
                  res.status(500).json({ error: 'Error al guardar el usuario' });
                });
            })
            .catch((err) => {
              console.error('Error al generar el hash de la contraseña:', err);
              res.status(500).json({ error: 'Error al guardar el usuario' });
            });
        })
        .catch((err) => {
          console.error('Error al verificar el correo electrónico:', err);
          res.status(500).json({ error: 'Error al verificar el correo electrónico' });
        });
    })
    .catch((err) => {
      console.error('Error al verificar el usuario:', err);
      res.status(500).json({ error: 'Error al verificar el usuario' });
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

const loginUser = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      //autenticamos utilizando bcryptjs
      bcrypt.compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            //la contraseña coincide, el inicio de sesión es exitoso
            return res.status(200).json({ message: 'Inicio de sesión exitoso' });
          } else {
            //la contraseña no coincide, el inicio de sesión falla
            return res.status(401).json({ error: 'Contraseña incorrecta' });
          }
        })
        .catch((err) => {
          console.error('Error al comparar las contraseñas:', err);
          res.status(500).json({ error: 'Error en el servidor' });
        });
    })
    .catch((err) => {
      console.error('Error al obtener el usuario:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    });
};

module.exports = {
  createUser,
  getUserById,
  loginUser
};