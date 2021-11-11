const express = require('express');
const fs = require('fs');
const ruta = express.Router();

ruta.get('/', (req, res) => {
    fs.readFile('public/html/index.html', (err, data) => {
        if (!err) {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(data);
            res.end();
        } else {
            res.writeHead(404, { 'content-type': 'text/html' });
            res.write(err);
            res.end();
        }
    });
});

ruta.get('/registro', (req, res) => {
    fs.readFile('public/html/registro.html', (err, data) => {
        if (!err) {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(data);
            res.end();
        } else {
            res.writeHead(404, { 'content-type': 'text/html' });
            res.write(err);
            res.end();
        }
    });
});

ruta.get('/Administrar', (req, res) => {
    fs.readFile('public/html/administrador.html', (err, data) => {
        if (!err) {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(data);
            res.end();
        } else {
            res.writeHead(404, { 'content-type': 'text/html' });
            res.write(err);
            res.end();
        }
    });
});

module.exports = ruta;