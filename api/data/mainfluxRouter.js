import express from 'express';
import Mainflux from '../../models/Mainflux';
require('dotenv').config();

const MainfluxRouter = express.Router();

// -- Get all data from "mainflux" collection -- //
MainfluxRouter.route('/').post(async (req, res, next) => {
  const { device, parameter, date } = req.body
  const joinedString = `zsse/${device}/${parameter}/value`
  const timestamp = Math.round((Date.now() - date) / 1000)
  try {
    await Mainflux.find({
      name: joinedString,
      time: { $gte: timestamp },
    }, (req, records) => {
      const arr = records.map((item) => ({
        time: item.time,
        [parameter]: item.value,
      }))
      return res.status(200).send(arr)
    }).limit(20)
    next();
  } catch(err) {
    return res.send(err)
  }
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
