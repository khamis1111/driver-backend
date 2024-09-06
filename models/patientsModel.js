const mongoose = require("mongoose");

const patientsSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true,
        trim: true,
        minLength: 5
    },
    slug: {
        type: String,
        lowercase: true
    },
    price: {
        type: Number,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    direction: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    isPaid: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const patientsModel = mongoose.model('patients', patientsSchema)

module.exports = patientsModel