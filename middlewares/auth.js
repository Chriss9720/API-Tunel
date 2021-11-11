const Tunel = require('../models/Tunel')

const validarKey = (req, res, next) => {
    try {
        Tunel.findOne({ id_acceso: req.params.id }, async(err, result) => {
            if (err) {
                return res.status(401).send(err);
            } else if (result) {
                req.usuario = result;
                next();
            } else {
                return res.status(401).send("No se encontro la clave de acceso del usuario")
            }
        }).select({ _id: 1 }).populate('dispositivos.Dispositivo');
    } catch (e) {
        return res.status(401).send(e);
    }
};

const validarDispositivo = (req, res, next) => {
    let v = req.usuario.dispositivos.find(d => d.Dispositivo && d.Dispositivo.id_acceso == req.params.acces);
    if (v) {
        req.dispositivo = v.Dispositivo._id;
        if (v.Dispositivo.datos) {
            let size = v.Dispositivo.datos.length - 1;
            if (v.Dispositivo.datos[size] && v.Dispositivo.datos[size].dato) {
                req.dato = v.Dispositivo.datos[size].dato;
            }
        }
        next();
    } else
        res.status(401).send('El dispositivo no le pertecene a este usuario');
};

module.exports = {
    validarKey: validarKey,
    validarDispositivo: validarDispositivo
}