const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const registeredHospitalModel = require('../model/registeredHospitalModel');
const { Country, State, City } = require('country-state-city');

/*
 * @param {*} req 
 * @param {*} res 
 * api POST@/api/logger/logs/save-hospital
 * desc create location for logger access only
 */
const saveHospital = async (req, res) => {
    try {
        const schema = Joi.object({
            Hospital_Name: Joi.string().required(),
            Hospital_Address: Joi.string().required(),
            Country: Joi.string().required(),
            State: Joi.string().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        const checkHospital = await registeredHospitalModel.findOne({ Hospital_Name: req.body.Hospital_Name });
        if (checkHospital) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Hospital already registered."
            })
        }
        const hospitalData = new registeredHospitalModel(req.body);
        const saveDoc = await hospitalData.save();
        if (!saveDoc) {
            return res.status(404).json({
                status: 0,
                msg: "Hospital not saved."
            });
        }
        return res.status(201).json({
            status: 1,
            msg: "Hospital has been registered successfully.",
            data: saveDoc
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
        })
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * api GET@/api/logger/logs/location/:deviceId/:project_code
 */
const getHospitalList = async (req, res) => {
    try {
        const data = await registeredHospitalModel.find({State:req.params.State}, { __v: 0, createdAt: 0, updatedAt: 0 });
        if (data.length == "") {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found."
            })
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Hospital data get successfully.",
            data: data
        })
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
}

const getCountryList = async (req, res) => {
    try {
        const countryData = await Country.getAllCountries();
        if (!countryData) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Data not found.",
                data: [],
            });
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Country list get successfully.",
            data: countryData,
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
}

const getStateListByCountryName = async (req, res) => {
    try {
        const countryData = await Country.getAllCountries();
        const getName = countryData.filter((item) => {
            return item.name == req.params.name
        });
        const countryCode = getName[0].isoCode;
        const stateData = await State.getStatesOfCountry(countryCode);
        if (!stateData) { 
            return res.status(400).json({ 
                statusCode: 400, 
                statusValue: "FAIL",
                message: "Data not found.", 
                data: [], 
            });
        } 
        return res.status(200).json({ 
            statusCode: 200, 
            statusValue: "SUCCESS", 
            message: "State list get successfully.", 
            data: stateData, 
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
}





module.exports = {
    saveHospital,
    getHospitalList,
    getCountryList,
    getStateListByCountryName
}