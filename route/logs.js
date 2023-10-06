const express = require("express");
const multer = require("multer");
const { body } = require('express-validator');
var maxSize = 1 * 1024 * 1024

// FILE UPLOAD WITH MULTER 
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage, limits: { fileSize: maxSize } });
var uploadFunc = upload.single("filePath")
const router = express.Router();
const {
  createLogs,
  createLogsV2,
  createAlerts,
  createAlertsNew,
  createTrends,
  getLogsByLogType,
  dateWiseCrashCount,
  dateWiseLogOccurrencesByLogMsg,
  getLogsCountWithOs,
  getLogsCountWithModelName,
  getCrashOccurrenceByLogMsg,
  getErrorCountByOSArchitecture,
  crashlyticsData,
  crashFreeUsersDatewise,
  getFilteredLogs,
  getAlertsWithFilter,
  getErrorCountByVersion,
  createEvents,
  getEventsWithFilter,
  getEventsById,
  getAlertsById,
  getLogsById,
  getAllDeviceId,
  getCrashOccurrenceByLogMsgWithDeviceId,
  dateWiseLogOccurrencesByLogMsgWithDeviceId,
  crashlyticsData2,
  getTrendsWithFilter,
  getTrendsById,
} = require("../controller/logs");
// New controller
const logController = require('../controller/logController.js');
const locationController = require('../controller/locationController.js');
const calibrationController = require('../controller/calibrationController.js');
const deviceController = require('../controller/deviceController');
const { isAuth, isSuperAdmin, isAdmin } = require("../middleware/authMiddleware");

const { validateHeader } = require("../middleware/validateMiddleware");
const hospitalController = require("../controller/hospitalController");

// Unprotected routes
router.post("/:project_code", logController.createNewLog);


router.post("/location/:project_code", locationController.saveNewLocation);
router.get('/location/:deviceId/:project_code', locationController.getLocationByDeviceId);
router.post('/calibration/:project_code', calibrationController.saveCalibrationData);
router.get('/calibration/:deviceId', calibrationController.getCalibrationByDeviceId);
router.post('/services/:project_code', deviceController.addDeviceService);
router.get('/services/:deviceId/:project_code', deviceController.getServicesById);
router.post('/status/:project_code', deviceController.saveStatus);
router.get('/deviceOverview/:deviceId/:project_code', isAuth, deviceController.getDeviceOverviewById);
router.post('/add-dispatch-details/:project_code', deviceController.addAboutDevice);
router.get('/get-dispatch-data/:project_code', deviceController.getDispatchData);
router.get('/get-dispatch-databyId/:deviceId', deviceController.getDispatchDataById);
// router.put('/add-dispatch-details', deviceController.addDispatchDetails);
router.get('/about/:deviceId', isAuth, deviceController.getAboutByDeviceId);
router.get('/dynamicDeviceId/:deviceId', deviceController.sendAndReceiveData);
router.put('/assignedDeviceToUser', isAuth, isAdmin, deviceController.assignedDeviceToUser);
router.get('/getAssignedDeviceByUserId/:userId', isAuth, deviceController.getAssignedDeviceById);
router.put('/deleteAssignedDeviceById', isAuth, isAdmin, deviceController.deleteAssignedDeviceFromUser);
router.get('/adminDashboardDataCount', deviceController.getAdminDashboardDataCount);
router.get('/getTotalDevicesCount/:filterType', deviceController.getTotalDevicesDataCount);
router.get('/getTotalActiveDevicesCount/:filterType', deviceController.getTotalActiveDevicesCount);
router.get('/getDevicesAttentionCount/:filterType', deviceController.getDevicesNeedingAttention);


router.post(
  "/v2/:project_code",
  function (req, res, next) {
    uploadFunc(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: err.stack,
              msg: err.message,
              type: err.name,
            },
          },
        });
      } else if (err) {
        // console.log(err)
        // An unknown error occurred when uploading.
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
      // Everything went fine.
      next()
    })
  },
  validateHeader,
  createLogsV2
);
router.post("/alerts/:project_code",
  body('did').notEmpty(),
  body('type').notEmpty(),
  body('ack.*.code').notEmpty(),
  body('ack.*.timestamp').notEmpty(),
  createAlerts);

  // New alerts or alarm api for new ventilators
  router.post("/alerts-new/:project_code",
  createAlertsNew);

  router.post("/events/:project_code",
  body('did').notEmpty(),
  body('type').notEmpty(),
  body('ack.*.code').notEmpty(),
  body('ack.*.timestamp').notEmpty(),
  createEvents);
  router.post("/trends/:project_code",
  body('did').notEmpty(),
  body('type').notEmpty(),
  body('ack.*.code').notEmpty(),
  body('ack.*.timestamp').notEmpty(),
  createTrends);

//Protected Route
router.get("/:projectCode", isAuth, getFilteredLogs);

router.get("/getLogsCount/:projectCode", isAuth, getLogsByLogType);
router.get("/datewiselogcount/:projectCode", isAuth, dateWiseCrashCount);
router.get(
  "/crashfree-users-datewise/:projectCode",
  isAuth,
  crashFreeUsersDatewise
);
router.get("/alerts/:projectCode", isAuth, getAlertsWithFilter);
router.get("/events/:projectCode",isAuth,getEventsWithFilter);
router.get("/trends/:projectCode",isAuth,getTrendsWithFilter);
router.get("/deviceTrends/:did",getTrendsById);
router.get("/deviceAlerts/:did",getAlertsById);
router.get("/deviceEvents/:did",getEventsById);
router.get("/deviceLogs/:device",getLogsById);
router.get("/Allevents/Events",getAllDeviceId);


// router.get("/example", async (req,res)=>{
//     console.log("value of something")
// })

router.get("/get-crashlytics-data/:projectCode", isAuth, crashlyticsData);
router.get("/log-occurrences-datewise/:projectCode", isAuth, dateWiseLogOccurrencesByLogMsg);
router.get("/logMsgOccurence/:projectCode", isAuth, getCrashOccurrenceByLogMsg);
router.get("/logMsgOccurence2/:did", isAuth, getCrashOccurrenceByLogMsgWithDeviceId);
router.get("/log-occurrences-datewise2/:did", isAuth, dateWiseLogOccurrencesByLogMsgWithDeviceId);
router.get("/get-crashlytics-data2/:did", isAuth, crashlyticsData2);

//router.get("/deviceLoges/:did",getLogesById)

// UNUSED ROUTES
router.get("/getLogsCountWithOs/:projectCode", isAuth, getLogsCountWithOs);
router.get(
  "/getLogsCountWithModelName/:projectCode",
  isAuth,
  getLogsCountWithModelName
);
router.get(
  "/getErrorCountByOSArchitecture/:projectCode",
  isAuth,
  getErrorCountByOSArchitecture
);
router.get(
  "/getErrorCountByVersion/:projectCode",
  isAuth,
  getErrorCountByVersion
);

module.exports = router;
