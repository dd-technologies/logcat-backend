const bcrypt = require('bcrypt');
const { makeId } = require('../helper/helperFunctions');
const JWTR = require('jwt-redis').default;
const Users = require('../model/users');
const ForgetPassword = require('../model/forgetPassword');
const Email = require('../utils/email');
let redisClient = require('../config/redisInit');
const { validationResult } = require('express-validator');
const verifyUserOrAdmin = require('../middleware/verifyUserOrAdmin');
const mongoose = require('mongoose');

const jwtr = new JWTR(redisClient);
const Joi = require('joi');
const User = require('../model/users');
const sendEmail = require('../helper/sendEmail.js');

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
      passwordHash: Joi.string().min(3).max(15).required(),
    })
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
      accountStatus:"Initial",
    });
    const saveDoc = await insertData.save();
    // Send the email
    const emailSubject = "Welcome to our Logcat";
    const emailText = "Please verify your email id";
    // await sendEmail(insertData.email, emailSubject, emailText);
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
      statusCode:500,
      statusValue:"FAIL",
      message:"Internal server error",
      data:{
        name:"user/registerUser",
        err:err
      }
    })
  }
}

// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const emailTaken = await Users.findOne({ email: email });

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

//     if (emailTaken) {
//       // throw new AppError(`Email already taken`, 409);
//       return res.status(409).json({
//         status: 0,
//         data: {
//           err: {
//             generatedTime: new Date(),
//             errMsg: 'Email already taken',
//             msg: 'Email already taken',
//             type: 'Duplicate Key Error',
//           },
//         },
//       });
//     }

//     if (!email || !name || !password) {
//       return res.status(400).json({
//         status: 0,
//         data: {
//           err: {
//             generatedTime: new Date(),
//             errMsg: 'Please fill all the details.',
//             msg: 'Please fill all the details.',
//             type: 'Client Error',
//           },
//         },
//       });
//     }

//     const salt = await bcrypt.genSalt();
//     const passwordHash = await bcrypt.hash(password, salt);

//     const user = await new Users({
//       name,
//       email,
//       isSuperAdmin: false,
//       passwordHash,
//       image: '',
//     });

//     const savedUser = await user.save(user);

//     if (savedUser) {
//       const url = `${req.protocol}://${req.get('host')}/welcome`;

//       new Email(email, url).sendWelcome();

//       res.status(201).json({
//         status: 1,
//         data: { name: savedUser.name, avatar: savedUser.image },
//         message: 'Registered successfully!',
//       });
//     } else {
//       res.status(500).json({
//         status: 0,
//         data: {
//           err: {
//             generatedTime: new Date(),
//             errMsg: 'Some error happened during registration',
//             msg: 'Some error happened during registration',
//             type: 'MongodbError',
//           },
//         },
//       });
//     }
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
        message:"User not found.",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'User not available with this email address.',
            msg: 'User not available with this email address.',
            type: 'Internal Server Error',
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
      statusValue:"FAIL",
      message:"Internal server error!",
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
    });
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while updating user profile."
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
      status: 500,
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

const userForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 0,
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

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Email does not exist!',
            msg: 'Email does not exist!',
            type: 'Internal Server Error',
          },
        },
      });
    }

    const otp = makeId(6);

    // store email in ForgetPassword Model
    const store = await new ForgetPassword({
      email: user.email,
      otp,
      user: user._id,
    });

    const storeOTP = await store.save(store);
    if (!storeOTP) {
      return res.status(500).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Otp not send.',
            msg: 'Otp not send.',
            type: 'Internal ServerError',
          },
        },
      });
    }

    const url = `${otp}`;

    new Email(email, url).forgetPassword();

    return res
      .status(200)
      .json({ success: true, message: `Email send to you!` });
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

/**
 * @desc        Reset password
 * @Endpoint    Post @/api/users/resetPasemailsword
 * @access      Token access
 */
const resetForgetPassword = async (req, res) => {
  try {
    const { email, otp, password, passwordVerify } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 0,
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

    if (password !== passwordVerify) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Make sure your passwords match.',
            msg: 'Make sure your passwords match.',
            type: 'ValidationError',
          },
        },
      });
    }

    // find user using email
    const user = await Users.findOne({ email });
    const fp = await ForgetPassword.findOne({ otp });

    if (!fp) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'OTP does not exist!',
            msg: 'OTP does not exist!',
            type: 'Internal Server Error',
          },
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (isMatch) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg:
              'You cannot set your previous password as new password, Enter new password!',
            msg: 'You cannot set your previous password as new password, Enter new password!',
            type: 'Internal Server Error',
          },
        },
      });
    }

    if (user.email === fp.email) {
      // update password of user
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      user.passwordHash = passwordHash;
      const saveUser = await user.save();
      if (!saveUser) {
        return res.status(500).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'User not saved',
              msg: 'User not saved',
              type: 'MongodbError',
            },
          },
        });
      }

      // delete the document from forget password using email
      await ForgetPassword.deleteMany({ user: user._id });

      // SENDING FORGET MAIL USER

      // delete cookie email and other token
      return res
        .status(200)
        .json({ status: 1, data: {}, message: 'Password reset successfully' });
    } else {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'OTP does not match, try again!',
            msg: 'OTP does not match, try again!',
            type: 'Internal Server Error',
          },
        },
      });
    }
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

const logoutUser = async (req, res) => {
  try {
    const gettoken = req.headers["authorization"].split(" ")[1];
    const data = await jwtr.destroy(req.jti);
    // console.log(jwtr);
      if (data) {
        return res
        .status(200)
        .json({ status: 1, data: {}, message: 'Logged out successfully!' });
      }
      console.log("not ok")
    // return res.json({'message':'Logged out successfully!','token':token});
   
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

// update user profile
const userPasswordChange = async (req, res) => {
  try {
    var { currentPassword, newPassword } = req.body;
    // console.log(currentPassword);

    //  currentPassword could not be empty -----
    if (!currentPassword) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Current password should not be empty',
            msg: 'Current password should not be empty',
            type: 'Client  Error',
          },
        },
      });
    }
    //  new password could not be empty -----
    if (!newPassword) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'new password should not be empty',
            msg: 'new password should not be empty',
            type: 'Client  Error',
          },
        },
      });
    }
    //  new password should not match current password -----
    if (currentPassword === newPassword) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Current and New password should not be same`',
            msg: 'Current and New password should not be same`',
            type: 'Client  Error',
          },
        },
      });
    }

    const user = await Users.findById(req.user);

    const salt = await bcrypt.genSalt();

    //  current password correct checking -----
    const passwordCompare = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!passwordCompare) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Current password is incorrect',
            msg: 'Current password is incorrect',
            type: 'Internal Server Error',
          },
        },
      });
    }
    // checking new password and hashing it
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = newPasswordHash;

    await user.save();

    return res
      .status(200)
      .json({ status: 1, data: {}, message: 'Password changed successfully!' });
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

const getUserProfileById = async (req, res) => {
  try {
    const userData = await Users.findById({_id:mongoose.Types.ObjectId(req.params.userId)});
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
    })
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message:"Internal server error",
      data:{
        name:"users/getUserProfileById",
        error:error
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
      status: 1,
      data: { user },
      message: 'Successful1',
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
  userForgetPassword,
  resetForgetPassword,
  userPasswordChange,
  getUserByUserId,
  getUserProfileById
};
