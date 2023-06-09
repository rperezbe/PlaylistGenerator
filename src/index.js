//iniciamos conexión
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
require('./database');

app.use(express.json());
//middlewares¿?¿?¿?
app.use('/users', userRoutes);

app. listen(3000);
console.log('server on port 3000', 3000);