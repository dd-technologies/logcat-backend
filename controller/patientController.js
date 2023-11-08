const Joi = require('joi');
const patientModel = require('../model/patientModel');


/**
 * api      POST @/patient/save-uhid-details
 * desc     @saveUhid for publickly access
 */
const saveUhid = async (req, res) => {
  try {
    const patientData = await patientModel.findOneAndUpdate({UHID:req.body.UHID},{
      UHID:req.body.UHID,
      age:req.body.age,
      weight:req.body.weight,
      height:req.body.height,
    },{ upsert: true, new: true });
  
    if (!patientData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not added."
      });
    }
    res.status(200).json({
      statusCode: 201,
      statusValue: "SUCCESS",
      message: "Data added successfully.",
      data: patientData
    });
  } catch (error) {
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
};


/**
 * api      GET @/patient/get-allUhid
 * desc     @getAllUhid for logger access only
 */
const getAllUhid = async (req, res) => {
  try {
    const getList = await patientModel.find({},{__v:0,_id:0,createdAt:0,updatedAt:0,})
      .sort({ createdAt: -1 });
    if (!getList) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Patient list get successfully.",
      data: getList
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
 * api      GET @/patient/get-allUhid
 * desc     @getAllUhid for logger access only
 */
const getAllUhids = async (req, res) => {
  try {
    const getList = await patientModel.find({},{UHID:1,_id:0})
      .sort({ createdAt: -1 });
    if (!getList) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "UHID list get successfully.",
      data: getList
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
 * api      GET @/patient/get-patient-details/:UHID
 * desc     @getDataByUhid for logger access only
 */
const getDataByUhid = async (req, res) => {
  try {
    const UHID = req.params.UHID;
    const getData = await patientModel.findOne({UHID:UHID},{__v:0,});
    
    // check UHID data
    if (!getData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
      })
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully.",
      data:getData,
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



module.exports = {
  saveUhid,
  getAllUhid,
  getAllUhids,
  getDataByUhid
}
