
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
        
        const ventilatorprre_collectionSchema = new mongoose.Schema(
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
                  ref: 'Device' },
                log:logs,
                
            },
            schemaOptions
        )

        ventilatorprre_collectionSchema.index({'type': 1})
                
        const ventilatorprre_collection = mongoose.model('ventilatorprre_collection', ventilatorprre_collectionSchema)
        
        module.exports = ventilatorprre_collection
        