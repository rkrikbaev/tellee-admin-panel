import express from 'express';
import https from 'https';
import axios from 'axios';
import md5 from 'md5';
require('dotenv').config();

const BootstrapRouter = express.Router();

// -- Connect edge device to Channel (App ***) --
BootstrapRouter.route('/create/app').post( async (req, res, next) => {

  const token = req.cookies.auth;
  const { mac, id, channels, name } = req.body;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };

  const pref_name = `zsse/${name}`;

  const newConnection = {
    "external_id": `${mac}`,
    "external_key": `${md5(mac.toLowerCase())}`,
    "thing_id": `${id}`,
    "name": `${pref_name}`,
    "channels": typeof channels === "string"
      ? [channels]
      : channels,
    "content": `{"type":"app", "name": ${JSON.stringify(pref_name)}, "mac":${JSON.stringify(mac)},"hash":${JSON.stringify(md5(req.body))}, "models": []}`,
    "state": 1,
  };

  try {
    axios.post(`http://${process.env.MAINFLUX_URL}:8200/things/configs`, JSON.stringify(newConnection), config)
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

// -- Connect edge device to Channels (Device ***) --
BootstrapRouter.route('/create/device').post( async (req, res, next) => {

  const token = req.cookies.auth;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };

  const { mac, id, channels, name, firmware, cycle, sendToApp, model, app, } = req.body;
  const pref_name = `zsse/${name}`;
  let newConnection = {};

  if(!sendToApp) {
    newConnection = {
      "external_id": `${mac}`,
      "external_key": `${md5(mac.toLowerCase())}`,
      "thing_id": `${id}`,
      "name": `${pref_name}`,
      "channels": typeof channels === "string"
        ? [channels]
        : channels,
      "content": `{"firmware": ${JSON.stringify(firmware)}, "name": ${JSON.stringify(pref_name)}, "cycle": ${JSON.stringify(cycle)}, "sendToApp": ${sendToApp}, "type": "device"}`,
      "state": 1
    };
  } else {
    newConnection = {
      "external_id": `${mac}`,
      "external_key": `${md5(mac.toLowerCase())}`,
      "thing_id": `${id}`,
      "name": `${pref_name}`,
      "channels": typeof channels === "string"
        ? [channels]
        : channels,
      "content": `{"firmware": ${JSON.stringify(firmware)}, "name": ${JSON.stringify(pref_name)}, "cycle": ${JSON.stringify(cycle)}, "sendToApp": ${sendToApp}, "type": "device", "model":${JSON.stringify(model)}, "app":${JSON.stringify(app)}}`,
      "state": 1
    };
  }

  console.log(model, app)
  console.log(newConnection);

  try {
    axios.post(`http://${process.env.MAINFLUX_URL}:8200/things/configs`, JSON.stringify(newConnection), config)
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

// -- Get all confgis in Bootstrap --
BootstrapRouter.route('/').get( async (req, res, next) => {

  const token = req.cookies.auth;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };

  try {
    axios.get(`http://${process.env.MAINFLUX_URL}:8200/things/configs?offset=0&limit=100`, config)
      .then( response => {
        res.send(response.data.configs);
        next();
      })
      .catch( err => {
        return next(err);
      });
  } catch(err) {
    return next(err);
  };

});

// -- Get config by Id in Bootstrap --
BootstrapRouter.route('/:id').get( async (req, res, next) => {

  const hash = md5(req.params.id.toLowerCase())
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': hash,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };

  try {
    axios.get(`http://${process.env.MAINFLUX_URL}:8200/things/bootstrap/${req.params.id}`, config)
      .then( response => {
        res.send(response.data);
        next();
      })
      .catch( err => {
        return next(err);
      });
  } catch(err) {
    return next(err);
  };

});

// // -- Edit config's channels by it's mainflux_id in Bootstrap (channels***) --
// BootstrapRouter.route('/edit/channels/:id').put( async (req, res, next) => {

//   // Chech for JSON
//   if(!req.is('application/json')) {
//     next();
//     throw new Error("Expects content-type 'application/json'");
//   }

//   const token = req.cookies.auth;

//   const config = {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': token,
//     },
//     httpsAgent: new https.Agent({
//       rejectUnauthorized: false,
//     })
//   };

//   let editedConfig = {};

//   if(req.body.obj.type === "app") {
//     const { mac, id, channels, name, type } = req.body.obj;

//     editedConfig = {
//       "external_id": `${mac}`,
//       "external_key": `${md5(mac.toLowerCase())}`,
//       "thing_id": `${id}`,
//       "name": `${name}`,
//       "channels": typeof channels === "string"
//         ? [channels]
//         : channels,
//       "content": `{"type": ${JSON.stringify(type)},"name": ${JSON.stringify(name)}, "mac": ${JSON.stringify(mac)}, "hash": ${JSON.stringify(md5(req.body.obj))},
//       }`,
//     };
//   } else if(req.body.obj.type === "device") {
//     const { mac, id, channels, name, firmware, cycle, state, model } = req.body.obj;

//     editedConfig = {
//       "external_id": `${mac}`,
//       "external_key": `${md5(mac.toLowerCase())}`,
//       "thing_id": `${id}`,
//       "name": `${name}`,
//       "channels": typeof channels === "string"
//         ? [channels]
//         : channels,
//       "content": `{"firmware": ${JSON.stringify(firmware)}, "name": ${JSON.stringify(name)}, "cycle": ${JSON.stringify(cycle)}, "model": ${JSON.stringify(model)}}`,
//       "state": state
//     };
//   }

//   try {
//     axios.put(`http://${process.env.MAINFLUX_URL}:8200/things/configs/connections/${req.params.id}`,
//     editedConfig, config)
//       .then( response => {
//         res.sendStatus(response.status);
//         next();
//       })
//       .catch( err => {
//         return next(err);
//       });
//   } catch(err) {
//     return next(err);
//   };

// });

// -- Edit config info by it's mainflux_id in Bootstrap (name, content***) --
BootstrapRouter.route('/edit/info/:id').put( async (req, res, next) => {

  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  }

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
  let editedConfig = {};
  if(req.body.obj !== undefined) {
    if(req.body.obj.type === "app") {
      const { mac, id, channels, name, type, models } = req.body.obj;

      editedConfig = {
        "external_id": `${mac}`,
        "external_key": `${md5(mac.toLowerCase())}`,
        "thing_id": `${id}`,
        "name": `${name}`,
        "channels": typeof channels === "string"
          ? [channels]
          : channels,
        "content": `{"type": ${JSON.stringify(type)},"name": ${JSON.stringify(name)}, "mac": ${JSON.stringify(mac)}, "hash": ${JSON.stringify(md5(req.body.obj))}, "models": ${JSON.stringify(models)}}`,
      };
    } else if(req.body.obj.type === "device") {
      const { mac, id, channels, name, firmware, cycle, state, model } = req.body.obj;

      editedConfig = {
        "external_id": `${mac}`,
        "external_key": `${md5(mac.toLowerCase())}`,
        "thing_id": `${id}`,
        "name": `${name}`,
        "channels": typeof channels === "string"
          ? [channels]
          : channels,
        "content": `{"firmware": ${JSON.stringify(firmware)}, "name": ${JSON.stringify(name)}, "cycle": ${JSON.stringify(cycle)}, "model": ${JSON.stringify(model)}}`,
      };
    }
  } else if (req.body.response !== undefined) {
    const { mainflux_id, mainflux_channels, content } = req.body.response;
    if(req.body.response.content.type === "app") {
      editedConfig = {
        "external_id": `${content.type}`,
        "external_key": `${md5(content.mac.toLowerCase())}`,
        "thing_id": `${mainflux_id}`,
        "name": `${content.name}`,
        "channels": typeof mainflux_channels === "string"
          ? [mainflux_channels]
          : mainflux_channels,
        "content": JSON.stringify(content),
      };
    }
  }

  try {
    axios.put(`http://${process.env.MAINFLUX_URL}:8200/things/configs/${req.params.id}`,
    editedConfig, config)
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

// -- Edit config's state by it's mainflux_id in Bootstrap (name, content***) --
BootstrapRouter.route('/edit/state/:id').put( async (req, res, next) => {

  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  }

  const token = req.cookies.auth;
  const { mac, id, channels, name, firmware, cycle, state, model } = req.body.obj;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    })
  };

  const editedConfig = {
    "external_id": `${mac}`,
    "external_key": `${md5(mac.toLowerCase())}`,
    "thing_id": `${id}`,
    "name": `${name}`,
    "channels": typeof channels === "string"
      ? [channels]
      : channels,
    "content": `{"firmware": ${JSON.stringify(firmware)}, "name": ${JSON.stringify(name)}, "cycle": ${JSON.stringify(cycle)}, "model": ${JSON.stringify(model)}}`,
    "state": state
  };

  try {
    axios.put(`http://${process.env.MAINFLUX_URL}:8200/things/state/${req.params.id}`,
    editedConfig, config)
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

// -- Delete config by it's mainflux_id in Bootstrap (name, content***) --
BootstrapRouter.route('/remove/:id').delete( async (req, res, next) => {

  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  }

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
    axios.delete(`http://${process.env.MAINFLUX_URL}:8200/things/configs/${req.params.id}`, config)
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

export default BootstrapRouter;