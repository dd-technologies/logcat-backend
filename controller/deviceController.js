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
const { registerDevice } = require('./RegisterDevice');


/**
 * api      POST @/devices/register
 * desc     @register for logger access only
 */
const createDevice = async (req, res) => {
  const newDevice = new Device(req.body);
  try {
    const savedDevice = await newDevice.save();
    if (!!savedDevice) {
      return res.status(200).json({
        "statusCode": 200,
        "statusValue": "SUCCESS",
        data: savedDevice
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Validation error."
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
      limit = 10;
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
    const data = await aboutDeviceModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 }).sort({ createdAt: -1 }).limit(1);
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
    const data = await assignDeviceTouserModel.find({userId:mongoose.Types.ObjectId(userId)})
    .select({_id:0, __v:0, createdAt:0, updatedAt:0})
    .sort({ createdAt: -1 });
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
    if (arrLength == 0 || arrLength == undefined) {
      await assignDeviceTouserModel.findOneAndRemove({userId:req.body.userId})
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data has been removed successfully!.",
        data:removeData
      });
    }
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
    const totalMonthlyCounts = monthlyDataCount.reduce((acc,cur) => {
      return acc+cur.count;
    },0);
    
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data counts get successfully.",
      data:{
        totalUserCount:totalUsers ? totalUsers : 0,
        totalUserCount30Days:monthlyDataCount,
        totalActiveUserIn7Days:totalCounts,
        totalActiveUserIn7DaysDatewise:weeklyDataCount,
        totalNewUserInLast30Days:totalMonthlyCounts,
        totalNewUserInLast30DaysDatewise:monthlyDataCount
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
      const weeklyDataCount = await Device.aggregate(aggregateLogic)
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
  getAllDevices,
  addDeviceService,
  getServicesById,
  saveStatus,
  getDeviceOverviewById,
  addAboutDevice,
  getAboutByDeviceId,
  sendAndReceiveData,
  assignedDeviceToUser,
  getAssignedDeviceById,
  deleteAssignedDeviceFromUser,
  getAdminDashboardDataCount,
  getTotalDevicesDataCount,
  getTotalDevicesDataCount1,
  getTotalActiveDevicesCount,
  getDevicesNeedingAttention
}
