const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const RegisterDeviceSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    dId: {
        type: Schema.Types.ObjectId,
        ref: "Device"
    },
    DeviceId: {
        required: [true, "did is required"],
        type: String
    },
    Department_Name: {
        required: [true, 'Department name is required'],
        type: String
    },
    IMEI_NO: {
        type: String,
        default:""
    },
    Hospital_Name: {
        required: [true, "Hospital Name is required"],
        type: String
    },
    Ward_No: {
        required: [true, "Ward Number is required"],
        type: String
    },
    Bio_Med: {
        required: [true, "Bio-Med is required"],
        type: String
    },
    // Ventilator_Operator: {
    //     required: [true, "Ventilator Operator name is required"],
    //     type: String
    // },
    Doctor_Name: {
        required: [true, "Doctor Name is required"],
        type: String
    },
    Status: {
        type: String,
        default:"INACTIVE"
    },
},
    { timestamps: true })

const RegisterDevice = mongoose.model('RegisterDevice', RegisterDeviceSchema)
module.exports = RegisterDevice




















































































































// const mongoose = require('mongoose')
// const Schema = mongoose.Schema;

// const RegisterDeviceSchema = mongoose.Schema({
//     userId: {
//         type: Schema.Types.ObjectId,
//         ref: "User" 
//     },
//     deviceId: { 
//         type: String,
//         required: true 
//     },
//     status: { 
//         type: String,
//         default : "" 
//     },
//     departmentName: { 
//         type: String,
//         required: true,
//         default: "" 
//     },
//     hospitalName: {
//         required: true,
//         type: String,
//         default: ""
//     },
//     wardNo: {
//         required: true,
//         type: String
//     },
//     doctorName: {
//         required: true,
//         type: String,
//         default: ""
//     },
//     bioMed: {
//         type: String,
//         required: true,
//         default:""
//     },
//     IMEI_NO: {
//         type: String,
//         required: true,
//         default: ""
//     },  
//     // ventilatorOperator: {
//     //     type: String,
//     //     required: true,
//     //     default: ""
//     // },
// },
//     { timestamps: true })

// const RegisterDevice = mongoose.model('registered_devices', RegisterDeviceSchema)
// module.exports = RegisterDevice
