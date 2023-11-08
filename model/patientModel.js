const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const patientSchema = mongoose.Schema({
    UHID: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
    height: {
        type: String,
        required: true,
    },
    patientName : {
        type: String,
        required: true,
        default:""
    },
    dosageProvided: {
        type: String,
        default: "",
    },
    medicalDiagnosis: [
        {
           name: { type: String, default: "" },
           date: { type: String, default: "" },

        }
    ],
},
    { timestamps: true })

const patientModel = mongoose.model('patient_ventilator_collection', patientSchema)
module.exports = patientModel
