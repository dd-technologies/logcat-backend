
    const mongoose = require('mongoose');
    
        const schemaOptions = {
            timestamps: true,
            toJSON: {
                virtuals: false
            },
            toObject: {
                virtuals: false
            }
        }
        
        const event_ventilatorprosgrtfg_collectionSchema = new mongoose.Schema(
            {
              did:  {
                type: String,
                required: [true, "Device id is required."],
                // validate: {
                //     validator: function (v) {
                //     return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4})$/.test(
                //         v
                //     );
                //     },
                //     message: "{VALUE} is not a valid device id.",
                // },
            },
                type: {
                  type: String,
                  enum: ["001","002"],
                  required: [true, "Atleast one model required."]
                },
                // ack:{
                //     msg: String,
                //     code: {
                //       type: String,
                //       required: [true, 'Code is required']
                //     },
                //     date: {
                //       type: Date,
                //       required: [true, 'Date time is required']
                //     }
                //   }
                message:{
                  type:String,
                  required:[true,"message is required"]
                }
            },
            schemaOptions
        )

        event_ventilatorprosgrtfg_collectionSchema.index({'type': 1})
                
        const event_ventilatorprosgrtfg_collection = mongoose.model('event_ventilatorprosgrtfg_collection', event_ventilatorprosgrtfg_collectionSchema)
        
        module.exports = event_ventilatorprosgrtfg_collection
        