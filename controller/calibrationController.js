const express = require('express');
const mongoose = require('mongoose');
const calibrationModel = require('../model/calibrationModel.js')
const { validationResult } = require('express-validator');
// const Projects = require('../model/project.js');
const Joi = require('joi');

const saveCalibrationData = async (req, res) => {
    try {
        const schema = Joi.object({
            deviceId: Joi.string().required(),
            message: Joi.string().required(),
            date: Joi.string().required(),
            name: Joi.string().required(),

        })
        let result = schema.validate(req.body);
        if (result.error) {
            console.log(req.body);
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }

        const project_code = req.params.project_code;
        const calibrationData = new calibrationModel(req.body);
        const saveDoc = await calibrationData.save();
        if (!saveDoc) {
            return res.status(404).json({
                status: 0,
                msg: "Calibration data not saved."
            });
        }
        return res.status(201).json({
            status: 1,
            msg: "Calibration data has been saved successfully.",
            data: saveDoc
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
}

const getCalibrationByDeviceId = async (req, res) => {
    try {
        const { deviceId, project_code } = req.params;
        if (!deviceId) {
            return res.status(400).json({
              statusCode: 400,
              statusValue: "Validation error",
              message: "Device Id is required!"
            })
        }
        const getData = await calibrationModel.find({deviceId},{ "createdAt": 0, "updatedAt": 0, "__v": 0 })
        if (!getData.length)
        return res.status(404).json({
            statusCode: 404,
            statusValue: "FAIL",
            message: "Data not found."
        })
        return res.status(200).json({
            statusCode: 200,
            statusValue:"SUCCESS",
            message:"Calibration data get successfully.",
            data:getData
        })
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        statusValue:"FAIL",
        message: "Internal server error",
        data : {
            name: "calibrationController/getCalibrationByDeviceId",
            error:error
        }
      })
    }
}



module.exports = {
    saveCalibrationData,
    getCalibrationByDeviceId
}