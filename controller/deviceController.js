// deviceController.js
const Device = require('../model/RegisterDevice');
const servicesModel = require('../model/servicesModel');
const Log = require('../model/logs');
const Joi = require('joi');
const statusModel = require('../model/statusModel');
const deviceOverviewModel = require('../model/deviceOverviewModel');
const { address } = require('..');
const aboutDeviceModel = require('../model/aboutDeviceModel');
// const deviceController = {};

/**
 * api      POST @/devices/register
 * desc     @register for logger access only
 */

const createDevice = async (req, res) => {
  const newDevice = new Device(req.body);
  try {
    const savedDevice = await newDevice.save();
    res.status(201).json(savedDevice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllDevices = async (req, res) => {
  try {

    const devices = await Device.find().sort({ createdAt: 'desc' });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const registerNewDevice = async (req, res) => {
//   try {
//     const schema = Joi.object({
//       deviceId: Joi.string().required(),
//       departmentName: Joi.string().required(),
//       hospitalName: Joi.string().required(),
//       wardNo: Joi.string().required().optional(),
//       doctorName: Joi.string().required(),
//       IMEI_NO: Joi.string().allow("").optional(),
//       bioMed: Joi.string().allow("").optional(),
//     })
//     let result = schema.validate(req.body);
//     if (result.error) {
//       return res.status(400).json({
//         statusCode: 400,
//         statusValue: "Validation Error",
//         message: result.error.details[0].message,
//       })
//     }
//     const newDevice = new Device(req.body);
//     const savedDevice = await newDevice.save();
//     if (savedDevice) {
//       return res.status(201).json({
//         statusCode: 201,
//         statusValue: "SUCCESS",
//         message: "Data added successfully."
//       })
//     }
//     return res.status(400).json({
//       statusCode: 400,
//       statusValue: "FAIL",
//       message: "Error! Data not added."
//     })
//   } catch (err) {
//     res.status(500).json({
//       statusCode: 500,
//       statusValue: "FAIL",
//       message: "Internal server error",
//       data: {
//         name: "deviceController/registerNewDevice",
//         err: err
//       }
//     })
//   }
// }

/**
 * api      GET @/devices
 * desc     @getAllDevices for logger access only
 */
const getAllDevices1 = async (req, res) => {
  try {
    // Search keyword
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }

    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 99999999;
    }
    const skip = page > 0 ? (page - 1) * limit : 0;

    const devices = await Device.find({
      $or:[
        { deviceId: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    })
    .sort({ createdAt: 'desc' })
    .skip(skip)
    .limit(limit);

    const count = await Device.find({
      $or:[
        { deviceId: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    })
    .sort({ createdAt: 'desc' }).countDocuments();
    // console.log(11, count);
    if (devices.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "The device lists has been retrieved successfully.",
        data: devices,
        // totalDataCount: count,
        // totalPages:Math.ceil(count/limit),
        // currentPage: page
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data not found.",
      data: devices,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        name: "deviceController/getAllDevices",
        
      }
    })
  }
};

/**
 * api      POST @/api/logger/logs/services/:project_code
 * desc     @addDeviceServices for logger access only
 */
const addDeviceService = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      message: Joi.string().required(),
      date: Joi.string().required(),
      serialNo: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      })
    }
    const project_code = req.query.project_code
    const newServices = new servicesModel(req.body);
    const savedServices = await newServices.save();
    if (savedServices) {
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully."
      })
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! Data not added.",
      data: console.log(savedServices)
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        name: "deviceController/addDeviceService",
        err: err
      }
    })
  }
}

/**
 * api   GET@/api/logger/logs/services/:deviceId/:project_code
 * desc  @getServicesById for logger access only
 */
const getServicesById = async (req, res) => {
  try {
    const { deviceId, project_code } = req.params;
    // const project_code = req.query.project_code;
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }
    const data = await servicesModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 });
    if (!data.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Services get successfully!",
      data: data
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        name: "deviceController/getServicesById",
        err: err
      }
    })
  }
}

/**
 * api POST@/api/logger/logs/status/:project_code
 * desc @saveStatus for logger access only
 */
const saveStatus = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      message: Joi.string().required(),
      health: Joi.string().required(),
      last_hours: Joi.string().required(),
      total_hours: Joi.string().required(),
      address: Joi.string().required()
    })
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      })
    }
    const project_code = req.query.project_code
    const newStatus = new statusModel(req.body);
    const savedStatus = await newStatus.save();
    if (savedStatus) {
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully."
      })
    }
    return res.status(404).json({
      statusCode: 404,
      statusValue: "FAIL",
      message: "Error! Data not added.",
      data: console.log(savedStatus)
    })
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data:{
        name: "deviceController/saveStatus",
        error:error
      }
    })
  }
}


const getDeviceOverviewById = async (req, res) => {
  try {
    const { deviceId, project_code } = req.params;
    // const project_code = req.query.project_code;
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }
    const findData = await statusModel.findOne({deviceId:deviceId});
    if (findData) {
      const saveDoc = new deviceOverviewModel({
        deviceId:findData.deviceId,
        runningStatus:findData.message,
        address:"A-1 Sector 81, Noida 201301 (UP)",
        hours:"01:54:14",
        totalHours:"06:52:14",
        health:"Good"
      })
      await saveDoc.save();
    }
    const data = await deviceOverviewModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 });
    if (!data.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device overview get successfully!",
      data: data
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        name: "deviceController/getServicesById",
        err: err
      }
    })
  }
}

const addAboutDevice = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      product: Joi.string().required(),
      model: Joi.string().required(),
      delivery_date: Joi.string().required(),
      date_of_manufacture: Joi.string().required(),
      batch_no: Joi.string().required(),
      date_of_warranty: Joi.string().required(),
      last_service: Joi.string().required(),
    })
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      })
    }
    const project_code = req.query.project_code
    const newStatus = new aboutDeviceModel(req.body);
    const savedStatus = await newStatus.save();
    if (savedStatus) {
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully."
      })
    }
    return res.status(404).json({
      statusCode: 404,
      statusValue: "FAIL",
      message: "Error! Data not added.",
      data: console.log(savedStatus)
    })
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data:{
        name: "deviceController/addAboutDevice",
        error:error
      }
    })
  }
}


const getAboutByDeviceId = async (req, res) => {
  try {
    const { deviceId, project_code } = req.params;
    // const project_code = req.query.project_code;
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }
    const data = await aboutDeviceModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 }).sort({createdAt:-1}).limit(1);
    if (!data.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "About device get successfully!",
      data: data
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        name: "deviceController/getAboutByDeviceId",
        err: err
      }
    })
  }
}


// deviceController.getDeviceById = async (req, res) => {
//   const { deviceId } = req.params;
//   try {
//     const device = await Device.findOne({ DeviceId: deviceId });
//     if (!device) {
//       res.status(404).json({ message: 'Device not found' });
//     } else {
//       res.status(200).json(device);
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// deviceController.createLogs = async(req,res) =>{
//   const newLog = new Log(req.body);
//   try{
//     const savedLog = await newLog.save();
//     res.status(201).json(savedLog);
//   }catch(error){
//     res.status(400).json({message:error.message});
//   }
// }







// deviceController.updateDevice = async (req, res) => {
//   const { deviceId } = req.params;
//   try {
//     const updatedDevice = await Device.findOneAndUpdate(
//       { DeviceId: deviceId },
//       req.body,
//       { new: true }
//     );
//     if (!updatedDevice) {
//       res.status(404).json({ message: 'Device not found' });
//     } else {
//       res.status(200).json(updatedDevice);
//     }
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// deviceController.deleteDevice = async (req, res) => {
//   const { deviceId } = req.params;
//   try {
//     const deletedDevice = await Device.findOneAndDelete({ DeviceId: deviceId });
//     if (!deletedDevice) {
//       res.status(404).json({ message: 'Device not found' });
//     } else {
//       res.status(200).json(deletedDevice);
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

module.exports = {
  createDevice,
  getAllDevices,
  addDeviceService,
  getServicesById,
  saveStatus,
  getDeviceOverviewById,
  addAboutDevice,
  getAboutByDeviceId
}
