const express = require('express');
const Tunel = require('../models/Tunel');
const Dispositivo = require('../models/Dispositivo');
const auth = require('../middlewares/auth');
const app = express.Router();

const getTemp = (data) => {
    let result = {};
    result.fecha = data.fecha;
    result.generacion = data.generacion;
    result.temperaturas = [];
    data.temperaturas.forEach(t => {
        result.temperaturas.push(t.temperatura);
    });
    return result;
}

app.get('/:id/leer', auth.validarKey, async(req, res) => {
    let result = [];
    let lista = await Tunel.findById(req.usuario._id)
        .populate({
            path: 'dispositivos.Dispositivo',
            model: 'Dispositivo',
            populate: {
                path: 'datos.dato',
                model: 'Dato',
                populate: {
                    path: 'temperaturas.temperatura',
                    model: 'Temperatura',
                    select: { _id: 0, __v: 0 }
                },
                select: { _id: 0, __v: 0 }
            },
            select: { _id: 0, __v: 0 }
        }).select('-_id -clave -correo -nombre -__v');
    lista.dispositivos.forEach(t => {
        let dato = {
            dispositivo: t.Dispositivo.id_acceso,
            cantidadMax: t.Dispositivo.cantidadMax,
            cantidadActual: t.Dispositivo.cantidadActual,
            datos: []
        };
        t.Dispositivo.datos.forEach(te => {
            dato.datos.push(getTemp(te.dato));
        });
        result.push(dato);
    });
    res.json(result);
});

app.get('/:id/:acces/leer', auth.validarKey, auth.validarDispositivo, async(req, res) => {
    let lista = await Dispositivo.findById({ _id: req.dispositivo })
        .populate({
            path: 'datos.dato',
            model: 'Dato',
            populate: {
                path: 'temperaturas.temperatura',
                model: 'Temperatura',
                select: { _id: 0, __v: 0 }
            },
            select: { _id: 0, __v: 0 }
        });
    let dato = {
        dispositivo: lista.id_acceso,
        cantidadMax: lista.cantidadMax,
        cantidadActual: lista.cantidadActual,
        datos: []
    };
    lista.datos.forEach(te => {
        dato.datos.push(getTemp(te.dato));
    });
    res.json(dato);
});

module.exports = app