const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const registeredHospitalModel = require('../model/registeredHospitalModel');
const assignTicketModel = require('../model/assignTicketModel');

// for redis client
let redisClient = require("../config/redisInit");
const activityModel = require('../model/activityModel');
const User = require('../model/users');

const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);


// Create new ticket
const saveTicket = async (req, res) => {
    try {
        const schema = Joi.object({
            deviceId: Joi.string().required(),
            hospital_name: Joi.string().required(),
            concerned_p_contact: Joi.string().required(),
            service_engineer: Joi.string().required(),
            issues: Joi.string().required(),
            details: Joi.string().required(),
            priority: Joi.string().valid('Critical', 'Medium'),
            address: Joi.string().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        const ticketStr = "AgVaPro";
        const ranNum = Math.floor(1000 + Math.random() * 9000); 
        // for ticket owner
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
    

        const ticketData = new assignTicketModel({
            deviceId:req.body.deviceId,
            ticket_number:`${ticketStr}-${ranNum}`,
            ticket_owner:loggedInUser.email,
            // ticket_owner:"admin@gmail.com",
            status:"Pending",
            priority:req.body.priority,
            hospital_name:req.body.hospital_name,
            concerned_p_contact:req.body.concerned_p_contact,
            service_engineer:req.body.service_engineer,
            issues:req.body.issues,
            details:req.body.details,
            address:req.body.address,
        });
        const saveDoc = await ticketData.save();
        if (!saveDoc) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Ticket not assigned.",
            });
        }
        return res.status(201).json({
            statusCode: 201,
            statusValue: "SUCCESS",
            message: "Ticket assigned successfully!",
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


const getAllTickets = async (req, res) => {
    try {
        // for search
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
        
        // for userType access data
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        var obj = {};
        if (loggedInUser.userType == "Service-Engineer" && loggedInUser.userType !== undefined) {
            fullname = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
            obj = {service_engineer:fullname}
        }

        const data = await assignTicketModel.find({
            $or:[
                obj,
                { ticket_number:{ $regex: ".*" + search + ".*", $options: "i" } },
            ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        // count
        const count = await assignTicketModel.find({
            obj,
            $or:[
                { ticket_number:{ $regex: ".*" + search + ".*", $options: "i" } },
            ]
        })
        .sort({ createdAt: -1 })
        .countDocuments();
        if (data.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data get successfully.",
                data: data,
                totalDataCount: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not found."
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

const deleteTicket = async (req, res) => {
    try {
        // for loggedIn user
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        if (loggedInUser.userType == "Support") {
            const id = req.params.id;
            const checkTicket = await assignTicketModel.findOne({ _id: req.params.id });
            if (!checkTicket) {
                return res.status(400).json({
                    statusCode: 400,
                    statusValue: "FAIL",
                    message:!!id ? "Incorrect ticket id" : "Data not found.",
                })
            }
            const removeDoc = await assignTicketModel.findByIdAndDelete(
                { _id:req.params.id },
                { new: true }
            );
            if (!removeDoc) {
                return res.status(400).json({
                    statusCode: 400,
                    statusValue: "FAIL",
                    message: "Data not deleted!",
                });
            }
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data deleted successfully.",
                data: removeDoc,
            });
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "You don't have permission for this action!.",
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


const updateTicket = async (req, res) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required(),
            priority: Joi.string().valid("Critical", "Medium").optional(),
            status: Joi.string().valid("Pending", "Not-Done", "Completed").optional(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // console.log(123, req.body);
        const updateDoc = await assignTicketModel.findByIdAndUpdate({_id:req.body.id}, req.body, { new: true });
        if (!!updateDoc) {
            return res.status(200).json({
                statusCode: 200,
                msg: "Data updated successfully.",
                data: updateDoc,
            });
        }
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

const getTicketDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await assignTicketModel.findById({_id:req.params.id}, { __v: 0, createdAt: 0, updatedAt: 0 });
        if (!data) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found."
            });
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully.",
            data: data
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
    saveTicket,
    getAllTickets,
    deleteTicket,
    updateTicket,
    getTicketDetails,
}