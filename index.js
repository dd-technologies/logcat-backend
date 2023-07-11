const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db.js');
const morgan = require('morgan');
require('dotenv').config({ path: './.env' });
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const http = require('http')

// sendin blue
const Sib = require('sib-api-v3-sdk');
require('dotenv').config()

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY

// var deviceIdArray = new Map();
// var deviceId = "";

// end sendin blue

// importing router
const users = require('./route/users.js');
const projects = require('./route/projects');
const logs = require('./route/logs');
// const RegisterDevice=require('./route/RegisterDevice');
const deviceRouter = require('./route/deviceRouter.js');
const patientRouter = require('./route/patientRouter.js');
const hospitalRouter = require('./route/hospitalRoute');
const projectRouter = require('./route/projectRouter.js');
// const { urlencoded } = require('body-parser');

// socket ioo
// const { Server } = require("socket.io");

// creating connection with DB
connectDB();

const app = express();
const server = http.createServer(app);
app.use(express.json());

app.enable('trust proxy');

// DEVELOPMENT environment morgan logs
// if (process.env.NODE_ENV === "DEVELOPMENT") {
app.use(morgan('tiny'));
// }

app.use(cors());

// For session
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: { expires: 60*60*1000 },
  })
);       

// adding static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '1mb', extended: true }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Users Routing
app.use('/api/logger', users);

// Project Routing
app.use('/api/logger/projects', projects);
app.use("/registerDev",require("./route/RegisterDevice.js"));
app.use('/devices', deviceRouter);
app.use('/patient', patientRouter);
app.use('/hospital', hospitalRouter);
app.use('/projects', projectRouter);


// Logs Routing
app.use('/api/logger/logs', logs);

//RegisterDevice
// app.use('/api/logger/device',RegisterDevice);
// error handling for all routes which are not define
app.all('*', (req, res, next) => {
  res.status(400).json({
    status: 0,
    data: {
      err: {
        generatedTime: new Date(),
        errMsg: 'No Route Found',
        msg: 'No Route Found',
        type: 'Express Error',
      },
    },
  });
  next();
});

const PORT = process.env.PORT || 5000;

// Socket start


// Socket end
module.exports = server.listen(PORT, () => console.log(`active on port ${PORT} `));
// module.exports = app.listen(PORT, () => console.log(`active on port ${PORT} `));

// unhandledRejection Error handling
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  process.exit(1);
});