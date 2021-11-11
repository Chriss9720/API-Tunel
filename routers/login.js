const express = require('express');
const Joi = require('@hapi/joi');
const Tunel = require('../models/Tunel');
const app = express.Router();

const joiLogin = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "mx"] } }).required().error(errores => {
        errores.forEach(e => {
            switch (e.code) {
                case "any.required":
                    e.message = "Se requiere el campo email";
                case "string.empty":
                    e.message = "Ingrese su email";
                    break;
                case "string.domain":
                    e.message = "Dominios permitos son: mx y com";
                    break;
                case "string.email":
                    e.message = "Email incompleto";
                    break;
            }
        });
        return errores;
    }),
    clave: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9\.\$\#]+$/).required().error(errores => {
        errores.forEach(e => {
            switch (e.code) {
                case "any.required":
                    e.message = "Se requiere el campo clave";
                case "string.empty":
                    e.message = "Ingrese su contraseña";
                    break;
                case "string.min":
                    e.message = "Longitud minima de 3";
                    break;
                case 'string.pattern.name':
                case "string.pattern.base":
                case "string.pattern.invert.name":
                case "string.pattern.invert.base":
                    e.message = "Solo se permiten letras, numeros y los caracteres: . $ #";
                    break;
                case 'string.max':
                    e.message = "Longitud maxima de 30 caracteres";
                    break;
            }
        })
        return errores;
    })
});

app.post('/', async(req, res) => {
    let datos = req.body;
    let { error } = joiLogin.validate({
        email: datos.email,
        clave: datos.clave
    });
    if (!error) {
        await Tunel.findOne({ correo: datos.email, clave: datos.clave }, async(err, result) => {
            if (err) {
                res.status(401).send(err);
            } else if (result) {
                res.json({ id_Acceso: result.id_acceso });
            } else {
                res.status(401).send("Datos incorrectos 1");
            }
        });
    } else {
        res.status(401).json(error);
    }
});

module.exports = app