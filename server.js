import express from 'express';
// import Keycloak from 'keycloak-connect';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {connectDb} from './models/index';
require('dotenv').config();

import UserRouter from './api/user/userRouter';
import ThingRouter from './api/thing/thingRouter';
import ChannelRouter from './api/channel/channelRouter';
import BootstrapRouter from './api/bootstrap/bootstrapRouter';
import OtherRouter from './api/other/otherRouter';
import ConnectionRouter from './api/connection/connectionRouter';

const app = express();
const originsWhitelist = [
  'http://localhost',
  'http://zsse.zeinetsse.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
    callback(null, isWhitelisted);
  }
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://zsse.zeinetsse.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

const memoryStore = new session.MemoryStore();

// Session
app.use( session({
  secret: 'thisShouldBeLongAndSecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// Routes
app.use('/api/users', UserRouter);
app.use('/api/other', OtherRouter);
app.use('/api/things', ThingRouter);
app.use('/api/channels', ChannelRouter);
app.use('/api/bootstrap', BootstrapRouter);
app.use('/api/connection', ConnectionRouter);

connectDb().then( async () => {
  app.listen(process.env.PORT, () =>
    console.log(`Mainflux admin server listening on port ${process.env.PORT}!`),
  );
});
