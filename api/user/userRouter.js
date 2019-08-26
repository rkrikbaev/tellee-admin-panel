import express from 'express';
import User from '../../models/User';
import https from 'https';
import axios from 'axios';
require('dotenv').config();

const UserRouter = express.Router();

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
};

UserRouter.route('/create').post( async (req, res, next) => {
  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  }

  const { username, email, password } = req.body;

  let mainflux_pwd = Math.floor(Math.random() * 90000000) + 100000;

  const user = new User({
    username,
    email,
    password,
    mainflux_pwd
  });


  try {

    await user.save();

    axios.post(`https://${process.env.MAINFLUX_URL}/users`, {
      'email': `${user.email}`,
      'password': `${user.mainflux_pwd}`
    }, config)
      .then( response => {
        res.send(response.status);
        next();
      });
  } catch(err) {
    return next(err);
  };
});

UserRouter.route('/login').post( async (req, res, next) => {
  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  };
  const { email } = req.body;

  try {

    const user = await User.findOne({ email });

    const token = await axios.post(`https://${process.env.MAINFLUX_URL}/tokens`, {
      'email': user.email,
      'password': `${user.mainflux_pwd}`
    }, config);

    res.cookie('auth', token.data.token);
    res.send(token.data);
    next();

  } catch(err) {
    return next(err);
  }

});

UserRouter.route('/').get( async (req, res, next) => {
  try {
    const users = await User.find({});
    res.send(users);
    next();
  } catch(err) {
    next(err);
  };
});

export default UserRouter;