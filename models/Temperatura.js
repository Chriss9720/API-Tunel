const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const temperatura = new Schema({
    temp: { type: Number, required: false },
    matricula: { type: String, required: false, default: "XXXXXXX" }
});

module.exports = mongoose.model('Temperatura', temperatura);