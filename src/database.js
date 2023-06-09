//aquí tendremos la conexion a la base de datos con mongoose
require('dotenv').config();
const mongoose = require('mongoose');

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

const connectionString = `mongodb://${dbHost}:${dbPort}/${dbName}`;

mongoose.connect(connectionString).
    then(db => console.log('DB is connected to', db.connection.host))
    .catch(err => console.error(err));
