import express from 'express';
import https from 'https';
import axios from 'axios';
import md5 from 'md5';
require('dotenv').config();

const ConnectionRouter = express.Router();

// -- Connect thing and channel mainflux_id in Bootstrap --
ConnectionRouter.route('/create/channels/:channel_id/things/:thing_id').put( async (req, res, next) => {

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
    axios.put(`https://${process.env.MAINFLUX_URL}/channels/${req.params.channel_id}/things/${req.params.thing_id}`,{}, config)
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

export default ConnectionRouter;
