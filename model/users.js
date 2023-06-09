const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    firstName:{
        required:[true, "First name is required"],
        type: String
    },
    lastName:{
        required:[true, "Last name is required"],
        type: String
    },
    email:{
        type:String,
        unique: true,
        required:[true,'Email address is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    hospitalName:{
        required:[true, "Hospital name is required"],
        type: String
    },
    passwordHash:{
        required: true,
        type:String
    },
    image:{
        type:String,
        default:null
    },
    userType:{
        type: String,
        required:true,
        enum:["User", "Admin", "Owner"],
        default:"User",
    },
    isSuperAdmin:{
        type:Boolean,
        default: false
    },
    accountStatus:{
        type: String,
        enum: ["Active", "Inactive", "Initial"],
        required:true,
        default:""
    },
}, {timestamps: true})

const User = mongoose.model('User',userSchema)


module.exports = User
