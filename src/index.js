//iniciamos conexión
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const cors = require('cors'); //para que no haya problemas de cors
const session = require('express-session');
require('./database');

//middlewares
app.use(express.json());
app.use(cors());
app.use(
    session({
      secret: 'mysecretkey',
      resave: false,
      saveUninitialized: false,
    })
  );

// Rutas de usuarios
app.use('/users', userRoutes);

app. listen(3000);
console.log('server on port 3000', 3000);