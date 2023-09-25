const bcrypt = require('bcrypt');
const { makeId } = require('../helper/helperFunctions');
const JWTR = require('jwt-redis').default;
const Users = require('../model/users');
// const ForgetPassword = require('../model/forgetPassword');
const Email = require('../utils/email');
let redisClient = require('../config/redisInit');
const { validationResult } = require('express-validator');
const verifyUserOrAdmin = require('../middleware/verifyUserOrAdmin');
const mongoose = require('mongoose');

const jwtr = new JWTR(redisClient);
const Joi = require('joi');
const User = require('../model/users');
const sendEmail = require('../helper/sendEmail.js');
const sendInBlueEmail = require('../helper/sendInBlueEmail.js');
const errorHandler = require('../middleware/errorHandler.js');
const sendOtp = require('../helper/sendOtp');

/**
 * api      POST @/api/logger/register
 * desc     @register for logger access only
 */
const registerUser = async (req, res) => {
  try {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      hospitalName: Joi.string().required(),
      passwordHash: Joi.string().min(5).max(10).required(),
      countryName:Joi.string().required(),
      stateName: Joi.string().required(),
    });
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message:
          "The email is already in use. Please try to login using the email address or sign up with a different email address. ",
      });
    }
    const salt = await bcrypt.genSalt();
    let mpwd = await bcrypt.hash(req.body.passwordHash, salt);
  
    const insertData = new User({
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email:req.body.email,
      hospitalName:req.body.hospitalName,
      passwordHash:mpwd,
      userType:"User",
      image:"",
      isSuperAdmin:false,
      accountStatus:"Active",
      countryName:req.body.countryName,
      stateName:req.body.stateName
    });
    const saveDoc = await insertData.save();
    // Send the email
    // const emailSubject = "Welcome to our Logcat";
    // const emailText = "Please verify your email id";
    // await sendEmail(insertData.email, emailSubject, emailText);
    // await sendInBlueEmail(insertData.email);
    if (saveDoc) {
      return res.status(201).json({
        statusCode:201,
        statusValue:"SUCCESS",
        message:"Congratulations! You have successfully signed up with us , Please login.",
        data:saveDoc
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
 *
 * @param {email, passwordHash} req
 * @param {token} res
 * @api     POST @/api/logger/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, passwordHash } = req.body;
    // console.log(process.env.JWT_SECRET)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        statusCode: 400,
        statusValue:"FAIL",
        message:"You have entered wrong credentials. Please enter valid credentials",
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

    const isUserExist = await Users.findOne({ email: email });   
    if (!isUserExist) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'User does not exist',
            msg: 'User does not exist',
            type: 'User does not exist',
          },
        },
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      passwordHash,
      isUserExist.passwordHash
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        statusCode: 401,
        statusValue:"FAIL",
        message:"You have entered wrong credentials ! please enter correct credentials.",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Password is incorrect',
            msg: 'Password is incorrect',
            type: 'Internal Server Error',
          },
        },
      });
    }
    const id = { user: isUserExist._id };
    const token = await jwtr.sign(id, process.env.JWT_SECRET, {
      expiresIn: '15d',
    });
    // console.log(token)
    // req.session.user = {
    //   name:isUserExist._id
    // }
    // console.log(123, req.session.user);
    return res.status(200).json({
      statusCode: 200,
      statusValue:"SUCCESS",
      message: `Logged in Successfully!`,
      data2: req.user,
      data: {
        _id:isUserExist._id,
        token: token,
        name: `${isUserExist.firstName ? isUserExist.firstName : ""} ${ isUserExist.lastName ? isUserExist.lastName : ""}`,
        email: isUserExist.email,
        hospitalName:isUserExist.hospitalName,
        image: isUserExist.image,
        userType:isUserExist.userType,
        isSuperAdmin: isUserExist.isSuperAdmin,
      },
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error!",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

/**
 * api      PUT @/api/logger/users/update
 * desc     @updateUserProfile individual users
 */
const updateUserProfile = async (req, res) => {
  try {
    let {userId, name, email} = req.body;
    let arr = name.split(" ");
    const checkUser = await Users.findOne({_id:mongoose.Types.ObjectId(req.body.userId)})
    // console.log("_id :", req.body._id, Users._id)
    const updateUser = await Users.findByIdAndUpdate({_id:mongoose.Types.ObjectId(req.body.userId)},{
      firstName:arr[0]? arr[0] : checkUser.firstName,
      lastName:arr[1]? arr[1] : checkUser.lastName,
      email:req.body.email,
    }, { new:true });
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while updating profile."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: 'Profile details updated successfully!',
      data: updateUser
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};

// const userForgetPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         status: 0,
//         data: {
//           err: {
//             generatedTime: new Date(),
//             errMsg: errors
//               .array()
//               .map((err) => {
//                 return `${err.msg}: ${err.param}`;
//               })
//               .join(' | '),
//             msg: 'Invalid data entered.',
//             type: 'ValidationError',
//           },
//         },
//       });
//     }

//     const user = await Users.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         status: 0,
//         data: {
//           err: {
//             generatedTime: new Date(),
//             errMsg: 'Email does not exist!',
//             msg: 'Email does not exist!',
//             type: 'Internal Server Error',
//           },
//         },
//       });
//     }

//     const otp = makeId(6);

//     // store email in ForgetPassword Model
//     const store = await new ForgetPassword({
//       email: user.email,
//       otp,
//       user: user._id,
//     });

//     const storeOTP = await store.save(store);
//     if (!storeOTP) {
//       return res.status(500).json({
//         status: 0,
//         data: {
//           err: {
//             generatedTime: new Date(),
//             errMsg: 'Otp not send.',
//             msg: 'Otp not send.',
//             type: 'Internal ServerError',
//           },
//         },
//       });
//     }

//     const url = `${otp}`;

//     new Email(email, url).forgetPassword();

//     return res
//       .status(200)
//       .json({ success: true, message: `Email send to you!` });
//   } catch (err) {
//     return res.status(500).json({
//       status: -1,
//       data: {
//         err: {
//           generatedTime: new Date(),
//           errMsg: err.stack,
//           msg: err.message,
//           type: err.name,
//         },
//       },
//     });
//   }
// };

/**
 * @desc        Reset password
 * @Endpoint    Post @/api/users/resetPasemailsword
 * @access      Token access
 */
const resetForgetPassword = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    };
    const checkUser = await Users.findOne({email:req.body.email});
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User not found with this emai id"
      })
    }
    var otp = Math.floor(1000 + Math.random() * 9000);
    const saveOtp = await Users.findByIdAndUpdate(
      {_id:checkUser._id},
      {otp:otp},
      {upsert:true}
    );
    await sendOtp(checkUser.email, otp)
    res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Otp send successfully.",
      otp
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}


const verifyOtp = async (req, res) => {
  try {
    const schema = Joi.object({
      otp: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    const checkOtp = await Users.findOne({ otp: req.body.otp });
    if (!checkOtp) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "You have entered wrong otp",
      })
    }
    res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Otp verified successfully."
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}

const generateNewPassword = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      passwordHash: Joi.string().required()
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    const salt = await bcrypt.genSalt();
    let mpwd = await bcrypt.hash(req.body.passwordHash, salt);
    const updateUser = await Users.findOneAndUpdate(
      {email:req.body.email},
      {passwordHash:mpwd},
      {upsert:true}
    )
    // console.log("_id :", req.body._id, Users._id)
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while generate new password."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: 'User details updated successfully!',
      data: updateUser
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};

/**
 * @desc - logger access only
 * @api - /api/logger/logs/logout
 * @method - POST
 */
const logoutUser = async (req, res) => {
  try {
    const gettoken = req.headers["authorization"].split(" ")[1];
    const data = await jwtr.destroy(req.jti);
    // console.log(1234, data)
    // console.log(jwtr);
    if (data) {
      return res.status(200).json({ 
        status: 200, 
        statusValue: "SUCCESS", 
        message: 'Logged out successfully!' });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue:"FAIL",
      message:"User not loggedin!"
    })
  } catch (err) {
    return res.status(500).json({
      status: 500,
      statusValue:"FAIL",
      data:{
        file:"users/logoutUser",
        name:err.name,
        error:err.stack,
      }
    });
  }
};

/**
 * @desc - update your passwrd
 * @api - PUT /api/logger/users/changepassword
 * @returns json data
 */
const userPasswordChange = async (req, res) => {
  try {
    const schema = Joi.object({
      _id: Joi.string().required(),
      currentPassword: Joi.string().required(),
      newPasswordHash: Joi.string().min(3).max(15).required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }

    const isUserExist = await Users.findById({ _id: mongoose.Types.ObjectId(req.body._id)})
    if (!isUserExist) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User does not exist with this user id"
      })
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.currentPassword,
      isUserExist.passwordHash
    );
    
    if (!isPasswordCorrect) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Incorrect current password!! enter correct current password."
      })
    }
    const salt = await bcrypt.genSalt();
    let mpwd = await bcrypt.hash(req.body.newPasswordHash, salt);
    const updateDoc = await Users.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { passwordHash: mpwd }
    )
    res.status(200).json({
      statusCode: 200,
      statusValue: "FAIL",
      message: "Password has been changed successfully.",
      data: updateDoc
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
 * @desc - get user profile by userId
 * @api - GET /api/logger/users/userId 
 * @returns json data
 */
const getUserProfileById = async (req, res) => {
  try {
    const userData = await Users.findById({_id:mongoose.Types.ObjectId(req.params.userId)})
    .select({createdAt:0, updatedAt:0, __v:0, otp:0});
    if (!userData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User not found!"
      })
    } 
    return res.status(200).json({
      statusCode: 200,
      statusValue:"SUCCESS",
      message:"Get user profile successfully!",
      data:userData
    });

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message:"Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * @desc - get all users
 * @api - /api/logger/users-list
 * @returns json data
 */
const getAllUsers = async (req, res) => {
  try {
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 1000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0
    const getUsers = await User.find({})
    .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit);

    // Count 
    const count = await User.find({})
    .sort({createdAt:-1})
    .countDocuments();

    if (getUsers.length>0) {
      return res.status(200).json({
        statusCode:200,
        statusValue:"SUCCESS",
        message:"Users list get successfully.",
        data:getUsers,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Data not found.",
      data: []
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
 * @desc - change user type by userId
 * @api - PUT /api/logger/change-userType/userId
 * @returns json data
 */
const changeUserType = async (req, res) => {
  try {
    const schema = Joi.object({
      userType: Joi.string().valid('Admin', 'User', 'Dispatch').required()
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    const userId = req.params.userId;
    const checkUser = await Users.findById({ _id: mongoose.Types.ObjectId(userId) })
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User not found with this userId"
      })
    }
    const updateDoc = await Users.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(userId) }, {
      userType: req.body.userType
    }, { new: true });
    if (!updateDoc) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "data not update."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Usertype changed successfully.",
      data: updateDoc
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

const getUserByUserId = async (req, res) => {
  try {
    const user = await Users.findById(req.user).select('-passwordHash');
    // console.log(123,user)
    if (!user) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'User not found',
            msg: 'User not found',
            type: 'MongoDBError',
          },
        },
      });
    }

    res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      data: { user },
      message: 'User get successfully',
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
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  logoutUser,
  // userForgetPassword,
  resetForgetPassword,
  userPasswordChange,
  getUserByUserId,
  getUserProfileById,
  getAllUsers,
  changeUserType,
  verifyOtp,
  generateNewPassword
};
