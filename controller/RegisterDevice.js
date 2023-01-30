const RegisterDevice = require("../model/RegesterDevice");
const { validationResult } = require('express-validator');

const registerDevice = async (req, res) => {
    try {
      const { did, IMEI_NO, Hospital_Name,Ward_No,Ventilator_Operator,Doctor_Name } = req.body;
      const didTaken = await RegisterDevice.findOne({ did:did });
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: errors
                .array()
                .map((err) => {
                  return `${err.msg}: ${err.param}`;
                })
                .join(' | '),
              msg: 'Invalid data entered.',
              type: 'ValidationError',
            },
          },
        });
      }
  
      if (didTaken) {
        
        return res.status(409).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'did already taken',
              msg: 'did already taken',
              type: 'Duplicate Key Error',
            },
          },
        });
      }
  
      if (!did|| !IMEI_NO|| !Hospital_Name||!Ward_No||!Ventilator_Operator||!Doctor_Name) {
        return res.status(400).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'Please fill all the details.',
              msg: 'Please fill all the details.',
              type: 'Client Error',
            },
          },
        });
      }
  
      const device = await new RegisterDevice({
        did, 
        IMEI_NO,
         Hospital_Name,
         Ward_No,
         Ventilator_Operator,
         Doctor_Name
      });
  
      const savedDevice = await device.save(device);
  
      if (savedDevice) {
        
        res.status(201).json({
          status: 1,
          data: { did: savedDevice.did, Hospital_Name: savedDevice.Hospital_Name},
          message: 'Registered successfully!',
        });
      } else {
        res.status(500).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'Some error happened during registration',
              msg: 'Some error happened during registration',
              type: 'MongodbError',
            },
          },
        });I
      }
    } catch (err) {
      return res.status(500).json({
        status: -1,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: err.stack,
            msg: err.message,
            type: err.name,
          },
        },
      });
    }
  };
  const getAllRegisteredDevice = async (req, res) => {
    try {
      const allRegisteredDevice= await RegisterDevice .find().sort({'_id':-1});
      return res.status(200).json({
        status: 1,
        data: { data: allRegisteredDevice},
        message: 'Successful',
      });
    } catch (err) {
      return res.status(500).json({
        status: -1,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: err.stack,
            msg: err.message,
            type: err.name,
          },
        },
      });
    }
  };
  module.exports={
    registerDevice, 
    getAllRegisteredDevice
  }