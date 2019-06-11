import mongoose from 'mongoose';

import User from './User';
import Thing from './Thing';

const connectDb = () => {
  return mongoose.connect("mongodb://localhost:27017/mainflux_admin");
};

const models = { User, Thing };

export { connectDb };

export default models;