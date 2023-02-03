
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
        
        const ventilatorpr_collectionSchema = new mongoose.Schema(
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
                device:device,
                 },

                
                
            
            schemaOptions
        )

        ventilatorpr_collectionSchema.index({'type': 1})
                
        const ventilatorpr_collection = mongoose.model('ventilatorpr_collection', ventilatorpr_collectionSchema)
        
        module.exports = ventilatorpr_collection
        