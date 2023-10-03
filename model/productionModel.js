const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productionSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    dId: { type: Schema.Types.ObjectId, ref: "Device" },
    deviceId: { type: String, required: true, default: "" },
    purpose: { type: String, required: true, default: "" },
    simNumber: { type: String, required: true, default: "" },
    productType: { type: String, required: true, default: "" },
    batchNumber: { type: String, required: true, default: "" },
    iopr: { type: String, required: true, default: "" },
    manufacturingDate: {type: String, required: true, default: ""},
    dispatchDate: {type: String, required: true, default: ""},
},
    { timestamps: true }
);

const productionModel = mongoose.model('production', productionSchema);

module.exports = productionModel;

