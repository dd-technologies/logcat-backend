// deviceController.js
const Device = require('../model/RegisterDevice');
const servicesModel = require('../model/servicesModel');
const Log = require('../model/logs');
const Joi = require('joi');
const statusModel = require('../model/statusModel');
const deviceOverviewModel = require('../model/deviceOverviewModel');
const { address } = require('..');
const aboutDeviceModel = require('../model/aboutDeviceModel');
const RegisterDevice = require('../model/RegisterDevice');
const assignDeviceTouserModel = require('../model/assignedDeviceTouserModel');
// const deviceController = {};
const mongoose = require('mongoose');
const User = require('../model/users');
// const { registerDevice } = require('./RegisterDevice');


/**
 * api      POST @/devices/register
 * desc     @register for logger access only
 */
const createDevice = async (req, res) => {
  try {
    const schema = Joi.object({
      DeviceId: Joi.string().required(),
      Department_Name: Joi.string().required(),
      Hospital_Name: Joi.string().required(),
      Ward_No: Joi.string().required(),
      Doctor_Name: Joi.string().required(),
      IMEI_NO: Joi.string().required(),
      Bio_Med: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    
    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      })
    }

    // for logger user activity
    // const token = req.headers["authorization"].split(' ')[1];
    // const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // const loggedInUser = await User.findById({_id:verified.user});
    // const normalUser = await User.findById({_id:req.body._id});

    const deviceData = await Device.findOneAndUpdate(
      { DeviceId: req.body.DeviceId },
      req.body,
      { upsert: true, new: true }
    );
    // const newDevice = new Device(req.body);
    // const savedDevice = await newDevice.save();
    return res.status(200).json({
      "statusCode": 200,
      "statusValue": "SUCCESS",
      data: deviceData
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};

/**
 * api      UPDATE @/devices/update/DeviceId
 * desc     @update devices for logger access only
 */
const updateDevice = async (req, res) => {
  try {
    const schema = Joi.object({
      Department_Name: Joi.string().required(),
      Hospital_Name: Joi.string().required(),
      Ward_No: Joi.string().required(),
      Doctor_Name: Joi.string().required(),
      IMEI_NO: Joi.string().required(),
      Bio_Med: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      })
    }
    const deviceData = await Device.findOneAndUpdate(
      { DeviceId: req.params.DeviceId },
      req.body,
      { upsert: true, new: true},
    );
    // const newDevice = new Device(req.body);
    // const savedDevice = await newDevice.save();
    return res.status(200).json({
      "statusCode": 200,
      "statusValue": "SUCCESS",
      data: deviceData
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};


/**
 * api      UPDATE @/devices/update/DeviceId
 * desc     @update devices for logger access only
 */
const deleteSingleDevice = async (req, res) => {
  try {
    const DeviceId = req.params.DeviceId;

    const checkDevice = await Device.findOne({DeviceId:DeviceId});
    if (!checkDevice || checkDevice == "") {
      return res.status(400).json({
        "statusCode": 400,
        "statusValue": "FAIL",
        "message":"data not found."
      });
    }
    const deleteDevice = await Device.findOneAndDelete({DeviceId:DeviceId});
    // await statusModel.findByIdAndDelete({deviceId:DeviceId})
    if (!!deleteDevice) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Device deleted successfully.",
      });
    }
    return res.status(400).json({
      "statusCode": 400,
      "statusValue": "FAIL",
      "message":"data not deleted."
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};


/**
 * api      GET @/devices/getdevice/DeviceId
 * desc     @get single device by id for logger access only
 */
const getDeviceById = async (req, res) => {
  try {
    const { DeviceId } = req.params;
    if (!DeviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }

    let data = await Device.findOne({ DeviceId: DeviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 });
    const data2 = await statusModel.findOne({deviceId:DeviceId},{ "createdAt": 0, "updatedAt": 0, "__v": 0 });
    data = {
      '_id':data._id,
      'DeviceId':data.DeviceId,
      'Bio_Med':data.Bio_Med,
      'Department_Name':data.Department_Name,
      'Doctor_Name':data.Doctor_Name,
      'Hospital_Name':data.Hospital_Name,
      'IMEI_NO':data.IMEI_NO,
      'message':data2.message,
      'Ward_No':data.Ward_No,
      'isAssigned':data.isAssigned, 
      'address':data2.address, 
      'health':data2.health,
      'last_hours':data2.last_hours,
      'total_hours':data2.total_hours,
    };
    if (!data) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId.",
        data: {},
      })
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device get successfully!",
      data: data
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * api      GET @/devices
 * desc     @getAllDevices for logger access only
 */
const getAllDevices = async (req, res) => {
  try {
    // Search
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
      limit = 20000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0;

    const devices = await Device.find({
      $or: [
        { Hospital_Name: { $regex: ".*" + search + ".*", $options: "i" } },
        { DeviceId: {  $regex: search  } }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count
    const count = await Device.find({
      $or: [
        { Hospital_Name: { $regex: ".*" + search + ".*", $options: "i" } },
        { DeviceId: {  $regex: search } }
      ]
    })
      .sort({ createdAt: -1 }).countDocuments();
    
    if (devices.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "The device lists has been retrieved successfully.",
        data: devices,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data not found.",
      data: devices,
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
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
        generatedTime: new Date(),
        errMsg: err.stack,
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
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 999999;
    }
    const skip = page > 0 ? (page - 1) * limit : 0;

    // const project_code = req.query.project_code;
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }
    const data = await servicesModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 })
    .skip(skip)
    .limit(limit);

    // count data
    const count = await servicesModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 })
    .countDocuments();

    if (data.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Services get successfully!",
        data: data,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    }
    return res.status(404).json({
      statusCode: 404,
      statusValue: "FAIL",
      message: "Data not found."
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
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
    });
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      });
    }
    const project_code = req.query.project_code

    // const newStatus = new statusModel(req.body);
    const saveDoc = await statusModel.updateMany(
      {
        deviceId:req.body.deviceId
      },
      {
        deviceId:req.body.deviceId,
        message:req.body.message,
        health:req.body.health,
        last_hours:req.body.last_hours,
        total_hours:req.body.total_hours,
        address:req.body.address
      },
      {
        upsert:true,
      }
    );
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data added successfully."
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * api      GET @/api/logger/logs/deviceOverview/:deviceId/:project_code
 * desc     @getDeviceOverviewById for logger access only
 */
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
    const findData = await statusModel.findOne({ deviceId: deviceId });
    if (findData) {
      const saveDoc = new deviceOverviewModel({
        deviceId: findData.deviceId,
        runningStatus: findData.message,
        address: "A-1 Sector 81, Noida 201301 (UP)",
        hours: "01:54:14",
        totalHours: "06:52:14",
        health: "Good"
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
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

const addAboutDevice = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      product_type: Joi.string().required(),
      serial_no: Joi.string().required(),
      purpose: Joi.string().required(),
      concerned_person: Joi.string().required(),
      batch_no: Joi.string().required(),
      date_of_manufacturing: Joi.string().required(),
      address: Joi.string().required(),
      date_of_dispatch: Joi.string().required(),
      hospital_name: Joi.string().required(),
      phone_number: Joi.string().required(),
      sim_no: Joi.string().required(),
      pincode: Joi.string().required(),
      distributor_name: Joi.string().allow(''),
      distributor_contact: Joi.string().allow(''),
    });
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      });
    }
    const project_code = req.query.project_code;
    const saveDispatchData = await aboutDeviceModel.findOneAndUpdate(
      { deviceId: req.body.deviceId },
      req.body,
      { upsert: true }
    );
    return res.status(201).json({
      statusCode: 201,
      statusValue: "SUCCESS",
      message: "Data added successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};


const getDispatchData = async (req, res) => {
  try {
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 99999;
    }

    const {project_code } = req.params;
    const dispatchData = await aboutDeviceModel.find({ "product_type":{$ne:null} }, 
      { "deviceId":1,
      "batch_no":1,
      "product_type":1,
      "serial_no":1,
      "purpose":1,
      "concerned_person":1,
      "date_of_manufacturing":1,
      "address":1,
      "date_of_dispatch":1,
      "hospital_name":1,
      "phone_number":1,
      "sim_no":1,
      "pincode":1,
      "distributor_name":1,
      "distributor_contact":1,
    }).sort({updatedAt:-1});
    const paginateArray =  (dispatchData, page, limit) => {
      const skip = dispatchData.slice((page - 1) * limit, page * limit);
      return skip;
    };

    let allData = paginateArray(dispatchData, page, limit)
    if (!dispatchData.length) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Product dispatch details get successfully!",
      data: allData,
      totalDataCount: dispatchData.length,
      totalPages: Math.ceil( (dispatchData.length)/ limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const getDispatchDataById = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const data = await aboutDeviceModel.find({ "deviceId":req.params.deviceId }, 
      { "deviceId":1,
      "batch_no":1,
      "product_type":1,
      "serial_no":1,
      "purpose":1,
      "concerned_person":1,
      "date_of_manufacturing":1,
      "address":1,
      "date_of_dispatch":1,
      "hospital_name":1,
      "phone_number":1,
      "sim_no":1,
      "pincode":1,
      "distributor_name":1,
      "distributor_contact":1,
    }).sort({updatedAt:-1}).limit(1);
    const servicesData = await servicesModel.find({ "deviceId":req.params.deviceId },
    {
      "createdAt":0, "updatedAt":0, "__v":0,
    }).sort({updatedAt:-1});
    if (!data.length) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Product dispatch details get successfully!",
      data: data[0],
      servicesData: servicesData,
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

let redisClient = require("../config/redisInit");
const activityModel = require('../model/activityModel');

const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);

const getAboutByDeviceId = async (req, res) => {
  try {
    const { deviceId, project_code } = req.params;
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }
    const data = await aboutDeviceModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 }).sort({ createdAt: -1 }).limit(1);
    if (!data.length) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Product dispatch details get successfully!",
      data: data
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

const sendAndReceiveData = async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "DeviceId is required."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully.",
      data: deviceId
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const assignedDeviceToUser = async (req, res) => {
  try {

    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    
    // console.log('resp2',verified.user)

    const findDevice = await RegisterDevice.find({ DeviceId: { $in: req.body.DeviceId }})
    .select({__v:0,_id:0,createdAt:0,updatedAt:0});
    if (findDevice.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: `Device not registered with this deviceId : ${req.body.DeviceId}`
      });
    }
    const checkIsAssigned = await RegisterDevice.find({DeviceId: { $in: req.body.DeviceId }, isAssigned:true});
    if (checkIsAssigned.length>0) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Device already assigned.",
      })
    }
    const updateDoc = await assignDeviceTouserModel.findOneAndUpdate({
      userId: mongoose.Types.ObjectId(req.body._id),
    }, {
      $push: {
        Assigned_Devices:findDevice
      }
    }, { upsert: true, new: true });

    let deviceIds = req.body.DeviceId
    deviceIds.map(async (items) => {
      await RegisterDevice.findOneAndUpdate({DeviceId:items},{isAssigned:true});
    })
    // for logger user activity
    const loggedInUser = await User.findById({_id:verified.user});
    const normalUser = await User.findById({_id:req.body._id});
    // console.log(userInfo);
    await saveActivity(verified.user,'Device assigned successfully!',`${loggedInUser.email} has assigned new device to ${normalUser.email}`);

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device assigned successfully.",
      data: updateDoc
    });
    
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


async function saveActivity(userId,action,msg) {
  const userInfo = await User.findOne({_id:userId});
  const data = await activityModel.create({userId:userId,email:userInfo.email,action:action,msg:msg});
  data.save();
}

const getAssignedDeviceById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "User Id is required!"
      })
    }
    let data = await assignDeviceTouserModel.find({userId:mongoose.Types.ObjectId(userId)})
    .select({_id:0, __v:0, createdAt:0, updatedAt:0})
    .sort({ createdAt: -1 });
    // var tempArr = data[0].Assigned_Devices;
    // tempArr.map(async (item) => {
        
    // })
    // console.log(123,)
    // data[0].Assigned_Devices.map(async (item) => {
    //   var eventsData = await statusModel.findOne({deviceId:item.DeviceId})
    //   return tempArr.push(eventsData)
    // })
   
    if (!data.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found.",
        data:{}
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "assigned device get successfully!",
      data: data[0]
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const deleteAssignedDeviceFromUser = async (req, res) => {
  try {
    // for logger activity
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);

    const removeData = await assignDeviceTouserModel.updateOne(
      { userId: mongoose.Types.ObjectId(req.body.userId) },
      { $pull: { Assigned_Devices: { DeviceId:req.body.DeviceId } } },
      { upsert: true },
      // { multi: true },
    )
    if (!removeData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not deleted.",
      }) 
    }  
    let deviceIds = req.body.DeviceId;
    deviceIds.map(async (items) => {
      await RegisterDevice.findOneAndUpdate({DeviceId:items},{isAssigned:false});
    })
    const checkData = await assignDeviceTouserModel.findOne({userId:req.body.userId})
    let arrLength = checkData.Assigned_Devices

    // for logger user activity
    const loggedInUser = await User.findById({_id:verified.user});
    const normalUser = await User.findById({_id:req.body.userId});

    if (arrLength == 0 || arrLength == undefined) {
      
      await saveActivity(verified.user,'Device assigned remove successfully!',`${loggedInUser.email} has removed device to ${normalUser.email}`);
      await assignDeviceTouserModel.findOneAndRemove({userId:req.body.userId})
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data has been removed successfully!.",
        data:removeData
      });
    }
    await saveActivity(verified.user,'Device assigned remove successfully!',`${loggedInUser.email} has removed device to ${normalUser.email}`);
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data has been removed successfully!.",
      data:removeData
    }); 
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * get dashboard data count for admin access only
 * GET - api/logger/logs/
*/ 
const getAdminDashboardDataCount = async (req, res) => {
  try {
    let curDate = new Date().toJSON().slice(0,10);

    let filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    filterDate.setTime(last7days); 
    var expectedDateWeekly = filterDate.toJSON().slice(0,10);
    
    let filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0,10);

    const totalUsers = await User.find({ "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) },}).countDocuments(); 
    
    const aggregateLogic = [
      {
        $match : { "createdAt": { $gte: new Date(expectedDateWeekly), $lt: new Date(curDate) }, "accountStatus":"Active"}
      },
      {
        $group : {
           _id : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
           count: { $sum: 1 }
        }
      },
      {
        $sort : { createdAt: -1 }
      }
    ]
    // use of logic
    const weeklyDataCount = await User.aggregate(aggregateLogic)
    let sortedData = weeklyDataCount.sort((a,b) =>{
      return new Date(a._id) - new Date(b._id);
    })
    const totalCounts = weeklyDataCount.reduce((acc,cur) => {
      return acc+cur.count;
    },0);

    // for 30 days users count

    const aggregateLogic2 = [
      {
        $match : { "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) },}
      },
      {
        $group : {
           _id : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
           count: { $sum: 1 }
        }
      },
      {
        $sort : { createdAt: -1 }
      }
    ]
    // use of logic
    const monthlyDataCount = await User.aggregate(aggregateLogic2)
    let sortedData2 = monthlyDataCount.sort((a,b) =>{
      return new Date(a._id) - new Date(b._id);
    })
    const totalMonthlyCounts = monthlyDataCount.reduce((acc,cur) => {
      return acc+cur.count;
    },0);
    
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data counts get successfully.",
      data:{
        totalUserCount:totalUsers ? totalUsers : 0,
        totalUserCount30Days:monthlyDataCount ? sortedData2 : 0,
        totalActiveUserIn7Days:totalCounts ? totalCounts : 0,
        totalActiveUserIn7DaysDatewise:weeklyDataCount ? weeklyDataCount : 0,
        totalNewUserInLast30Days:totalMonthlyCounts ? totalMonthlyCounts : 0,
        totalNewUserInLast30DaysDatewise:monthlyDataCount ? sortedData2 : 0,
      }
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * query {req.params.filterType}
 * GET - /api/logger/logs/getTotalDevicesCount/:filterType
 * description -  admin access only
 */
const getTotalDevicesDataCount = async (req, res) => {
  try {
    var curDate = new Date().toJSON().slice(0,10);
    var filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    filterDate.setTime(last7days); 
    var expectedDateWeekly = filterDate.toJSON().slice(0,10);
    
    var filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0,10);

    if (req.params.filterType == "Weekly" || req.params.filterType == "weekly") {
      // Logic
      const aggregateLogic = [
        {
          $match : { "createdAt": { $gte: new Date(expectedDateWeekly), $lt: new Date(curDate) } }
        },
        {
          $group : {
             _id : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
             count: { $sum: 1 }
          }
        },
        {
          $sort : { createdAt: -1 }
        }
      ]
      // use of logic
      const weeklyDataCount = await Device.aggregate(aggregateLogic).sort({createdAt:-1})
      let sortedData = weeklyDataCount.sort((a,b) =>{
        return new Date(a._id) - new Date(b._id);
      })
      
      const totalCounts = weeklyDataCount.reduce((acc,cur) => {
        return acc+cur.count;
      },0);
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Weekly data counts get successfully.",
        data:{
          totalCounts:totalCounts ? totalCounts : 0,
          weeklyCounts:weeklyDataCount ? sortedData: 0,
        }
      })
    } else if (req.params.filterType == "Monthly" || req.params.filterType == "monthly") {
      
      const aggregateLogic = [
        {
          $match : { "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) } }
        },
        {
          $group : {
             _id : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
             count: { $sum: 1 }
          }
        },
        {
          $sort : { createdAt: -1 }
        }
      ]
      // use of logic
      const monthlyDataCount = await Device.aggregate(aggregateLogic)
      let sortedData = monthlyDataCount.sort((a,b) =>{
        return new Date(a._id) - new Date(b._id);
      })

      const totalCounts = monthlyDataCount.reduce((acc,cur) => {
        return acc+cur.count;
      },0);

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Monthly data counts get successfully.",
        data:{
          totalCounts:totalCounts ? totalCounts : 0,
          monthlyCounts:monthlyDataCount ? sortedData: 0,
        }
      })
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

const getTotalDevicesDataCount1 = async (req, res) => {
  try {
    var curDate = new Date().toJSON().slice(0,10);
    var filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    filterDate.setTime(last7days); 
    var expectedDateWeekly = filterDate.toJSON().slice(0,10);
    
    var filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0,10);

    if (req.params.filterType == "Weekly" || req.params.filterType == "weekly") {
      const totalDevicesCount = await Device.find({
        createdAt: {$gte: new Date(expectedDateWeekly).toISOString(),
        $lte: new Date(curDate).toISOString()},
      }).countDocuments();

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Weekly data counts get successfully.",
        data:{
          totalDevices:totalDevicesCount ? totalDevicesCount: 0,
        }
      })
    } else if (req.params.filterType == "Monthly" || req.params.filterType == "monthly") {
      const totalDevicesCount = await Device.find({
        createdAt: {$gte: new Date(expectedDateMonthly).toISOString(),
        $lte: new Date(curDate).toISOString()},
      }).countDocuments();

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Monthly data counts get successfully.",
        data:{
          totalDevices:totalDevicesCount ? totalDevicesCount: 0,
        }
      })
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * data - {req.body, req.params}
 * GET - /api/logger/logs/getTotalActiveDevicesCount/:filterType
 * description -  admin access only
 */
const getTotalActiveDevicesCount = async (req, res) => {
  try {
    var curDate = new Date().toJSON().slice(0,10);
    var filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    filterDate.setTime(last7days); 
    var expectedDateWeekly = filterDate.toJSON().slice(0,10);
    
    var filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0,10);
    
    if (req.params.filterType == "Weekly" || req.params.filterType == "weekly") {

      const aggregateLogic = [
        {
          $match : { "createdAt": { $gte: new Date(expectedDateWeekly), $lt: new Date(curDate) }, "message":"ACTIVE" }
        },
        {
          $group : {
             _id : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
             count: { $sum: 1 }
          }
        },
        {
          $sort : { createdAt: -1 }
        }
      ]
      // use of logic
      const weeklyDataCount = await statusModel.aggregate(aggregateLogic)
      const totalCounts = weeklyDataCount.reduce((acc,cur) => {
        return acc+cur.count;
      },0);
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Weekly data counts get successfully.",
        data:{
          totalCounts:totalCounts ? totalCounts : 0,
          weeklyCounts:weeklyDataCount ? weeklyDataCount: 0,
        }
      })
    } else if (req.params.filterType == "Monthly" || req.params.filterType == "monthly") {
      const aggregateLogic = [
        {
          $match : { "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) }, "message":"ACTIVE" }
        },
        {
          $group : {
             _id : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
             count: { $sum: 1 }
          }
        },
        {
          $sort : { createdAt: -1 }
        }
      ]
      // use of logic
      const monthlyDataCount = await statusModel.aggregate(aggregateLogic)
      const totalCounts = monthlyDataCount.reduce((acc,cur) => {
        return acc+cur.count;
      },0);

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Monthly data counts get successfully.",
        data:{
          totalCounts:totalCounts ? totalCounts : 0,
          monthlyCounts:monthlyDataCount ? monthlyDataCount: 0,
        }
      })      
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * data - {req.body, req.params}
 * GET - /api/logger/logs/getDevicesNeedingAttention/:filterType
 * description -  admin access only
 */
const getDevicesNeedingAttention = async (req, res) => {
  try {
    var curDate = new Date().toJSON().slice(0,10);
    var filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    filterDate.setTime(last7days); 
    var expectedDateWeekly = filterDate.toJSON().slice(0,10);
    
    var filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0,10);
    
    if (req.params.filterType == "Weekly" || req.params.filterType == "weekly") {
      const aggregateLogic = [
        {
          $match : { "createdAt": { $gte: new Date(expectedDateWeekly), $lt: new Date(curDate) },}
        },
        {
          $group : {
             _id : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
             count: { $sum: 1 }
          }
        },
        {
          $sort : { createdAt: -1 }
        }
      ]
      // use of logic
      const weeklyDataCount = await servicesModel.aggregate(aggregateLogic)
      const totalCounts = weeklyDataCount.reduce((acc,cur) => {
        return acc+cur.count;
      },0);
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Weekly data counts get successfully.",
        data:{
          totalCounts:totalCounts ? totalCounts : 0,
          weeklyCounts:weeklyDataCount ? weeklyDataCount: 0,
        }
      })
    } else if (req.params.filterType == "Monthly" || req.params.filterType == "monthly") {
      const aggregateLogic = [
        {
          $match : { "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) }, }
        },
        {
          $group : {
             _id : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
             count: { $sum: 1 }
          }
        },
        {
          $sort : { createdAt: -1 }
        }
      ]
      // use of logic
      const monthlyDataCount = await servicesModel.aggregate(aggregateLogic)
      const totalCounts = monthlyDataCount.reduce((acc,cur) => {
        return acc+cur.count;
      },0);

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Monthly data counts get successfully.",
        data:{
          totalCounts:totalCounts ? totalCounts : 0,
          monthlyCounts:monthlyDataCount ? monthlyDataCount: 0,
        }
      })
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    }) 
  }
}





module.exports = {
  createDevice,
  updateDevice,
  getDeviceById,
  deleteSingleDevice,
  getAllDevices,
  addDeviceService,
  getServicesById,
  saveStatus,
  getDeviceOverviewById,
  addAboutDevice,
  // addDispatchDetails,
  getAboutByDeviceId,
  sendAndReceiveData,
  assignedDeviceToUser,
  getAssignedDeviceById,
  deleteAssignedDeviceFromUser,
  getAdminDashboardDataCount,
  getTotalDevicesDataCount,
  getTotalDevicesDataCount1,
  getTotalActiveDevicesCount,
  getDevicesNeedingAttention,
  getDispatchData,
  getDispatchDataById,
}
