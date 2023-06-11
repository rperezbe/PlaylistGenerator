const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//ruta para crear un nuevo usuario
router.post('/', userController.createUser);

//ruta para obtener un usuario específico por ID
router.get('/:id', userController.getUserById);

//ruta para iniciar sesión
router.post('/login', userController.loginUser);

module.exports = router;
