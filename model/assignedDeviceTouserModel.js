const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const assignDeviceSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    DeviceId: {
        required: [true, "did is required"],
        type: String
    },
    Department_Name: {
        type: String,
        default: ""
    },
    IMEI_NO: {
        type: String,
        default: ""
    },
    Hospital_Name: {
        type: String,
        default: ""
    },
    Ward_No: {
        type: String,
        default: ""
    },
    Bio_Med: {
        type: String,
        default: ""
    },
    Doctor_Name: {
        type: String,
    },
    Status: {
        type: String,
        default: "INACTIVE"
    },

}, { timestamps: true })

const assignDeviceTouserModel = mongoose.model('assigned_devices_tousers', assignDeviceSchema);


module.exports = assignDeviceTouserModel