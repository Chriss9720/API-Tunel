const express = require('express');;
const mongoose = require('mongoose');
const config = require('config');

const vistas = require('./routers/vistas');
const registros = require('./routers/registros');
const datos = require('./routers/datos');
const borrar = require('./routers/borrar');
const leer = require('./routers/leer');
const login = require('./routers/login');

mongoose.connect(config.get('configBD.HOST'), { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(res => console.log("Conectado"))
    .catch(err => console.log("Error al conectar con la bd"));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', vistas);
app.use('/Registrar/', registros);
app.use('/dato/', datos);
app.use('/borrar/', borrar);
app.use('/leer/', leer);
app.use('/acceso', login);

let dato = `${app.get('env')} ${config.get('configBD.HOST')}`;

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Ejecutandose!!! ${port} ${dato}`));