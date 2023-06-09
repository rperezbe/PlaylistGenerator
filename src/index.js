//iniciamos conexión
const express = require('express');

const app = express();

require('./database');

app. listen(3000);
console.log('server on port 3000', 3000);