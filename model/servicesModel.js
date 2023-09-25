const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ServiceSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    deviceId: { 
        type: String,
        required: true 
    },
    message: { 
        type: String,
        default : "" 
    },
    date: { 
        type: String,
        required: true,
        default: "" 
    },
    serialNo: {
        required: true,
        type: String,
        default: ""
    },
},
    { timestamps: true })

const servicesModel = mongoose.model('services', ServiceSchema)
module.exports = servicesModel
