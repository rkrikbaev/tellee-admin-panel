import mongoose from 'mongoose';

const mainfluxSchema = new mongoose.Schema({
  channel: {
    type: String,
  },
  publisher: {
    type: String,
  },
  protocol: {
    type: String,
  },
  name: {
    type: String,
  },
  value: {
    type: Number,
  },
  time: {
    type: Number,
  },
}, {collection: 'mainflux'});

const Mainflux = mongoose.model('mainflux', mainfluxSchema);

export default Mainflux;