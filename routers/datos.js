const express = require('express');
const Joi = require('@hapi/joi');
const Dispositivo = require('../models/Dispositivo');
const Dato = require('../models/Dato');
const Temperatura = require('../models/Temperatura');
const auth = require('../middlewares/auth');
const moment = require('moment');
const app = express.Router();

const joiTemp = Joi.object({
    temperatura: Joi.string().pattern(/^\d+\.*\d+$/).required().error(errores => {
        errores.forEach(e => {
            switch (e.code) {
                case "any.required":
                    e.message = "Se requiere el campo temperatura";
                    break;
                case 'string.empty':
                    e.message = "Ingrese la cantidad temperatura";
                    break;
                case 'string.pattern.name':
                case "string.pattern.base":
                case "string.pattern.invert.name":
                case "string.pattern.invert.base":
                    e.message = "Solo se permiten numeros";
                    break;
            }
        });
        return errores;
    })
});

const vincularTemperaturaDato = async(idT, idD) => {
    let update = await Dato.findByIdAndUpdate(idD, {
        $addToSet: {
            temperaturas: {
                $each: [{
                    temperatura: idT
                }]
            }
        }
    }, { new: true });
    return update;
};

const guardarTemperatura = async(datos, datoid, res) => {
    if (!datos.matricula)
        datos.matricula = "N/A";
    let t = new Temperatura({
        temp: datos.temperatura,
        matricula: datos.matricula
    });
    await t.save((err, result) => {
        if (!err) {
            vincularTemperaturaDato(result._id, datoid).then(
                x => res.send("Registro Exitoso")
            ).catch(
                x => res.send(402).send(`Fallo al guardar la temperatura ${x}`)
            )
        }
    });
}

const vincularDatoDispositivo = async(id, dispositivo) => {
    let update = await Dispositivo.findByIdAndUpdate(dispositivo, {
        $addToSet: {
            datos: {
                $each: [{
                    dato: id
                }]
            }
        }
    }, { new: true });
    return update;
};

const registrarDatos = async(datos, dispositivo, res, dato_id) => {
    let d = new Dato({
        generacion: "12",
        fecha: moment().format('L')
    });
    await Dato.findOne({ fecha: d.fecha, _id: dato_id }, (err, result) => {
        if (result) {
            guardarTemperatura(datos, result._id, res)
        } else if (!err) {
            d.save((err, result) => {
                if (!err) {
                    vincularDatoDispositivo(result._id, dispositivo).then(
                        x => guardarTemperatura(datos, result._id, res)
                    ).catch(
                        x => res.status(402).send(`Fallo al registrar los datos: ${x}`)
                    )
                }
            });
        }
    });
};

app.post('/:id/:acces/temp', auth.validarKey, auth.validarDispositivo, async(req, res) => {
    let { error } = joiTemp.validate({
        temperatura: req.body.temperatura
    });
    if (!error) {
        registrarDatos(req.body, req.dispositivo, res, req.dato).then(
            x => {}
        ).catch(
            x => res.status(402).send(x)
        )
    } else {
        res.status(404).json({ error: error.details[0].message });
    }
});

module.exports = app