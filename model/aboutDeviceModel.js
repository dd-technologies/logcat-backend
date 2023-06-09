const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const aboutSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    dId: {
        type: Schema.Types.ObjectId,
        ref: "RegisterDevice"
    },
    deviceId: { 
        type: String,
        required: true 
    },
    product: { 
        type: String,
        required:true,
        default:""
    },
    model: { 
        type: String,
        required:true,
        default:""
    },
    delivery_date: { 
        type: String,
        required:true,
        default:""
    },
    date_of_manufacture: { 
        type: String,
        required:true,
        default:""
    },
    batch_no: { 
        type: String,
        required:true,
        default:""
    },
    date_of_warranty: { 
        type: String,
        required:true,
        default:""
    },
    last_service: { 
        type: String,
        required:true,
        default:""
    },
},
    { timestamps: true })

const aboutDeviceModel = mongoose.model('about_device', aboutSchema)
module.exports = aboutDeviceModel
