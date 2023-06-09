//iniciamos conexión
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const cors = require('cors'); //para que no haya problemas de cors
require('./database');

app.use(express.json());
//middlewares
app.use(cors());

// Rutas de usuarios
app.use('/users', userRoutes);

app. listen(3000);
console.log('server on port 3000', 3000);