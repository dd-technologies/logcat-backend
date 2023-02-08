
    const mongoose = require('mongoose');
    const device = require('./device')
    const logs = require('./logs')
    
        const schemaOptions = {
            timestamps: true,
            toJSON: {
                virtuals: false
            },
            toObject: {
                virtuals: false
            }
        }
        
        const ventilatorprosgrtfg_collectionSchema = new mongoose.Schema(
            {
                version: {
                    type: String,
                    required: [true, 'Log version is required.']
                },
                type: {
                  type: String,
                  enum: ["001","002"],
                  required: [true, "Atleast one model required."]
                },
                device:{ type:String, 
                  ref: 'did' },
                log:logs,
                state:{
                  type:String,
                  required:[true,"state is required"]
                },
                
            },
         
            schemaOptions
        )

        ventilatorprosgrtfg_collectionSchema.index({'type': 1})
                
        const ventilatorprosgrtfg_collection = mongoose.model('ventilatorprosgrtfg_collection', ventilatorprosgrtfg_collectionSchema)
        
        module.exports = ventilatorprosgrtfg_collection
        