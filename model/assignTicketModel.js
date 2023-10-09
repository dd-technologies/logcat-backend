const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ticketSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    deviceId:{
        type: String,
        default:""
    },
    ticket_number: { 
        type: String,
        required: true,
        unique: true,
    },
    ticket_owner: { 
        type: String,
        default:""
    },
    status: {
        type: String,
        enum: ["Pending", "Not-Done", "Completed"],
        default: "Pending",
    },
    priority: {
        type: String,
        enum: ["Critical", "Medium"],
        default: "",
    },
    hospital_name: { 
        type: String,
        default:""
    },
    concerned_p_contact: { 
        type: String,
        default:""
    },
    service_engineer: {
        type: String,
        default:""
    },
    issues: {
        type: String,
        default:""
    },
    details: {
        type: String,
        default:""
    },
    address: {
        type: String,
        default: ""
    }
},
    { timestamps: true })

const assignTicketModel = mongoose.model('assign_ticket', ticketSchema)
module.exports = assignTicketModel;
