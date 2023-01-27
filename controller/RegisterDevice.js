const RegisterDevice = require("../model/RegesterDevice");
const { validationResult } = require('express-validator');

const registerDevice = async (req, res) => {
    try {
      const { DeviceId, IMEI_NO, Hospital_Name,Ward_No,Ventilatior_Operator,Doctor_Name } = req.body;
      const DeviceIDTaken = await RegisterDevice.findOne({ DeviceId:DeviceId });
  
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
  
      if (DeviceIDTaken) {
        // throw new AppError(`Email already taken`, 409);
        return res.status(409).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'Email already taken',
              msg: 'Email already taken',
              type: 'Duplicate Key Error',
            },
          },
        });
      }
  
      if (!DeviceId|| !IMEI_NO|| !Hospital_Name||!Ward_No||!Ventilatior_Operator||!Doctor_Name) {
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
  
    //   const salt = await bcrypt.genSalt();
    //   const passwordHash = await bcrypt.hash(password, salt);
  
      const device = await new RegisterDevice({
        DeviceId, 
        IMEI_NO,
         Hospital_Name,
         Ward_No,
         Ventilatior_Operator,
         Doctor_Name
        
      });
  
      const savedDevice = await device.save(user);
  
      if (savedDevice) {
        const url = `${req.protocol}://${req.get('host')}/welcome`;
  
        new Email(email, url).sendWelcome();
  
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
        });
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
  module.exports={
    registerDevice 
  }