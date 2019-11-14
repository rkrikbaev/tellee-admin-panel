import express from 'express';
import Mainflux from '../../models/Mainflux';
require('dotenv').config();

const MainfluxRouter = express.Router();

// -- Get all data from "mainflux" collection -- //
MainfluxRouter.route('/').get(async (req, res, next) => {
  try {
    const allData = await Mainflux.find({
      "time" : {
        $gte: Math.round(
          (new Date(new Date().setDate(new Date().getDate()-1)))
          .getTime() / 1000
        )
      }
    });
    res.send(allData);
    next();
  } catch(err) {
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