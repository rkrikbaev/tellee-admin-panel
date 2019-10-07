import express from 'express';
import https from 'https';
import axios from 'axios';
require('dotenv').config();

const ThingRouter = express.Router();

// -- Get all things --
ThingRouter.route('/').get( async (req, res, next) => {
  const token = req.cookies.auth;

  try {
    const things = await axios.get(`https://${process.env.MAINFLUX_URL}/things?offset=0&limit=100`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    res.send(things.data.things);
    next();
  } catch(err) {
    return next(err);
  };

});

// -- Get thing by id --
ThingRouter.route('/:id').get( async (req, res, next) => {
  const token = req.cookies.auth;

  try {
    const thing = await axios.get(`https://${process.env.MAINFLUX_URL}/things/${req.params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    res.send(thing.data);
    next();
  } catch(err) {
    return next(err);
  };

});

// -- Create new Thing --
ThingRouter.route('/create').post( async (req, res, next) => {

  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  }

  const token = req.cookies.auth;
  const { name, metadata } = req.body;
  const pref_name = `zsse/${name}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    })
  };

  const newThing = {
    name: pref_name,
    metadata
  }

  try {
    axios.post(`https://${process.env.MAINFLUX_URL}/things`,
      JSON.stringify(newThing), config)
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

// -- Remove Thing by it's Id --
ThingRouter.route('/remove/:id').delete( async (req, res, next) => {

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
    axios.delete(`https://${process.env.MAINFLUX_URL}/things/${req.params.id}`, config)
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

// -- Edit Thing by it's Id --
ThingRouter.route('/edit/:id').put( async (req, res, next) => {

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

  const editedThing = {
    name,
    metadata
  };

  try {
    axios.put(`https://${process.env.MAINFLUX_URL}/things/${req.params.id}`,
    editedThing, config)
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

export default ThingRouter;