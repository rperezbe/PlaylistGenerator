const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para crear un nuevo usuario
router.post('/', userController.createUser);

// Ruta para obtener un usuario específico por ID
router.get('/:id', userController.getUserById);

// Otras rutas relacionadas con usuarios...

module.exports = router;
