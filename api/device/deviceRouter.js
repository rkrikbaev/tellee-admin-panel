import express from 'express';
import Device from '../../models/Device';
require('dotenv').config();

const DeviceRouter = express.Router();

// -- Send device additional info to MongoDB --
// DeviceRouter.route('/create/company/:company_id/device/:device_id').put( async (req, res, next) => {
DeviceRouter.route('/create').post( async (req, res, next) => {

  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  }

  const { id, title, subtitle, severity } = req.body;

  const device = new Device({
    id,
    title,
    subtitle,
    severity
  });

  try {
    await device.save();
    res.sendStatus(201);
  } catch(err) {
    return next(err);
  };

});

// -- Get all devices additional info from MongoDB --
DeviceRouter.route('/').get( async (req, res, next) => {

  try {
    const devices = await Device.find({});
    res.send(devices);
    next();
  } catch(err) {
    return next(err);
  };

});

// -- Get device addition info by id from MongoDB --
DeviceRouter.route('/:id').get( async (req, res, next) => {

  try {
    const device = await Device.findOne({ id : req.params.id });

    res.send(device);
    next();
  } catch(err) {
    return next(err);
  };

});

// -- Update device additional info to MongoDB --
DeviceRouter.route('/update/:id').put( (req, res, next) => {

  // Chech for JSON
  if(!req.is('application/json')) {
    next();
    throw new Error("Expects content-type 'application/json'");
  }

  const { title, subtitle, severity } = req.body;

  try {
    Device.findOneAndUpdate({ id : req.params.id }, {
      title,
      subtitle,
      severity
    }, (err, device) => {
      if(err) return res.status(500).send(err);
      if(!device) return res.sendStatus(404);
      return res.sendStatus(200);
    });
  } catch(err) {
    return next(err);
  };

});

// -- Remove device additional info from MongoDb --
DeviceRouter.route('/remove/:id').delete( (req, res, next) => {

  try {
    Device.deleteOne({ id: req.params.id }, err => {
      if(err) return res.status(500).send(err);
      if(!err) return res.sendStatus(204);
    });
  } catch(err) {
    res.sendStatus(500);
    return next(err);
  };

});

export default DeviceRouter;
