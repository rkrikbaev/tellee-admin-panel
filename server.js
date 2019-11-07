import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {connectDb} from './models/index';
require('dotenv').config();

const pino = require('pino');
const expressPino = require('express-pino-logger');

import UserRouter from './api/user/userRouter';
import ThingRouter from './api/thing/thingRouter';
import ChannelRouter from './api/channel/channelRouter';
import BootstrapRouter from './api/bootstrap/bootstrapRouter';
import OtherRouter from './api/other/otherRouter';
import DeviceRouter from './api/device/deviceRouter';
import ConnectionRouter from './api/connection/connectionRouter';
import MainfluxRouter from './api/data/MainfluxRouter';

const app = express();
const originsWhitelist = [
  'http://0.0.0.0:8080',
  'http://134.209.240.215',
  'http://mainflux.zeinetsse.com',
  'http://key.zeinetsse.com',
  'http://flash.zeinetsse.com',
  'http://admin.zeinetsse.com',
  process.env.UI_URL
];

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (originsWhitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },credentials: true
// }

const corsOptions = {
  origin: true,
  credentials: true
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(expressLogger);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use( (req, res, next) => {
  let allowedOrigins = [
    process.env.UI_URL,
    'http://0.0.0.0:8080',
    'http://134.209.240.215',
    'http://mainflux.zeinetsse.com',
    'http://key.zeinetsse.com',
    'http://flash.zeinetsse.com',
    'http://admin.zeinetsse.com',
];
  if (allowedOrigins.includes(req.headers.origin)) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
  } else {
    res.header("Access-Control-Allow-Origin", '*');
  }

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

// Routes
app.use('/api/users', UserRouter);
app.use('/api/other', OtherRouter);
app.use('/api/things', ThingRouter);
app.use('/api/device', DeviceRouter);
app.use('/api/channels', ChannelRouter);
app.use('/api/bootstrap', BootstrapRouter);
app.use('/api/connection', ConnectionRouter);
app.use('/api/data', MainfluxRouter);

connectDb().then( async () => {
  app.listen(process.env.PORT, () =>
    logger.debug(`Mainflux admin server listening on port ${process.env.PORT}!`)
  );
});
