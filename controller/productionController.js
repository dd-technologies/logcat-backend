const express = require('express');
const mongoose = require('mongoose');
const productionModel = require("../model/productionModel");
const { validationResult } = require('express-validator');
const Projects = require('../model/project.js');
const Joi = require('joi');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * api POST@/production/add-new
 * desc create production for logger access only
 */
const createProduction = async (req, res) => {
    try {
        const schema = Joi.object({
            deviceId: Joi.string().required(),
            purpose: Joi.string().required(),
            simNumber: Joi.string().required(),
            productType: Joi.string().required(),
            batchNumber: Joi.string().required(),
            iopr: Joi.string().required(),
            manufacturingDate: Joi.string().required(),
            dispatchDate: Joi.string().required(),
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
        // const project_code = req.params.project_code;
        const productionData = new productionModel(req.body);
        const saveDoc = await productionData.save();
        if (!saveDoc) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Production data not saved."
            });
        }
        return res.status(201).json({
            statusCode: 201,
            statusValue: "SUCCESS",
            message: "Production data has been saved successfully.",
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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * api GET@/production/production-list
 */
const getProductionData = async (req, res) => {
    try {
        let { page, limit } = req.query;
        if (!page || page === "undefined") {
            page = 1;
        }
        if (!limit || limit === "undefined" || parseInt(limit) === 0) {
            limit = 1000;
        }
        const skip = page > 0 ? (page - 1) * limit : 0

        const data = await productionModel.find({})
            .select({__v: 0, createdAt: 0, updatedAt: 0 })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const count = await productionModel.find({})
            .sort({ createdAt: -1 })
            .countDocuments();

        if (!data.length) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found.",
                data: [],
            })
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "production data get successfully!",
            data: data,
            totalDataCount: count,
            totalPages: Math.ceil(count / limit),
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

/*
* @param {*} req 
* @param {*} res 
* api GET@/production/get-byid/:id
*/
const getProductionById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await productionModel.findById({_id:req.params.id}).select({ __v: 0, createdAt: 0, updatedAt: 0 })
        
        if (!data) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found.",
                data: {},
            })
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "production data get successfully!",
            data: data,
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


/*
* @param {*} req 
* @param {*} res 
* api PUT@/production/update-production
*/
const updateProduction = async (req, res) => {
    try {
        const schema = Joi.object({
            id:Joi.string().required(),
            deviceId: Joi.string().required(),
            purpose: Joi.string().required(),
            simNumber: Joi.string().required(),
            productType: Joi.string().required(),
            batchNumber: Joi.string().required(),
            iopr: Joi.string().required(),
            manufacturingDate: Joi.string().required(),
            dispatchDate: Joi.string().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // const project_code = req.params.project_code;
        const updateDoc = await productionModel.findByIdAndUpdate({_id:req.body.id}, req.body, {upsert:true, new: true});
    
        if (!updateDoc) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Production data not updated."
            });
        }
        return res.status(201).json({
            statusCode: 201,
            statusValue: "SUCCESS",
            message: "Production data has been updated successfully.",
            data: updateDoc
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


/*
* @param {*} req 
* @param {*} res 
* api DELETE@/production/delete-byid
*/
const deleteProductionById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteDoc = await productionModel.findByIdAndDelete({_id:id});
        if (!deleteDoc) {
            return res.status(400).json({
                statusCode: 400,
                statusValue:"FAIL",
                message: "data not deleted !!."
            })
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message:"data deleted successfully!",
        })

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






module.exports = {
    createProduction,
    getProductionData,
    getProductionById,
    updateProduction,
    deleteProductionById,
}