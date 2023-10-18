const Joi = require('joi');
const patientModel = require('../model/patientModel');


const addNewPatient = async (req, res) => {
  try {
    const newPatient = new patientModel(req.body);
    const savedDoc = await newPatient.save();
    if (!savedDoc) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not added."
      });
    }
    res.status(200).json({
      statusCode: 201,
      statusValue: "SUCCESS",
      message: "New patient added successfully.",
      data: savedDoc
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

const getAllPatient = async (req, res) => {
  try {
    const getList = await patientModel.find({})
      .select({ __v: 0, createdAt: 0, updatedAt: 0 })
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
  

module.exports = {
  addNewPatient,
  getAllPatient
}
