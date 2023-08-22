const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const patientSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    DeviceId: { 
        type: String,
        default: ""
    },
    patient_name: { 
        type: String,
        required:true,
        default:""
    },
    drug_info: { 
        type: String,
        required:true,
        default:""
    },
    notification: { 
        type: String,
        required:true,
        default:""
    },
    ward_inspection_record: { 
        type: String,
        required:true,
        default:""
    },
    patient_logs: { 
        type: String,
        required:true,
        default:""
    },
    bed_no: { 
        type: String,
        required:true,
        default:""
    },
    ward_no: { 
        type: String,
        required:true,
        default:""
    },
    vti: { 
        type: String,
        required:true,
        default:""
    },
    spo2: { 
        type: String,
        required:true,
        default:""
    },
    pr: { 
        type: String,
        required:true,
        default:""
    },
    rr: { 
        type: String,
        required:true,
        default:""
    },
    mvi: { 
        type: String,
        required:true,
        default:""
    },
    peep: { 
        type: String,
        required:true,
        default:""
    },
    pip: { 
        type: String,
        required:true,
        default:""
    },
},
    { timestamps: true })

const patientModel = mongoose.model('patient_ventilator_collection', patientSchema)
module.exports = patientModel
