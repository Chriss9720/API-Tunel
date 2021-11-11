const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dato = new Schema({
    fecha: { type: Date, required: false },
    generacion: { type: String, required: false },
    temperaturas: [{
        temperatura: {
            type: Schema.Types.ObjectId,
            ref: "Temperatura"
        }
    }]
});

module.exports = mongoose.model('Dato', dato);