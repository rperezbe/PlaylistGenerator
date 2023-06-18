const bcrypt = require('bcryptjs');
const User = require('../models/user');

//creamos un nuevo usuario
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
                  req.session.user = newUser; //guardamos el nuevo usuario en la sesión
                  //console.log(req.session.user);
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

//obtener un usuario por id (solo puedes consultar tu mismo usuario con el que te has logeado)
const getUserById = (req, res) => {
  const userId = req.params.id;

  if (req.session.user) {
    if (req.session.user._id.toString() === userId) {
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
    } else {
      res.status(401).json({ error: 'Acceso no autorizado' });
    }
  } else {
    res.status(401).json({ error: 'Acceso no autorizado' });
  }
};

//logear usuarios
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
            req.session.user = user; //guardamos el usuario en la sesión
            //console.log(req.session.user);
            return res.status(200).json({ message: 'Inicio de sesión exitoso', user: user});
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

//cerrar sesión de usuarios
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar la sesión:', err);
      return res.status(500).json({ error: 'Error al cerrar la sesión' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  });
};

//update de valores del usuario
const updateUser = (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;
  //verificar si se ha proporcionado una nueva contraseña
  if (updatedData.password) {
    //encriptar la nueva contraseña
    bcrypt.hash(updatedData.password, 10)
      .then((hash) => {
        updatedData.password = hash;
        //actualizar los datos del usuario
        User.findByIdAndUpdate(userId, updatedData, { new: true })
          .then((user) => {
            if (user) {
              res.status(200).json({ message: 'Datos de usuario actualizados correctamente', user});
            } else {
              res.status(404).json({ error: 'Usuario no encontrado' });
            }
          })
          .catch((err) => {
            console.error('Error al actualizar los datos del usuario:', err);
            res.status(500).json({ error: 'Error al actualizar los datos del usuario' });
          });
      })
      .catch((err) => {
        console.error('Error al generar el hash de la contraseña:', err);
        res.status(500).json({ error: 'Error al actualizar los datos del usuario' });
      });
  } else {
    // No se ha proporcionado una nueva contraseña, actualizar los demás datos
    User.findByIdAndUpdate(userId, updatedData, { new: true })
      .then((user) => {
        if (user) {
          res.status(200).json({ message: 'Datos de usuario actualizados correctamente',user });
        } else {
          res.status(404).json({ error: 'Usuario no encontrado' });
        }
      })
      .catch((err) => {
        console.error('Error al actualizar los datos del usuario:', err);
        res.status(500).json({ error: 'Error al actualizar los datos del usuario' });
      });
  }
};

//delete de usuario (solamente si eres admin)
const deleteUser = (req, res) => {
  if (req.session.user && req.session.user.isAdmin) {
    const userId = req.params.id;
    User.findByIdAndRemove(userId)
      .then((user) => {
        if (user) {
          res.status(200).json({ message: 'Usuario eliminado correctamente' });
        } else {
          res.status(404).json({ error: 'Usuario no encontrado' });
        }
      })
      .catch((err) => {
        console.error('Error al eliminar el usuario:', err);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
      });
  } else {
    res.status(401).json({ error: 'Acceso no autorizado' });
  }
};

//mostramos todos los usuarios (solamente si eres admin)
const getAllUsers = (req, res) => {
  if (req.session.user && req.session.user.isAdmin) {
    User.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error('Error al obtener todos los usuarios:', err);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
      });
  } else {
    res.status(401).json({ error: 'Acceso no autorizado' });
  }
};

module.exports = {
  createUser,
  getUserById,
  loginUser,
  logoutUser,
  getAllUsers,
  deleteUser,
  updateUser
};