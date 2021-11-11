const express = require('express');
const Tunel = require('../models/Tunel');
const Dispositivo = require('../models/Dispositivo');
const Dato = require('../models/Dato');
const Temperatura = require('../models/Temperatura');
const auth = require('../middlewares/auth');
const app = express.Router();

app.delete('/:id/', auth.validarKey, async(req, res) => {
    await req.usuario.dispositivos.forEach(async(id) => {
        await borrarDispositivo(id.Dispositivo._id, req.usuario._id);
    });
    res.send("Todos los dispositivos han sido removidos");
});

app.delete('/:id/:acces', auth.validarKey, auth.validarDispositivo, async(req, res) => {
    await borrarDispositivo(req.dispositivo, req.usuario._id);
    res.send(`El Dispositivo: ${req.dispositivo}. Fue borrado exitosamente`);
});

app.delete('/:id/temp/all', auth.validarKey, async(req, res) => {
    await req.usuario.dispositivos.forEach(async(d) => {
        await borrarTemperaturasDispositivo(d.Dispositivo._id);
    });
    res.send("Borrar todas las temperatura de todos los dispositivos");
});

app.delete('/:id/:acces/temp', auth.validarKey, auth.validarDispositivo, async(req, res) => {
    await borrarTemperaturasDispositivo(req.dispositivo);
    res.send("Todas sus temperaturas han sido borradas");
});

const borrarDispositivo = async(dipositivo_id, usuario_id) => {
    await borrarTemperaturasDispositivo(dipositivo_id);
    await limpiarDispositivo(usuario_id, dipositivo_id);
    await removerDispositivo(dipositivo_id);
};

const borrarTemperaturasDispositivo = async(dispositivo_id) => {
    let lista = await Dispositivo.findOne({ _id: dispositivo_id })
        .populate({
            path: 'datos.dato',
            model: 'Dato',
            populate: {
                path: 'temperaturas.temperatura',
                model: 'Temperatura'
            }
        });
    let idDatos = [];
    let idTemp = [];
    lista.datos.forEach(idD => {
        if (idD.dato && idD.dato._id) {
            idDatos.push(idD.dato._id);
        }
        if (idD.dato && idD.dato.temperaturas) {
            idD.dato.temperaturas.forEach(idT => {
                if (idT.temperatura && idT.temperatura._id) {
                    idTemp.push(idT.temperatura._id);
                }
            });
        }
    });
    await removerTemperaturas(idTemp);
    await removerDatos(lista);
    await limpiarDatos(lista);
};

const removerDispositivo = async(id) => {
    await Dispositivo.remove({ _id: id });
};

const removerTemperaturas = async(id) => {
    await id.forEach(async(x) => {
        await Temperatura.remove({ _id: x });
    });
};

const removerDatos = async(id) => {
    await id.datos.forEach(async(dato) => {
        if (dato.dato && dato.dato._id)
            await Dato.remove({ _id: dato.dato._id });
    });
};

const limpiarDatos = async(id) => {
    id.datos.forEach(async(datos) => {
        if (datos._id) {
            await Dispositivo.findByIdAndUpdate(id._id, {
                $pop: {
                    "datos": 1
                }
            }, { new: true });
        }
    });
};

const limpiarDispositivo = async(id, dispositivo) => {
    if (dispositivo) {
        await Tunel.findByIdAndUpdate(id, {
            $pull: {
                "dispositivos": {
                    "Dispositivo": dispositivo
                }
            }
        }, { new: true });
    }
};

module.exports = app