const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//ruta para crear un nuevo usuario
router.post('/', userController.createUser);

//ruta para obtener todos los usuarios
router.get('/', userController.getAllUsers);

//ruta para obtener un usuario específico por ID
router.get('/:id', userController.getUserById);

// Ruta para eliminar un usuario (solamente si eres admin)
router.delete('/:id', userController.deleteUser);

//ruta para iniciar sesión
router.post('/login', userController.loginUser);

//ruta para el logout
router.post('/logout', userController.logoutUser);

module.exports = router;
