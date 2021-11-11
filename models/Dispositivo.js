const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dispositivo = new Schema({
    id_acceso: { type: String, required: true, unique: true },
    nombre: { type: String, required: false },
    cantidadMax: { type: Number, required: false, default: 10000 },
    cantidadActual: { type: Number, default: 0 },
    datos: [{
        dato: {
            type: Schema.Types.ObjectId,
            ref: "Dato"
        }
    }]
});

module.exports = mongoose.model('Dispositivo', dispositivo);