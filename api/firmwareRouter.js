import express from 'express';
import https from 'https';
import axios from 'axios';
require('dotenv').config();

const FirmwareRouter = express.Router();

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
};

FirmwareRouter.route('/').get( async (req, res, next) => {

  try {

    await axios.get(`http://${process.env.FIRMWARE_URL}:8100/listoffirmwares`, config)
      .then( response => {
        res.send(response.data);
        next();
      })
      .catch( err => {
        if (!err.status) {
          res.send(["fp_project.prj", "file2", "file3"]);
        }
      });
  } catch(err) {
    return next(err);
  };
});

export default FirmwareRouter;