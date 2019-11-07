import express from 'express';
import https from 'https';
import axios from 'axios';
require('dotenv').config();

const ChannelRouter = express.Router();

// -- Get all channels --
ChannelRouter.route('/').get( async (req, res, next) => {
  const token = req.cookies.auth;

  try {
    const channels = await axios.get(`https://${process.env.MAINFLUX_URL}/channels`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
    res.send(channels.data.channels);
    next();
  } catch(err) {
    return next(err);
  };

});

// -- Create new Channel --
ChannelRouter.route('/create').post( async (req, res, next) => {
  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  }

  const token = req.cookies.auth;
  const { name, metadata } = req.body.channel;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    })
  };

  const newChannel = {
    name: `zsse/${name}`,
    metadata
  }

  try {
    axios.post(`https://${process.env.MAINFLUX_URL}/channels`,
      JSON.stringify(newChannel), config)
      .then( response => {
        res.sendStatus(response.status);
        next();
      })
      .catch( err => {
        return next(err);
      });
  } catch(err) {
    return next(err);
  };
});

// -- Edit Channel by it's Id --
ChannelRouter.route('/edit/:id').put( async (req, res, next) => {

  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  }

  const token = req.cookies.auth;
  const { name, metadata } = req.body;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    })
  };

  const editedChannel = {
    name,
    metadata
  };

  try {
    axios.put(`https://${process.env.MAINFLUX_URL}/channels/${req.params.id}`,
    editedChannel, config)
      .then( response => {
        res.sendStatus(response.status);
        next();
      })
      .catch( err => {
        return next(err);
      });
  } catch(err) {
    return next(err);
  };

});

// -- Remove Channel by it's Id --
ChannelRouter.route('/remove/:id').delete( async (req, res, next) => {

  // Chech for JSON
  // if(!req.is('application/json')) {
  //   next();
  //   throw new Error("Expects content-type 'application/json'");
  // }

  const token = req.cookies.auth;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    })
  };

  try {
    axios.delete(`https://${process.env.MAINFLUX_URL}/channels/${req.params.id}`, config)
      .then( response => {
        res.sendStatus(response.status);
        next();
      })
      .catch( err => {
        return next(err);
      });
  } catch(err) {
    return next(err);
  };

});

export default ChannelRouter;