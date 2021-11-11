const express = require('express');
const Joi = require('@hapi/joi');
const keygen = require("keygenerator");
const Tunel = require('../models/Tunel');
const Dispositivo = require('../models/Dispositivo');
const auth = require('../middlewares/auth');
const app = express.Router();

const joiRegistro = Joi.object({
    nombre: Joi.string().pattern(/^[ña-zA-Z\s]+$/).required().error(errores => {
        errores.forEach(e => {
            switch (e.code) {
                case "any.required":
                    e.message = "Se requiere el campo nombre";
                    break;
                case 'string.empty':
                    e.message = "Ingrese su nombre";
                    break;
                case 'string.pattern.name':
                case "string.pattern.base":
                case "string.pattern.invert.name":
                case "string.pattern.invert.base":
                    e.message = "Solo se permiten letras mayusculas y minusculas y espacios";
                    break;
            }
        });
        return errores;
    }),
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

const joiDispositivo = Joi.object({
    nombre: Joi.string().required().error(errores => {
        errores.forEach(e => {
            switch (e.code) {
                case "any.required":
                    e.message = "Se requiere el campo nombre";
                    break;
                case 'string.empty':
                    e.message = "Ingrese el nombre";
                    break;
            }
        });
        return errores;
    }),
    cantidadMax: Joi.string().pattern(/^\d+$/).error(errores => {
        errores.forEach(e => {
            switch (e.code) {
                case "any.required":
                    e.message = "Se requiere el campo cantidadMax";
                    break;
                case 'string.empty':
                    e.message = "Ingrese la cantidad maxima";
                    break;
                case 'string.pattern.name':
                case "string.pattern.base":
                case "string.pattern.invert.name":
                case "string.pattern.invert.base":
                    e.message = "Solo se permiten numeros enteros";
                    break;
            }
        });
        return errores;
    })
});

const generarKey = () => keygen._({ forceUppercase: true });

const registrarUsuario = async(datos) => {
    let tunel = new Tunel({
        id_acceso: datos.key,
        nombre: datos.nombre,
        correo: datos.email,
        clave: datos.clave
    });
    await tunel.save();
};

app.post('/usuario', async(req, res) => {
    let datos = req.body;
    let { error } = joiRegistro.validate({
        nombre: datos.nombre,
        email: datos.email,
        clave: datos.clave
    });
    if (!error) {
        var key = generarKey();
        Tunel.findOne({ id_acceso: key }, async(err, result) => {
            if (err) {
                res.status(400).send(`Error ${err}`);
            } else if (result) {
                res.status(405).send("Intentelo de nuevo");
            } else {
                datos.key = key;
                registrarUsuario(datos).then(
                    x => res.status(200).json({ key: key })
                ).catch(
                    x => res.status(401).json({ error: x })
                )
            }
        });
    } else {
        res.status(404).json({ error: error.details[0].message });
    }
});

const registrarDispositivo = async(datos, userid) => {
    let dis = new Dispositivo({
        id_acceso: datos.key,
        nombre: datos.nombre,
        cantidadMax: datos.cantidadMax
    });
    await dis.save((err, result) => {
        if (!err) {
            vincular(userid, result._id);
        } else {
            console.log("Error al vincular")
        }
    });
};

app.post('/:id/dispositivo', auth.validarKey, async(req, res) => {
    let datos = req.body;
    let { error } = joiDispositivo.validate({
        nombre: datos.nombre,
        cantidadMax: datos.cantidadMax
    });
    if (!error) {
        var key = generarKey();
        Dispositivo.findOne({ id_acceso: key }, async(err, result) => {
            if (err) {
                res.status(400).send(`Error ${err}`);
            } else if (result) {
                res.status(405).send("Intentelo de nuevo");
            } else {
                datos.key = key;
                registrarDispositivo(datos, req.usuario).then(
                    x => res.status(200).json({ key: key })
                ).catch(
                    x => res.status(401).json({ error: x })
                )
            }
        });
    } else {
        res.status(404).json({ error: error.details[0].message });
    }
});

const vincular = async(id, disp) => {
    let update = await Tunel.findByIdAndUpdate(id, {
        $addToSet: {
            dispositivos: {
                $each: [{
                    Dispositivo: disp
                }]
            }
        }
    }, { new: true });
    return update;
};

module.exports = app