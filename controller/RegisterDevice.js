const RegisterDevice = require("../model/RegisterDevice");
const { validationResult } = require('express-validator');

const registerDevice = async (req, res) => {
    try {
      const { DeviceId, IMEI_NO, Hospital_Name,Ward_No,Ventilator_Operator,Doctor_Name } = req.body;
      const DeviceIdTaken = await RegisterDevice.findOne({ DeviceId:DeviceId });
  
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
  
      if (DeviceIdTaken) {
        
        return res.status(409).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'DeviceId already taken',
              msg: 'DeviceId already taken',
              type: 'Duplicate Key Error',
            },
          },
        });
      }
  
      if (!DeviceId|| !IMEI_NO|| !Hospital_Name||!Ward_No||!Ventilator_Operator||!Doctor_Name) {
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
        DeviceId, 
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
          data: { DeviceId: savedDevice.DeviceId, Hospital_Name: savedDevice.Hospital_Name},
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

  const getRegisterDeviceById=async(req,res)=>{
    try {
      const { did } = req.params;
    const RegisterDeviceCollection=await RegisterDevice.findOne({deviceId:did});getRegisterDeviceById
    console.log('registerDeviceCollection',RegisterDeviceCollection)
    if(!RegisterDeviceCollection){
      return res.status(404).json({
        status:0,
        data:{
          err:{
            generatedTime: new Date(),
            errMsg: 'RegisterDevice not found',
            msg: 'RegisterDevice not found',
            type: 'Internal Server Error',
          },
        },
      })
    }
    const collectionName=require(`../model/${RegisterDeviceCollection.collection_name}.js`);
    console.log(collectionName,'collectionName')
    const particularDeviceById=await collectionName.aggregate([
      {
        $match:{
          deciceId:'did'

        },
        $lookup:{
          from:'devices',
          localField:'device',
          forgenField:'_id',
          as:'device'
        }
      }
    ]);
    return res.status(200).json({
      status: 1,
      data: {
        particularDeviceById:particularDeviceById,
        //modelNameParticularCount: modelNameParticularCount[0].count,
      },
      message: 'successfull',
    });
  }
  catch(err){
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
}

  module.exports={
    registerDevice, 
    getAllRegisteredDevice,
    getRegisterDeviceById
  }