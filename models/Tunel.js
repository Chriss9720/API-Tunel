const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tunel = new Schema({
    id_acceso: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    clave: { type: String, required: true },
    dispositivos: [{
        Dispositivo: {
            type: Schema.Types.ObjectId,
            ref: "Dispositivo"
        }
    }]
});

module.exports = mongoose.model('Tunel', tunel);