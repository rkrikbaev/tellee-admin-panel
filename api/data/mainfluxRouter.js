import express from 'express';
import Mainflux from '../../models/Mainflux';
require('dotenv').config();

const MainfluxRouter = express.Router();

// -- Get all data from "mainflux" collection -- //
MainfluxRouter.route('/').post(async (req, res, next) => {
  const { device, parameter, date } = req.body
  const joinedString = `zsse/${device}/${parameter}/value`
  const timestamp = Math.round((Date.now() - date) / 1000)
  let requestedData = []
  try {
    requestedData = await Mainflux.find({
      name: joinedString,
      time: { $gte: timestamp },
    }, (err, records) => {
      if (err) return err
      return records
    })
    res.status(200).send(requestedData)
    next();
  } catch(err) {
    res.status(502).send(requestedData)
    return next(err);
  };
});

export default MainfluxRouter;

// Order.find({ "articles.quantity": { "$gte": 5 } })
//     .select({ "articles.$": 1 })
//     .populate({
//         "path": "articles.article",
//         "match": { "price": { "$lte": 500 } }
//     }).exec(function(err,orders) {
//        // populated and filtered twice
//     }
// )
